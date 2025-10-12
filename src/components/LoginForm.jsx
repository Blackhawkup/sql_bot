import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function LoginForm() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    try {
      await login(username.trim(), password)
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-3 py-2 rounded text-sm">
          {error}
        </div>
      )}
      <div>
        <label className="block mb-1 text-sm text-gray-300">Username</label>
        <input 
          className="input" 
          value={username} 
          onChange={(e) => setUsername(e.target.value)} 
          placeholder="jane.doe" 
          required 
        />
      </div>
      <div>
        <label className="block mb-1 text-sm text-gray-300">Password</label>
        <input 
          className="input" 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          placeholder="••••••••" 
          required 
        />
      </div>
      <button type="submit" className="btn-primary w-full" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  )
}


