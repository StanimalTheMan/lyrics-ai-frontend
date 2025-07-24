"use client"
import { useAuth } from "../context/AuthContext"
import UserSongs from "./components/UserSongs"
import SongAnalyzer from "./components/SongAnalyzer"
import { useState, useEffect } from "react"

export default function HomePage() {
  const { token, isAuthenticated } = useAuth()
  const [userSongs, setUserSongs] = useState([])

  const fetchUserSongs = async () => {
    if (!token) return
    try {
      const res = await fetch("http://localhost:8080/api/usersongs", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error("Failed to fetch user songs")
      const data = await res.json()
      setUserSongs(data)
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserSongs()
    }
  }, [isAuthenticated, token])

  return (
    <div className="page-content">
      <SongAnalyzer onSaveSuccess={fetchUserSongs} />
      {isAuthenticated && token && <UserSongs songs={userSongs} />}
    </div>
  )
}
