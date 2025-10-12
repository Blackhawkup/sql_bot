import React, { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { Navigate } from 'react-router-dom'
import { addUser, removeUser, analyzeColumns } from '../api/admin.js'
import Modal from '../components/Modal.jsx'

export default function AdminDashboard() {
  const { user, loading } = useAuth()
  const [users, setUsers] = useState([])
  const [columnAnalysis, setColumnAnalysis] = useState(null)
  const [addUserOpen, setAddUserOpen] = useState(false)
  const [removeUserOpen, setRemoveUserOpen] = useState(false)
  const [newUser, setNewUser] = useState({ username: '', password: '', role: 'user', schema: '' })
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
      await addUser(newUser.username, newUser.password, newUser.role, newUser.schema || null)
      setAddUserOpen(false)
      setNewUser({ username: '', password: '', role: 'user', schema: '' })
      // In a real app, you'd refresh the users list
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
      // In a real app, you'd refresh the users list
    } catch (err) {
      setError(err.message)
    } finally {
      setLoadingState(false)
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

  useEffect(() => {
    loadColumnAnalysis()
  }, [])

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <main className="flex-1 p-6">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-2xl font-semibold mb-6">Admin Dashboard</h1>
          
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-3 py-2 rounded text-sm mb-4">
              {error}
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            <div className="bg-[#202123] p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-4">User Management</h2>
              <div className="space-y-2">
                <button 
                  className="btn-primary w-full" 
                  onClick={() => setAddUserOpen(true)}
                >
                  Add User
                </button>
                <button 
                  className="w-full px-3 py-2 rounded-md border border-white/20 hover:bg-white/10" 
                  onClick={() => setRemoveUserOpen(true)}
                >
                  Remove User
                </button>
              </div>
            </div>

            <div className="bg-[#202123] p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-4">Column Analysis</h2>
              <button 
                className="btn-primary w-full mb-4" 
                onClick={loadColumnAnalysis}
                disabled={loadingState}
              >
                {loadingState ? 'Analyzing...' : 'Analyze Columns'}
              </button>
              {columnAnalysis && (
                <div className="space-y-2">
                  <div>
                    <h3 className="text-sm font-medium text-green-400">Useful Columns ({columnAnalysis.useful?.length || 0})</h3>
                    <p className="text-xs text-gray-400">{columnAnalysis.useful?.join(', ') || 'None'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-red-400">Redundant Columns ({columnAnalysis.redundant?.length || 0})</h3>
                    <p className="text-xs text-gray-400">{columnAnalysis.redundant?.join(', ') || 'None'}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
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
            disabled={loadingState}
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
            <label className="block text-sm text-gray-300 mb-1">Schema (optional)</label>
            <textarea 
              className="input min-h-[80px]" 
              value={newUser.schema} 
              onChange={(e) => setNewUser({...newUser, schema: e.target.value})}
              placeholder="Table definitions, column info, etc."
            />
          </div>
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
    </div>
  )
}


