import { PUBLIC_API_BASE_URL } from '$env/static/public';

const API_BASE_URL = PUBLIC_API_BASE_URL.replace(/\/$/, '');

export async function apiFetch(path, options = {}) {
  const endpoint = path.startsWith('/') ? path : `/${path}`;
  const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`API ${response.status}: ${detail || response.statusText}`);
  }

  if (response.status === 204) return null;
  return response.json();
}
