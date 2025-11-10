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

export async function sendPrompt(prompt, schema = null) {
  const body = { prompt };
  if (schema !== null) {
    body.schema = schema;
  }
  
  const response = await fetch(`${API_BASE}/api/generate-sql`, {
    method: 'POST',
    headers: getAuthHeaders(),
    credentials: 'omit',
    body: JSON.stringify(body)
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || error.error || error.message || 'Failed to generate SQL')
  }
  
  const data = await response.json()
  return { sql: data.sql, explain: data.explain }
}

export async function runQuery(sql, limit = null) {
  const body = { sql };
  if (limit !== null) {
    body.limit = limit;
  }
  
  const response = await fetch(`${API_BASE}/api/run-query`, {
    method: 'POST',
    headers: getAuthHeaders(),
    credentials: 'omit',
    body: JSON.stringify(body)
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || error.error || error.message || 'Failed to run query')
  }
  
  const data = await response.json()
  return { success: true, message: `Fetched ${data.rows.length} rows successfully`, rows: data.rows }
}

export async function retryQuery(prompt, feedback) {
  // Combine the original prompt with the feedback
  const combinedPrompt = `${prompt}\n\nAdditional requirements: ${feedback}`;
  return sendPrompt(combinedPrompt);
}

export async function getChatHistory() {
  const response = await fetch(`${API_BASE}/api/chat-history`, {
    method: 'GET',
    headers: getAuthHeaders(),
    credentials: 'omit'
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || error.error || error.message || 'Failed to get chat history')
  }
  
  const data = await response.json()
  return data.messages
}

export async function saveChatSession(sessionName, messages) {
  const response = await fetch(`${API_BASE}/api/save-session`, {
    method: 'POST',
    headers: getAuthHeaders(),
    credentials: 'omit',
    body: JSON.stringify({
      session_name: sessionName,
      messages: messages
    })
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || error.error || error.message || 'Failed to save chat session')
  }
  
  const data = await response.json()
  return data.session_id
}

export async function getChatSessions() {
  const response = await fetch(`${API_BASE}/api/chat-sessions`, {
    method: 'GET',
    headers: getAuthHeaders(),
    credentials: 'omit'
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || error.error || error.message || 'Failed to get chat sessions')
  }
  
  const data = await response.json()
  return data.sessions
}

export async function getChatSession(sessionId) {
  const response = await fetch(`${API_BASE}/api/chat-session/${sessionId}`, {
    method: 'GET',
    headers: getAuthHeaders(),
    credentials: 'omit'
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || error.error || error.message || 'Failed to get chat session')
  }
  
  const data = await response.json()
  return data.session
}

export async function deleteChatSession(sessionId) {
  const response = await fetch(`${API_BASE}/api/chat-session/${sessionId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
    credentials: 'omit'
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || error.error || error.message || 'Failed to delete chat session')
  }
  
  const data = await response.json()
  return data
}


