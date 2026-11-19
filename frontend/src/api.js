const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

export function getToken() { return localStorage.getItem('agrisafe_token') }

export async function api(path, options = {}) {
  const token = getToken()
  const headers = { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...options.headers }
  if (token) headers.Authorization = `Bearer ${token}`
  const response = await fetch(`${API_URL}${path}`, { ...options, headers })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.detail || 'Something went wrong')
  return data
}

export function saveSession(data) {
  localStorage.setItem('agrisafe_token', data.access_token)
  localStorage.setItem('agrisafe_user', JSON.stringify(data.user))
}
export function clearSession() {
  localStorage.removeItem('agrisafe_token')
  localStorage.removeItem('agrisafe_user')
}
