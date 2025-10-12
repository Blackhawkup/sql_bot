import React from 'react'

export default function Modal({ open, title, children, onClose, actions }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative z-10 w-[90vw] max-w-lg rounded-2xl border border-white/10 bg-gradient-to-br from-[#1f2937]/80 to-[#0f172a]/60 p-6 shadow-xl">
        {title && <h3 className="mb-4 text-lg font-semibold">{title}</h3>}
        <div>{children}</div>
        <div className="mt-6 flex gap-2 justify-end">
          <button className="px-4 py-2 rounded-lg border border-white/20 hover:bg-white/10 transition-colors" onClick={onClose}>Close</button>
          {actions}
        </div>
      </div>
    </div>
  )
}


