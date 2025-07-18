import SongAnalyzer from "./components/SongAnalyzer"

export default function HomePage() {
  return (
    <main className="flex flex-col items-center p-6">
      <h1 className="text-xl font-bold mb-4">Lyrics AI Analysis App</h1>
      <SongAnalyzer />
    </main>
  )
}
