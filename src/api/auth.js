const API_BASE = 'http://localhost:8000'

export async function loginApi(username, password) {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Login failed')
  }
  
  const data = await response.json()
  return {
    token: data.token,
    role: data.role,
    username,
    schema: data.schema
  }
}


