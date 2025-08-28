"use client"

import { useEffect } from "react"
import { useRouter } from "next/router"
import { useAuth } from "../../../context/AuthContext"

export default function OAuthCallback() {
  const router = useRouter()
  const { login } = useAuth()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get("token")
    if (token) {
      login(token)
      router.push("/")
    } else {
      router.push("/login")
    }
  }, [login, router])

  return <div>Logging in...</div>
}
