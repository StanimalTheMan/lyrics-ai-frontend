"use client"

import { useState } from "react"
import Image from "next/image"
import { Song } from "../songs/[id]/page"

export default function SongAnalyzer() {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResulits, setSearchResults] = useState<Song[]>([])
  const [song, setSong] = useState({})
  const [selectedText, setSelectedText] = useState("")
  const [explanation, setExplanation] = useState("")

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
  }

  const handleAnalyze = async () => {
    if (Object.keys(song).length === 0) return
    const response = await fetch("http://localhost:8080/api/analysis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ word: selectedText, context: song.lyrics }),
    })
    const data = await response.json()
    setExplanation(data.explanation)
  }

  // const handleSpeak = async (text: string) => {
  //   if (!text) return
  //   const response = await fetch("http://localhost:8080/api/speech/speak", {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({ text }),
  //   })

  //   if (!response.ok) {
  //     console.error("Failed to generate speech")
  //     return
  //   }

  //   const audioBlob = await response.blob()
  //   const audioUrl = URL.createObjectURL(audioBlob)
  //   new Audio(audioUrl).play()
  // }

  const handleGetSongs = async () => {
    const res = await fetch(
      `http://localhost:8080/api/songs/details?track=everytime&artist=chen`
    )
    const data = await res.json()
    setSong({
      spotifyUrl: data.spotifyUrl,
      imageUrl: data.imageUrl,
      track: data.track,
      artist: data.artist,
      lyrics: data.lyrics,
    })
  }

  const handleSelection = () => {
    const selection = window.getSelection()?.toString()
    if (selection) setSelectedText(selection)
  }

  // const speakText = () => {
  //   if (!selectedText) return
  //   const speech = new SpeechSynthesisUtterance(selectedText)
  //   speech.lang = "es"
  //   speech.rate = 0.7
  //   speechSynthesis.speak(speech)
  // }

  return (
    <div className="w-full max-w-5xl">
      <button
        onClick={handleGetSongs}
        className="bg-green-500 text-white px-4 py-2 rounded mb-4"
      >
        Get Song
      </button>

      {Object.keys(song).length > 0 && (
        <div className="flex flex-col gap-6">
          <a
            href={song.spotifyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 self-center"
          >
            <Image
              src={song.imageUrl}
              alt={`${song.track} by ${song.artist}`}
              width={300}
              height={300}
              className="rounded-lg"
            />
            <div className="text-center mt-2">
              {song.track} - {song.artist}
            </div>
          </a>

          <div className="flex flex-col md:flex-row gap-6">
            {/* Lyrics Block */}
            <div className="flex-1 bg-black text-white p-4 rounded shadow border max-h-[500px] overflow-auto">
              <p
                onMouseUp={handleSelection}
                style={{
                  cursor: "pointer",
                  userSelect: "text",
                  whiteSpace: "pre-wrap",
                }}
              >
                {song.lyrics}
              </p>

              <div className="mt-4 flex flex-col gap-2">
                {/* <button
                  onClick={speakText}
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                  Pronounce
                </button>
                <button
                  onClick={() => handleSpeak(selectedText)}
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                  Play Audio
                </button> */}
                <button
                  onClick={handleAnalyze}
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                  Analyze
                </button>
              </div>
            </div>

            {/* Explanation Block */}
            <div className="flex-1 bg-black text-white p-4 rounded shadow border max-h-[500px] overflow-auto">
              <h2 className="text-lg font-semibold mb-2">Explanation</h2>
              {selectedText && (
                <p>
                  <strong>Selected:</strong> {selectedText}
                </p>
              )}
              <p className="whitespace-pre-wrap">
                {explanation || "Click 'Analyze' to get explanation."}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
