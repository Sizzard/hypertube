"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Composant de protection de route.
 * Vérifie si l'utilisateur est connecté (ex: via token en localStorage)
 * Redirige vers /403 si non autorisé.
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        //  Exemple simple : on récupère un token stocké localement
        const token = localStorage.getItem("token");

        if (!token) {
          setIsAuthorized(false);
          router.push("/403");
          return;
        }

        // Optionnel : vérifier le token auprès du backend
        const res = await fetch("http://localhost:3030/api/verify-token", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        console.log(res);

        if (!res.ok) {
          setIsAuthorized(false);
          router.push("/403");
          return;
        }

        //  Si tout est OK
        setIsAuthorized(true);
      } catch (err) {
        console.error("Auth check failed:", err);
        setIsAuthorized(false);
        router.push("/403");
      }
    };

    checkAuth();
  }, [router]);

  // ⏳ En attendant la vérification → écran neutre
  if (isAuthorized === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <p>Vérification de l'accès...</p>
      </div>
    );
  }

  //  Non autorisé → rien à afficher (redirection gérée)
  if (!isAuthorized) return null;

  //  Autorisé → on affiche la page demandée
  return <>{children}</>;
}
