"use client"
import React, { useState, useEffect } from "react"
import AuthForm from "./components/AuthForm"
import UserSongs from "./components/UserSongs"
import SongAnalyzer from "./components/SongAnalyzer"

export default function HomePage() {
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) setToken(token)
  }, [])

  const handleAuthSuccess = (jwt: string) => {
    setToken(jwt)
    localStorage.setItem("token", jwt)
  }

  const handleLogout = () => {
    setToken(null)
    localStorage.removeItem("token")
  }

  return (
    <main className="flex flex-col items-center p-6">
      <SongAnalyzer />
      {!token ? (
        <AuthForm onAuthSuccess={handleAuthSuccess} />
      ) : (
        <UserSongs token={token} onLogout={handleLogout} />
      )}
    </main>
  )
}
