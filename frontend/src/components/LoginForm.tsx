"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";

interface LoginFormProps {
  onSuccess?: () => void; // <-- nouvelle prop pour fermer le slide
}

export default function LoginForm({ onSuccess }: LoginFormProps) {
  const { lang } = useLanguage(); 
  const router = useRouter();

  const t = {
    fr: {
      title: "Connexion",
      username: "Nom d'utilisateur",
      password: "Mot de passe",
      requiredUsername: "Le nom d'utilisateur est requis.",
      requiredPassword: "Le mot de passe est requis.",
      loginBtn: "Se connecter",
      forgotPassword: "Mot de passe oublié ?",
      loading: "Connexion...",
      success: "✅ Connexion réussie !",
      wrongCredentials: "❌ Nom d'utilisateur ou mot de passe incorrect.",
      default: "❌ Une erreur est survenue, réessayez plus tard.",
    },
    en: {
      title: "Login",
      username: "Username",
      password: "Password",
      requiredUsername: "Username is required.",
      requiredPassword: "Password is required.",
      loginBtn: "Login",
      forgotPassword: "Forgot password?",
      loading: "Logging in...",
      success: "✅ Login successful!",
      wrongCredentials: "❌ Incorrect username or password.",
      default: "❌ An error has occurred, please try again later.",
    },
  }[lang];

  const [formData, setFormData] = useState({ username: "", password: "" });
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({});
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setServerError("");
  };

  const validate = () => {
    const newErrors: { username?: string; password?: string } = {};
    if (!formData.username.trim()) newErrors.username = t.requiredUsername;
    if (!formData.password.trim()) newErrors.password = t.requiredPassword;
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const validationErrors = validate();
    setErrors(validationErrors);
    setSuccess(false);

    if (Object.keys(validationErrors).length > 0) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok && data.token) {
        localStorage.setItem("token", data.token);
        setSuccess(true);

        // Fermer le slide
        if (onSuccess) onSuccess();

        // Rediriger vers l'accueil
        router.push("/");
      } else {
        setServerError(t.wrongCredentials);
      }
    } catch (err: any) {
      setServerError(err.message || t.default);
    } finally {
      setLoading(false);
    }
  };

  const handle42Connect = () => {
    const redirectUrl = process.env.NEXT_PUBLIC_API_42;
    if (!redirectUrl) return;
    window.location.href = redirectUrl;
  };

  const handleGithubConnect = () => {
    const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
    const redirectUri = process.env.NEXT_PUBLIC_GITHUB_REDIRECT_URI;
    if (!clientId || !redirectUri) return;
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=read:user%20user:email`;
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto bg-gray-900 p-6 rounded-lg shadow-md border border-yellow-400"
    >
      <h2 className="text-2xl font-bold text-yellow-400 mb-4">{t.title}</h2>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">{t.username}</label>
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
          className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 focus:outline-none focus:border-yellow-400"
        />
        {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
      </div>

      <div className="mb-2">
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

      <div className="text-right mb-4">
        <button
          type="button"
          onClick={() => router.push("/forgot-password")}
          className="text-sm text-yellow-400 hover:underline"
        >
          {t.forgotPassword}
        </button>
      </div>

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

      <button
        type="button"
        onClick={handle42Connect}
        className="w-full mt-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-500 transition"
      >
        42 Connect
      </button>

      <button
        type="button"
        onClick={handleGithubConnect}
        className="w-full mt-4 py-2 rounded bg-gray-800 text-white hover:bg-gray-700 transition"
      >
        GitHub Connect
      </button>

      {serverError && <p className="text-red-500 text-center mt-4 font-semibold">{serverError}</p>}
      {success && <p className="text-green-400 text-center mt-4 font-semibold">{t.success}</p>}
    </form>
  );
}
