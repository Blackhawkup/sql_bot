import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Sidebar() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const isActive = (path) => location.pathname === path

  return (
    <aside className="hidden md:flex md:w-64 flex-col bg-[#202123] text-gray-200 border-r border-white/10">
      <div className="p-4 border-b border-white/10">
        <Link to="/" className="block text-lg font-semibold">AI SQL Chat</Link>
      </div>
      <nav className="flex-1 p-3 space-y-2">
        <Link to="/" className={`block px-3 py-2 rounded ${isActive('/') ? 'bg-white/10' : 'hover:bg-white/5'}`}>Chat</Link>
        {user?.role === 'admin' && (
          <Link to="/admin" className={`block px-3 py-2 rounded ${isActive('/admin') ? 'bg-white/10' : 'hover:bg-white/5'}`}>Admin</Link>
        )}
      </nav>
      <div className="p-3 border-t border-white/10">
        <div className="mb-2 text-sm text-gray-400">{user ? `Signed in as ${user.username} (${user.role})` : 'Not signed in'}</div>
        {user ? (
          <button className="w-full px-3 py-2 rounded-md border border-white/20 hover:bg-white/10" onClick={logout}>Logout</button>
        ) : (
          <Link to="/login" className="btn-primary w-full text-center block">Login</Link>
        )}
      </div>
    </aside>
  )
}






