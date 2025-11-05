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
    <div className="border-t border-500/40 bg-navy-800/0 backdrop-blur-sm">
      <form onSubmit={submit} className="mx-auto max-w-4xl px-4 py-4">
        <div className="flex items-end gap-3">
          <div className="flex-1 relative">
            <textarea
              className="w-full min-h-[54px] max-h-40 resize-y bg-navy-800/0 text-black placeholder-secondaryGray-600 px-5 py-4 pr-12 rounded-pill outline-2px border border-500 font-medium transition-all duration-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              placeholder="Type your message here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  submit(e)
                }
              }}
              rows={1}
            />
          </div>
          <button 
            type="submit" 
            className="h-[54px] px-8 bg-gradient-brand text-white font-semibold rounded-pill shadow-button transition-all duration-200 hover:shadow-hover disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            disabled={!text.trim()}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            Submit
          </button>
        </div>
        <p className="mt-3 text-center text-xs text-secondaryGray-600">
          AI SQL Assistant may produce inaccurate information. Please verify results.
        </p>
      </form>
    </div>
  )
}



