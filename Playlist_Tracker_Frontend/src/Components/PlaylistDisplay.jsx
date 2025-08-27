import React, { useState } from "react";

export default function PlaylistDisplay({ playlist }) {
  const [speed, setSpeed] = useState(1);
  const [watched, setWatched] = useState([]); // Track watched videos by index

  // Convert "12h 45m 33s" → total seconds
  const parseDuration = (duration) => {
    const regex = /(?:(\d+)h)?\s?(?:(\d+)m)?\s?(?:(\d+)s)?/;
    const match = duration.match(regex);

    if (!match) return 0;

    const hours = parseInt(match[1] || 0);
    const minutes = parseInt(match[2] || 0);
    const seconds = parseInt(match[3] || 0);

    return hours * 3600 + minutes * 60 + seconds;
  };

  // Convert seconds → "hh:mm:ss"
  const formatDuration = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours > 0 ? hours + "h " : ""}${
      minutes > 0 ? minutes + "m " : ""
    }${seconds > 0 ? seconds + "s" : ""}`;
  };

  // Total playlist duration
  const totalSeconds = parseDuration(playlist.total_duration);

  // Calculate watched duration
  const watchedSeconds = watched.reduce((acc, idx) => {
    return acc + parseDuration(playlist.videos[idx].duration);
  }, 0);

  // Apply speed adjustment
  const adjustedTotal = Math.floor(totalSeconds / speed);
  const adjustedRemaining = Math.floor((totalSeconds - watchedSeconds) / speed);

  // Toggle watched state
  const toggleWatched = (index) => {
    setWatched((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">{playlist.playlist_title}</h2>

      {/* Playback speed selector */}
      <div className="flex items-center gap-3 mb-4">
        <p className="text-gray-600">Playback speed:</p>
        <select
          value={speed}
          onChange={(e) => setSpeed(parseFloat(e.target.value))}
          className="px-3 py-1 border rounded-md bg-white focus:ring-2 focus:ring-indigo-500"
        >
          <option value={1}>1x</option>
          <option value={1.25}>1.25x</option>
          <option value={1.5}>1.5x</option>
          <option value={2}>2x</option>
        </select>
      </div>

      {/* Time Summary */}
      <div className="mb-6 bg-gray-50 p-4 rounded-lg shadow-sm">
        <p className="text-gray-700">
          🎬 Total Duration: <span className="font-semibold">{playlist.total_duration}</span>
        </p>
        <p className="text-gray-700">
          ⚡ Adjusted Duration ({speed}x):{" "}
          <span className="font-semibold text-indigo-600">
            {formatDuration(adjustedTotal)}
          </span>
        </p>
        <p className="text-gray-700">
          ✅ Remaining Time:{" "}
          <span className="font-semibold text-green-600">
            {formatDuration(adjustedRemaining)}
          </span>
        </p>
      </div>

      {/* Video cards with checkboxes */}
      <div className="grid md:grid-cols-2 gap-4">
        {playlist.videos.map((video, index) => (
          <div
            key={index}
            className={`p-4 border rounded-lg shadow bg-white transition ${
              watched.includes(index) ? "opacity-70 bg-green-50" : ""
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <input
                type="checkbox"
                checked={watched.includes(index)}
                onChange={() => toggleWatched(index)}
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <h3 className="font-medium">{video.title}</h3>
            </div>
            <a
              href={video.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-full rounded-lg mb-2"
              />
            </a>
            <p className="text-sm text-gray-500">Duration: {video.duration}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
