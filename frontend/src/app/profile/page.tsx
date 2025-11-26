"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import ProfileCard from "@/components/ProfileCard";
import ProfileResearch from "@/components/ProfileResearch";

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

  // Charger le profil utilisateur
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

  // Charger l’avatar
  useEffect(() => {
    if (!user?.username) return;
    const fetchAvatar = async () => {
      try {
        const res = await fetch(`/api/avatar/${user.username}`);
        const data = await res.json();

        if (data.avatar_url) {
          const fullUrl = `${data.avatar_url}?t=${Date.now()}`;
          setUserAvatar(fullUrl);
        } else {
          setUserAvatar("/default.jpg");
        }
      } catch {
        setUserAvatar("/default.jpg");
      }
    };
    fetchAvatar();
  }, [user?.username]);

  // Input texte
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // Sélection avatar
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setPreview(URL.createObjectURL(file)); // aperçu immédiat
  };

  // Upload avatar
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
        setMessage("❌ Erreur lors de l'upload.");
        return;
      }

      // Ajout timestamp pour forcer rafraîchissement
      const refreshed = `${data.avatar_url}?t=${Date.now()}`;

      setUserAvatar(refreshed);
      setPreview(refreshed);

      setMessage("✅ Avatar mis à jour !");
      setSelectedFile(null);
    } catch {
      setMessage("❌ Erreur réseau lors de l'upload.");
    }
  };

  // Sauvegarde infos profil
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
        setMessage("❌ Erreur lors de la mise à jour.");
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
      <div className="flex justify-center items-start min-h-screen bg-gray-900 text-white px-4 py-8">
        <div className="flex flex-col w-full max-w-md space-y-8">

          <ProfileResearch />

          <h1 className="text-3xl font-bold text-yellow-400 mb-6 text-center">
            Mon Profil
          </h1>

          <ProfileCard
            user={user}
            avatarUrl={userAvatar}
            editing={editing}
            formData={formData}
            setFormData={setFormData}
            preview={preview}
            selectedFile={selectedFile}
            handleAvatarChange={handleAvatarChange}
            handleAvatarUpload={handleAvatarUpload}
            handleSave={handleSave}
            setEditing={setEditing}
            message={message}
          />
        </div>
      </div>
    </ProtectedRoute>
  );
}
