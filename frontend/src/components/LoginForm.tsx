"use client";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function LoginForm() {
  const pathname = usePathname();
  const router = useRouter();
  const currentLocale = pathname?.startsWith("/en") ? "en" : "fr";

  const t = {
    fr: {
      title: "Connexion",
      email: "Email",
      password: "Mot de passe",
      invalidEmail: "Email invalide.",
      requiredPassword: "Le mot de passe est requis.",
      loginBtn: "Se connecter",
      forgotPassword: "Mot de passe oublié ?",
      loading: "Connexion...",
      success: "✅ Connexion réussie !",
      wrongCredentials: "❌ Email ou mot de passe incorrect.",
      default: "❌ Une erreur est survenue, réessayez plus tard.",
    },
    en: {
      title: "Login",
      email: "Email",
      password: "Password",
      invalidEmail: "Invalid email address.",
      requiredPassword: "Password is required.",
      loginBtn: "Login",
      forgotPassword: "Forgot password?",
      loading: "Logging in...",
      success: "✅ Login successful!",
      wrongCredentials: "❌ Incorrect email or password.",
      default: "❌ An error has occurred, please try again later.",
    },
  }[currentLocale];

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

    const validationErrors = validate();
    setErrors(validationErrors);
    setSuccess(false);

    if (Object.keys(validationErrors).length > 0) return;

    try {
      const res = await fetch("http://localhost:3030/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok && data.token) {
        localStorage.setItem("token", data.token);
        console.log("User connected:", data);
        setTimeout(() => window.location.reload(), 500);
      } else {
        setServerError(t.wrongCredentials);
      }

      setSuccess(true);
      setErrors({});
      setFormData({ email: "", password: "" });
    } catch (err: any) {
      setErrors({ general: err.message || "Erreur serveur." });
    } finally {
      setLoading(false);
    }
  };

  const handle42Connect = () => {
    const redirectUrl = process.env.NEXT_PUBLIC_API_42;
    if (!redirectUrl) {
      console.error("NEXT_PUBLIC_API_42 is not defined in .env");
      return;
    }
    window.location.href = redirectUrl;
  };

  const handleGithubConnect = () => {
    const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
    const redirectUri = process.env.NEXT_PUBLIC_GITHUB_REDIRECT_URI;
    if (!clientId || !redirectUri) {
      console.error("Variables NEXT_PUBLIC_GITHUB_CLIENT_ID ou REDIRECT_URI non définies");
      return;
    }
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=read:user%20user:email`;
    window.location.href = githubAuthUrl;
  };

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

      {/* Forgot password */}
      <div className="text-right mb-4">
        <button
          type="button"
          onClick={() => router.push("/reset-password")}
          className="text-sm text-yellow-400 hover:underline"
        >
          {t.forgotPassword}
        </button>
      </div>

      {/* Bouton de connexion */}
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

      {/* OAuth */}
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
