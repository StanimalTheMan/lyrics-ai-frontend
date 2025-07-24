"use client"
import LyricsWithActions, {
  Highlight,
} from "../../components/LyricsWithActions"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"

export type Song = {
  id: number
  title: string
  artist: string
  lyrics: string
  spotifyUrl: string
  imageUrl: string
}

export default function SongDetailPage() {
  const { id } = useParams()
  const [song, setSong] = useState<Song | null>(null)
  const [highlights, setHighlights] = useState<Highlight[]>([])
  const [error, setError] = useState("")
  const [token, setToken] = useState<string | null>(null)
  const [refreshHighlights, setRefreshHighlights] = useState(0)

  useEffect(() => {
    setToken(localStorage.getItem("token"))
  }, [])

  useEffect(() => {
    if (!id || !token) return
    fetch(`http://localhost:8080/api/songs/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res.status === 401) {
          setError("Unauthorized. Please log in again.")
          return null
        }
        return res.json()
      })
      .then((data) => {
        if (data) setSong(data)
      })
      .catch(() => setError("Failed to load song"))
  }, [id, token])

  useEffect(() => {
    if (!id || !token) return
    fetch(`http://localhost:8080/api/songs/${id}/highlights`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res.status === 401) {
          setError("Unauthorized. Please log in again.")
          return []
        }
        if (res.status === 404) {
          setError(
            "You have not saved this song, so no highlights are available."
          )
          return []
        }
        return res.json()
      })
      .then((data) => {
        if (Array.isArray(data)) setHighlights(data)
      })
      .catch(() => {})
  }, [id, token, refreshHighlights])

  const handleAddHighlight = (_highlight: Highlight) => {
    setRefreshHighlights((prev) => prev + 1)
  }

  if (error) return <div>{error}</div>

  return (
    <div>
      {song && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "1rem",
            padding: "1rem",
          }}
        >
          <div style={{ width: "100%", textAlign: "center" }}>
            <h1 style={{ fontSize: "24px", fontWeight: "bold" }}>
              {song.title} - {song.artist}
            </h1>
          </div>
          <div
            style={{ display: "flex", justifyContent: "center", width: "100%" }}
          >
            <a href={song.spotifyUrl} target="_blank" rel="noopener noreferrer">
              <Image
                src={song.imageUrl}
                alt={`${song.title} by ${song.artist}`}
                width={300}
                height={300}
                style={{
                  borderRadius: "0.5rem",
                  objectFit: "cover",
                }}
              />
            </a>
          </div>
          <LyricsWithActions
            lyrics={song.lyrics}
            highlights={highlights}
            onAddHighlight={handleAddHighlight}
            token={token!}
            songId={id as string}
          />
        </div>
      )}
    </div>
  )
}
