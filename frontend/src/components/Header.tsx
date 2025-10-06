"use client";
import Link from "next/link";

export default function Header() {
  return (
    <header className="w-full bg-gray-900 text-white shadow-md">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/">
              <h1 className="text-2xl font-bold tracking-tight text-yellow-400">
                Hypertube
              </h1>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-6">
            <Link href="/films" className="hover:text-yellow-400 transition">
              Films
            </Link>
            <Link href="/series" className="hover:text-yellow-400 transition">
              Séries
            </Link>
          </nav>

          {/* Boutons / actions */}
          <div className="flex items-center space-x-4">
            <Link
              href="/login"
              className="bg-yellow-400 text-gray-900 px-3 py-1 rounded hover:bg-yellow-300 transition"
            >
              Connexion
            </Link>
            <Link
              href="/signup"
              className="border border-yellow-400 px-3 py-1 rounded hover:bg-yellow-400 hover:text-gray-900 transition"
            >
              Inscription
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
