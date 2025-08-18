import { render, screen } from "@testing-library/react"
import { test, expect } from "vitest"
import LyricsWithActions, { Highlight } from "./LyricsWithActions"

const lyrics = "This is a test lyric"
const highlights: Highlight[] = [
  {
    startIndex: 10,
    endIndex: 14,
    selectedText: "test",
    explanation: "Example tooltip",
  },
]

test("renders lyrics", () => {
  render(
    <LyricsWithActions
      lyrics={lyrics}
      highlights={highlights}
      onAddHighlight={() => {}}
      token="dummy"
      songId="1"
    />
  )

  expect(screen.getByText(/This is a/i)).toBeInTheDocument()
  expect(screen.getByText(/test/i)).toBeInTheDocument()
  expect(screen.getByText(/ lyric/i)).toBeInTheDocument()
})
