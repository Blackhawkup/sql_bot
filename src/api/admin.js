const API_BASE = 'http://localhost:8000'

function getAuthHeaders() {
  const token = localStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  }
}

export async function addUser(username, password, role = 'user', schema = null) {
  const response = await fetch(`${API_BASE}/api/admin/add-user`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ username, password, role, schema })
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Failed to add user')
  }
  
  const data = await response.json()
  return { success: true, id: data.id }
}

export async function removeUser(username) {
  const response = await fetch(`${API_BASE}/api/admin/remove-user`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ username })
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Failed to remove user')
  }
  
  return { success: true }
}

export async function analyzeColumns() {
  const response = await fetch(`${API_BASE}/api/admin/analyze-columns`, {
    method: 'GET',
    headers: getAuthHeaders()
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Failed to analyze columns')
  }
  
  const data = await response.json()
  return data.analysis
}


