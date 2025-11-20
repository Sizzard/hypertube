"use client";

import { useEffect, useState, useRef } from "react";

interface FilmsStreamProps {
  imdb_id: string | number;
}

export default function FilmsStream({imdb_id} : FilmsStreamProps) {
  const [status, setStatus] = useState("idle");
  const [progress, setProgress] = useState(0);
  const [videoUrl, setVideoUrl] = useState("");
  const [error, setError] = useState("");
  const [subtitleOffset, setSubtitleOffset] = useState(0);
  const [subtitleUrl, setSubtitleUrl] = useState("");

  const initialized = useRef(false);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!imdb_id) {
      setError("Imdb ID introuvable dans le magnet.");
      return;
    }


    if (initialized.current) return;
    initialized.current = true;

    const token = localStorage.getItem("token");
    if (!token) {
      setError("❌ Vous devez être connecté.");
      return;
    }

    const startDownload = async () => {
      try {
        setStatus("starting");
        console.log("IMDB_ID : ", imdb_id);

        const res = await fetch(
          `/api/download-torrent?imdb_id=${imdb_id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!res.ok) throw new Error("Erreur lancement torrent");

        setStatus("downloading");
      } catch (err) {
        console.error(err);
        setError("❌ Impossible de lancer le téléchargement.");
      }
    };

    startDownload();

    intervalRef.current = window.setInterval(async () => {
      try {
        const res = await fetch(`/api/status-torrent?imdb_id=${imdb_id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) return;

        const data = await res.json();

        if (data.progress !== undefined) {
          setProgress(Math.round(data.progress * 100));
        }


      if (data.progress >= 0.1 && data.filePath) {
        setVideoUrl(`/stream/${data.filePath}`);
        setStatus("ready");
        if (data.progress === 1) {
          if (intervalRef.current !== null) clearInterval(intervalRef.current);
        }
      }
      } catch (err) {
        console.error("Erreur polling :", err);
      }
    }, 3000);
  }, []);

  if (error) return <p className="text-red-400 mt-4">{error}</p>;

  if (status === "starting")
    return <p className="text-yellow-400 mt-4">Initialisation…</p>;

  if (status === "downloading")
    return (
      <p className="text-yellow-400 mt-4">
        Téléchargement : {progress}%
      </p>
    );

  if (status === "ready" && videoUrl)
    return (
      <div className="mt-6 w-full max-w-4xl">
        <video
          controls
          width="100%"
          className="rounded-lg shadow-lg border border-yellow-400"
        >
          <source src={videoUrl} type="video/mp4" />

          <track
            src={`/stream/${imdb_id}/en.vtt`}
            kind="subtitles"
            srcLang="en"
            label="English"
            default
          />

          Votre navigateur ne supporte pas la lecture vidéo.
        </video>

        <p className="text-green-400 pt-3 text-sm">
          Téléchargement total : {progress}%
        </p>
      </div>
    );

  return <p className="text-gray-400 mt-4">En attente…</p>;
}
