import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { getChatHistory, getChatSessions, getChatSession, deleteChatSession } from '../api/chat.js'

export default function Sidebar() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [chatSessions, setChatSessions] = useState([])
  const [loading, setLoading] = useState(false)
  const isActive = (path) => location.pathname === path

  useEffect(() => {
    if (user) {
      loadChatSessions()
    }
  }, [user])

  // Listen for session refresh events
  useEffect(() => {
    const handleRefreshSessions = () => {
      loadChatSessions()
    }

    window.addEventListener('refreshSessions', handleRefreshSessions)
    return () => window.removeEventListener('refreshSessions', handleRefreshSessions)
  }, [])

  const loadChatSessions = async () => {
    try {
      setLoading(true)
      const sessions = await getChatSessions()
      setChatSessions(sessions.slice(0, 10)) // Show last 10 sessions
    } catch (error) {
      console.error('Failed to load chat sessions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSessionClick = async (sessionId) => {
    try {
      const session = await getChatSession(sessionId)
      // Emit a custom event to load the session in the chat
      window.dispatchEvent(new CustomEvent('loadChatSession', { 
        detail: { session } 
      }))
    } catch (error) {
      console.error('Failed to load chat session:', error)
    }
  }

  const handleDeleteSession = async (sessionId, event) => {
    event.stopPropagation() // Prevent loading the session
    if (window.confirm('Are you sure you want to delete this chat session?')) {
      try {
        await deleteChatSession(sessionId)
        loadChatSessions() // Refresh the list
      } catch (error) {
        console.error('Failed to delete chat session:', error)
        alert('Failed to delete chat session')
      }
    }
  }

  return (
    <aside className="hidden md:flex md:w-[285px] flex-col bg-white dark:bg-navy-800 text-navy-700 dark:text-white shadow-card fixed h-[calc(100vh-32px)] m-4 rounded-card">
      {/* Header */}
      <div className="p-6 border-b border-secondaryGray-200 dark:border-white/10">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center shadow-sm">
            <span className="text-white text-lg font-bold">SQL</span>
          </div>
          <span className="text-lg font-bold bg-gradient-brand bg-clip-text text-transparent">AI SQL Chat</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <Link 
          to="/" 
          className={`flex items-center gap-3 px-4 py-3 rounded-button font-medium transition-all duration-200 ${
            isActive('/') 
              ? 'bg-gradient-brand text-white shadow-sm' 
              : 'text-secondaryGray-700 hover:bg-secondaryGray-300/50 dark:text-white dark:hover:bg-white/5'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          Chat UI
        </Link>
        
        {/* Chat Sessions Section */}
        <div className="mt-6">
          <div className="text-xs font-semibold text-secondaryGray-600 dark:text-secondaryGray-600 mb-3 px-4 uppercase tracking-wider">
            Saved Chats
          </div>
          <div className="space-y-1 max-h-72 overflow-y-auto scrollbar-thin">
            {loading ? (
              <div className="px-4 py-3 text-xs text-secondaryGray-600">Loading...</div>
            ) : chatSessions.length === 0 ? (
              <div className="px-4 py-3 text-xs text-secondaryGray-600">No saved chats</div>
            ) : (
              chatSessions.map((session) => (
                <div 
                  key={session.id} 
                  className="px-3 py-2.5 text-sm bg-white/5 dark:bg-white/5 rounded-button hover:bg-white/10 dark:hover:bg-white/10 transition-all duration-200 cursor-pointer group"
                  onClick={() => handleSessionClick(session.id)}
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <div className="font-medium truncate flex-1 text-navy-700 dark:text-white">{session.session_name}</div>
                      <button
                        onClick={(e) => handleDeleteSession(session.id, e)}
                        className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-400 ml-2 transition-opacity text-lg leading-none"
                        title="Delete session"
                      >
                        ×
                      </button>
                    </div>
                    <div className="text-xs text-secondaryGray-600">
                      {session.messages?.length || 0} messages • {new Date(session.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-secondaryGray-200 dark:border-white/10 space-y-3">
        <div className="text-sm text-secondaryGray-700 dark:text-secondaryGray-600 px-2">
          {user ? (
            <div>
              <div className="font-medium text-navy-700 dark:text-white">{user.username}</div>
              <div className="text-xs">{user.role}</div>
            </div>
          ) : (
            'Not signed in'
          )}
        </div>
        {user ? (
          <button 
            className="w-full px-4 py-2.5 rounded-button border border-secondaryGray-300 dark:border-white/20 text-secondaryGray-700 dark:text-white hover:bg-secondaryGray-300/50 dark:hover:bg-white/10 transition-all duration-200 font-medium text-sm" 
            onClick={logout}
          >
            Logout
          </button>
        ) : (
          <Link to="/login" className="btn-primary w-full text-center block text-sm">
            Login
          </Link>
        )}
      </div>
    </aside>
  )
}







