const API_BASE = 'http://localhost:8000'

function getAuthHeaders() {
  const token = localStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  }
}

export async function sendPrompt(prompt, schema = null) {
  const response = await fetch(`${API_BASE}/api/generate-sql`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ prompt, schema })
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Failed to generate SQL')
  }
  
  const data = await response.json()
  return { sql: data.sql, preview: data.preview }
}

export async function runQuery(sql, limit = null) {
  const response = await fetch(`${API_BASE}/api/run-query`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ sql, limit })
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Failed to run query')
  }
  
  const data = await response.json()
  return { success: true, message: `Fetched ${data.rows.length} rows successfully`, rows: data.rows }
}

export async function retryQuery(prompt, feedback) {
  return sendPrompt(prompt, feedback)
}


