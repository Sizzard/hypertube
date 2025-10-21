"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import SignupForm from "./SignupForm";
import LoginForm from "./LoginForm";
import { useLanguage } from "@/contexts/LanguageContext";

const translations = {
  fr: { films: "Films", series: "Séries", login: "Connexion", signup: "Inscription", logout: "Déconnexion", profile: "Profil" },
  en: { films: "Movies", series: "Series", login: "Login", signup: "Sign Up", logout: "Logout", profile: "Profile" },
};

export default function Header() {
  const [showSlide, setShowSlide] = useState(false);
  const [slideType, setSlideType] = useState<"login" | "signup" | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const { lang, setLang } = useLanguage();
  const t = translations[lang];
  const router = useRouter();

  // Vérifie l’état de connexion à chaque rendu et quand le token change dans localStorage
  useEffect(() => {
    const checkLogin = () => {
      const token = localStorage.getItem("token");
      setIsLoggedIn(!!token);
    };

    checkLogin();
    window.addEventListener("storage", checkLogin); // synchronise avec autres onglets

    return () => window.removeEventListener("storage", checkLogin);
  }, []);

  const handleSlide = (type: "login" | "signup") => {
    if (slideType === type && showSlide) setShowSlide(false);
    else {
      setSlideType(type);
      setShowSlide(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setShowSlide(false); // ferme le slide si ouvert
    router.push("/");
  };

  const handleProfile = () => router.push("/profile");

  const toggleLang = () => setLang(lang === "en" ? "fr" : "en");

  // Callback pour fermer le slide après login/signup réussi
  const handleAuthSuccess = () => {
    setShowSlide(false);
    setIsLoggedIn(true);
    router.push("/"); // ramène à l'accueil après login
  };

  return (
    <header className="w-full bg-gray-900 text-white shadow-md relative">
      <div className="flex justify-between items-center h-16 px-6">
        <Link href="/" className="hover:text-yellow-300 transition">
          <h1 className="text-2xl font-bold text-yellow-400">Hypertube</h1>
        </Link>

        <nav className="hidden md:flex space-x-6">
          <Link href="/films" className="hover:text-yellow-400 transition">{t.films}</Link>
          <Link href="/series" className="hover:text-yellow-400 transition">{t.series}</Link>
        </nav>

        <nav className="flex space-x-4 items-center">
          {!isLoggedIn ? (
            <>
              <button onClick={() => handleSlide("login")} className="bg-yellow-400 text-gray-900 px-3 py-1 rounded hover:bg-yellow-300 transition">{t.login}</button>
              <button onClick={() => handleSlide("signup")} className="border border-yellow-400 px-3 py-1 rounded hover:bg-yellow-400 hover:text-gray-900 transition">{t.signup}</button>
            </>
          ) : (
            <>
              <button onClick={handleProfile} className="bg-gray-700 text-white px-3 py-1 rounded hover:bg-gray-600 transition">{t.profile}</button>
              <button onClick={handleLogout} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-400 transition">{t.logout}</button>
            </>
          )}

          <button onClick={toggleLang} className="ml-4 w-8 h-8 flex items-center justify-center rounded-full hover:scale-110 transition-transform">
            {lang === "en" ? <span role="img" aria-label="Français">🇫🇷</span> : <span role="img" aria-label="English">🇬🇧</span>}
          </button>
        </nav>
      </div>

      <div className={`absolute left-0 top-16 w-full bg-gray-800 text-white transition-all duration-500 overflow-hidden ${showSlide ? "max-h-[100vh] p-6" : "max-h-0 p-0"}`}>
        {slideType === "login" && <LoginForm onSuccess={handleAuthSuccess} />}
        {slideType === "signup" && <SignupForm onSuccess={handleAuthSuccess} />}
      </div>
    </header>
  );
}
