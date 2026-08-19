export type Role = 'Admin' | 'Engineer';
export type WhoAmI = { id: number; fullName: string; email: string; role: Role };
export type Session = { accessToken: string; refreshToken?: string; expiresAt?: number; whoami: WhoAmI };

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7268';
let session: Session | null = null;
let refreshPromise: Promise<Session | null> | null = null;

async function fetchWhoAmI(accessToken: string): Promise<WhoAmI> {
  const response = await fetch(`${API_BASE_URL}/api/me/whoami`, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!response.ok) throw new Error(await response.text() || 'Unable to load the authenticated user.');
  const data = await response.json() as WhoAmI;
  return { ...data, role: String(data.role).trim().toLowerCase() === 'admin' ? 'Admin' : 'Engineer' };
}
export function getSession(): Session | null {
  if (session) return session;
  try {
    const raw = sessionStorage.getItem('interiorhub.session');
    if (raw) session = JSON.parse(raw) as Session;
  } catch { /* unavailable storage */ }
  return session;
}
export function saveSession(value: Session | null) {
  session = value;
  try {
    if (value) sessionStorage.setItem('interiorhub.session', JSON.stringify(value));
    else sessionStorage.removeItem('interiorhub.session');
  } catch { /* unavailable storage */ }
}
export function isLoggedIn() { return !!getSession()?.accessToken; }
export function getRole() { return getSession()?.whoami.role; }

export async function login(email: string, password: string): Promise<Session> {
  const body = new URLSearchParams({ grant_type: 'password', username: email, password, scope: 'offline_access' });
  const response = await fetch(`${API_BASE_URL}/connect/token`, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body });
  if (!response.ok) throw new Error(await response.text() || 'The credentials were not accepted.');
  const data = await response.json();
  const whoami = await fetchWhoAmI(data.access_token);
  const value = { accessToken: data.access_token, refreshToken: data.refresh_token, expiresAt: data.expires_in ? Date.now() + data.expires_in * 1000 : undefined, whoami };
  saveSession(value);
  return value;
}
async function refresh(): Promise<Session | null> {
  const current = getSession();
  if (!current?.refreshToken) return null;
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const body = new URLSearchParams({ grant_type: 'refresh_token', refresh_token: current.refreshToken || '', scope: 'offline_access' });
      const response = await fetch(`${API_BASE_URL}/connect/token`, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body });
      if (!response.ok) { saveSession(null); return null; }
      const data = await response.json();
      const whoami = await fetchWhoAmI(data.access_token);
      const value = { accessToken: data.access_token, refreshToken: data.refresh_token || current.refreshToken, expiresAt: data.expires_in ? Date.now() + data.expires_in * 1000 : undefined, whoami };
      saveSession(value);
      return value;
    })().finally(() => { refreshPromise = null; });
  }
  return refreshPromise;
}
export async function logout() {
  const current = getSession();
  if (current?.accessToken) await fetch(`${API_BASE_URL}/connect/revoke`, { method: 'POST', headers: { Authorization: `Bearer ${current.accessToken}`, 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ token: current.accessToken }) }).catch(() => undefined);
  saveSession(null);
}
export type RequestOptions = RequestInit & { retry?: boolean };
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const current = getSession();
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type') && options.body && !(options.body instanceof FormData)) headers.set('Content-Type', 'application/json');
  if (current?.accessToken) headers.set('Authorization', `Bearer ${current.accessToken}`);
  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  if (response.status === 401 && options.retry !== false && current?.refreshToken) {
    const next = await refresh();
    if (next) return apiRequest<T>(path, { ...options, retry: false });
  }
  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try { const error = await response.json(); message = error.message || error.title || error.detail || (Array.isArray(error.errors) ? error.errors.join(', ') : message); } catch { const text = await response.text().catch(() => ''); if (text) message = text; }
    throw new Error(message);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
export function upload<T>(path: string, file: File, fields: Record<string, string> = {}) {
  const form = new FormData(); form.append('file', file); Object.entries(fields).forEach(([key, value]) => form.append(key, value));
  return apiRequest<T>(path, { method: 'POST', body: form });
}
export function normalizePage<T>(payload: unknown): { items: T[]; totalCount: number; totalPages: number } {
  const value = (payload || {}) as Record<string, unknown>;
  const items = (value.items || value.data || value.results || (Array.isArray(payload) ? payload : [])) as T[];
  const totalCount = Number(value.totalCount ?? value.total ?? items.length);
  const totalPages = Number(value.totalPages ?? Math.max(1, Math.ceil(totalCount / Math.max(items.length, 1))));
  return { items: Array.isArray(items) ? items : [], totalCount, totalPages };
}
