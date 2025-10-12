import React, { useMemo, useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar.jsx'
import ChatMessage from '../components/ChatMessage.jsx'
import ChatInput from '../components/ChatInput.jsx'
import AcceptRetryButtons from '../components/AcceptRetryButtons.jsx'
import ErrorBoundary from '../components/ErrorBoundary.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { Navigate, Link } from 'react-router-dom'
import Modal from '../components/Modal.jsx'
import { sendPrompt, runQuery, retryQuery, saveChatSession } from '../api/chat.js'

export default function ChatPage() {
  const { user, loading } = useAuth()
  const [messages, setMessages] = useState([
    { id: 1, role: 'assistant', content: 'Hello how may i help you?' }
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [acceptOpen, setAcceptOpen] = useState(false)
  const [acceptRows, setAcceptRows] = useState('10')
  const [retryOpen, setRetryOpen] = useState(false)
  const [retryFeedback, setRetryFeedback] = useState('')
  const [currentSql, setCurrentSql] = useState('')
  const [runQueryResult, setRunQueryResult] = useState({ rows: [] })
  const [saveSessionOpen, setSaveSessionOpen] = useState(false)
  const [sessionName, setSessionName] = useState('')
  const lastUserPrompt = useMemo(() => {
    const last = [...messages].reverse().find(m => m.role === 'user')
    return last?.content || ''
  }, [messages])

  // Handle loading chat sessions from sidebar
  useEffect(() => {
    const handleLoadSession = (event) => {
      const { session } = event.detail
      if (session && session.messages) {
        setMessages(session.messages)
        setError('')
      }
    }

    window.addEventListener('loadChatSession', handleLoadSession)
    return () => window.removeEventListener('loadChatSession', handleLoadSession)
  }, [])

  const handleSaveSession = async () => {
    if (!sessionName.trim()) return
    
    try {
      await saveChatSession(sessionName.trim(), messages)
      setSaveSessionOpen(false)
      setSessionName('')
      // Refresh sidebar sessions
      window.dispatchEvent(new CustomEvent('refreshSessions'))
    } catch (error) {
      setError(error.message)
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  if (!user) return <Navigate to="/login" replace />

  const handleSend = async (text) => {
    const userMsg = { id: Date.now(), role: 'user', content: text }
    setMessages(prev => [...prev, userMsg])
    setIsLoading(true)
    setError('')
    try {
      // For admin users, don't send schema - let backend use admin_schema
      const schemaToSend = user.role === 'admin' ? null : user.schema
      const res = await sendPrompt(text, schemaToSend)
      setCurrentSql(res.sql)
      
      // Get preview by running the query with limit 5
      let previewRows = []
      try {
        const previewRes = await runQuery(res.sql, 5)
        previewRows = Array.isArray(previewRes?.rows) ? previewRes.rows.slice(0, 5) : []
      } catch (previewError) {
        console.warn('Preview query failed:', previewError)
        previewRows = []
      }
      
      const aiMsg = { 
        id: Date.now() + 1, 
        role: 'assistant', 
        content: 'Here is a proposed SQL and preview:', 
        sql: res.sql, 
        previewRows: previewRows
      }
      setMessages(prev => [...prev, aiMsg])
    } catch (err) {
      setError(err.message)
      // Handle specific error messages
      let errorContent = `Error: ${err.message}`
      if (err.message.includes("couldn't identify anything in your database")) {
        errorContent = "I couldn't identify anything in your database from that query - please ask about a specific table or column."
      } else if (err.message.includes("not a SELECT")) {
        errorContent = "For safety, only SELECT queries are allowed."
      } else if (err.message.includes("not reference your database schema")) {
        errorContent = "I couldn't identify anything in your database from that query - please ask about a specific table or column."
      } else if (err.message.includes("contact your administrator to upload a database schema")) {
        errorContent = "Please contact your administrator to upload a database schema before using the chat. You need a schema to generate SQL queries."
      }
      
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', content: errorContent }])
    } finally {
      setIsLoading(false)
    }
  }

  const openAccept = () => setAcceptOpen(true)
  const doAccept = async () => {
    setIsLoading(true)
    setError('')
    try {
      const result = await runQuery(currentSql, Number(acceptRows) || 0)
      setRunQueryResult(result)
      const message = `Query executed successfully! Fetched ${result.rows.length} rows.`
      setMessages(prev => [...prev, { id: Date.now(), role: 'assistant', content: message, sql: currentSql, rows: result.rows }])
    } catch (err) {
      setError(err.message)
      
      // Handle specific error cases
      if (err.message.includes('too many rows') || err.message.includes('query too large')) {
        const retryRows = prompt('Query returned too many rows. Please specify a smaller number of rows (e.g., 100, 500, 1000):')
        if (retryRows && !isNaN(parseInt(retryRows))) {
          try {
            const retryResult = await runQuery(currentSql, parseInt(retryRows))
            setRunQueryResult(retryResult)
            
            const retryMsg = {
              id: Date.now() + 1,
              role: 'assistant',
              content: `Query executed successfully with reduced rows! Fetched ${retryResult.rows.length} rows.`,
              sql: currentSql,
              rows: retryResult.rows
            }
            setMessages(prev => [...prev, retryMsg])
          } catch (retryErr) {
            setError(`Retry failed: ${retryErr.message}`)
            setMessages(prev => [...prev, { id: Date.now() + 2, role: 'assistant', content: `Retry Error: ${retryErr.message}` }])
          }
        }
      } else {
        setMessages(prev => [...prev, { id: Date.now(), role: 'assistant', content: `Error: ${err.message}` }])
      }
    } finally {
      setIsLoading(false)
      setAcceptOpen(false)
    }
  }

  const openRetry = () => setRetryOpen(true)
  const doRetry = async () => {
    setIsLoading(true)
    setError('')
    try {
      const res = await retryQuery(lastUserPrompt, retryFeedback)
      setCurrentSql(res.sql)
      const aiMsg = { id: Date.now(), role: 'assistant', content: 'Updated SQL after feedback:', sql: res.sql, previewRows: res.preview }
      setMessages(prev => [...prev, aiMsg])
    } catch (err) {
      setError(err.message)
      setMessages(prev => [...prev, { id: Date.now(), role: 'assistant', content: `Error: ${err.message}` }])
    } finally {
      setIsLoading(false)
      setRetryOpen(false)
      setRetryFeedback('')
    }
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex">
        <Sidebar />

        <main className="flex-1 flex flex-col">
        {/* Header with Admin Button for Admin Users */}
        {user?.role === 'admin' && (
          <div className="flex justify-end items-center p-4 border-b border-white/10">
            <Link 
              to="/admin" 
              className="btn-primary px-4 py-2 text-sm"
            >
              Admin Panel
            </Link>
          </div>
        )}
        
        <div className="flex-1 overflow-y-auto">
          {/* Error display removed as requested */}
          {messages.map(m => {
            try {
              return (
                <div key={m.id}>
                  <ChatMessage role={m.role} content={m.content} sql={m.sql} previewRows={m.previewRows} />
                  {m.role === 'assistant' && m.sql && (
                    <div className="-mt-6 mb-6">
                      <div className="mx-auto max-w-3xl px-4">
                        <AcceptRetryButtons 
                          onAccept={openAccept} 
                          onRetry={openRetry} 
                          sql={currentSql}
                          rows={runQueryResult?.rows || []}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )
            } catch (error) {
              console.error('Error rendering message:', error, m)
              return (
                <div key={m.id} className="p-4 bg-red-900/20 border border-red-500/50 rounded">
                  <p className="text-red-300">Error rendering message: {error.message}</p>
                </div>
              )
            }
          })}
          {isLoading && (
            <div className="mx-auto max-w-3xl px-4 py-6 text-gray-400 flex items-center gap-2">
              <div className="animate-spin h-4 w-4 border-2 border-accent border-t-transparent rounded-full"></div>
              Generating...
            </div>
          )}
        </div>
        {/* Save Session Button */}
        {messages.length > 1 && (
          <div className="px-4 py-2 border-t border-white/10">
            <button
              onClick={() => setSaveSessionOpen(true)}
              className="w-full px-3 py-2 text-sm bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg transition-colors"
            >
              💾 Save Chat Session
            </button>
          </div>
        )}
        
        <ChatInput onSend={handleSend} />
      </main>

      <Modal
        open={acceptOpen}
        title="Accept Query"
        onClose={() => setAcceptOpen(false)}
        actions={<button className="btn-primary" onClick={doAccept}>Confirm</button>}
      >
        <label className="block mb-1 text-sm text-gray-300">Number of rows to fetch</label>
        <input className="input" value={acceptRows} onChange={(e) => setAcceptRows(e.target.value)} type="number" min="1" />
      </Modal>

      <Modal
        open={retryOpen}
        title="Retry with Feedback"
        onClose={() => setRetryOpen(false)}
        actions={<button className="btn-primary" onClick={doRetry}>Retry</button>}
      >
        <label className="block mb-1 text-sm text-gray-300">What should be improved?</label>
        <textarea className="input min-h-[100px]" value={retryFeedback} onChange={(e) => setRetryFeedback(e.target.value)} placeholder="e.g., Filter by last 30 days" />
      </Modal>

      {/* Save Session Modal */}
      <Modal
        open={saveSessionOpen}
        title="Save Chat Session"
        onClose={() => setSaveSessionOpen(false)}
        actions={
          <div className="flex gap-2">
            <button 
              className="px-3 py-2 rounded-lg border border-white/20 hover:bg-white/10 transition-colors" 
              onClick={() => setSaveSessionOpen(false)}
            >
              Cancel
            </button>
            <button 
              className="btn-primary px-4 py-2" 
              onClick={handleSaveSession}
              disabled={!sessionName.trim()}
            >
              Save
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block mb-1 text-sm text-gray-300">Session Name</label>
            <input 
              className="input" 
              value={sessionName} 
              onChange={(e) => setSessionName(e.target.value)} 
              placeholder="My SQL Chat Session" 
              autoFocus
            />
          </div>
          <div className="text-xs text-gray-400">
            This will save {messages.length} messages from your current chat.
          </div>
        </div>
      </Modal>
      </div>
    </ErrorBoundary>
  )
}



