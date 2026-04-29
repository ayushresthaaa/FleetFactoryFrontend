import { apiFetch } from './client.js';

export async function loginUser({ username, password }) {
  return apiFetch('/api/Auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export async function registerUser({ username, password }) {
  return apiFetch('/api/Auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}
