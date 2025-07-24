"use client"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "../../context/AuthContext"

export default function AuthHeader() {
  const { token, logout, isAuthenticated } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  // Redirect logout can be handled by logout function or here:
  const handleLogout = () => {
    logout()
    router.push("/")
    router.refresh()
  }

  if (["/login", "/register"].includes(pathname)) return null

  return (
    <header className="auth-header">
      <Link href="/" className="logo">
        Lyrics AI
      </Link>

      <div className="auth-group">
        {isAuthenticated ? (
          <>
            <button onClick={handleLogout} className="auth-btn logout">
              Logout
            </button>
            <Link href="/" className="auth-btn">
              User Songs
            </Link>
          </>
        ) : (
          <>
            <Link href="/login" className="auth-btn">
              Login
            </Link>
            <Link href="/register" className="auth-btn register">
              Register
            </Link>
          </>
        )}
      </div>
    </header>
  )
}
