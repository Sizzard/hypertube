"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface FilmDetails {
  Title: string;
  Year: string;
  Rated: string;
  Released: string;
  Runtime: string;
  Genre: string;
  Director: string;
  Writer: string;
  Actors: string;
  Plot: string;
  Poster: string;
}

export default function FilmDetailPage() {
  const { imdbID } = useParams();
  const [film, setFilm] = useState<FilmDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!imdbID) return;

    const token = localStorage.getItem("token");
    if (!token) {
      setError("❌ Vous devez être connecté pour voir les détails du film.");
      return;
    }

    const fetchFilmDetails = async () => {
      try {
        const res = await fetch(`http://localhost:3030/api/movie-details?id=${imdbID}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Erreur de requête");

        setFilm(data);
      } catch (err) {
        console.error(err);
        setError("❌ Impossible de charger les détails du film.");
      } finally {
        setLoading(false);
      }
    };

    fetchFilmDetails();
  }, [imdbID]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-yellow-400 text-xl">
        Chargement du film...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen text-yellow-400 text-lg">
        {error}
        <a
          href="/films"
          className="mt-4 bg-yellow-400 text-gray-900 px-4 py-2 rounded hover:bg-yellow-300 transition"
        >
          Retour à la recherche
        </a>
      </div>
    );
  }

  if (!film) return null;

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center py-10 px-4">
      <div className="max-w-4xl w-full bg-gray-800 rounded-2xl shadow-lg p-6 border border-yellow-400 flex flex-col md:flex-row gap-6">
        {/* Poster */}
        <div className="flex-shrink-0">
          <img
            src={film.Poster !== "N/A" ? film.Poster : "/default-poster.jpg"}
            alt={film.Title}
            className="w-64 h-auto rounded-lg shadow-md border border-gray-700"
          />
        </div>

        {/* Infos principales */}
        <div className="flex flex-col justify-between space-y-3">
          <div>
            <h1 className="text-3xl font-bold text-yellow-400 mb-2">{film.Title}</h1>
            <p className="text-gray-300 italic mb-4">{film.Plot}</p>

            <div className="space-y-1 text-sm text-gray-300">
              <p><span className="text-yellow-400 font-semibold">Année :</span> {film.Year}</p>
              <p><span className="text-yellow-400 font-semibold">Durée :</span> {film.Runtime}</p>
              <p><span className="text-yellow-400 font-semibold">Genre :</span> {film.Genre}</p>
              <p><span className="text-yellow-400 font-semibold">Sortie :</span> {film.Released}</p>
              <p><span className="text-yellow-400 font-semibold">Classé :</span> {film.Rated}</p>
              <p><span className="text-yellow-400 font-semibold">Réalisateur :</span> {film.Director}</p>
              <p><span className="text-yellow-400 font-semibold">Scénariste :</span> {film.Writer}</p>
              <p><span className="text-yellow-400 font-semibold">Acteurs :</span> {film.Actors}</p>
            </div>
          </div>

          <a
            href="/films"
            className="self-start bg-yellow-400 text-gray-900 px-4 py-2 rounded hover:bg-yellow-300 transition mt-4"
          >
            ← Retour
          </a>
        </div>
      </div>
    </div>
  );
}
