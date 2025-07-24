"use client"
import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { Song } from "../songs/[id]/page"

export default function SongAnalyzer() {
  const [searchParams, setSearchParams] = useState({
    track: "",
    artist: "",
  })
  const [song, setSong] = useState<Partial<Song>>({})
  const [selectedText, setSelectedText] = useState("")
  const [explanation, setExplanation] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState("")

  const abortControllerRef = useRef<AbortController | null>(null)

  // Add cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  const handleSearch = async () => {
    if (!searchParams.track.trim() || !searchParams.artist.trim()) {
      setSearchError("Please enter both track and artist")
      return
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Create new controller
    abortControllerRef.current = new AbortController()
    setIsSearching(true)
    setSearchError("")

    try {
      const response = await fetch(
        `http://localhost:8080/api/songs/details?track=${encodeURIComponent(
          searchParams.track
        )}&artist=${encodeURIComponent(searchParams.artist)}`,
        { signal: abortControllerRef.current.signal } // Add abort signal
      )

      console.log(response.ok)

      if (!response.ok)
        throw new Error(
          response.status === 404
            ? "Song not found"
            : `Search failed (${response.status})`
        )

      const data = await response.json()
      setSong(data)
    } catch (error) {
      // Ignore abort errors
      if (error.name !== "AbortError") {
        setSearchError(error instanceof Error ? error.message : "Search failed")
      }
    } finally {
      setIsSearching(false)
    }
  }

  const handleAnalyze = async () => {
    console.log("Analyze button clicked")
    if (!song.title || !selectedText) {
      return
    }
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
    console.log("fff")
    const data = await response.json()
    setExplanation(data.explanation)
  }

  return (
    <div className="w-full max-w-5xl">
      {/* Search Section - Now requires both fields */}
      <div className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-sm font-medium mb-1">Track</label>
            <input
              type="text"
              value={searchParams.track}
              onChange={(e) =>
                setSearchParams({ ...searchParams, track: e.target.value })
              }
              placeholder="e.g. dtmf"
              className="w-full p-2 border rounded"
              disabled={isSearching}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Artist</label>
            <input
              type="text"
              value={searchParams.artist}
              onChange={(e) =>
                setSearchParams({ ...searchParams, artist: e.target.value })
              }
              placeholder="e.g. badbunny"
              className="w-full p-2 border rounded"
              disabled={isSearching}
            />
          </div>
        </div>

        <button
          onClick={handleSearch}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
          disabled={isSearching || !searchParams.track || !searchParams.artist}
        >
          {isSearching ? "Searching..." : "Find Song"}
        </button>
        {searchError && (
          <p className="text-red-500 text-sm mt-2">{searchError}</p>
        )}
      </div>

      {/* Song Display */}
      {song.title && (
        <div className="flex flex-col gap-6">
          <div className="text-center">
            <a
              href={song.spotifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block"
            >
              <Image
                src={song.imageUrl}
                alt={`${song.title} by ${song.artist}`}
                width={300}
                height={300}
                className="rounded-lg mx-auto"
              />
              <div className="mt-2 text-lg font-medium">
                {song.title} - {song.artist}
              </div>
            </a>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            {/* Lyrics Block */}
            <div className="flex-1 bg-black text-white p-4 rounded shadow border max-h-[500px] overflow-auto">
              <p
                onMouseUp={() => {
                  const selection = window.getSelection()?.toString()
                  if (selection) setSelectedText(selection)
                }}
                className="cursor-pointer select-text whitespace-pre-wrap"
              >
                {song.lyrics}
              </p>

              <div className="mt-4">
                <button
                  onClick={handleAnalyze}
                  className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                  disabled={!selectedText}
                >
                  Analyze Selection
                </button>
                {selectedText && (
                  <div className="mt-2 text-sm text-blue-200">
                    Selected: {selectedText}
                  </div>
                )}
              </div>
            </div>

            {/* Explanation Block */}
            <div className="flex-1 bg-black text-white p-4 rounded shadow border max-h-[500px] overflow-auto">
              <h2 className="text-lg font-semibold mb-2">Explanation</h2>
              <p className="whitespace-pre-wrap">
                {explanation || "Select text in lyrics and click 'Analyze'"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
