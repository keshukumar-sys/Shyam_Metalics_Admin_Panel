import React, { useEffect, useState } from "react";
import DataTable from "../components/DataTable";

export default function AwardAdmin() {
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [awards, setAwards] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editFields, setEditFields] = useState({});

  const API_BASE = `${import.meta.env.VITE_API_BASE || "http://localhost:3002"}/award`;

  useEffect(() => {
    fetchAwards();
  }, []);

  const fetchAwards = async () => {
    try {
      const res = await fetch(`${API_BASE}/get_awards`);
      const data = await res.json();
      if (res.ok) setAwards(data.award || []);
      else setAwards([]);
    } catch (err) {
      console.error(err);
      setAwards([]);
    }
  };

  const handleImageSelect = (e, isEdit = false) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".webp")) {
      alert("Only .webp images are allowed");
      return;
    }

    if (isEdit) setEditFields({ ...editFields, imgFile: file });
    else setImage(file);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setMessage("");
    setUploading(true);

    if (!category || !title || !description || !image) {
      setMessage("All fields including image are required.");
      setUploading(false);
      return;
    }

    const formData = new FormData();
    formData.append("category", category);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("image", image);

    try {
      const res = await fetch(`${API_BASE}/create_awards`, { method: "POST", body: formData });
      const result = await res.json();
      if (!res.ok) setMessage(result.message || "Error creating award");
      else {
        setMessage("Award created successfully!");
        setCategory(""); setTitle(""); setDescription(""); setImage(null);
        fetchAwards();
      }
    } catch (err) {
      console.error(err);
      setMessage("Server error");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this award?")) return;
    try {
      const res = await fetch(`${API_BASE}/delete`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const result = await res.json();
      if (res.ok) fetchAwards();
      else alert(result.message || "Delete failed");
    } catch (err) {
      alert("Server error");
    }
  };

  const handleEdit = (award) => {
    setEditId(award._id);
    setEditFields({
      category: award.category,
      title: award.title,
      description: award.description,
      imgFile: null,
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUploading(true);

    const formData = new FormData();
    formData.append("category", editFields.category);
    formData.append("title", editFields.title);
    formData.append("description", editFields.description);
    if (editFields.imgFile) formData.append("image", editFields.imgFile);

    try {
      const res = await fetch(`${API_BASE}/update_awards/${editId}`, { method: "PUT", body: formData });
      const result = await res.json();
      if (res.ok) {
        setEditId(null);
        setEditFields({});
        fetchAwards();
      } else alert(result.message || "Update failed");
    } catch (err) {
      alert("Server error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Awards Management</h2>

      {/* Edit Form on Top */}
      {editId && (
        <div className="mb-6 p-6 border border-gray-300 rounded bg-gray-50 shadow">
          <h3 className="text-xl font-semibold mb-4">Edit Award</h3>
          <form onSubmit={handleUpdate} className="grid gap-4 max-w-xl">
            <label className="flex flex-col">
              Category
              <input
                className="border border-gray-300 rounded p-2 mt-1"
                value={editFields.category}
                onChange={(e) => setEditFields({ ...editFields, category: e.target.value })}
                required
              />
            </label>

            <label className="flex flex-col">
              Title
              <input
                className="border border-gray-300 rounded p-2 mt-1"
                value={editFields.title}
                onChange={(e) => setEditFields({ ...editFields, title: e.target.value })}
                required
              />
            </label>

            <label className="flex flex-col">
              Description
              <textarea
                className="border border-gray-300 rounded p-2 mt-1 h-32 resize-none"
                value={editFields.description}
                onChange={(e) => setEditFields({ ...editFields, description: e.target.value })}
                required
              />
            </label>

            <label className="flex flex-col">
              Image (.webp only)
              <input
                type="file"
                accept=".webp"
                onChange={(e) => handleImageSelect(e, true)}
                className="mt-1"
              />
            </label>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={uploading}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                {uploading ? "Updating..." : "Update Award"}
              </button>
              <button
                type="button"
                onClick={() => setEditId(null)}
                className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Create Form */}
      <div className="mb-6 p-6 border border-gray-300 rounded bg-white shadow">
        <h3 className="text-xl font-semibold mb-4">Add New Award</h3>
        <form onSubmit={handleCreate} className="grid gap-4 max-w-xl">
          <label className="flex flex-col">
            Category
            <input
              className="border border-gray-300 rounded p-2 mt-1"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            />
          </label>

          <label className="flex flex-col">
            Title
            <input
              className="border border-gray-300 rounded p-2 mt-1"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </label>

          <label className="flex flex-col">
            Description
            <textarea
              className="border border-gray-300 rounded p-2 mt-1 h-32 resize-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </label>

          <label className="flex flex-col">
            Image (.webp only)
            <input
              type="file"
              accept=".webp"
              onChange={handleImageSelect}
              className="mt-1"
              required
            />
          </label>

          <button
            type="submit"
            disabled={uploading}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            {uploading ? "Uploading..." : "Add Award"}
          </button>

          {message && <p className={`mt-2 ${message.includes("successfully") ? "text-green-600" : "text-red-600"}`}>{message}</p>}
        </form>
      </div>

      {/* Awards Table */}
      <h3 className="text-xl font-semibold mb-4">All Awards</h3>
      <DataTable
        columns={[
          { key: "category", label: "Category" },
          { key: "title", label: "Title" },
          { key: "description", label: "Description", render: (r) => r.description?.substring(0, 50) + "..." },
          { key: "image", label: "Image", render: (r) => r.image ? <a href={r.image} target="_blank" className="text-blue-600 underline">View</a> : "-" },
        ]}
        data={awards}
        actions={(row) => (
          <div className="flex gap-2">
            <button
              className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
              onClick={() => handleEdit(row)}
            >
              Edit
            </button>
            <button
              className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
              onClick={() => handleDelete(row._id)}
            >
              Delete
            </button>
          </div>
        )}
      />
    </div>
  );
}
