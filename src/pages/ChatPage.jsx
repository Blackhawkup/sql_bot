import React, { useMemo, useState } from 'react'
import Sidebar from '../components/Sidebar.jsx'
import ChatMessage from '../components/ChatMessage.jsx'
import ChatInput from '../components/ChatInput.jsx'
import AcceptRetryButtons from '../components/AcceptRetryButtons.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { Navigate } from 'react-router-dom'
import Modal from '../components/Modal.jsx'
import { sendPrompt, runQuery, retryQuery } from '../api/chat.js'

export default function ChatPage() {
  const { user, loading } = useAuth()
  const [messages, setMessages] = useState([
    { id: 1, role: 'assistant', content: 'Hello! Ask me anything about your database.' }
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [acceptOpen, setAcceptOpen] = useState(false)
  const [acceptRows, setAcceptRows] = useState('10')
  const [retryOpen, setRetryOpen] = useState(false)
  const [retryFeedback, setRetryFeedback] = useState('')
  const [currentSql, setCurrentSql] = useState('')
  const lastUserPrompt = useMemo(() => {
    const last = [...messages].reverse().find(m => m.role === 'user')
    return last?.content || ''
  }, [messages])

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  if (!user) return <Navigate to="/login" replace />

  const handleSend = async (text) => {
    const userMsg = { id: Date.now(), role: 'user', content: text }
    setMessages(prev => [...prev, userMsg])
    setIsLoading(true)
    setError('')
    try {
      const res = await sendPrompt(text, user.schema)
      setCurrentSql(res.sql)
      const aiMsg = { id: Date.now() + 1, role: 'assistant', content: 'Here is a proposed SQL and preview:', sql: res.sql, previewRows: res.preview }
      setMessages(prev => [...prev, aiMsg])
    } catch (err) {
      setError(err.message)
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', content: `Error: ${err.message}` }])
    } finally {
      setIsLoading(false)
    }
  }

  const openAccept = () => setAcceptOpen(true)
  const doAccept = async () => {
    setIsLoading(true)
    setError('')
    try {
      const { message } = await runQuery(currentSql, Number(acceptRows) || 0)
      setMessages(prev => [...prev, { id: Date.now(), role: 'assistant', content: message }])
    } catch (err) {
      setError(err.message)
      setMessages(prev => [...prev, { id: Date.now(), role: 'assistant', content: `Error: ${err.message}` }])
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
    <div className="min-h-screen flex">
      <Sidebar />

      <main className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto">
          {error && (
            <div className="mx-auto max-w-3xl px-4 py-4">
              <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-3 py-2 rounded text-sm">
                {error}
              </div>
            </div>
          )}
          {messages.map(m => (
            <div key={m.id}>
              <ChatMessage role={m.role} content={m.content} sql={m.sql} previewRows={m.previewRows} />
              {m.role === 'assistant' && m.sql && (
                <div className="-mt-6 mb-6">
                  <div className="mx-auto max-w-3xl px-4">
                    <AcceptRetryButtons onAccept={openAccept} onRetry={openRetry} />
                  </div>
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="mx-auto max-w-3xl px-4 py-6 text-gray-400 flex items-center gap-2">
              <div className="animate-spin h-4 w-4 border-2 border-accent border-t-transparent rounded-full"></div>
              Generating...
            </div>
          )}
        </div>
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
    </div>
  )
}



