"use client"
import React, { useRef, useState, useEffect } from "react"
import { franc } from "franc"

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

  // Detect language once lyrics load
  const [detectedLang, setDetectedLang] = useState("en")

  const [hoveredHighlightIndex, setHoveredHighlightIndex] = useState<
    number | null
  >(null)
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null)

  // State for tooltip position
  const [tooltipPosition, setTooltipPosition] = useState<{
    top: number
    left: number
  }>({
    top: 0,
    left: 0,
  })

  // Update tooltip position when hoveredHighlightIndex changes
  useEffect(() => {
    if (hoveredHighlightIndex === null) return
    if (!lyricsRef.current) return

    const highlightSpans = lyricsRef.current.querySelectorAll("span")
    const el = highlightSpans[hoveredHighlightIndex]
    if (!el) return

    const rect = el.getBoundingClientRect()
    const padding = 10
    const tooltipWidth = 300
    const tooltipHeight = 200

    let top = rect.bottom + 5
    let left = rect.left

    if (left + tooltipWidth + padding > window.innerWidth) {
      left = window.innerWidth - tooltipWidth - padding
    }
    if (top + tooltipHeight + padding > window.innerHeight) {
      top = rect.top - tooltipHeight - 5
    }

    setTooltipPosition({ top, left })
  }, [hoveredHighlightIndex])

  // useEffect to detect language
  useEffect(() => {
    if (!lyrics) return
    const langCode = franc(lyrics)

    // map ISO 693-3 code franc library returns to language that speech synthesis browser tool can understand
    const langMap = {
      eng: "en-US",
      spa: "es-ES",
      kor: "ko-KR",
      fra: "fr-FR",
      deu: "de-DE",
      jpn: "ja-JP",
      cmn: "zh-CN",
      rus: "ru-RU",
      ita: "it-IT",
      por: "pt-PT",
    }

    setDetectedLang(langMap[langCode as keyof typeof langMap] || "en-US")
  }, [lyrics])

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
      `http://lyrics-ai-backend-production.up.railway.app:8080/api/songs/${songId}/highlights`,
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
    utter.lang = detectedLang
    utter.rate = 0.7
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
                top: tooltipPosition.top,
                left: tooltipPosition.left,
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
