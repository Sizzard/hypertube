"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function LinkagePage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const email = searchParams.get("email");
  const provider = searchParams.get("provider");
  const oauthId = searchParams.get("id");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleLink = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("http://localhost:3030/auth/link-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, provider, oauth_id: oauthId }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Erreur serveur");

      setSuccess(true);
      setTimeout(() => {
        router.push("/");
      }, 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <div className="bg-gray-800 border border-yellow-400 rounded-lg p-8 shadow-lg text-center w-[400px]">
        <h2 className="text-2xl font-bold text-yellow-400 mb-4">Fusion de comptes</h2>
        <p className="mb-4">
          Un compte existe déjà avec l'adresse <strong>{email}</strong>.
        </p>
        <p className="mb-6">
          Souhaitez-vous le lier à votre connexion <strong>{provider}</strong> ?
        </p>

        <button
          onClick={handleLink}
          disabled={loading || success}
          className={`w-full py-2 rounded font-semibold transition ${
            loading
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-yellow-400 text-gray-900 hover:bg-yellow-300"
          }`}
        >
          {loading ? "Lien en cours..." : "Oui, lier les comptes"}
        </button>

        {error && <p className="text-red-500 mt-4">{error}</p>}
        {success && <p className="text-green-400 mt-4">✅ Comptes liés avec succès !</p>}

        <button
          onClick={() => router.push("/login")}
          className="w-full mt-3 text-sm text-gray-400 hover:underline"
        >
          Non, revenir à la connexion
        </button>
      </div>
    </div>
  );
}
