"use client"
import Link from "next/link"
import Image from "next/image"
import { Song } from "../songs/[id]/page"

export default function UserSongs({ songs }: { songs: Song[] }) {
  return (
    <div className="user-songs">
      <h2 className="section-title">Your Saved Songs</h2>

      {songs.length === 0 ? (
        <p>No saved songs yet</p>
      ) : (
        <ul className="song-list">
          {songs.map((song) => (
            <li key={song.id} className="song-item">
              <Link href={`/songs/${song.id}`} className="song-link">
                <div className="song-image-container">
                  <Image
                    src={song.imageUrl}
                    alt={`${song.title} by ${song.artist}`}
                    width={300}
                    height={300}
                    className="song-image"
                  />
                </div>
                <div className="song-info">
                  <h3 className="song-title">{song.title}</h3>
                  <p className="song-artist">{song.artist}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
