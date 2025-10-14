"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Lien de réinitialisation invalide ou expiré.");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!password.trim() || !confirmPassword.trim()) {
      setError("Veuillez remplir tous les champs.");
      return;
    }

    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    if (!token) {
      setError("Token invalide.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:3030/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erreur serveur.");
      }

      setSuccess(true);
      setPassword("");
      setConfirmPassword("");

      // Redirige vers login après quelques secondes
      setTimeout(() => router.push("/"), 3000);
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-900 border border-yellow-400 rounded-lg p-6 w-full max-w-md shadow-lg"
      >
        <h2 className="text-2xl font-bold text-yellow-400 mb-4 text-center">
          🔑 Nouveau mot de passe
        </h2>

        {error && <p className="text-red-500 text-sm mb-2 text-center">{error}</p>}
        {success && (
          <p className="text-green-400 text-sm mb-2 text-center">
            ✅ Mot de passe réinitialisé avec succès !<br />
            Redirection en cours...
          </p>
        )}

        {!success && (
          <>
            <input
              type="password"
              placeholder="Nouveau mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-800 text-white border border-gray-700 rounded px-3 py-2 mb-3 focus:outline-none focus:border-yellow-400"
            />

            <input
              type="password"
              placeholder="Confirmez le mot de passe"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-gray-800 text-white border border-gray-700 rounded px-3 py-2 mb-4 focus:outline-none focus:border-yellow-400"
            />

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 rounded font-semibold transition ${
                loading
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-yellow-400 text-gray-900 hover:bg-yellow-300"
              }`}
            >
              {loading ? "Réinitialisation..." : "Mettre à jour le mot de passe"}
            </button>
          </>
        )}
      </form>
    </div>
  );
}
