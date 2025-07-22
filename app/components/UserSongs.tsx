"use client"
import React, { useEffect, useState } from "react"
import Link from "next/link"

export default function UserSongs({
  token,
  onLogout,
}: {
  token: string
  onLogout: () => void
}) {
  const [songs, setSongs] = useState<any[]>([])
  const [error, setError] = useState("")
  console.log(token)
  useEffect(() => {
    fetch("http://localhost:8080/api/usersongs", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setSongs(Array.isArray(data) ? data : []))
      .catch(() => setError("Failed to fetch songs"))
  }, [token])

  return (
    <div>
      <h2>Your Saved Songs</h2>
      {token != "" && <button onClick={onLogout}>Logout</button>}
      {error && <div style={{ color: "red" }}>{error}</div>}
      <ul>
        {songs.map((song) => (
          <li key={song.id}>
            <Link href={`/songs/${song.id}`}>
              {song.title} by {song.artist}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
