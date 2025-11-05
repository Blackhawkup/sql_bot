import React from 'react'
import * as XLSX from 'xlsx'

export default function AcceptRetryButtons({ onAccept, onRetry, sql, rows }) {
  const downloadExcel = () => {
    if (!rows || rows.length === 0) {
      alert('No data to download')
      return
    }

    // Create a new workbook
    const wb = XLSX.utils.book_new()
    
    // Convert rows to worksheet
    const ws = XLSX.utils.json_to_sheet(rows)
    
    // Add the worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Query Results')
    
    // Generate filename with timestamp
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
    const filename = `sql_query_results_${timestamp}.xlsx`
    
    // Save the file
    XLSX.writeFile(wb, filename)
  }

  return (
    <div className="mt-4 flex gap-3">
      <button 
        className="px-6 py-2.5 bg-gradient-brand text-white font-semibold rounded-button shadow-button transition-all duration-200 hover:shadow-hover flex items-center gap-2"
        onClick={onAccept}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        Accept
      </button>
      
      <button 
        className="px-6 py-2.5 bg-secondaryGray-300 text-navy-700 font-semibold rounded-button transition-all duration-200 hover:bg-secondaryGray-400 flex items-center gap-2" 
        onClick={onRetry}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Retry
      </button>
      
      {rows && rows.length > 0 && (
        <button 
          className="px-6 py-2.5 bg-gradient-teal text-white font-semibold rounded-button shadow-button transition-all duration-200 hover:shadow-teal flex items-center gap-2"
          onClick={downloadExcel}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Download Excel
        </button>
      )}
    </div>
  )
}



