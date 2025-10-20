"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface FilmDetails {
  id: number;
  title: string;
  release_date: string;
  runtime: string;
  genres: string[];
  vote_average: string;
  overview: string;
  poster_url: string | null;
  backdrop_url: string | null;
  directors: string[];
  producers: string[];
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
        const res = await fetch(
          `http://localhost:3030/api/movie-details?id=${imdbID}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

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

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-yellow-400 text-xl">
        Chargement du film...
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col justify-center items-center h-screen text-yellow-400 text-lg">
        {error}
        <a
          href="/en/films"
          className="mt-4 bg-yellow-400 text-gray-900 px-4 py-2 rounded hover:bg-yellow-300 transition"
        >
          Retour à la recherche
        </a>
      </div>
    );

  if (!film) return null;

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center py-10 px-4">
      <div className="max-w-5xl w-full bg-gray-800 rounded-2xl shadow-lg p-6 border border-yellow-400 flex flex-col md:flex-row gap-8">
        {/* Poster */}
        <div className="flex-shrink-0">
          <img
            src={film.poster_url || "/default-poster.jpg"}
            alt={film.title}
            className="w-72 h-auto rounded-lg shadow-md border border-gray-700"
          />
        </div>

        {/* Infos principales */}
        <div className="space-y-3 text-sm text-gray-300">
          <p>
            <span className="text-yellow-400 font-semibold">Date de sortie :</span>{" "}
            {film.release_date || "Non renseignée"}
          </p>
          <p>
            <span className="text-yellow-400 font-semibold">Durée :</span>{" "}
            {film.runtime || "Non renseignée"}
          </p>
          <p>
            <span className="text-yellow-400 font-semibold">Genres :</span>{" "}
            {film.genres?.length ? film.genres.join(", ") : "Non renseigné"}
          </p>
          <p>
            <span className="text-yellow-400 font-semibold">Note :</span>{" "}
            {film.vote_average || "Non noté"}
          </p>

          {/* Réalisateurs */}
          <p>
            <span className="text-yellow-400 font-semibold">Réalisateur(s) :</span>{" "}
            {film.directors?.length ? film.directors.join(", ") : "Non renseigné"}
          </p>

          {/* Producteurs */}
          <p>
            <span className="text-yellow-400 font-semibold">Producteur(s) :</span>{" "}
            {film.producers?.length ? film.producers.join(", ") : "Non renseigné"}
          </p>

          {/* Acteurs principaux */}
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-yellow-400">Acteurs principaux :</h2>
            {film.main_actors && film.main_actors.length > 0 ? (
              <ul className="space-y-1">
                {film.main_actors.map((actor, index) => (
                  <li key={index} className="text-gray-300">
                    {actor.name}
                    {actor.character && (
                      <span className="text-yellow-400"> — {actor.character}</span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400">Non renseignés</p>
            )}
          </div>


          <a
            href="/en/films"
            className="self-start bg-yellow-400 text-gray-900 px-4 py-2 rounded hover:bg-yellow-300 transition mt-4"
          >
            ← Retour
          </a>
        </div>
      </div>
    </div>
  );
}
