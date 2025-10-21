"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function SignupForm() {
  const { lang } = useLanguage(); // Récupère la langue depuis le contexte

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
      success: "✅ Inscription réussie, vous pouvez maintenant vous connecter !",
      errors: {
        USER_EXISTS: "❌ Ce username existe déjà.",
        EMAIL_EXISTS: "❌ Cet email existe déjà.",
        MISSING_FIELDS: "❌ Tous les champs sont requis.",
        default: "❌ Une erreur est survenue, réessayez plus tard.",
      },
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
      firstNameRequired: "A first name is required.",
      lastNameRequired: "A last name is required.",
      invalidEmail: "Invalid email address.",
      shortPassword: "Password must be at least 6 characters long.",
      passwordsMismatch: "Passwords do not match.",
      submit: "Sign Up",
      success: "✅ Registration successful, you may now login!",
      errors: {
        USER_EXISTS: "❌ This username already exists.",
        EMAIL_EXISTS: "❌ This email already exists.",
        MISSING_FIELDS: "❌ All fields are required.",
        default: "❌ An error has occurred, please try again later.",
      },
    },
  }[lang];

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
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) newErrors.email = t.invalidEmail;
    if (formData.password.length < 6) newErrors.password = t.shortPassword;
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = t.passwordsMismatch;
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    setSuccess(false);
    if (Object.keys(validationErrors).length > 0) return;

    try {
      const res = await fetch(`/api/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const key = data.error || "default";
        const msg = t.errors[key as keyof typeof t.errors] || t.errors.default;
        throw new Error(msg);
      }

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
      setErrors({ general: err.message || t.errors.default });
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto bg-gray-900 p-6 rounded-lg shadow-md border border-yellow-400"
    >
      <h2 className="text-2xl font-bold text-yellow-400 mb-4">{t.title}</h2>

      {["username", "firstName", "lastName", "email", "password", "confirmPassword"].map((field) => (
        <div key={field} className="mb-4">
          <label className="block text-sm font-medium mb-1">{t[field as keyof typeof t]}</label>
          <input
            type={field.toLowerCase().includes("password") ? "password" : field === "email" ? "email" : "text"}
            name={field}
            value={formData[field as keyof typeof formData]}
            onChange={handleChange}
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 focus:outline-none focus:border-yellow-400"
          />
          {errors[field] && <p className="text-red-500 text-sm mt-1">{errors[field]}</p>}
        </div>
      ))}

      <button
        type="submit"
        className="w-full bg-yellow-400 text-gray-900 py-2 rounded font-semibold hover:bg-yellow-300 transition"
      >
        {t.submit}
      </button>

      {errors.general && <p className="text-red-500 text-center mt-4 font-semibold">{errors.general}</p>}
      {success && <p className="text-green-400 text-center mt-4 font-semibold">{t.success}</p>}
    </form>
  );
}
