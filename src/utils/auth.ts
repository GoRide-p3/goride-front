import type { AuthUser } from "../services/auth";

const TOKEN_KEY = "goride_token";
const USER_KEY = "goride_user";

export function saveSession(user: AuthUser, token: string) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getCurrentUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function updateCurrentUser(changes: Partial<AuthUser>): AuthUser | null {
  const current = getCurrentUser();
  if (!current) return null;
  const updated = { ...current, ...changes };
  localStorage.setItem(USER_KEY, JSON.stringify(updated));
  return updated;
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function isAuthenticated(): boolean {
  return Boolean(getToken());
}

export const logout = clearSession;