// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import ProtectedRoute from "@/components/ProtectedRoute";
// import Header from "@/components/Header";
// import Footer from "@/components/Footer";

// export default function FilmsPage() {
//   const [query, setQuery] = useState("");
//   const [results, setResults] = useState<any[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const router = useRouter();

//   const handleSearch = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!query.trim()) return;

//     const token = localStorage.getItem("token");
//     if (!token) {
//       setError("❌ Vous devez être connecté pour effectuer une recherche.");
//       return;
//     }

//     setLoading(true);
//     setError(null);

//     try {
//       const res = await fetch(`http://localhost:3030/api/search-movie?title=${encodeURIComponent(query)}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       const data = await res.json();
//       if (!res.ok || !data.Search) throw new Error(data?.error || "Erreur lors de la recherche");

//       setResults(data.Search);
//     } catch (err) {
//       console.error(err);
//       setError("❌ Impossible de récupérer les résultats.");
//       setResults([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleClick = (id: string) => {
//     router.push(`films/${id}`);
//   };

//   return (
//     <div className="min-h-screen flex flex-col bg-gray-900 text-white">
//       <Header />

//       <main className="flex-1 p-6 max-w-5xl mx-auto">
//         <ProtectedRoute>
//           <h1 className="text-4xl font-bold text-yellow-400 mb-8 text-center">
//             Recherche de Films
//           </h1>

//           <form
//             onSubmit={handleSearch}
//             className="flex flex-col sm:flex-row justify-center gap-4 mb-10"
//           >
//             <input
//               type="text"
//               value={query}
//               onChange={(e) => setQuery(e.target.value)}
//               placeholder="Entrez le nom d’un film..."
//               className="w-full sm:w-2/3 bg-gray-800 text-white border border-gray-700 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
//             />
//             <button
//               type="submit"
//               className="bg-yellow-400 text-gray-900 px-6 py-2 rounded-xl font-semibold hover:bg-yellow-300 transition"
//             >
//               Rechercher
//             </button>
//           </form>

//           {error && <p className="text-center text-red-400 mb-6">{error}</p>}
//           {loading && <p className="text-center text-gray-400">Chargement...</p>}

//           {!loading && results.length > 0 && (
//             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
//               {results.map((film) => (
//                 <div
//                   key={film.imdbID}
//                   onClick={() => handleClick(film.imdbID)}
//                   className="relative group cursor-pointer rounded-lg overflow-hidden shadow-lg border border-gray-700 hover:scale-105 transition-transform duration-300"
//                 >
//                   {film.Poster && film.Poster !== "N/A" ? (
//                     <img
//                       src={film.Poster}
//                       alt={film.Title}
//                       className="w-full h-72 object-cover"
//                     />
//                   ) : (
//                     <div className="w-full h-72 bg-gray-700 flex items-center justify-center text-gray-500">
//                       Pas d’image
//                     </div>
//                   )}

//                   <div className="absolute inset-0 bg-black bg-opacity-70 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
//                     <p className="text-yellow-400 font-semibold text-center px-2 text-lg">
//                       {film.Title} ({film.Year})
//                     </p>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </ProtectedRoute>
//       </main>

//       <Footer />
//     </div>
//   );
// }

"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function FilmsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [films, setFilms] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const token = localStorage.getItem("token");
    if (!token) {
      setError("❌ Vous devez être connecté pour rechercher un film.");
      return;
    }

    try {
      const res = await fetch(`http://localhost:3030/api/search-movie?title=${encodeURIComponent(searchTerm)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur inconnue");
      setFilms(data.results || []); // <= adapter à la nouvelle structure
    } catch (err) {
      console.error(err);
      setError("❌ Erreur lors de la recherche.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white items-center py-10">
      <h1 className="text-4xl font-bold text-yellow-400 mb-6">Recherche de Films</h1>

      {/* Barre de recherche */}
      <form onSubmit={handleSearch} className="flex mb-8 w-full max-w-md">
        <input
          type="text"
          placeholder="Rechercher un film..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow px-4 py-2 rounded-l-lg bg-gray-800 border border-yellow-400 focus:outline-none text-white"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-yellow-400 text-gray-900 rounded-r-lg hover:bg-yellow-300 transition"
        >
          Rechercher
        </button>
      </form>

      {/* Gestion des erreurs */}
      {error && <p className="text-red-400 mb-4">{error}</p>}

      {/* Liste des résultats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {films.map((film) => (
          <div
            key={film.id}
            className="relative group cursor-pointer"
            onClick={() => router.push(`films/${film.id}`)}
          >
            <img
              src={
                film.poster_path
                  ? `https://image.tmdb.org/t/p/w500${film.poster_path}`
                  : "/default-poster.jpg"
              }
              alt={film.title}
              className="w-full rounded-lg shadow-lg border border-gray-700 transition-transform transform group-hover:scale-105"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-yellow-400 text-center py-2 opacity-0 group-hover:opacity-100 transition-opacity rounded-b-lg">
              {film.title}
            </div>
          </div>
        ))}
      </div>

      {/* Aucun résultat */}
      {films.length === 0 && !error && (
        <p className="text-gray-400 mt-6">Aucun film trouvé.</p>
      )}
    </div>
  );
}
