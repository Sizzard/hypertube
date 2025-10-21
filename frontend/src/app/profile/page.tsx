"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";

// --- Composant de recherche utilisateur ---
function UserSearchBar() {
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
        setMessage(
          data.error === "USER_DOES_NOT_EXIST"
            ? "❌ Utilisateur introuvable."
            : "❌ Erreur lors de la recherche."
        );
        return;
      }

      setUserProfile(data);
    } catch (err) {
      console.error(err);
      setMessage("❌ Erreur réseau lors de la recherche.");
    }
  };

  return (
    <div className="flex flex-col items-center bg-gray-800 p-6 rounded-2xl shadow-md border border-yellow-400 w-full mb-8">
      <h2 className="text-2xl font-bold text-yellow-400 mb-4">🔍 Rechercher un utilisateur</h2>

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

      {message && <p className="text-yellow-400 mb-3 text-sm font-medium">{message}</p>}

      {userProfile && (
        <div className="flex flex-col items-center bg-gray-900 p-4 rounded-xl border border-gray-700 w-full text-center">
          <img
            src={userProfile.avatar_url || "/default.jpg"}
            alt={userProfile.username}
            className="w-24 h-24 rounded-full border-2 border-yellow-400 object-cover mb-3"
            onError={(e) => ((e.target as HTMLImageElement).src = "/default.jpg")}
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

// --- PAGE PRINCIPALE ---
export default function ProfilePage() {
  const [user, setUser] = useState<{
    username: string;
    first_name: string;
    last_name: string;
    email: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    username: "",
    first_name: "",
    last_name: "",
    email: "",
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState("");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => setIsClient(true), []);

  useEffect(() => {
    if (!isClient) return;
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch("/api/private-profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Erreur lors du chargement du profil");
        const data = await res.json();
        setUser(data);
        setFormData({
          username: data.username,
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
        });
      } catch {
        setMessage("❌ Impossible de récupérer vos informations.");
      }
    };
    fetchUser();
  }, [isClient]);

  useEffect(() => {
    if (!user?.username) return;
    const fetchAvatar = async () => {
      try {
        const res = await fetch(`/api/avatar/${user.username}`);
        const data = await res.json();
        setUserAvatar(data.avatar_url || "/default.jpg");
      } catch {
        setUserAvatar("/default.jpg");
      }
    };
    fetchAvatar();
  }, [user?.username]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleAvatarUpload = async () => {
    if (!selectedFile) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowedTypes.includes(selectedFile.type)) {
      setMessage("❌ Format d'image non valide (jpg, jpeg, png uniquement).");
      return;
    }

    const formDataUpload = new FormData();
    formDataUpload.append("avatar", selectedFile);

    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await fetch("/api/avatar/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formDataUpload,
      });
      const data = await res.json();

      if (!res.ok) {
        setMessage(
          data.error === "LIMIT_FILE_SIZE"
            ? "❌ Fichier trop volumineux (max 2 Mo)."
            : "❌ Erreur lors de l'upload."
        );
        return;
      }

      setUserAvatar(data.avatar_url);
      setPreview(data.avatar_url);
      setMessage("✅ Avatar mis à jour !");
      setSelectedFile(null);
    } catch {
      setMessage("❌ Erreur réseau lors de l'upload.");
    }
  };

  const handleSave = async () => {
    setMessage("");
    if (!formData.username || !formData.first_name || !formData.last_name || !formData.email) {
      setMessage("❌ Tous les champs sont obligatoires.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setMessage("❌ Email invalide.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await fetch("/api/private-profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(
          data.error === "USER_EXISTS"
            ? "❌ Ce username est déjà utilisé."
            : data.error === "EMAIL_EXISTS"
            ? "❌ Cet email est déjà utilisé."
            : "❌ Erreur lors de la mise à jour."
        );
        return;
      }
      setUser(data);
      setEditing(false);
      setMessage("✅ Profil mis à jour !");
    } catch {
      setMessage("❌ Erreur réseau.");
    }
  };

  if (!isClient) return null;
  if (!user)
    return (
      <div className="flex flex-col justify-center items-center h-screen text-yellow-400 text-lg space-y-4">
        <p>❌ Vous devez être connecté pour accéder à cette page.</p>
        <a
          href="/"
          className="bg-yellow-400 text-gray-900 px-4 py-2 rounded hover:bg-yellow-300 transition"
        >
          Retour à l'accueil
        </a>
      </div>
    );

  return (
    <ProtectedRoute>
      <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white px-4">
        <div className="bg-gray-800 p-8 rounded-2xl shadow-lg w-full max-w-md border border-yellow-400">
          {/* 🔍 Barre de recherche utilisateur */}
          <UserSearchBar />

          <h1 className="text-3xl font-bold text-yellow-400 mb-6 text-center">
            Mon Profil
          </h1>

          {/* Avatar */}
          <div className="flex flex-col items-center mb-6">
            <img
              src={preview || userAvatar || "/default.jpg"}
              alt="Avatar"
              className="w-24 h-24 rounded-full border-2 border-yellow-400 object-cover mb-3"
              onError={(e) => ((e.target as HTMLImageElement).src = "/default.jpg")}
            />
            {editing && (
              <>
                <label className="cursor-pointer bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-600 transition mb-2">
                  Choisir un fichier
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/jpg"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
                {selectedFile && (
                  <p className="text-sm text-gray-300 mb-2">{selectedFile.name}</p>
                )}
                <button
                  onClick={handleAvatarUpload}
                  disabled={!selectedFile}
                  className={`px-4 py-2 rounded text-white transition ${
                    selectedFile
                      ? "bg-blue-500 hover:bg-blue-400"
                      : "bg-gray-500 cursor-not-allowed"
                  }`}
                >
                  Uploader l’avatar
                </button>
              </>
            )}
          </div>

          {/* Formulaire profil */}
          <div className="space-y-4">
            {["username", "first_name", "last_name", "email"].map((field) => (
              <div key={field}>
                <label className="block text-sm text-gray-300 mb-1">
                  {field.replace("_", " ")}
                </label>
                {editing ? (
                  <input
                    type={field === "email" ? "email" : "text"}
                    name={field}
                    value={(formData as any)[field]}
                    onChange={handleChange}
                    required
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-yellow-400"
                  />
                ) : (
                  <p className="text-lg font-medium">{(user as any)[field]}</p>
                )}
              </div>
            ))}
          </div>

          {/* Boutons */}
          <div className="mt-6 flex justify-between">
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="bg-yellow-400 text-gray-900 px-4 py-2 rounded hover:bg-yellow-300 transition"
              >
                Modifier
              </button>
            ) : (
              <>
                <button
                  onClick={handleSave}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-400 transition"
                >
                  Sauvegarder
                </button>
                <button
                  onClick={() => {
                    setEditing(false);
                    setFormData({ ...user });
                    setSelectedFile(null);
                  }}
                  className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-500 transition"
                >
                  Annuler
                </button>
              </>
            )}
          </div>

          {message && (
            <p
              className={`text-center mt-4 font-semibold ${
                message.startsWith("✅") ? "text-green-400" : "text-yellow-400"
              }`}
            >
              {message}
            </p>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
