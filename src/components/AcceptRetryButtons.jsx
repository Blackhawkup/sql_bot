import React from 'react'

export default function AcceptRetryButtons({ onAccept, onRetry }) {
  return (
    <div className="mt-3 flex gap-2">
      <button className="btn-primary" onClick={onAccept}>Accept</button>
      <button className="px-3 py-2 rounded-md border border-white/20 hover:bg-white/10 transition" onClick={onRetry}>Retry</button>
    </div>
  )
}



