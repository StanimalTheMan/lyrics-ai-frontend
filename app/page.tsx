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
    if (!songs) return

    const response = await fetch(
      "http://localhost:8000/analyze_song_comprehensive",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          song_title: "시작",
          artist: "gaho",
          lyrics: songs[0].lyrics,
        }),
      }
    )
    const data = await response.json()
    console.log(data)
    // setExplanation(data.explanation);
  }

  const handleGetSongs = async () => {
    const res = await fetch(
      `http://localhost:8080/api/songs/details?track=What%20is%20Love%3F&artist=TWICE`
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
    speech.lang = "ko" // Korean
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
      {explanation && <p className="mt-4">Explanation: {explanation}</p>}
      {Object.keys(song).length > 0 && (
        <>
          <a
            href={song.trackInfo.spotifyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600"
          >
            <Image
              src={song.trackInfo.imageUrl}
              alt={`${song.trackInfo.track} by ${song.trackInfo.artist}`}
              width={300}
              height={300}
              className="rounded-lg"
            />
            {song.trackInfo.track} - {song.trackInfo.artist}
          </a>
          <ul className="mt-4">{song.lyrics}</ul>
        </>
      )}
    </div>
  )
}
