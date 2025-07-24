"use client"
import Link from "next/link"
import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"

export default function AuthHeader() {
  const [token, setToken] = useState<string | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    setToken(localStorage.getItem("token"))
  }, [pathname])

  const handleLogout = () => {
    localStorage.removeItem("token")
    router.push("/")
    router.refresh()
  }

  if (["/login", "/register"].includes(pathname)) return null

  return (
    <header className="auth-header">
      <Link href="/" className="logo">
        My App
      </Link>

      {token ? (
        <div className="auth-group">
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      ) : (
        <div className="auth-group">
          <Link href="/login" className="auth-link">
            Login
          </Link>
          <Link href="/register" className="auth-link register">
            Register
          </Link>
        </div>
      )}
    </header>
  )
}
