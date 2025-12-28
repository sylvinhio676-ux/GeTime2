import api, { setAuthToken } from './api';

const TOKEN_KEY = 'api_token';

export async function login(email, password) {
  const res = await api.post('/login', { email, password });
  const token = res.data?.access_token;
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
    setAuthToken(token);
  }
  return res.data;
}

export function logout() {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    setAuthToken(token);
    // call backend logout endpoint if you have one
    api.post('/logout').catch(() => {});
  }
  localStorage.removeItem(TOKEN_KEY);
  setAuthToken(null);
}

export function initAuthFromStorage() {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) setAuthToken(token);
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}
