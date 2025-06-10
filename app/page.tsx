"use client"
import { useState } from "react"
import Image from "next/image"

export default function Home() {
  const [translation, setTranslation] = useState(null)
  const [romanizedTranslation, setRomanizedTranslation] = useState(null)
  // const [songs, setSongs] = useState([])
  const [song, setSong] = useState({})
  const [selectedText, setSelectedText] = useState("")
  const [explanation, setExplanation] = useState("")

  const handleTranslate = async () => {
    if (!selectedText) return

    const response = await fetch("http://localhost:8000/translate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: selectedText, target_lang: "en" }),
    })
    const data = await response.json()
    setTranslation(data.translation)
  }

  const handleRomanize = async () => {
    if (!selectedText) return

    const response = await fetch("http://localhost:8000/romanize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: selectedText }),
    })
    const data = await response.json()
    setRomanizedTranslation(data.romanization)
  }

  const handleAnalyze = async () => {
    // if (!selectedText || !songs) return;
    if (Object.keys(song).length == 0) return
    console.log(`word: ${selectedText}`)
    console.log(`context: ${song.lyrics}`)
    const response = await fetch("http://localhost:8080/api/analysis", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        word: selectedText,
        context: song.lyrics,
      }),
    })
    const data = await response.json()
    console.log(data)
    setExplanation(data.explanation)
  }

  const handleGetSongs = async () => {
    const res = await fetch(
      `http://localhost:8080/api/songs/details?track=dtmf&artist=Bad Bunny`
    )
    const data = await res.json()
    console.log(data)
    setSong({ trackInfo: data.trackInfo, lyrics: data.lyrics })
    console.log(data.lyrics)
  }

  // Get selected text
  const handleSelection = () => {
    const selection = window.getSelection()?.toString()
    if (selection) setSelectedText(selection)
  }

  // Speak the selected text
  const speakText = () => {
    if (!selectedText) return
    const speech = new SpeechSynthesisUtterance(selectedText)
    speech.lang = "es" // spanish
    speech.rate = 0.7
    speechSynthesis.speak(speech)
  }

  return (
    <div className="flex flex-col items-center p-6">
      <h1 className="text-xl font-bold mb-4">Music Translation App</h1>

      <div className="flex gap-4 mt-4">
        <button
          onClick={handleGetSongs}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Get Songs
        </button>
        <button
          onClick={handleTranslate}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Translate
        </button>
      </div>

      {translation && <p className="mt-4">Translation: {translation}</p>}

      {Object.keys(song).length > 0 && (
        <div className="flex flex-col w-full max-w-5xl mt-6">
          <a
            href={song.trackInfo.spotifyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 mb-4 self-center"
          >
            <Image
              src={song.trackInfo.imageUrl}
              alt={`${song.trackInfo.track} by ${song.trackInfo.artist}`}
              width={300}
              height={300}
              className="rounded-lg"
            />
            <div className="text-center mt-2">
              {song.trackInfo.track} - {song.trackInfo.artist}
            </div>
          </a>

          <div className="flex flex-col md:flex-row gap-6 mt-6">
            {/* Lyrics Block */}
            <div className="flex-1 bg-black p-4 rounded shadow border overflow-auto max-h-[500px]">
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
                <button
                  onClick={speakText}
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                  Pronounce Selected Text
                </button>
                <button
                  onClick={handleAnalyze}
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                  Use OpenAI to analyze context of this word or phrase:
                </button>
                {/* <button
                  onClick={handleRomanize}
                  className="bg-purple-500 text-white px-4 py-2 rounded"
                >
                  Romanize Selected Text
                </button> */}
              </div>
            </div>

            {/* Explanation Block */}
            <div className="flex-1 bg-black p-4 rounded shadow border overflow-auto max-h-[500px]">
              <h2 className="text-lg font-semibold mb-2">Explanation</h2>
              {selectedText && (
                <p className="text-sm0 mb-2">
                  <strong>Selected:</strong> {selectedText}
                </p>
              )}
              <p className="whitespace-pre-wrap">
                {explanation || "Select text and click analyze."}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
