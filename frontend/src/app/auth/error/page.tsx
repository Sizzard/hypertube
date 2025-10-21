"use client";

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

import { useEffect, useState } from "react";

export default function AuthErrorPage() {
  const [currentLocale, setCurrentLocale] = useState<"fr" | "en">("fr");

  useEffect(() => {
    const langCookie = getCookie("lang");
    if (langCookie === "en" || langCookie === "fr") {
      setCurrentLocale(langCookie);
    }
  }, []);

  const t = {
    fr: {
      title: "Erreur de connexion",
      message: "Nous n'avons pas pu lier votre compte externe, quelqu'un avec cette adresse ou ce pseudo existe déjà.",
      button: "Retour à l'accueil",
    },
    en: {
      title: "Login Error",
      message: "We couldn't link your external account, someone with the same address or username already exists.",
      button: "Back to Home",
    },
  }[currentLocale];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-gray-100 px-6">
      <div className="max-w-md w-full text-center bg-gray-800 p-8 rounded-2xl shadow-lg border border-red-500">
        <h1 className="text-3xl font-bold text-red-500 mb-4">{t.title}</h1>
        <p className="text-gray-300 mb-6">{t.message}</p>
        <a
          href="/"
          className="px-6 py-2 rounded-lg bg-gray-700 text-gray-100 font-semibold hover:bg-gray-600 transition"
        >
          {t.button}
        </a>
      </div>
    </div>
  );
}
