import React from 'react'
import { motion } from 'framer-motion'

export default function ChatMessage({ role = 'user', content, sql, previewRows, children }) {
  const isUser = role === 'user'
  return (
    <div className={`w-full ${isUser ? 'bg-[#343541]' : 'bg-[#444654]'} `}>
      <div className="mx-auto max-w-3xl px-4 py-6">
        <div className="flex gap-4">
          <div className="shrink-0 h-8 w-8 rounded-sm flex items-center justify-center text-sm font-bold bg-accent/20 text-accent">
            {isUser ? 'U' : 'AI'}
          </div>
          <motion.div
            className="flex-1 leading-relaxed"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18 }}
          >
            {content && <div className="whitespace-pre-wrap">{content}</div>}
            {!isUser && sql && (
              <div className="mt-4">
                <div className="text-xs uppercase tracking-wider text-gray-400 mb-2">Proposed SQL</div>
                <pre className="bg-[#202123] border border-white/10 rounded p-3 overflow-x-auto text-sm">
{sql}
                </pre>
              </div>
            )}
            {!isUser && Array.isArray(previewRows) && previewRows.length > 0 && (
              <div className="mt-4">
                <div className="text-xs uppercase tracking-wider text-gray-400 mb-2">Preview</div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-[#202123]">
                      <tr>
                        {Object.keys(previewRows[0]).map(k => (
                          <th key={k} className="text-left px-3 py-2 font-semibold">{k}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {previewRows.map((row, i) => (
                        <tr key={i} className="odd:bg-white/5">
                          {Object.keys(previewRows[0]).map(k => (
                            <td key={k} className="px-3 py-2 text-gray-200">{String(row[k])}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            {children}
          </motion.div>
        </div>
      </div>
    </div>
  )
}


