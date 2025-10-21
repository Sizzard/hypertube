"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";

const translations = {
  fr: {
    title: "Recherche de Films",
    searchPlaceholder: "Rechercher un film...",
    searchButton: "Rechercher",
    sortLabel: "Tri par :",
    sortOptions: {
      name: "Nom",
      genre: "Genre",
      vote_average: "Note",
      release_date: "Année de production",
    },
    errorNotLoggedIn: "❌ Vous devez être connecté pour rechercher un film.",
    errorSearch: "❌ Erreur lors de la recherche.",
    noResults: "Aucun film trouvé.",
    unknownDate: "Date inconnue",
    unknownRating: "?",
  },
  en: {
    title: "Movie Search",
    searchPlaceholder: "Search for a movie...",
    searchButton: "Search",
    sortLabel: "Sort by:",
    sortOptions: {
      name: "Name",
      genre: "Genre",
      vote_average: "Rating",
      release_date: "Release Year",
    },
    errorNotLoggedIn: "❌ You must be logged in to search for a movie.",
    errorSearch: "❌ Error while searching.",
    noResults: "No movies found.",
    unknownDate: "Unknown date",
    unknownRating: "?",
  },
};

export default function FilmsPage() {
  const { lang } = useLanguage();
  const t = translations[lang];

  const [searchTerm, setSearchTerm] = useState("");
  const [films, setFilms] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"name" | "genre" | "vote_average" | "release_date">("name");
  const router = useRouter();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const token = localStorage.getItem("token");
    if (!token) {
      setError(t.errorNotLoggedIn);
      return;
    }

    try {
      const res = await fetch(
        `/api/search-movie?title=${encodeURIComponent(searchTerm)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t.errorSearch);

      setFilms(data.results || []);
    } catch {
      setError(t.errorSearch);
    }
  };

  const sortedFilms = [...films].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.title.localeCompare(b.title);
      case "genre":
        return (a.genres?.[0] || "").localeCompare(b.genres?.[0] || "");
      case "vote_average":
        return (b.vote_average || 0) - (a.vote_average || 0);
      case "release_date":
        return (b.release_date ? new Date(b.release_date).getTime() : 0) - (a.release_date ? new Date(a.release_date).getTime() : 0);
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white items-center py-10">
      <h1 className="text-4xl font-bold text-yellow-400 mb-6">{t.title}</h1>

      {/* Barre de recherche */}
      <form onSubmit={handleSearch} className="flex mb-4 w-full max-w-md">
        <input
          type="text"
          placeholder={t.searchPlaceholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow px-4 py-2 rounded-l-lg bg-gray-800 border border-yellow-400 focus:outline-none text-white"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-yellow-400 text-gray-900 rounded-r-lg hover:bg-yellow-300 transition"
        >
          {t.searchButton}
        </button>
      </form>

      {/* Choix du tri */}
      <div className="mb-6 flex space-x-4">
        <label className="text-gray-300 flex items-center space-x-2">
          <span>{t.sortLabel}</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-gray-800 border border-yellow-400 px-2 py-1 rounded text-white focus:outline-none"
          >
            <option value="name">{t.sortOptions.name}</option>
            <option value="genre">{t.sortOptions.genre}</option>
            <option value="vote_average">{t.sortOptions.vote_average}</option>
            <option value="release_date">{t.sortOptions.release_date}</option>
          </select>
        </label>
      </div>

      {/* Gestion des erreurs */}
      {error && <p className="text-red-400 mb-4">{error}</p>}

      {/* Liste des résultats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {sortedFilms.map((film) => (
          <div
            key={film.id}
            className="relative group cursor-pointer rounded-lg overflow-hidden"
            onClick={() => router.push(`films/${film.id}`)}
          >
            <img
              src={
                film.poster_path
                  ? `https://image.tmdb.org/t/p/w500${film.poster_path}`
                  : "/default-poster.jpg"
              }
              alt={film.title}
              className="w-full h-full object-cover transition-transform duration-300 transform group-hover:scale-105"
            />

            <div className="absolute inset-0 bg-black bg-opacity-70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center items-center text-center px-2">
              <h2 className="text-lg font-bold text-yellow-400 mb-2">{film.title}</h2>
              <p className="text-sm text-gray-300">
                📅 {film.release_date || t.unknownDate}
              </p>
              <p className="text-sm text-gray-300">
                ⭐ {film.vote_average?.toFixed(1) || t.unknownRating} / 10
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Aucun résultat */}
      {films.length === 0 && !error && (
        <p className="text-gray-400 mt-6">{t.noResults}</p>
      )}
    </div>
  );
}
