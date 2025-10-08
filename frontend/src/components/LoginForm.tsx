"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";

export default function LoginForm() {
  const pathname = usePathname();
  const currentLocale = pathname?.startsWith("/en") ? "en" : "fr";

  // Dictionnaires FR/EN
  const t = {
    fr: {
      title: "Connexion",
      email: "Email",
      password: "Mot de passe",
      invalidEmail: "Email invalide.",
      requiredPassword: "Le mot de passe est requis.",
      loginBtn: "Se connecter",
      loading: "Connexion...",
      success: "✅ Connexion réussie !",
      wrongCredentials: "Email ou mot de passe incorrect.",
      serverError: "Erreur de connexion au serveur.",
    },
    en: {
      title: "Login",
      email: "Email",
      password: "Password",
      invalidEmail: "Invalid email address.",
      requiredPassword: "Password is required.",
      loginBtn: "Login",
      loading: "Logging in...",
      success: "✅ Login successful!",
      wrongCredentials: "Incorrect email or password.",
      serverError: "Server connection error.",
    },
  }[currentLocale];

  // États du formulaire
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setServerError("");
  };

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
      newErrors.email = t.invalidEmail;
    if (!formData.password.trim()) newErrors.password = t.requiredPassword;
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);
    setServerError("");

    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    setLoading(true);

    try {
      const res = await fakeLoginRequest(formData);
      if (res.ok) {
        setSuccess(true);
        setFormData({ email: "", password: "" });
      } else {
        setServerError(res.message || t.wrongCredentials);
      }
    } catch (err) {
      setServerError(t.serverError);
    } finally {
      setLoading(false);
    }
  };

  // Simulation d'un appel API
  const fakeLoginRequest = (data: { email: string; password: string }) =>
    new Promise<{ ok: boolean; message?: string }>((resolve) => {
      setTimeout(() => {
        if (data.email === "admin@site.com" && data.password === "admin123") {
          resolve({ ok: true });
        } else {
          resolve({ ok: false, message: t.wrongCredentials });
        }
      }, 1000);
    });

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto bg-gray-900 p-6 rounded-lg shadow-md border border-yellow-400"
    >
      <h2 className="text-2xl font-bold text-yellow-400 mb-4">{t.title}</h2>

      {/* Email */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">{t.email}</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 focus:outline-none focus:border-yellow-400"
        />
        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
      </div>

      {/* Mot de passe */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-1">{t.password}</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 focus:outline-none focus:border-yellow-400"
        />
        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
      </div>

      {/* Bouton */}
      <button
        type="submit"
        disabled={loading}
        className={`w-full py-2 rounded font-semibold transition ${
          loading
            ? "bg-gray-600 cursor-not-allowed"
            : "bg-yellow-400 text-gray-900 hover:bg-yellow-300"
        }`}
      >
        {loading ? t.loading : t.loginBtn}
      </button>

      {/* Messages */}
      {serverError && (
        <p className="text-red-500 text-center mt-4 font-semibold">{serverError}</p>
      )}
      {success && (
        <p className="text-green-400 text-center mt-4 font-semibold">{t.success}</p>
      )}
    </form>
  );
}
