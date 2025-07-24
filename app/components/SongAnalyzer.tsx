"use client"
import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { Song } from "../songs/[id]/page"
import "./SongAnalyzer.css"

function SongAnalyzer() {
  const [searchParams, setSearchParams] = useState({ track: "", artist: "" })
  const [song, setSong] = useState<Partial<Song>>({})
  const [selectedText, setSelectedText] = useState("")
  const [explanation, setExplanation] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState("")
  const [saveSuccess, setSaveSuccess] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const abortControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  const handleSearch = async () => {
    if (!searchParams.track.trim() || !searchParams.artist.trim()) {
      setSearchError("Please enter both song title and artist")
      return
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    abortControllerRef.current = new AbortController()
    setIsSearching(true)
    setSearchError("")

    try {
      const response = await fetch(
        `http://localhost:8080/api/songs/details?track=${encodeURIComponent(
          searchParams.track
        )}&artist=${encodeURIComponent(searchParams.artist)}`,
        { signal: abortControllerRef.current.signal }
      )

      if (!response.ok)
        throw new Error(
          response.status === 404
            ? "Song not found"
            : `Search failed (${response.status})`
        )

      const data = await response.json()
      setSong(data)
    } catch (error) {
      if (error.name !== "AbortError") {
        setSearchError(error instanceof Error ? error.message : "Search failed")
      }
    } finally {
      setIsSearching(false)
    }
  }

  const handleAnalyze = async () => {
    if (!song.title || !selectedText) return
    setIsAnalyzing(true)
    try {
      const response = await fetch("http://localhost:8080/api/analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          word: selectedText,
          context: song.lyrics,
          track: song.title,
          artist: song.artist,
        }),
      })
      const data = await response.json()
      setExplanation(data.explanation)
    } catch {
      setExplanation("Failed to get explanation.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleSaveSong = async () => {
    if (!song.id) {
      setSaveError("Song ID is missing")
      return
    }

    setIsSaving(true)
    setSaveError("")
    setSaveSuccess("")

    try {
      const token = localStorage.getItem("token")
      if (!token) throw new Error("You must be logged in to save songs")

      const response = await fetch(
        `http://localhost:8080/api/usersongs/${song.id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || "Failed to save song")
      }

      setSaveSuccess("Song saved to your collection!")
    } catch (error) {
      setSaveError(
        error instanceof Error ? error.message : "Failed to save song"
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="song-analyzer">
      {/* Search Section */}
      <div className="search-section">
        <h1 style={{ textAlign: "center" }}>Search for a Song</h1>
        <div className="input-row">
          <div className="input-group">
            <label>Song Title</label>
            <input
              type="text"
              value={searchParams.track}
              onChange={(e) =>
                setSearchParams({ ...searchParams, track: e.target.value })
              }
              placeholder="e.g. dtmf"
              disabled={isSearching}
            />
          </div>
          <div className="input-group">
            <label>Artist</label>
            <input
              type="text"
              value={searchParams.artist}
              onChange={(e) =>
                setSearchParams({ ...searchParams, artist: e.target.value })
              }
              placeholder="e.g. badbunny"
              disabled={isSearching}
            />
          </div>
        </div>
        <button
          onClick={handleSearch}
          disabled={isSearching || !searchParams.track || !searchParams.artist}
        >
          {isSearching ? "Searching..." : "Find Song"}
        </button>
        {searchError && <p className="error">{searchError}</p>}
      </div>

      {/* Song Display */}
      {song.title && (
        <div className="song-display">
          <div className="song-info">
            <Image
              src={song.imageUrl!}
              alt={`${song.title} by ${song.artist}`}
              fill
              className="song-image"
              sizes="300px"
            />
          </div>
          <div className="song-title">
            {song.title} - {song.artist}
          </div>

          <div className="lyrics-section">
            <div
              className="lyrics-box"
              onMouseUp={() => {
                const selection = window.getSelection()?.toString()
                if (selection) setSelectedText(selection)
              }}
            >
              <p>{song.lyrics}</p>
              <button
                onClick={handleAnalyze}
                disabled={!selectedText || isAnalyzing}
              >
                {isAnalyzing ? "Analyzing..." : "Analyze Selection"}
              </button>
              {selectedText && (
                <div className="selected-text">Selected: {selectedText}</div>
              )}
            </div>
            <button
              onClick={handleSaveSong}
              disabled={isSaving || !song.id}
              className="save-button"
            >
              {isSaving ? "Saving..." : "Save to My Songs"}
            </button>
            {saveSuccess && <p className="success">{saveSuccess}</p>}
            {saveError && <p className="error">{saveError}</p>}
          </div>

          <div className="explanation-box">
            <h2>Explanation</h2>
            {isAnalyzing ? (
              <p className="loading">Loading explanation...</p>
            ) : (
              <p>
                {explanation || "Select text in lyrics and click 'Analyze'"}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default SongAnalyzer
