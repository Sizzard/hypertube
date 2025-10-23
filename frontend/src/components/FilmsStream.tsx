"use client";

import { useEffect, useState } from "react";

export default function FilmsStream() {
  const [status, setStatus] = useState("idle");
  const [videoUrl, setVideoUrl] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTorrent = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("❌ Vous devez être connecté pour télécharger un film.");
          return;
        }

        setStatus("downloading...");

        // Magnet officiel Big Buck Bunny (domaine public)
        const magnet =
          "magnet:?xt=urn:btih:dd8255ecdc7ca55fb0bbf81323d87062db1f6d1c&dn=Big+Buck+Bunny";

        const res = await fetch(
          `/api/download-torrent?magnet=${encodeURIComponent(magnet)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!res.ok) throw new Error(`Erreur HTTP ${res.status}`);

        const data = await res.json();

        if (data.status === "completed" && data.filePath) {
          setVideoUrl(`/api/stream/${data.filePath}`);
          setStatus("ready");
        } else {
          setStatus("processing...");
        }
      } catch (err) {
        console.error(err);
        setError("❌ Une erreur est survenue lors du téléchargement.");
        setStatus("error");
      }
    };

    fetchTorrent();
  }, []);

  if (error) return <p className="text-red-400 mt-4">{error}</p>;

  if (status === "downloading..." || status === "processing...")
    return <p className="text-yellow-400 mt-4">⏳ Téléchargement du film en cours...</p>;

  if (status === "ready" && videoUrl)
    return (
      <div className="mt-6 w-full max-w-4xl">
        <video controls width="100%" className="rounded-lg shadow-lg border border-yellow-400">
          <source src={videoUrl} type="video/mp4" />
          Votre navigateur ne supporte pas la lecture vidéo.
        </video>
      </div>
    );

  return <p className="text-gray-400 mt-4">En attente de téléchargement...</p>;
}
