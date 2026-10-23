const HOUR = 3600000

// Delay until the next token refresh: half of the token's remaining lifetime,
// at most an hour, at least 10 s. The api lifetime is configurable
// (JWT_LIFETIME_SECONDS), so a fixed hourly refresh let shorter tokens expire first.
export const refreshDelay = (token: string, now = Date.now()): number => {
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    const { exp } = JSON.parse(atob(payload))
    return Math.min(HOUR, Math.max(10000, (exp * 1000 - now) / 2))
  } catch {
    return HOUR
  }
}
