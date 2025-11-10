const API_BASE = process.env.NODE_ENV === 'production' 
  ? 'https://sql-bot-worker.adudeja-be23.workers.dev' 
  : 'http://localhost:8000'

export async function loginApi(username, password) {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'omit',
    body: JSON.stringify({ username, password })
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || error.error || error.message || 'Login failed')
  }
  
  const data = await response.json()
  return {
    token: data.token,
    role: data.role,
    username,
    schema: data.schema
  }
}


