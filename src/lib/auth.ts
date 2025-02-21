const TOKEN_KEY_PREFIX = 'blind_ballot_admin_token_';

export function getStoredToken(sessionSlug: string): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(`${TOKEN_KEY_PREFIX}${sessionSlug}`);
}

export function storeToken(sessionSlug: string, token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`${TOKEN_KEY_PREFIX}${sessionSlug}`, token);
}

export function removeToken(sessionSlug: string): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(`${TOKEN_KEY_PREFIX}${sessionSlug}`);
}
