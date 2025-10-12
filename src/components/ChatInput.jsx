import React, { useState } from 'react'

export default function ChatInput({ onSend }) {
  const [text, setText] = useState('')

  const submit = (e) => {
    e.preventDefault()
    const value = text.trim()
    if (!value) return
    onSend?.(value)
    setText('')
  }

  return (
    <div className="border-t border-white/10 bg-[#343541]">
      <form onSubmit={submit} className="mx-auto max-w-3xl px-4 py-4">
        <div className="flex items-end gap-2">
          <textarea
            className="input min-h-[56px] max-h-40 resize-y"
            placeholder="Send a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button type="submit" className="btn-primary h-[56px] px-4">
            Send
          </button>
        </div>
        <p className="mt-2 text-center text-xs text-gray-400">AI SQL assistant UI demo</p>
      </form>
    </div>
  )
}



