"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

const translations = {
  fr: {
    title: "Réinitialiser le mot de passe",
    placeholder: "Votre adresse email",
    submit: "Envoyer le lien",
    sending: "Envoi...",
    success: "📧 Un lien de réinitialisation a été envoyé à votre adresse email si elle existe.",
    error: "Une erreur est survenue.",
    serverError: "Erreur serveur.",
  },
  en: {
    title: "Reset Password",
    placeholder: "Your email address",
    submit: "Send link",
    sending: "Sending...",
    success: "📧 A reset link has been sent to your email address if it exists.",
    error: "An error occurred.",
    serverError: "Server error.",
  },
};

export default function ResetPasswordPage() {
  const { lang } = useLanguage();
  const t = translations[lang];

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (res.ok) {
        setMessage(t.success);
      } else {
        setMessage(data.error || t.error);
      }
    } catch {
      setMessage(t.serverError);
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
          {t.title}
        </h1>

        <input
          type="email"
          placeholder={t.placeholder}
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
          {loading ? t.sending : t.submit}
        </button>

        {message && (
          <p className="text-sm text-center mt-4 text-yellow-300">{message}</p>
        )}
      </form>
    </div>
  );
}
