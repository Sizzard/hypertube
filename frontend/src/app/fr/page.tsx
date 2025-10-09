"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";

const features = [
  {
    title: "Découvrez Hypertube",
    description:
      "Hypertube est votre plateforme ultime pour découvrir films et séries en streaming avec une expérience fluide et moderne.",
  },
  {
    title: "Navigation simple",
    description:
      "Trouvez facilement vos films et séries préférés grâce à notre interface claire et intuitive.",
  },
  {
    title: "Inscription rapide",
    description:
      "Créez un compte en quelques secondes et accédez à toutes les fonctionnalités premium.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      {/* Hero */}
      <section className="w-full bg-black py-20 text-center">
        <div className="max-w-5xl mx-auto px-6">
          <h1 className="text-6xl font-bold text-white mb-4">Hypertube</h1>
          <p className="text-gray-300 text-xl max-w-2xl mx-auto">
            Explorez, regardez et partagez vos films et séries préférés
          </p>
        </div>
      </section>

      {/* Sections explicatives */}
      <main className="flex-grow bg-gray-900 text-white py-16 px-6">
        <section className="max-w-5xl mx-auto space-y-12">
          {features.map((f, idx) => (
            <article
              key={idx}
              className="flex flex-col md:flex-row items-center md:space-x-8 space-y-4 md:space-y-0"
            >
              <div className="md:w-1/2">
                <h2 className="text-3xl font-bold text-yellow-400 mb-4">{f.title}</h2>
                <p className="text-gray-300 text-lg">{f.description}</p>
              </div>
            </article>
          ))}
        </section>
      </main>

      <Footer />
    </div>
  );
}

