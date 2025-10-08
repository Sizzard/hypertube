"use client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function DocPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white">
      <Header />

      <main className="flex-1 p-6 max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-yellow-400 mb-6">Documentation</h1>

        <section className="space-y-4 text-gray-200">
          <p>
            Bienvenue sur la documentation d'Hypertube ! Cette page peut contenir :
          </p>
          <ul className="list-disc list-inside">
            <li>Instructions pour utiliser le site</li>
            <li>Liens vers les fonctionnalités principales</li>
            <li>Exemples d'API ou guides pour le front-end</li>
          </ul>

          <p className="mt-4">
            Tu peux revenir à l'accueil via le header
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}
