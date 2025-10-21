"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";

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
  main_actors?: { name: string; character?: string }[];
}

export default function FilmDetailPage() {
  const { imdbID } = useParams();
  const { lang } = useLanguage(); // Récupère la langue depuis le contexte

  const [film, setFilm] = useState<FilmDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const t = {
    fr: {
      releaseDate: "Date de sortie",
      runtime: "Durée",
      genres: "Genres",
      rating: "Note",
      directors: "Réalisateur(s)",
      producers: "Producteur(s)",
      mainActors: "Acteurs principaux",
      overview: "Synopsis",
      back: "← Retour",
      loading: "Chargement du film...",
      loginRequired: "❌ Vous devez être connecté pour voir les détails du film.",
      fetchError: "❌ Impossible de charger les détails du film.",
      returnSearch: "Retour à la recherche",
    },
    en: {
      releaseDate: "Release Date",
      runtime: "Runtime",
      genres: "Genres",
      rating: "Rating",
      directors: "Director(s)",
      producers: "Producer(s)",
      mainActors: "Main Actors",
      overview: "Overview",
      back: "← Back",
      loading: "Loading movie...",
      loginRequired: "❌ You must be logged in to view movie details.",
      fetchError: "❌ Unable to load movie details.",
      returnSearch: "Return to search",
    },
  }[lang];

  useEffect(() => {
    if (!imdbID) return;

    const token = localStorage.getItem("token");
    if (!token) {
      setError(t.loginRequired);
      setLoading(false);
      return;
    }

    const fetchFilmDetails = async () => {
      try {
        const res = await fetch(
          `http://localhost:3030/api/movie-details?id=${imdbID}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || t.fetchError);

        setFilm(data);
      } catch (err) {
        console.error(err);
        setError(t.fetchError);
      } finally {
        setLoading(false);
      }
    };

    fetchFilmDetails();
  }, [imdbID, lang]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-yellow-400 text-xl">
        {t.loading}
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col justify-center items-center h-screen text-yellow-400 text-lg">
        {error}
        <a
          href={`/films`}
          className="mt-4 bg-yellow-400 text-gray-900 px-4 py-2 rounded hover:bg-yellow-300 transition"
        >
          {t.returnSearch}
        </a>
      </div>
    );

  if (!film) return null;

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center py-10 px-4">
      <h1 className="text-5xl font-bold text-yellow-400 mb-6 text-center">{film.title}</h1>

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
            <span className="text-yellow-400 font-semibold">{t.releaseDate}:</span>{" "}
            {film.release_date || "N/A"}
          </p>
          <p>
            <span className="text-yellow-400 font-semibold">{t.runtime}:</span>{" "}
            {film.runtime || "N/A"}
          </p>
          <p>
            <span className="text-yellow-400 font-semibold">{t.genres}:</span>{" "}
            {film.genres?.length ? film.genres.join(", ") : "N/A"}
          </p>
          <p>
            <span className="text-yellow-400 font-semibold">{t.rating}:</span>{" "}
            {film.vote_average || "N/A"}
          </p>

          <p>
            <span className="text-yellow-400 font-semibold">{t.directors}:</span>{" "}
            {film.directors?.length ? film.directors.join(", ") : "N/A"}
          </p>

          <p>
            <span className="text-yellow-400 font-semibold">{t.producers}:</span>{" "}
            {film.producers?.length ? film.producers.join(", ") : "N/A"}
          </p>

          {/* Overview / Synopsis */}
          <div>
            <h2 className="text-lg font-semibold text-yellow-400">{t.overview}:</h2>
            <p className="text-gray-300">{film.overview || "N/A"}</p>
          </div>

          {/* Acteurs principaux */}
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-yellow-400">{t.mainActors}:</h2>
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
              <p className="text-gray-400">N/A</p>
            )}
          </div>

          <a
            href={`/films`}
            className="self-start bg-yellow-400 text-gray-900 px-4 py-2 rounded hover:bg-yellow-300 transition mt-4"
          >
            {t.back}
          </a>
        </div>
      </div>
    </div>
  );
}
