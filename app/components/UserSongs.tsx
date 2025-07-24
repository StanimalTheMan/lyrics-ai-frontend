"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Song } from "../songs/[id]/page"

export default function UserSongs({ token }: { token: string }) {
  const [songs, setSongs] = useState<Song[]>([])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch("http://localhost:8080/api/usersongs", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch songs")
        return res.json()
      })
      .then((data) => setSongs(Array.isArray(data) ? data : []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [token])

  return (
    <div className="user-songs">
      <h2 className="section-title">Your Saved Songs</h2>

      {loading ? (
        <p>Loading your songs...</p>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : songs.length === 0 ? (
        <p>No saved songs yet</p>
      ) : (
        <ul className="song-list">
          {songs.map((song) => (
            <li key={song.id} className="song-item">
              <Link href={`/songs/${song.id}`} className="song-link">
                <div className="song-image-container">
                  <Image
                    src={song.imageUrl}
                    alt={`${song.title} by ${song.artist}`}
                    width={300}
                    height={300}
                    className="song-image"
                  />
                </div>
                <div className="song-info">
                  <h3 className="song-title">{song.title}</h3>
                  <p className="song-artist">{song.artist}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
