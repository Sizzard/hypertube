"use client";

import Link from "next/link";

export default function Footer() {

  return (
    <footer className="w-full bg-gray-900 text-gray-400 py-4 mt-auto border-t border-gray-800">
      <div className="text-center text-sm">
        © 2025{" "}
        <Link
          href={`/doc`}
          className="text-yellow-400 hover:text-yellow-300 transition font-medium"
        >
          Sizzard
        </Link>
      </div>
    </footer>
  );
}
