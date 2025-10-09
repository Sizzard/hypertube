"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import SignupForm from "./SignupForm";
import LoginForm from "./LoginForm";

const translations = {
  fr: {
    films: "Films",
    series: "Séries",
    login: "Connexion",
    signup: "Inscription",
    logout: "Déconnexion",
    home: "Accueil",
    lang: "EN",
  },
  en: {
    films: "Movies",
    series: "Series",
    login: "Login",
    signup: "Sign Up",
    logout: "Logout",
    home: "Home",
    lang: "FR",
  },
};

export default function Header() {
  const [showSlide, setShowSlide] = useState(false);
  const [slideType, setSlideType] = useState<"login" | "signup" | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const currentLocale = pathname?.startsWith("/en") ? "en" : "fr";
  const t = translations[currentLocale];

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  const handleSlide = (type: "login" | "signup") => {
    if (slideType === type && showSlide) {
      setShowSlide(false);
    } else {
      setSlideType(type);
      setShowSlide(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    router.push(`/${currentLocale}`); // redirige vers l’accueil
  };

  const toggleLocale =
    currentLocale === "fr"
      ? pathname.replace(/^\/fr/, "/en") || `/en${pathname}`
      : pathname.replace(/^\/en/, "/fr") || `/fr${pathname}`;

  return (
    <header className="w-full bg-gray-900 text-white shadow-md relative">
      <div className="flex justify-between items-center h-16 px-6">
        {/* Logo */}
        <Link
          href={currentLocale === "en" ? "/en" : "/fr"}
          className="hover:text-yellow-300 transition"
        >
          <h1 className="text-2xl font-bold text-yellow-400">Hypertube</h1>
        </Link>

        {/* Navigation principale */}
        <nav className="hidden md:flex space-x-6">
          <Link href={`/${currentLocale}/films`} className="hover:text-yellow-400 transition">
            {t.films}
          </Link>
          <Link href={`/${currentLocale}/series`} className="hover:text-yellow-400 transition">
            {t.series}
          </Link>
        </nav>

        {/* Actions utilisateur */}
        <nav className="flex space-x-4 items-center">
          {!isLoggedIn ? (
            <>
              <button
                onClick={() => handleSlide("login")}
                className="bg-yellow-400 text-gray-900 px-3 py-1 rounded hover:bg-yellow-300 transition"
              >
                {t.login}
              </button>
              <button
                onClick={() => handleSlide("signup")}
                className="border border-yellow-400 px-3 py-1 rounded hover:bg-yellow-400 hover:text-gray-900 transition"
              >
                {t.signup}
              </button>
            </>
          ) : (
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-400 transition"
            >
              {t.logout}
            </button>
          )}

          {/* Switcher de langue */}
          <Link
            href={toggleLocale}
            className="ml-4 text-sm text-gray-400 hover:text-yellow-400 transition"
          >
            {t.lang}
          </Link>
        </nav>
      </div>

      {/* Slide Panel */}
      <div
        className={`absolute left-0 top-16 w-full bg-gray-800 text-white transition-all duration-500 overflow-hidden ${
          showSlide ? "max-h-[100vh] p-6" : "max-h-0 p-0"
        }`}
      >
        {slideType === "login" && <LoginForm />}
        {slideType === "signup" && <SignupForm />}
      </div>
    </header>
  );
}
