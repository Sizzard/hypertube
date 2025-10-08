"use client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white">
      {/* Header */}
      <Header />

      {/* Contenu principal */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <h1 className="text-5xl font-bold text-yellow-400 mb-4">404</h1>
        <p className="text-lg mb-6">Oups... this page does not exist.</p>
        <Link
          href="/"
          className="bg-yellow-400 text-gray-900 px-4 py-2 rounded hover:bg-yellow-300 transition"
        >
          Return to home
        </Link>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
