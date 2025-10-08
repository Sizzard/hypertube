"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const slides = [
  {
    title: "Découvrez Hypertube",
    description:
      "Hypertube est votre plateforme ultime pour découvrir films et séries en streaming avec une expérience fluide et moderne.",
    // image: "/images/slide1.jpg",
  },
  {
    title: "Navigation simple",
    description:
      "Trouvez facilement vos films et séries préférés grâce à notre interface claire et intuitive.",
    // image: "/images/slide2.jpg",
  },
  {
    title: "Inscription rapide",
    description:
      "Créez un compte en quelques secondes et accédez à toutes les fonctionnalités premium.",
    // image: "/images/slide3.jpg",
  },
];

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Slide automatique toutes les 5 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      {/* Hero */}
      <section className="relative w-full h-screen bg-black flex flex-col items-center justify-center text-center overflow-hidden">
        <h1 className="text-6xl font-bold text-white mb-4">Hypertube</h1>
        <p className="text-gray-300 text-xl max-w-2xl">
          Explorez, regardez et partagez vos films et séries préférés
        </p>

        {/* Slider */}
        <div className="absolute bottom-16 w-full flex justify-center items-center space-x-4">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`w-4 h-4 rounded-full transition ${
                index === currentSlide ? "bg-yellow-400" : "bg-gray-500"
              }`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>

        <div className="absolute inset-0 -z-10">
          {/* <img
            src={slides[currentSlide].image}
            alt={slides[currentSlide].title}
            className="w-full h-full object-cover opacity-70"
          /> */}
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
      </section>

      {/* Sections explicatives */}
      <main className="flex-grow bg-gray-900 text-white py-16 px-6">
        <section className="max-w-5xl mx-auto space-y-16">
          {slides.map((slide, idx) => (
            <div
              key={idx}
              className="flex flex-col md:flex-row items-center md:space-x-8 space-y-4 md:space-y-0"
            >
              {/* <img
                src={slide.image}
                alt={slide.title}
                className="w-full md:w-1/2 rounded-lg shadow-lg"
              /> */}
              <div className="md:w-1/2">
                <h2 className="text-3xl font-bold text-yellow-400 mb-4">
                  {slide.title}
                </h2>
                <p className="text-gray-300 text-lg">{slide.description}</p>
              </div>
            </div>
          ))}
        </section>
      </main>

      <Footer />
    </div>
  );
}
