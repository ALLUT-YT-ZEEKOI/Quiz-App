// API client for the CohesionTech backend (Node.js + Express + MongoDB).
//
// The backend is used when VITE_API_URL is set (e.g. in .env.local:
//   VITE_API_URL=http://localhost:5000/api
// ). Without it, the app keeps working on this browser's local storage only.

export const API_URL = (import.meta.env.VITE_API_URL || '').trim().replace(/\/+$/, '');
export const backendEnabled = Boolean(API_URL);

const TOKEN_KEY = 'cohesion_token';

export const getToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};
export const setToken = (token) => {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {}
};
export const clearToken = () => {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {}
};

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

let onUnauthorized = null;
/** Called when the server says the session is no longer valid. */
export const setUnauthorizedHandler = (fn) => {
  onUnauthorized = fn;
};

/**
 * Calls the API. `body` objects are sent as JSON; Blobs/ArrayBuffers are sent raw.
 * Returns parsed JSON (or a Blob when `responseType: 'blob'`). Throws ApiError on failure.
 */
export const api = async (path, { method = 'GET', body, headers = {}, responseType = 'json', auth = true, timeout = 10000 } = {}) => {
  const isRaw = body instanceof Blob || body instanceof ArrayBuffer;
  const token = auth ? getToken() : null;
  let res;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      signal: controller.signal,
      headers: {
        ...(body !== undefined && !isRaw ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers
      },
      body: body === undefined ? undefined : isRaw ? body : JSON.stringify(body)
    });
  } catch (err) {
    if (err?.name === 'AbortError') {
      throw new ApiError('Server response timed out. Please check if the backend is running.', 0, null);
    }
    throw new ApiError(`Cannot reach the backend server at ${API_URL || 'localhost:5000'}. Please ensure the backend is started.`, 0, null);
  } finally {
    clearTimeout(timeoutId);
  }

  if (res.status === 401 && token && onUnauthorized && !path.startsWith('/auth/')) onUnauthorized();

  if (!res.ok) {
    let data = null;
    try {
      data = await res.json();
    } catch {}
    throw new ApiError(data?.error || `Request failed (${res.status})`, res.status, data);
  }
  if (responseType === 'blob') return res.blob();
  if (res.status === 204) return null;
  return res.json();
};
