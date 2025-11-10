const API_BASE = process.env.NODE_ENV === 'production' 
  ? 'https://sql-bot-worker.adudeja-be23.workers.dev' 
  : 'http://localhost:8000'

function getAuthHeaders() {
  const token = localStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  }
}

export async function addUser(username, password, role = 'user', schema = null, admin_schema = null) {
  const body = { username, password, role };
  if (schema !== null) {
    body.schema = schema;
  }
  if (admin_schema !== null) {
    body.admin_schema = admin_schema;
  }
  
  const response = await fetch(`${API_BASE}/api/admin/add-user`, {
    method: 'POST',
    headers: getAuthHeaders(),
    credentials: 'omit',
    body: JSON.stringify(body)
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || error.error || error.message || 'Failed to add user')
  }
  
  const data = await response.json()
  return { success: true, id: data.id }
}

export async function removeUser(username) {
  const response = await fetch(`${API_BASE}/api/admin/remove-user`, {
    method: 'POST',
    headers: getAuthHeaders(),
    credentials: 'omit',
    body: JSON.stringify({ username })
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || error.error || error.message || 'Failed to remove user')
  }
  
  return { success: true }
}

export async function getUsers() {
  const response = await fetch(`${API_BASE}/api/admin/users`, {
    method: 'GET',
    headers: getAuthHeaders(),
    credentials: 'omit'
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || error.error || error.message || 'Failed to get users')
  }
  
  const data = await response.json()
  return data.users
}

export async function updateUser(userId, userData) {
  const response = await fetch(`${API_BASE}/api/admin/users/${userId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    credentials: 'omit',
    body: JSON.stringify(userData)
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || error.error || error.message || 'Failed to update user')
  }
  
  const data = await response.json()
  return data
}




