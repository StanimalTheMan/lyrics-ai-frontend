"use client"
import React, { useRef, useState } from "react"

export type Highlight = {
  id?: number
  startIndex: number
  endIndex: number
  selectedText: string
  explanation: string
}

export default function LyricsWithActions({
  lyrics,
  highlights,
  onAddHighlight,
  token,
  songId,
}: {
  lyrics: string
  highlights: Highlight[]
  onAddHighlight: (h: Highlight) => void
  token: string
  songId: string
}) {
  const lyricsRef = useRef<HTMLDivElement>(null)
  const [selection, setSelection] = useState<null | {
    text: string
    start: number
    end: number
    rect: DOMRect
  }>(null)

  const [hoveredHighlightIndex, setHoveredHighlightIndex] = useState<
    number | null
  >(null)
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null)

  // Handle user text selection
  const handleMouseUp = () => {
    const sel = window.getSelection()
    if (!sel || sel.isCollapsed) {
      setSelection(null)
      return
    }

    const text = sel.toString()
    if (!text || !lyricsRef.current) return

    const lyricsText = lyricsRef.current.innerText
    const start = lyricsText.indexOf(text)
    if (start === -1) return

    const end = start + text.length
    const range = sel.getRangeAt(0)
    const rect = range.getBoundingClientRect()

    setSelection({ text, start, end, rect })
  }

  const handleHighlightAnalyze = async () => {
    if (!selection || !token) return

    const res = await fetch(
      `http://localhost:8080/api/songs/${songId}/highlights`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          startIndex: selection.start,
          endIndex: selection.end,
          selectedText: selection.text,
          explanation: "",
        }),
      }
    )

    if (res.status === 401) {
      alert("Unauthorized. Please log in again.")
      setSelection(null)
      return
    }

    const data = await res.json()
    onAddHighlight(data)
    setSelection(null)
  }

  const handlePronounce = () => {
    if (!selection) return
    const utter = new window.SpeechSynthesisUtterance(selection.text)
    utter.lang = "en"
    window.speechSynthesis.speak(utter)
    setSelection(null)
  }

  const renderLyrics = () => {
    const safeHighlights = Array.isArray(highlights) ? highlights : []
    if (safeHighlights.length === 0) return lyrics

    const elements = []
    let lastIndex = 0

    const sorted = [...safeHighlights].sort(
      (a, b) => a.startIndex - b.startIndex
    )

    sorted.forEach((h, i) => {
      if (h.startIndex > lastIndex) {
        elements.push(lyrics.slice(lastIndex, h.startIndex))
      }

      elements.push(
        <span
          key={i}
          style={{
            background: "#ffe066",
            cursor: "pointer",
            position: "relative",
            borderRadius: 2,
          }}
          onMouseEnter={() => {
            if (hoverTimeout) {
              clearTimeout(hoverTimeout)
              setHoverTimeout(null)
            }
            setHoveredHighlightIndex(i)
          }}
          onMouseLeave={() => {
            const timeout = setTimeout(() => {
              setHoveredHighlightIndex(null)
            }, 300) // 300ms delay before closing
            setHoverTimeout(timeout)
          }}
        >
          {lyrics.slice(h.startIndex, h.endIndex)}

          {hoveredHighlightIndex === i && (
            <div
              style={{
                position: "fixed",
                background: "#000",
                color: "#fff",
                border: "1px solid #ccc",
                borderRadius: 4,
                zIndex: 1000,
                padding: 8,
                maxWidth: "300px",
                maxHeight: "200px",
                overflowY: "auto",
                wordBreak: "break-word",
                whiteSpace: "pre-wrap",
                boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
                scrollbarWidth: "thin",
              }}
              onMouseEnter={() => {
                if (hoverTimeout) {
                  clearTimeout(hoverTimeout)
                  setHoverTimeout(null)
                }
              }}
              onMouseLeave={() => setHoveredHighlightIndex(null)}
            >
              {h.explanation || "No explanation available."}
            </div>
          )}
        </span>
      )
      lastIndex = h.endIndex
    })

    if (lastIndex < lyrics.length) {
      elements.push(lyrics.slice(lastIndex))
    }

    return elements
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div
        ref={lyricsRef}
        onMouseUp={handleMouseUp}
        style={{
          width: "100%",
          maxWidth: "500px",
          fontSize: "18px",
          lineHeight: 1.6,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        {renderLyrics()}
      </div>

      {selection && (
        <div
          style={{
            position: "fixed",
            top: selection.rect.bottom + 5,
            left: selection.rect.left,
            background: "#000",
            border: "1px solid #ccc",
            borderRadius: 4,
            zIndex: 1000,
            padding: 8,
            display: "flex",
            gap: 8,
            boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
          }}
        >
          <button
            style={{ cursor: "pointer" }}
            onClick={handleHighlightAnalyze}
          >
            Highlight & Analyze
          </button>
          <button style={{ cursor: "pointer" }} onClick={handlePronounce}>
            Pronounce
          </button>
          <button
            style={{ cursor: "pointer" }}
            onClick={() => setSelection(null)}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  )
}
