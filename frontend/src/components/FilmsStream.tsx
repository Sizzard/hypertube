"use client";

import { useState } from "react";

export default function FilmsStream() {
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testMagnet = "magnet:?xt=urn:btih:dd8255ecdc7ca55fb0bbf81323d87062db1f6d1c&dn=Big+Buck+Bunny";

  const handleStart = async () => {
    setLoading(true);
    setError(null);

    try {

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Login required");
      setLoading(false);
      return;
    }

      const res = await fetch(`/api/download-torrent?magnet=${encodeURIComponent(testMagnet)}` , {
           headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erreur inconnue");
      }
      // suppose que le backend renvoie { message: "Téléchargement démarré", torrentId: "..." }
      setResponse(JSON.stringify(data, null, 2));
    } catch (err: any) {
      console.error("Erreur FilmsStream:", err);
      setError(err.message || "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-800 rounded-lg text-white max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Stream Torrent Test</h2>
      <button
        onClick={handleStart}
        disabled={loading}
        className="px-4 py-2 bg-yellow-400 text-gray-900 rounded hover:bg-yellow-300 disabled:opacity-50"
      >
        {loading ? "Démarrage..." : "Démarrer le téléchargement (Big Buck Bunny)"}
      </button>
      {response && (
        <pre className="mt-4 bg-gray-900 p-4 rounded text-sm whitespace-pre-wrap break-all">
          {response}
        </pre>
      )}
      {error && (
        <p className="mt-4 text-red-500">Erreur : {error}</p>
      )}
    </div>
  );
}
