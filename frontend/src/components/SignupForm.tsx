"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";

export default function SignupForm() {
  const pathname = usePathname();
  const currentLocale = pathname?.startsWith("/en") ? "en" : "fr";
  const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3030";

  // Traductions FR / EN
  const t = {
    fr: {
      title: "Inscription",
      username: "Nom d'utilisateur",
      firstName: "Prénom",
      lastName: "Nom",
      email: "Email",
      password: "Mot de passe",
      confirmPassword: "Confirmer le mot de passe",
      usernameRequired: "Le nom d'utilisateur est requis.",
      firstNameRequired: "Un prénom est requis.",
      lastNameRequired: "Un nom est requis.",
      invalidEmail: "Email invalide.",
      shortPassword: "Le mot de passe doit contenir au moins 6 caractères.",
      passwordsMismatch: "Les mots de passe ne correspondent pas.",
      submit: "S'inscrire",
      success: "✅ Inscription réussie !",
      errorRegistration: "Server connection error.",
    },
    en: {
      title: "Sign Up",
      username: "Username",
      firstName: "First Name",
      lastName: "Last Name",
      email: "Email",
      password: "Password",
      confirmPassword: "Confirm Password",
      usernameRequired: "Username is required.",
      firstNameRequired: "A fist name is required.",
      lastNameRequired: "A last name is required.",
      invalidEmail: "Invalid email address.",
      shortPassword: "Password must be at least 6 characters long.",
      passwordsMismatch: "Passwords do not match.",
      submit: "Sign Up",
      success: "✅ Registration successful!",
      errorRegistration: "Server connection error.",
    },
  }[currentLocale];

  // États
  const [formData, setFormData] = useState({
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) newErrors.username = t.usernameRequired;
    if (!formData.firstName.trim()) newErrors.firstName = t.firstNameRequired;
    if (!formData.lastName.trim()) newErrors.lastName = t.lastNameRequired;
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
      newErrors.email = t.invalidEmail;
    if (formData.password.length < 6)
      newErrors.password = t.shortPassword;
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = t.passwordsMismatch;

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    setSuccess(false);

    if (Object.keys(validationErrors).length > 0) return;

    try {
      const res = await fetch("http://localhost:3030/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Erreur d’inscription.");
      }

      // Succès
      setSuccess(true);
      setFormData({
        username: "",
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
    } catch (err: any) {
      console.error("Signup error:", err);
      setErrors({ general: err.message || "Erreur serveur." });
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto bg-gray-900 p-6 rounded-lg shadow-md border border-yellow-400"
    >
      <h2 className="text-2xl font-bold text-yellow-400 mb-4">{t.title}</h2>

      {/* Username */}
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

      {/* FirstName */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">{t.firstName}</label>
        <input
          type="text"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 focus:outline-none focus:border-yellow-400"
        />
        {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
      </div>

      {/* LastName */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">{t.lastName}</label>
        <input
          type="text"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 focus:outline-none focus:border-yellow-400"
        />
        {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
      </div>

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

      {/* Password */}
      <div className="mb-4">
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

      {/* Confirm password */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-1">{t.confirmPassword}</label>
        <input
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 focus:outline-none focus:border-yellow-400"
        />
        {errors.confirmPassword && (
          <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
        )}
      </div>

      {/* Submit button */}
      <button
        type="submit"
        className="w-full bg-yellow-400 text-gray-900 py-2 rounded font-semibold hover:bg-yellow-300 transition"
      >
        {t.submit}
      </button>
      {errors.general && (
        <p className="text-red-500 text-center mt-4 font-semibold">{errors.general}</p>
      )}

      {/* Success message */}
      {success && (
        <p className="text-green-400 text-center mt-4 font-semibold">{t.success}</p>
      )}
    </form>
  );
}
