"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setIsAuthorized(false);
          router.push("/403");
          return;
        }

        const res = await fetch("/api/verify-token", {
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

        setIsAuthorized(true);
      } catch (err) {
        console.error("Auth check failed:", err);
        setIsAuthorized(false);
        router.push("/403");
      }
    };

    checkAuth();
  }, [router]);

  if (isAuthorized === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <p>Vérification de l'accès...</p>
      </div>
    );
  }

  if (!isAuthorized) return null;

  return <>{children}</>;
}
