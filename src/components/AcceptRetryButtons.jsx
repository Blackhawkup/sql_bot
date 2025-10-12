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
    <div className="mt-3 flex gap-2">
      <button className="btn-primary" onClick={onAccept}>Accept</button>
      <button className="px-3 py-2 rounded-md border border-white/20 hover:bg-white/10 transition" onClick={onRetry}>Retry</button>
      {rows && rows.length > 0 && (
        <button 
          className="px-3 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors text-sm"
          onClick={downloadExcel}
        >
          📥 Download Excel
        </button>
      )}
    </div>
  )
}



