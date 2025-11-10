import React from 'react'

export default function Modal({ open, title, children, onClose, actions, hideCloseButton = false }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg rounded-[20px] border border-white/10 bg-navy-800 shadow-card">
        {/* Header */}
        {title && (
          <div className="px-6 pt-6 pb-4 border-b border-white/10">
            <h3 className="text-xl font-bold text-white">{title}</h3>
          </div>
        )}
        
        {/* Content */}
        <div className="px-6 py-5">
          {children}
        </div>
        
        {/* Actions */}
        <div className="px-6 pb-6 pt-2 flex gap-3 justify-end">
          {!hideCloseButton && (
            <button 
              className="px-5 py-2.5 rounded-button border border-white/20 text-white font-medium hover:bg-white/10 transition-all duration-200" 
              onClick={onClose}
            >
              Close
            </button>
          )}
          {actions}
        </div>
      </div>
    </div>
  )
}


