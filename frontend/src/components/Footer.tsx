"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();

  const currentLocale = pathname?.startsWith("/en") ? "en" : "fr";

  const toggleLocale =
  currentLocale === "fr"
    ? pathname.replace(/^\/fr/, "/en") || `/en${pathname}`
    : pathname.replace(/^\/en/, "/fr") || `/fr${pathname}`;

  return (
    <footer className="w-full bg-gray-900 text-gray-400 py-4 mt-auto border-t border-gray-800">
      <div className="text-center text-sm">
        © 2025{" "}
        <Link
          href={`/${currentLocale}/doc`}
          className="text-yellow-400 hover:text-yellow-300 transition font-medium"
        >
          Sizzard
        </Link>
      </div>
    </footer>
  );
}
