import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

interface FilmCommentsProps {
  imdb_id: string;
}

interface Comment {
  id: number;
  content: string;
  created_at: string;
  username: string;
}

const translations = {
  fr: {
    title: "Commentaires",
    placeholder: "Écrire un commentaire... (200 caractères max)",
    loading: "Chargement...",
    noComments: "Aucun commentaire pour ce film.",
    sendButton: "Envoyer",
    notLoggedIn: "Vous devez être connecté.",
  },
  en: {
    title: "Comments",
    placeholder: "Write a comment... (max 200 chars)",
    loading: "Loading...",
    noComments: "No comments for this movie.",
    sendButton: "Send",
    notLoggedIn: "You must be logged in.",
  },
};

export default function FilmComments({ imdb_id }: FilmCommentsProps) {
  const { lang } = useLanguage();
  const t = translations[lang];

  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [sending, setSending] = useState(false);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // ---- Fetch comments ----
  async function fetchComments() {
    try {
      const res = await fetch(`/api/comments?imdb_id=${imdb_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed fetching comments");

      const data = await res.json();
      setComments(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  // ---- Post new comment ----
  async function handleSubmit() {
    if (!newComment.trim()) return;
    if (!token) return alert(t.notLoggedIn);

    setSending(true);
    try {
      const res = await fetch(`/api/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ imdb_id, content: newComment.trim() }),
      });
      if (!res.ok) throw new Error("Error sending comment");

      setNewComment("");
      await fetchComments();
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
    }
  }

  useEffect(() => {
    fetchComments();
  }, [imdb_id]);

  return (
    <div className="w-full bg-neutral-900 text-white p-4 rounded-xl shadow-lg">
      <h2 className="text-xl font-semibold mb-4">{t.title}</h2>

      {/* --- Zone écriture --- */}
      <div className="mb-6">
        <textarea
          maxLength={200}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder={t.placeholder}
          className="w-full p-3 bg-neutral-800 rounded-lg outline-none resize-none"
          rows={3}
        />
        <div className="flex justify-between items-center mt-2">
          <span className="text-sm text-neutral-400">
            {newComment.length}/200
          </span>
          <button
            onClick={handleSubmit}
            disabled={sending || newComment.trim().length === 0}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg disabled:bg-neutral-700"
          >
            {t.sendButton}
          </button>
        </div>
      </div>

      {/* --- Liste des commentaires --- */}
      {loading ? (
        <p className="text-neutral-400">{t.loading}</p>
      ) : comments.length === 0 ? (
        <p className="text-neutral-500">{t.noComments}</p>
      ) : (
        <ul className="space-y-4">
          {comments.map((c) => (
            <li key={c.id} className="bg-neutral-800 p-4 rounded-lg">
              <div className="flex justify-between">
                <strong>{c.username ?? "User"}</strong>
                <span className="text-xs text-neutral-500">
                  {new Date(c.created_at).toLocaleString(lang === "fr" ? "fr-FR" : "en-US")}
                </span>
              </div>
              <p className="mt-2 break-words whitespace-pre-wrap">{c.content}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
