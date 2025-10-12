import React, { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { Navigate } from 'react-router-dom'
import { addUser, removeUser, analyzeColumns, getUsers, updateUser } from '../api/admin.js'
import { getChatHistory } from '../api/chat.js'
import Modal from '../components/Modal.jsx'

export default function AdminDashboard() {
  const { user, loading } = useAuth()
  const [users, setUsers] = useState([])
  const [columnAnalysis, setColumnAnalysis] = useState(null)
  const [allChatHistory, setAllChatHistory] = useState([])
  const [addUserOpen, setAddUserOpen] = useState(false)
  const [removeUserOpen, setRemoveUserOpen] = useState(false)
  const [showAnalysis, setShowAnalysis] = useState(false)
  const [showChatHistory, setShowChatHistory] = useState(false)
  const [newUser, setNewUser] = useState({ username: '', password: '', role: 'user', schema: '', admin_schema: '' })
  const [editUser, setEditUser] = useState(null)
  const [removeUsername, setRemoveUsername] = useState('')
  const [error, setError] = useState('')
  const [loadingState, setLoadingState] = useState(false)

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'admin') return <Navigate to="/" replace />

  const handleAddUser = async () => {
    setLoadingState(true)
    setError('')
    try {
      // Validate required fields
      if (!newUser.schema || newUser.schema.trim() === '') {
        setError('Schema is required for user creation')
        setLoadingState(false)
        return
      }
      
      await addUser(newUser.username, newUser.password, newUser.role, newUser.schema, newUser.admin_schema || null)
      setAddUserOpen(false)
      setNewUser({ username: '', password: '', role: 'user', schema: '', admin_schema: '' })
      
      // Refresh the users list
      await loadUsers()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoadingState(false)
    }
  }

  const handleRemoveUser = async () => {
    setLoadingState(true)
    setError('')
    try {
      await removeUser(removeUsername)
      setRemoveUserOpen(false)
      setRemoveUsername('')
      loadUsers() // Refresh users list
    } catch (err) {
      setError(err.message)
    } finally {
      setLoadingState(false)
    }
  }

  const handleEditUser = async () => {
    setLoadingState(true)
    setError('')
    try {
      if (!editUser) return
      
      // Update user via API
      await updateUser(editUser.id, {
        username: editUser.username,
        password: editUser.password,
        role: editUser.role,
        schema: editUser.schema,
        admin_schema: editUser.admin_schema
      })
      
      setEditUser(null)
      await loadUsers() // Refresh users list
    } catch (err) {
      setError(err.message)
    } finally {
      setLoadingState(false)
    }
  }

  const loadUsers = async () => {
    try {
      const usersList = await getUsers()
      setUsers(usersList)
    } catch (err) {
      console.error('Failed to load users:', err)
    }
  }

  const loadColumnAnalysis = async () => {
    setLoadingState(true)
    try {
      const analysis = await analyzeColumns()
      setColumnAnalysis(analysis)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoadingState(false)
    }
  }

  const loadAllChatHistory = async () => {
    try {
      const history = await getChatHistory()
      setAllChatHistory(history)
    } catch (err) {
      console.error('Failed to load chat history:', err)
    }
  }

  useEffect(() => {
    loadUsers()
    loadAllChatHistory()
    
    // Auto-refresh users list every 30 seconds
    const interval = setInterval(() => {
      loadUsers()
    }, 30000)
    
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-white/10">
          <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
          <div className="flex gap-2">
            <button 
              onClick={() => setShowChatHistory(!showChatHistory)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                showChatHistory 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-white/10 hover:bg-white/20 text-gray-300'
              }`}
            >
              {showChatHistory ? 'Hide Chat History' : 'Show Chat History'}
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-3 py-2 rounded text-sm mb-4">
              {error}
            </div>
          )}

          {showChatHistory ? (
            /* Chat History Display */
            <div className="max-w-4xl mx-auto space-y-4">
              {allChatHistory.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  <p>No chat history available</p>
                </div>
              ) : (
                allChatHistory.map((msg, index) => (
                  <div key={index} className={`p-4 rounded-lg ${
                    msg.role === 'user' 
                      ? 'bg-[#343541] ml-8' 
                      : 'bg-[#444654] mr-8'
                  }`}>
                    <div className="flex gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        msg.role === 'user' 
                          ? 'bg-blue-500/20 text-blue-400' 
                          : 'bg-green-500/20 text-green-400'
                      }`}>
                        {msg.role === 'user' ? 'U' : 'AI'}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm text-gray-400 mb-1">
                          {msg.username} • {new Date(msg.created_at).toLocaleString()}
                        </div>
                        <div className="whitespace-pre-wrap">{msg.content}</div>
                        {msg.sql_generated && (
                          <div className="mt-2 p-2 bg-[#202123] rounded text-sm font-mono">
                            <div className="text-xs text-gray-400 mb-1">Generated SQL:</div>
                            {msg.sql_generated}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            /* Admin Controls */
            <div className="max-w-6xl mx-auto space-y-6">
              {/* User Management */}
              <div className="bg-gradient-to-br from-[#1f2937]/80 to-[#0f172a]/60 p-6 rounded-lg border border-white/10">
                <h3 className="text-lg font-semibold mb-4">User Management</h3>
                
                {/* Users List */}
                <div className="mb-4 max-h-64 overflow-y-auto">
                  <div className="text-sm text-gray-400 mb-2">All Users ({users.length})</div>
                  {users.map((u) => (
                    <div key={u.id} className="flex items-center justify-between p-3 bg-white/5 rounded mb-2">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{u.username}</div>
                        <div className="text-xs text-gray-400">
                          {u.role} • {u.schema ? 'Has schema' : 'No schema'} • {u.admin_schema ? 'Has admin schema' : 'No admin schema'} • {new Date(u.created_at).toLocaleDateString()}
                        </div>
                        {u.admin_schema && (
                          <div className="text-xs text-blue-400 mt-1">
                            Admin Schema: {u.admin_schema.length} characters
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditUser(u)}
                          className="text-blue-400 hover:text-blue-300 text-xs px-2 py-1 bg-blue-500/20 rounded"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            setRemoveUsername(u.username)
                            setRemoveUserOpen(true)
                          }}
                          className="text-red-400 hover:text-red-300 text-xs px-2 py-1 bg-red-500/20 rounded"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="space-y-2">
                  <button 
                    className="btn-primary w-full" 
                    onClick={() => setAddUserOpen(true)}
                  >
                    Add New User
                  </button>
                </div>
              </div>

              {/* Database Analysis */}
              <div className="bg-gradient-to-br from-[#1f2937]/80 to-[#0f172a]/60 p-6 rounded-lg border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Database Analysis</h3>
                  <button
                    onClick={() => setShowAnalysis(!showAnalysis)}
                    className="text-sm text-blue-400 hover:text-blue-300"
                  >
                    {showAnalysis ? 'Hide Analysis' : 'Show Analysis'}
                  </button>
                </div>
                
                {showAnalysis && (
                  <div className="space-y-4">
                    <button 
                      className="btn-primary" 
                      onClick={handleAnalyze}
                      disabled={loadingState}
                    >
                      {loadingState ? 'Analyzing...' : 'Analyze Database Usage'}
                    </button>
                    
                    {columnAnalysis && (
                      <div className="mt-4 p-4 bg-[#202123] rounded-lg">
                        <h4 className="font-semibold mb-2">Analysis Results</h4>
                        
                        {columnAnalysis.useless_columns && columnAnalysis.useless_columns.length > 0 && (
                          <div className="mb-4">
                            <h5 className="text-sm font-medium text-red-400 mb-2">Useless Columns ({columnAnalysis.useless_columns.length})</h5>
                            <div className="text-xs text-gray-300 space-y-1">
                              {columnAnalysis.useless_columns.map((column, i) => (
                                <div key={i} className="bg-red-500/10 px-2 py-1 rounded">{column}</div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {columnAnalysis.useless_tables && columnAnalysis.useless_tables.length > 0 && (
                          <div className="mb-4">
                            <h5 className="text-sm font-medium text-red-400 mb-2">Useless Tables ({columnAnalysis.useless_tables.length})</h5>
                            <div className="text-xs text-gray-300 space-y-1">
                              {columnAnalysis.useless_tables.map((table, i) => (
                                <div key={i} className="bg-red-500/10 px-2 py-1 rounded">{table}</div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {columnAnalysis.useful_tables && columnAnalysis.useful_tables.length > 0 && (
                          <div className="mb-4">
                            <h5 className="text-sm font-medium text-green-400 mb-2">Useful Tables ({columnAnalysis.useful_tables.length})</h5>
                            <div className="text-xs text-gray-300 space-y-1">
                              {columnAnalysis.useful_tables.map((table, i) => (
                                <div key={i} className="bg-green-500/10 px-2 py-1 rounded">{table}</div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {columnAnalysis.summary && (
                          <div className="text-sm text-gray-300 whitespace-pre-wrap">
                            {columnAnalysis.summary}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      <Modal
        open={addUserOpen}
        title="Add User"
        onClose={() => setAddUserOpen(false)}
        actions={
          <button 
            className="btn-primary" 
            onClick={handleAddUser}
            disabled={loadingState || !newUser.schema || newUser.schema.trim() === ''}
          >
            {loadingState ? 'Adding...' : 'Add User'}
          </button>
        }
      >
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Username</label>
            <input 
              className="input" 
              value={newUser.username} 
              onChange={(e) => setNewUser({...newUser, username: e.target.value})}
              placeholder="jane.doe"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Password</label>
            <input 
              className="input" 
              type="password" 
              value={newUser.password} 
              onChange={(e) => setNewUser({...newUser, password: e.target.value})}
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Role</label>
            <select 
              className="input" 
              value={newUser.role} 
              onChange={(e) => setNewUser({...newUser, role: e.target.value})}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">
              Schema <span className="text-red-400">*</span>
            </label>
            <textarea 
              className="input min-h-[80px]" 
              value={newUser.schema} 
              onChange={(e) => setNewUser({...newUser, schema: e.target.value})}
              placeholder="Table definitions, column info, etc."
              required
            />
            <p className="text-xs text-gray-400 mt-1">Schema is required - paste the DDL for the tables this user can query.</p>
          </div>
          {newUser.role === 'admin' && (
            <div>
              <label className="block text-sm text-gray-300 mb-1">Admin Schema (optional)</label>
              <textarea 
                className="input min-h-[80px]" 
                value={newUser.admin_schema} 
                onChange={(e) => setNewUser({...newUser, admin_schema: e.target.value})}
                placeholder="Full company database schema for admin access"
              />
            </div>
          )}
        </div>
      </Modal>

      <Modal
        open={removeUserOpen}
        title="Remove User"
        onClose={() => setRemoveUserOpen(false)}
        actions={
          <button 
            className="btn-primary bg-red-600 hover:bg-red-700" 
            onClick={handleRemoveUser}
            disabled={loadingState}
          >
            {loadingState ? 'Removing...' : 'Remove User'}
          </button>
        }
      >
        <div>
          <label className="block text-sm text-gray-300 mb-1">Username to remove</label>
          <input 
            className="input" 
            value={removeUsername} 
            onChange={(e) => setRemoveUsername(e.target.value)}
            placeholder="jane.doe"
          />
        </div>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        open={editUser !== null}
        title="Edit User"
        onClose={() => setEditUser(null)}
        actions={
          <div className="flex gap-2">
            <button 
              className="px-3 py-2 rounded-lg border border-white/20 hover:bg-white/10 transition-colors" 
              onClick={() => setEditUser(null)}
            >
              Cancel
            </button>
            <button 
              className="btn-primary" 
              onClick={handleEditUser}
              disabled={loadingState}
            >
              {loadingState ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        }
      >
        {editUser && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Username</label>
              <input 
                className="input" 
                value={editUser.username} 
                onChange={(e) => setEditUser({...editUser, username: e.target.value})}
                placeholder="jane.doe"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Password (leave blank to keep current)</label>
              <input 
                className="input" 
                type="password" 
                value={editUser.password || ''} 
                onChange={(e) => setEditUser({...editUser, password: e.target.value})}
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Role</label>
              <select 
                className="input" 
                value={editUser.role} 
                onChange={(e) => setEditUser({...editUser, role: e.target.value})}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Schema</label>
              <textarea 
                className="input min-h-[100px]" 
                value={editUser.schema || ''} 
                onChange={(e) => setEditUser({...editUser, schema: e.target.value})}
                placeholder="CREATE TABLE users (...)"
              />
            </div>
            {editUser.role === 'admin' && (
              <div>
                <label className="block text-sm text-gray-300 mb-1">Admin Schema</label>
                <textarea 
                  className="input min-h-[100px]" 
                  value={editUser.admin_schema || ''} 
                  onChange={(e) => setEditUser({...editUser, admin_schema: e.target.value})}
                  placeholder="Complete database schema for admin access"
                />
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}


