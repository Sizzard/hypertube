"use client";

import Link from "next/link";

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-gray-100 px-6">
      <div className="max-w-md w-full text-center bg-gray-800 p-8 rounded-2xl shadow-lg border border-red-500">
        <h1 className="text-3xl font-bold text-red-500 mb-4">
          🚫 Erreur de liaison de compte
        </h1>

        <p className="text-gray-300 mb-6">
          Nous n'avons pas pu lier votre compte externe (GitHub, 42, etc.) à un
          compte existant.  
          Cela se produit généralement lorsque les adresses e-mail ne
          correspondent pas.
        </p>

        <p className="text-gray-400 mb-8 text-sm">
          Vous pouvez soit créer un nouveau compte, soit vous connecter avec
          l'adresse e-mail déjà utilisée.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="px-6 py-2 rounded-lg bg-gray-700 text-gray-100 font-semibold hover:bg-gray-600 transition"
          >
            Retour à l'acceuil
          </Link>
        </div>
      </div>
    </div>
  );
}
