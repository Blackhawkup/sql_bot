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
    <aside className="hidden md:flex md:w-64 flex-col bg-gradient-to-br from-[#1f2937]/80 to-[#0f172a]/60 text-gray-200 border-r border-white/10 shadow-lg">
      <div className="p-6 border-b border-white/10">
        <Link to="/" className="block text-lg font-semibold">AI SQL Chat</Link>
      </div>
      <nav className="flex-1 p-6 space-y-2">
        <Link to="/" className={`block px-3 py-2 rounded-lg transition-colors ${isActive('/') ? 'bg-white/10' : 'hover:bg-white/5'}`}>Chat</Link>
        
        {/* Chat Sessions Section - Always Visible */}
        <div className="mt-4">
          <div className="text-sm text-gray-400 mb-2 px-3">Saved Chats</div>
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {loading ? (
              <p className="text-xs text-gray-400 px-3 py-1">Loading...</p>
            ) : chatSessions.length === 0 ? (
              <p className="text-xs text-gray-400 px-3 py-1">No saved chats</p>
            ) : (
              chatSessions.map((session) => (
                <div 
                  key={session.id} 
                  className="text-xs text-gray-300 px-3 py-2 bg-white/5 rounded hover:bg-white/10 transition-colors cursor-pointer group"
                  onClick={() => handleSessionClick(session.id)}
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <div className="font-medium truncate flex-1">{session.session_name}</div>
                      <button
                        onClick={(e) => handleDeleteSession(session.id, e)}
                        className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 ml-2 transition-opacity"
                        title="Delete session"
                      >
                        ×
                      </button>
                    </div>
                    <div className="text-xs text-gray-400">
                      {session.messages?.length || 0} messages • {new Date(session.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </nav>
      <div className="p-6 border-t border-white/10">
        <div className="mb-2 text-sm text-gray-400">{user ? `Signed in as ${user.username} (${user.role})` : 'Not signed in'}</div>
        {user ? (
          <button className="w-full px-3 py-2 rounded-lg border border-white/20 hover:bg-white/10 transition-colors" onClick={logout}>Logout</button>
        ) : (
          <Link to="/login" className="btn-primary w-full text-center block">Login</Link>
        )}
      </div>
    </aside>
  )
}







