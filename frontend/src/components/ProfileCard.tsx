"use client";

export default function ProfileCard({
  user,
  editing,
  formData,
  setFormData,
  setEditing,
  handleSave,
  message,
  avatarUrl,
  preview,
  selectedFile,
  handleAvatarChange,
  handleAvatarUpload
}: any) {

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  return (
    <div className="bg-gray-800 p-8 rounded-2xl shadow-lg border border-yellow-400">

      {/* Avatar */}
      <div className="flex flex-col items-center mb-6">
        <img
          src={preview || avatarUrl || "/default.jpg"}
          className="w-24 h-24 rounded-full border-2 border-yellow-400 object-cover mb-3"
          onError={(e) => ((e.target as HTMLImageElement).src = "/default.jpg")}
        />

        {editing && (
          <>
            <label className="cursor-pointer bg-gray-700 px-4 py-2 rounded hover:bg-gray-600">
              Choisir un fichier
              <input type="file" className="hidden" onChange={handleAvatarChange} />
            </label>

            {selectedFile && (
              <button
                onClick={handleAvatarUpload}
                className="bg-blue-500 mt-2 px-4 py-2 rounded hover:bg-blue-400 text-white"
              >
                Uploader
              </button>
            )}
          </>
        )}
      </div>

      {/* Form */}
      <div className="space-y-4">
        {["username", "first_name", "last_name", "email"].map((field) => (
          <div key={field}>
            <label className="block text-sm text-gray-300 mb-1">
              {field.replace("_", " ")}
            </label>

            {editing ? (
              <input
                type={field === "email" ? "email" : "text"}
                name={field}
                value={formData[field]}
                onChange={handleChange}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
              />
            ) : (
              <p className="text-lg font-medium">{user[field]}</p>
            )}
          </div>
        ))}
      </div>

      {/* Buttons */}
      <div className="mt-6 flex justify-between">
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="bg-yellow-400 text-gray-900 px-4 py-2 rounded hover:bg-yellow-300"
          >
            Modifier
          </button>
        ) : (
          <>
            <button
              onClick={handleSave}
              className="bg-green-500 px-4 py-2 rounded text-white hover:bg-green-400"
            >
              Sauvegarder
            </button>

            <button
              onClick={() => setEditing(false)}
              className="bg-gray-600 px-4 py-2 rounded text-white hover:bg-gray-500"
            >
              Annuler
            </button>
          </>
        )}
      </div>

      {message && (
        <p className="text-center mt-4 font-semibold text-yellow-400">
          {message}
        </p>
      )}
    </div>
  );
}
