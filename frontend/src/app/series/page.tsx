"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import FilmsPage from "@/components/FilmPage";

export default function Films() {
  return (
    <ProtectedRoute>
      <FilmsPage />
    </ProtectedRoute>
  );
}
