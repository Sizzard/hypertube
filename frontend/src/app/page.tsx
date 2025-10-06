"use client"

import { useEffect, useState } from "react"
import Header from "@/components/Header";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3030";

export default function Home() {

  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/api/hello`)
    .then((res) => res.json())
    .then((data) => setMessage(data.message))
    .catch((err) => console.error("ERROR API :", err));
  }, []);

  return (
    <div className="flex flex-col min-h-screen items-center justify-between">
      {/* Header */}
      <Header />
      <header className="w-full bg-black py-8 text-center">
        <h1 className="text-6xl font-bold text-white">Hypertube</h1>
      </header>

      {/* Contenu central (vide pour l’instant) */}
      <main className="flex-grow flex items-center justify-center">
        <p className="text-gray-500 text-xl">          {message || "Chargement..."}</p>
      </main>



      {/* Footer */}
      <footer className="w-full bg-gray-900 py-4 text-center">
        <p className="text-gray-400 text-sm">© 2025 Sizzard</p>
      </footer>
    </div>
  )
}