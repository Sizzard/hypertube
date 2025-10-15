"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";

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
  const router = useRouter();

  useEffect(() => setIsClient(true), []);

  // Chargement des infos utilisateur
  useEffect(() => {
    if (!isClient) return;
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch("http://localhost:3030/api/private-profile", {
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
      } catch (err) {
        router.push("/");
        // console.error(err);
        setMessage("❌ Impossible de récupérer vos informations.");
      }
    };
    fetchUser();
  }, [isClient]);

  // Chargement de l’avatar
  useEffect(() => {
    if (!user?.username) return;
    const fetchAvatar = async () => {
      try {
        const res = await fetch(`http://localhost:3030/api/avatar/${user.username}`);
        if (!res.ok) throw new Error("Erreur lors du chargement de l'avatar");
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

    const formDataUpload = new FormData();
    formDataUpload.append("avatar", selectedFile);

    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch("http://localhost:3030/api/avatar/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formDataUpload,
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(
          data.error === "LIMIT_FILE_SIZE"
            ? "❌ Fichier trop volumineux (max 2 Mo)."
            : "❌ Erreur lors de l'upload de l'avatar."
        );
        return;
      }

      // Ici on met à jour l'avatar final
      setUserAvatar(data.avatar_url);
      setMessage("✅ Avatar mis à jour !");

      setSelectedFile(null);
    } catch {
      setMessage("❌ Erreur réseau lors de l'upload.");
    }
  };


  const handleSave = async () => {
    setMessage("");
    if (!formData.username.trim() || !formData.first_name.trim() || !formData.last_name.trim() || !formData.email.trim()) {
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

      const res = await fetch("http://localhost:3030/api/private-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error === "USER_EXISTS" ? "❌ Ce username est déjà utilisé." : data.error === "EMAIL_EXISTS" ? "❌ Cet email est déjà utilisé." : "❌ Erreur lors de la mise à jour du profil.");
        return;
      }
      setUser(data);
      setEditing(false);
      setMessage("✅ Profil mis à jour avec succès !");
    } catch {
      setMessage("❌ Erreur lors de la mise à jour du profil.");
    }
  };

  if (!isClient) return null;
  if (!user) {
    const token = localStorage.getItem("token");
    if (!token)
      return (
        <div className="flex flex-col justify-center items-center h-screen text-yellow-400 text-lg space-y-4">
          <p>❌ Vous devez être connecté pour accéder à cette page.</p>
          <a href="/" className="bg-yellow-400 text-gray-900 px-4 py-2 rounded hover:bg-yellow-300 transition">Retour à l'accueil</a>
        </div>
      );
    return (
      <ProtectedRoute>
        <div className="flex justify-center items-center h-screen text-yellow-400 text-lg">Chargement du profil...</div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white px-4">
        <div className="bg-gray-800 p-8 rounded-2xl shadow-lg w-full max-w-md border border-yellow-400">
          <h1 className="text-3xl font-bold text-yellow-400 mb-6 text-center">Mon Profil</h1>

          {/* Avatar */}
          <div className="flex flex-col items-center mb-6">
            <img
              src={preview || userAvatar || "/default.jpg"}
              alt="Avatar"
              className="w-24 h-24 rounded-full border-2 border-yellow-400 object-cover mb-3"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/default.jpg";
              }}
            />
            {editing && (
              <>
                <label className="cursor-pointer bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-600 transition mb-2">
                  Choisir un fichier
                  <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden"/>
                </label>
                {selectedFile && <p className="text-sm text-gray-300 mb-2">{selectedFile.name}</p>}
                <button onClick={handleAvatarUpload} disabled={!selectedFile}
                  className={`px-4 py-2 rounded text-white transition ${selectedFile ? "bg-blue-500 hover:bg-blue-400" : "bg-gray-500 cursor-not-allowed"}`}>
                  Uploader l’avatar
                </button>
              </>
            )}
          </div>

          {/* Formulaire profil */}
          <div className="space-y-4">
            {["username", "first_name", "last_name", "email"].map((field) => (
              <div key={field}>
                <label className="block text-sm text-gray-300 mb-1">{field.replace("_", " ")}</label>
                {editing ? (
                  <input type={field === "email" ? "email" : "text"} name={field} value={(formData as any)[field]} onChange={handleChange} required
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-yellow-400" />
                ) : (
                  <p className="text-lg font-medium">{(user as any)[field]}</p>
                )}
              </div>
            ))}
          </div>

          {/* Boutons */}
          <div className="mt-6 flex justify-between">
            {!editing ? (
              <button onClick={() => setEditing(true)} className="bg-yellow-400 text-gray-900 px-4 py-2 rounded hover:bg-yellow-300 transition">Modifier</button>
            ) : (
              <>
                <button onClick={handleSave} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-400 transition">Sauvegarder</button>
                <button onClick={() => {setEditing(false); setFormData({...user}); setSelectedFile(null);}} className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-500 transition">Annuler</button>
              </>
            )}
          </div>

          {message && (
            <p className={`text-center mt-4 font-semibold ${message.startsWith("✅") ? "text-green-400" : "text-yellow-400"}`}>{message}</p>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
