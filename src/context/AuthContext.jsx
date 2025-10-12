import React, { createContext, useContext, useMemo, useState, useEffect } from 'react'
import { loginApi } from '../api/auth.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for stored token on mount
    const token = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    if (token && storedUser) {
      try {
        // Check if token is expired
        const payload = JSON.parse(atob(token.split('.')[1]))
        const currentTime = Date.now() / 1000
        
        if (payload.exp && payload.exp > currentTime) {
          // Token is still valid
          setUser(JSON.parse(storedUser))
        } else {
          // Token is expired, clear storage
          localStorage.removeItem('token')
          localStorage.removeItem('user')
        }
      } catch (e) {
        // Invalid token format, clear storage
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
    setLoading(false)
  }, [])

  const login = async (username, password) => {
    try {
      const data = await loginApi(username, password)
      const userData = { username: data.username, role: data.role, schema: data.schema }
      setUser(userData)
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(userData))
      return data
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  const value = useMemo(() => ({ user, login, logout, loading }), [user, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}


