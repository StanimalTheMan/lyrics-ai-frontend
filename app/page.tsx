"use client"
import { useAuth } from "../context/AuthContext"
import UserSongs from "./components/UserSongs"
import SongAnalyzer from "./components/SongAnalyzer"

export default function HomePage() {
  const { token, isAuthenticated } = useAuth()

  return (
    <div className="page-content">
      <SongAnalyzer />
      {isAuthenticated && token && <UserSongs token={token} />}
    </div>
  )
}
