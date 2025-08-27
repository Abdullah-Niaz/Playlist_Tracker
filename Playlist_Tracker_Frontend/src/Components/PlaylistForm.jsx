import React, { useState } from "react";
import axios from "axios";


export default function PlaylistForm({ setPlaylistData }) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url) return;

    setLoading(true);
    try {
      const response = await axios.post("http://127.0.0.1:8000/api/playlist/", {
        url: url,
      });
      setPlaylistData(response.data);
    } catch (error) {
      console.error("Error fetching playlist:", error);
      alert("Failed to fetch playlist. Please try again.");
    }
    setLoading(false);
  };
  return (
    <form onSubmit={handleSubmit} className="mb-6 flex gap-2">
      <input
        type="text"
        placeholder="Paste YouTube playlist URL..."
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      <button
        type="submit"
        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
      >
        {loading ? "Fetching..." : "Fetch"}
      </button>
    </form>
  );
}