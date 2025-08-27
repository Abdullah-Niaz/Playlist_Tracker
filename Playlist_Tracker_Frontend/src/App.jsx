import React, { useState } from "react";


import PlaylistDisplay from "./Components/PlaylistDisplay";
import PlaylistForm from "./Components/PlaylistForm";

export default function App() {
  const [playlistData, setPlaylistData] = useState(null);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-center mb-6">🎵 Playlist Tracker</h1>

      {/* Form */}
      <PlaylistForm setPlaylistData={setPlaylistData} />

      {/* Display Playlist */}
      {playlistData ? (
        <PlaylistDisplay playlist={playlistData} />
      ) : (
        <p className="text-center text-gray-500 mt-6">
          Paste a playlist URL to get started!
        </p>
      )}
    </div>
  );
}
