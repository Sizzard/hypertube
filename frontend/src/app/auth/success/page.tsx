"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function AuthSuccessPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    if (token) {
      // console.log("Token reçu:", token);
      localStorage.setItem("token", token);

      // Redirection automatique après stockage
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    } else {
      console.error("No token found");
    }
  }, [token]);

  return (
    <div className="flex flex-col items-center justify-center h-screen text-yellow-400">
      <h1 className="text-2xl font-bold mb-4">Success🎉</h1>
      <p>Redirection...</p>
    </div>
  );
}
