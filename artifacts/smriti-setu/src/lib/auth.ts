export function getAuthToken(): string | null {
  return localStorage.getItem("smriti_token");
}

export function setAuthToken(token: string): void {
  localStorage.setItem("smriti_token", token);
}

export function clearAuthToken(): void {
  localStorage.removeItem("smriti_token");
}

export function isAuthenticated(): boolean {
  return !!getAuthToken();
}
