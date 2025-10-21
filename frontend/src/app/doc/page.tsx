"use client";

import { useLanguage } from "@/contexts/LanguageContext";

const translations = {
  fr: {
    title: "Documentation",
    intro: "Bienvenue dans la documentation de Hypertube ! Cette page peut inclure :",
    items: [
      "Instructions sur l'utilisation du site",
      "Liens vers les fonctionnalités principales",
      "Exemples d'API ou guides front-end",
    ],
    outro: "Vous pouvez revenir à l'accueil via le header.",
  },
  en: {
    title: "Documentation",
    intro: "Welcome to the Hypertube documentation! This page may include:",
    items: [
      "Instructions on how to use the site",
      "Links to the main features",
      "API examples or front-end guides",
    ],
    outro: "You can return to the homepage via the header.",
  },
};

export default function DocPage() {
  const { lang } = useLanguage();
  const t = translations[lang];

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white">
      <main className="flex-1 p-6 max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-yellow-400 mb-6">{t.title}</h1>

        <section className="space-y-4 text-gray-200">
          <p>{t.intro}</p>

          <ul className="list-disc list-inside">
            {t.items.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>

          <p className="mt-4">{t.outro}</p>
        </section>
      </main>
    </div>
  );
}
