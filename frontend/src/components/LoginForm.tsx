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
      wrongCredentials: "❌ Email ou mot de passe incorrect.",
      default: "❌ Une erreur est survenue, réessayez plus tard."
    },
    en: {
      title: "Login",
      email: "Email",
      password: "Password",
      invalidEmail: "Invalid email address.",
      requiredPassword: "Password is required.",
      loginBtn: "Login",
      loading: "Logging in...",
      success: "✅ Login successful !",
      wrongCredentials: "❌ Incorrect email or password.",
      default: "❌ An error has occured, please try again later.",
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

    const validationErrors = validate();
    setErrors(validationErrors);
    setSuccess(false);

    // Si validation locale échoue → on ne tente pas le POST
    if (Object.keys(validationErrors).length > 0) return;

    try {
      const res = await fetch("http://localhost:3030/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      // Si la réponse n’est pas OK → récupérer le message d’erreur
      if (!res.ok) {
        const message = t.wrongCredentials || t.default;
        setServerError(message);
        throw new Error(message);
      }

      // Succès → on reset le formulaire
      setSuccess(true);
      setErrors({});
      setFormData({
        username: "",
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
    } catch (err: any) {
      // console.error("Signup error:", err);
      setErrors({ general: err.message || "Erreur serveur." });
    }
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
