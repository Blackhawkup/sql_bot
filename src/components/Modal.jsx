import React from 'react'

export default function Modal({ open, title, children, onClose, actions }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative z-10 w-[90vw] max-w-lg rounded-lg border border-white/10 bg-[#202123] p-5 shadow-xl">
        {title && <h3 className="mb-3 text-lg font-semibold">{title}</h3>}
        <div>{children}</div>
        <div className="mt-4 flex gap-2 justify-end">
          <button className="px-3 py-2 rounded-md border border-white/20 hover:bg-white/10" onClick={onClose}>Close</button>
          {actions}
        </div>
      </div>
    </div>
  )
}


