"use client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function DocPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white">
      <Header />

      <main className="flex-1 p-6 max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-yellow-400 mb-6">Documentation</h1>

        <section className="space-y-4 text-gray-200">
          <p>
            Welcome to the Hypertube documentation! This page may include:
          </p>
          <ul className="list-disc list-inside">
            <li>Instructions on how to use the site</li>
            <li>Links to the main features</li>
            <li>API examples or front-end guides</li>
          </ul>

          <p className="mt-4">
            You can return to the homepage via the header.
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}
