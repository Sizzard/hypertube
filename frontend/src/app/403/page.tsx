"use client";

import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white text-center px-6">
      <h1 className="text-6xl font-bold text-yellow-400 mb-6">403</h1>
      <p className="text-gray-300 text-xl mb-8">
        There is nothing to see here, but maybe if you give a valid password ...
      </p>

      <Link
        href="/"
        className="bg-yellow-400 text-gray-900 px-6 py-2 rounded font-semibold hover:bg-yellow-300 transition"
      >
        Return to Home
      </Link>
    </div>
  );
}
