"use client";

import { useEffect, useState } from "react";
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

  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch("http://localhost:3030/api/profile", {
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
        console.error(err);
        setMessage("❌ Impossible de récupérer vos informations.");
      }
    };

    fetchUser();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setMessage("");

    if (
      !formData.username.trim() ||
      !formData.first_name.trim() ||
      !formData.last_name.trim() ||
      !formData.email.trim()
    ) {
      setMessage("❌ Tous les champs sont obligatoires.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setMessage("❌ Email invalide.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch("http://localhost:3030/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error === "USER_EXISTS") {
          setMessage("❌ Ce username est déjà utilisé.");
        } else if (data.error === "EMAIL_EXISTS") {
          setMessage("❌ Cet email est déjà utilisé.");
        } else {
          setMessage("❌ Erreur lors de la mise à jour du profil.");
        }
        return;
      }

      setUser(data);
      setEditing(false);
      setMessage("✅ Profil mis à jour avec succès !");
    } catch (err) {
      console.error(err);
      setMessage("❌ Erreur lors de la mise à jour du profil.");
    }
  };

  if (!user) {
    return (
      <ProtectedRoute>
        <div className="flex justify-center items-center h-screen text-yellow-400 text-lg">
          Chargement du profil...
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white px-4">
        <div className="bg-gray-800 p-8 rounded-2xl shadow-lg w-full max-w-md border border-yellow-400">
          <h1 className="text-3xl font-bold text-yellow-400 mb-6 text-center">
            Mon Profil
          </h1>

          <div className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-sm text-gray-300 mb-1">Username</label>
              {editing ? (
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-yellow-400"
                />
              ) : (
                <p className="text-lg font-medium">{user.username}</p>
              )}
            </div>

            {/* First Name */}
            <div>
              <label className="block text-sm text-gray-300 mb-1">First Name</label>
              {editing ? (
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-yellow-400"
                />
              ) : (
                <p className="text-lg font-medium">{user.first_name}</p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm text-gray-300 mb-1">Last Name</label>
              {editing ? (
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-yellow-400"
                />
              ) : (
                <p className="text-lg font-medium">{user.last_name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm text-gray-300 mb-1">Email</label>
              {editing ? (
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-yellow-400"
                />
              ) : (
                <p className="text-lg font-medium">{user.email}</p>
              )}
            </div>
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
                    setFormData({
                      username: user.username,
                      first_name: user.first_name,
                      last_name: user.last_name,
                      email: user.email,
                    });
                  }}
                  className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-500 transition"
                >
                  Annuler
                </button>
              </>
            )}
          </div>

          {/* Message */}
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
