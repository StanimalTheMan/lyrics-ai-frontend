// Simple validation check for email
export function isValidEmail(email: string) {
  return /\S+@\S+\.\S+/.test(email)
}

// Simple function to check if JWT token expired
export function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]))
    return payload.exp * 1000 < Date.now()
  } catch {
    return true
  }
}
