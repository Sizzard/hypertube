"use client";

import { useLanguage } from "@/contexts/LanguageContext";

const translations = {
  fr: {
    heroTitle: "Hypertube",
    heroDesc: "Explorez, regardez et partagez vos films et séries préférés",
    features: [
      {
        title: "Découvrez Hypertube",
        description:
          "Hypertube est votre plateforme ultime pour explorer films et séries en streaming avec une expérience fluide et moderne.",
      },
      {
        title: "Navigation simple",
        description:
          "Trouvez facilement vos films et séries préférés grâce à notre interface claire et intuitive.",
      },
      {
        title: "Inscription rapide",
        description: "Créez un compte en quelques secondes et accédez à toutes les fonctionnalités premium.",
      },
    ],
  },
  en: {
    heroTitle: "Hypertube",
    heroDesc: "Explore, watch and share your favorite movies and series",
    features: [
      {
        title: "Discover Hypertube",
        description:
          "Hypertube is your ultimate platform to explore movies and series in streaming with a smooth and modern experience.",
      },
      {
        title: "Simple Navigation",
        description:
          "Easily find your favorite movies and series thanks to our clear and intuitive interface.",
      },
      {
        title: "Quick Sign Up",
        description: "Create an account in seconds and access all premium features.",
      },
    ],
  },
};

export default function Home() {
  const { lang } = useLanguage();
  const t = translations[lang];

  return (
    <div className="flex flex-col min-h-screen">
      <section className="w-full bg-black py-20 text-center">
        <h1 className="text-6xl font-bold text-white mb-4">{t.heroTitle}</h1>
        <p className="text-gray-300 text-xl max-w-2xl mx-auto">{t.heroDesc}</p>
      </section>
      <main className="flex-grow bg-gray-900 text-white py-16 px-6">
        <section className="max-w-5xl mx-auto space-y-12">
          {t.features.map((f, idx) => (
            <article key={idx} className="flex flex-col md:flex-row items-center md:space-x-8 space-y-4 md:space-y-0">
              <div className="md:w-1/2">
                <h2 className="text-3xl font-bold text-yellow-400 mb-4">{f.title}</h2>
                <p className="text-gray-300 text-lg">{f.description}</p>
              </div>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
