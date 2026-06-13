// In development, Vite proxies /api to the backend.
// In production (VITE_API_URL set), point it to the deployed backend.
const API_BASE = import.meta.env.VITE_API_URL || '/api';

// ── Token Management ────────────────────────────────────────────

const TOKEN_KEY = 'health_assistant_token';
const USER_KEY = 'health_assistant_user';

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function storeAuth(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

async function apiFetch(url, options = {}) {
  const token = getStoredToken();
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: `Error ${res.status}` }));
    throw new Error(err.detail || `Request failed (${res.status})`);
  }
  return res.json();
}

// ── Auth API ────────────────────────────────────────────────────

export async function registerUser({ email, name, password }) {
  const data = await apiFetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    body: JSON.stringify({ email, name, password }),
  });
  storeAuth(data.access_token, data.user);
  return data;
}

export async function loginUser({ email, password }) {
  const data = await apiFetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  storeAuth(data.access_token, data.user);
  return data;
}

export async function getProfile() {
  return apiFetch(`${API_BASE}/auth/me`);
}

export async function changePassword({ currentPassword, newPassword }) {
  return apiFetch(`${API_BASE}/auth/change-password`, {
    method: 'POST',
    body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
  });
}

export function logoutUser() {
  clearAuth();
}

// ── Health Assistant API ────────────────────────────────────────

export async function analyzeSymptoms({ description, age, gender, duration, severity }) {
  return apiFetch(`${API_BASE}/analyze`, {
    method: 'POST',
    body: JSON.stringify({ description, age, gender, duration, severity }),
  });
}

export async function chatSend({ description, sessionId }) {
  return apiFetch(`${API_BASE}/chat?session_id=${sessionId || ''}`, {
    method: 'POST',
    body: JSON.stringify({ description }),
  });
}
