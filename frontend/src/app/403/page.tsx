"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

const translations = {
  fr: {
    code: "403",
    message: "Rien à voir ici, mais peut-être si vous vous connectez...",
    home: "Retour à l'accueil",
  },
  en: {
    code: "403",
    message: "There is nothing to see here, but maybe if you login...",
    home: "Return to Home",
  },
};

export default function ForbiddenPage() {
  const { lang } = useLanguage();
  const t = translations[lang];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white text-center px-6">
      <h1 className="text-6xl font-bold text-yellow-400 mb-6">{t.code}</h1>
      <p className="text-gray-300 text-xl mb-8">{t.message}</p>

      <Link
        href="/"
        className="bg-yellow-400 text-gray-900 px-6 py-2 rounded font-semibold hover:bg-yellow-300 transition"
      >
        {t.home}
      </Link>
    </div>
  );
}
