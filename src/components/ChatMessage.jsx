import React from 'react'
import { motion } from 'framer-motion'

export default function ChatMessage({ role = 'user', content, sql, previewRows, children }) {
  const isUser = role === 'user'
  return (
    <div className={`w-full ${isUser ? 'bg-transparent' : 'bg-secondaryGray-200'}`}>
      <div className="mx-auto max-w-4xl px-6 py-6">
        <div className="flex gap-6">
          {/* Avatar */}
          <div className={`shrink-0 h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold shadow-md ${
            isUser 
              ? 'bg-secondaryGray-300 border-2 border-secondaryGray-500 text-secondaryGray-900' 
              : 'bg-gradient-brand text-white'
          }`}>
            {isUser ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
              </svg>
            )}
          </div>

          {/* Message Content */}
          <motion.div
            className="flex-1 leading-relaxed"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18 }}
          >
            {content && (
              <div className="whitespace-pre-wrap text-[15px] leading-relaxed text-secondaryGray-900">
                {content}
              </div>
            )}
            
            {/* SQL Query Display */}
            {!isUser && sql && (
              <div className="mt-5">
                <div className="flex items-center gap-2 mb-2">
                  <div className="text-xs font-semibold uppercase tracking-wider text-secondaryGray-800">
                    Proposed SQL
                  </div>
                  <div className="flex-1 h-px bg-secondaryGray-500"></div>
                </div>
                <div className="bg-secondaryGray-300 border border-secondaryGray-500 rounded-card p-5 overflow-x-auto shadow-sm">
                  <pre className="text-sm text-secondaryGray-900 font-mono leading-relaxed">{sql}</pre>
                </div>
              </div>
            )}
            
            {/* Preview Table */}
            {!isUser && Array.isArray(previewRows) && previewRows.length > 0 && (
              <div className="mt-5">
                <div className="flex items-center gap-2 mb-2">
                  <div className="text-xs font-semibold uppercase tracking-wider text-secondaryGray-800">
                    Preview (Top 5 rows)
                  </div>
                  <div className="flex-1 h-px bg-secondaryGray-500"></div>
                </div>
                <div className="overflow-hidden rounded-card border border-secondaryGray-500 shadow-card bg-secondaryGray-300">
                  <div className="overflow-x-auto max-h-96">
                    <table className="min-w-full text-sm">
                      <thead className="bg-secondaryGray-400 sticky top-0">
                        <tr>
                          {previewRows[0] && Object.keys(previewRows[0]).map(k => (
                            <th 
                              key={k} 
                              className="text-left px-4 py-3 font-semibold text-secondaryGray-900 whitespace-nowrap border-b border-secondaryGray-500/0"
                            >
                              {k}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-secondaryGray-400">
                        {previewRows.slice(0, 5).map((row, i) => (
                          <tr 
                            key={i} 
                            className="hover:bg-secondaryGray-200 transition-colors"
                          >
                            {row && Object.keys(row).map(k => (
                              <td 
                                key={k} 
                                className="px-4 py-3 text-secondaryGray-900 whitespace-nowrap" 
                                title={String(row[k] || '')}
                              >
                                <div className="max-w-[200px] truncate">
                                  {String(row[k] || '').length > 30 
                                    ? `${String(row[k] || '').substring(0, 30)}...` 
                                    : String(row[k] || '')}
                                </div>
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
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


