"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import Header from "@/components/Header";
import Footer from "@/components/Footer";


export default function FilmsPage() {
  return (    <div className="min-h-screen flex flex-col bg-gray-900 text-white">
        <Header />
  
        <main className="flex-1 p-6 max-w-4xl mx-auto">
          <ProtectedRoute>
            <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
              <h1 className="text-4xl font-bold text-yellow-400 mb-4">Séries</h1>
              <p>Bienvenue dans la section réservée aux utilisateurs connectés.</p>
            </div>
          </ProtectedRoute>
        </main>
  
        <Footer />
      </div>

  );
}
