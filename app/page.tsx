"use client"
import { useEffect, useState } from "react"
import UserSongs from "./components/UserSongs"
import SongAnalyzer from "./components/SongAnalyzer"

export default function HomePage() {
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    setToken(localStorage.getItem("token"))
  }, [])

  return (
    <div className="page-content">
      <SongAnalyzer />
      {token && <UserSongs token={token} />}
    </div>
  )
}
