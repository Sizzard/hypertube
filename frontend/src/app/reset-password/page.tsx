"use client";
import { useState } from "react";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("http://localhost:3030/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (res.ok) {
        setMessage("📧 Un lien de réinitialisation a été envoyé à votre adresse email.");
      } else {
        setMessage(data.error || "Une erreur est survenue.");
      }
    } catch {
      setMessage("Erreur serveur.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 p-6 rounded-lg shadow-md border border-yellow-400 w-96"
      >
        <h1 className="text-2xl font-bold text-yellow-400 mb-4 text-center">
          Réinitialiser le mot de passe
        </h1>

        <input
          type="email"
          placeholder="Votre adresse email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 mb-4 focus:outline-none focus:border-yellow-400"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-yellow-400 text-gray-900 py-2 rounded hover:bg-yellow-300 transition"
        >
          {loading ? "Envoi..." : "Envoyer le lien"}
        </button>

        {message && (
          <p className="text-sm text-center mt-4 text-yellow-300">{message}</p>
        )}
      </form>
    </div>
  );
}
