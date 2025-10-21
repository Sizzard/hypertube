"use client";

import { useState } from "react";

export default function UserSearchBar() {
  const [search, setSearch] = useState("");
  const [userProfile, setUserProfile] = useState<{
    username: string;
    first_name: string;
    last_name: string;
    avatar_url: string;
  } | null>(null);
  const [message, setMessage] = useState("");

  const handleSearch = async () => {
    setMessage("");
    setUserProfile(null);

    if (!search.trim()) {
      setMessage("❌ Entrez un nom d'utilisateur à rechercher.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setMessage("❌ Vous devez être connecté pour rechercher un utilisateur.");
        return;
      }

      const res = await fetch(`/api/public-profile/${search}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error === "USER_DOES_NOT_EXIST"
          ? "❌ Utilisateur introuvable."
          : "❌ Erreur lors de la recherche.");
        return;
      }

      setUserProfile(data);
    } catch (err) {
      console.error(err);
      setMessage("❌ Erreur réseau lors de la recherche.");
    }
  };

  return (
    <div className="flex flex-col items-center bg-gray-800 p-6 rounded-2xl shadow-md border border-yellow-400 w-full max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-yellow-400 mb-4">🔍 Rechercher un utilisateur</h2>

      {/* Barre de recherche */}
      <div className="flex w-full mb-4">
        <input
          type="text"
          placeholder="Entrez un username..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-3 py-2 rounded-l bg-gray-700 text-white focus:outline-none border border-gray-600 focus:border-yellow-400"
        />
        <button
          onClick={handleSearch}
          className="bg-yellow-400 text-gray-900 px-4 py-2 rounded-r hover:bg-yellow-300 transition"
        >
          Rechercher
        </button>
      </div>

      {/* Message d'erreur ou d'info */}
      {message && (
        <p className="text-yellow-400 mb-3 text-sm font-medium">{message}</p>
      )}

      {/* Affichage du profil trouvé */}
      {userProfile && (
        <div className="flex flex-col items-center bg-gray-900 p-4 rounded-xl border border-gray-700 w-full text-center">
          <img
            src={userProfile.avatar_url || "/default.jpg"}
            alt={userProfile.username}
            className="w-24 h-24 rounded-full border-2 border-yellow-400 object-cover mb-3"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/default.jpg";
            }}
          />
          <p className="text-xl font-semibold text-yellow-400">{userProfile.username}</p>
          <p className="text-gray-300">
            {userProfile.first_name} {userProfile.last_name}
          </p>
        </div>
      )}
    </div>
  );
}
