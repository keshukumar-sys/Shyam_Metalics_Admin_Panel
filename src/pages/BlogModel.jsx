'use client';
import React, { useEffect, useState } from "react";
import DataTable from "../components/DataTable";

export default function BlogAdmin() {
  const [blogs, setBlogs] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  // Create form states
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [link, setLink] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [paragraphs, setParagraphs] = useState([{ description: [{ desc: "" }] }]);
  const [meta, setMeta] = useState({ title: "", description: "", canonical: "", ogTitle: "", ogDescription: "", ogUrl: "" });
  const [faqs, setFaqs] = useState({ desc: "", list: [{ listTitle: "", listdesc: "" }] });
  const [image, setImage] = useState(null);

  // Edit form states
  const [editId, setEditId] = useState(null);
  const [editFields, setEditFields] = useState({});

  const API_BASE = `${import.meta.env.VITE_API_BASE || "http://localhost:3002"}/blog`;

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const res = await fetch(`${API_BASE}/get_blog`);
      const data = await res.json();
      setBlogs(res.ok ? data.blogs || [] : []);
    } catch (err) {
      console.error(err);
      setBlogs([]);
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

  // CREATE BLOG
  const handleCreate = async (e) => {
    e.preventDefault();
    setMessage(""); setUploading(true);

    if (!title || !date || !link || !excerpt || !paragraphs.length || !image) {
      setMessage("All fields including image are required.");
      setUploading(false); return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("date", date);
    formData.append("link", link);
    formData.append("excerpt", excerpt);
    formData.append("paragraph", JSON.stringify(paragraphs));
    formData.append("meta", JSON.stringify(meta));
    formData.append("faqs", JSON.stringify(faqs));
    formData.append("img", image);

    try {
      const res = await fetch(`${API_BASE}/create_blog`, { method: "POST", body: formData });
      const result = await res.json();
      if (res.ok) {
        setMessage("Blog created successfully!");
        setTitle(""); setDate(""); setLink(""); setExcerpt("");
        setParagraphs([{ description: [{ desc: "" }] }]);
        setMeta({ title: "", description: "", canonical: "", ogTitle: "", ogDescription: "", ogUrl: "" });
        setFaqs({ desc: "", list: [{ listTitle: "", listdesc: "" }] });
        setImage(null); fetchBlogs();
      } else setMessage(result.message || "Error creating blog");
    } catch (err) {
      console.error(err); setMessage("Server error");
    } finally { setUploading(false); }
  };

  // DELETE BLOG
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this blog?")) return;
    try {
      const res = await fetch(`${API_BASE}/delete`, {
        method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id })
      });
      const result = await res.json();
      if (res.ok) fetchBlogs();
      else alert(result.message || "Delete failed");
    } catch { alert("Server error"); }
  };

  // EDIT BLOG
  const handleEdit = (blog) => {
    setEditId(blog._id);
    setEditFields({
      title: blog.title,
      date: blog.date?.substring(0, 10) || "",
      link: blog.link,
      excerpt: blog.excerpt,
      paragraphs: blog.paragraph || [{ description: [{ desc: "" }] }],
      meta: blog.meta || { title: "", description: "", canonical: "", ogTitle: "", ogDescription: "", ogUrl: "" },
      faqs: blog.faqs || { desc: "", list: [{ listTitle: "", listdesc: "" }] },
      imgFile: null
    });
    window.scrollTo({ top: 0, behavior: "smooth" }); // scroll to top when editing
  };

  // UPDATE BLOG
  const handleUpdate = async (e) => {
    e.preventDefault(); setUploading(true);
    const formData = new FormData();
    formData.append("title", editFields.title);
    formData.append("date", editFields.date);
    formData.append("link", editFields.link);
    formData.append("excerpt", editFields.excerpt);
    formData.append("paragraph", JSON.stringify(editFields.paragraphs));
    formData.append("meta", JSON.stringify(editFields.meta));
    formData.append("faqs", JSON.stringify(editFields.faqs));
    if (editFields.imgFile) formData.append("img", editFields.imgFile);

    try {
      const res = await fetch(`${API_BASE}/update_blog/${editId}`, { method: "PUT", body: formData });
      const result = await res.json();
      if (res.ok) { setEditId(null); setEditFields({}); fetchBlogs(); }
      else alert(result.message || "Update failed");
    } catch { alert("Server error"); }
    finally { setUploading(false); }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">

      {/* CREATE FORM */}
      <div className="p-6 bg-white rounded-lg shadow-md border border-gray-200">
        <h3 className="text-xl font-bold mb-4">Add New Blog</h3>
        <form onSubmit={handleCreate} className="grid gap-4">
          <label className="font-semibold">Title</label>
          <input type="text" placeholder="Title" className="border p-2 rounded w-full" value={title} onChange={e => setTitle(e.target.value)} required />

          <label className="font-semibold">Date</label>
          <input type="date" className="border p-2 rounded w-full" value={date} onChange={e => setDate(e.target.value)} required />

          <label className="font-semibold">URL Slug</label>
          <input type="text" placeholder="Link" className="border p-2 rounded w-full" value={link} onChange={e => setLink(e.target.value)} required />

          <label className="font-semibold">Excerpt</label>
          <textarea placeholder="Excerpt" rows={2} className="border p-2 rounded w-full" value={excerpt} onChange={e => setExcerpt(e.target.value)} required />

          {/* Paragraphs */}
          <div className="border p-3 rounded space-y-2">
            <h4 className="font-semibold">Paragraphs</h4>
            {paragraphs.map((p, idx) => (
              <div key={idx} className="space-y-2 border p-2 rounded">
                {p.description.map((d, i) => (
                  <div key={i} className="flex gap-2 items-start">
                    <textarea className="border p-2 rounded flex-1" rows={3} value={d.desc} onChange={e => {
                      const newP = [...paragraphs];
                      newP[idx].description[i].desc = e.target.value;
                      setParagraphs(newP);
                    }} />
                    <button type="button" className="bg-red-500 text-white px-3 py-1 rounded mt-1" onClick={() => {
                      const newP = [...paragraphs];
                      newP[idx].description.splice(i, 1);
                      setParagraphs(newP);
                    }}>Remove</button>
                  </div>
                ))}
                <button type="button" className="bg-green-500 text-white px-3 py-1 rounded" onClick={() => {
                  const newP = [...paragraphs];
                  newP[idx].description.push({ desc: "" });
                  setParagraphs(newP);
                }}>Add Sub-Paragraph</button>
              </div>
            ))}
            <button type="button" className="bg-blue-500 text-white px-4 py-1 rounded mt-2" onClick={() => setParagraphs([...paragraphs, { description: [{ desc: "" }] }])}>Add Paragraph Block</button>
          </div>

          {/* Meta */}
          <div className="border p-3 rounded space-y-2">
            <h4 className="font-semibold">Meta</h4>
            {["title", "description", "canonical", "ogTitle", "ogDescription", "ogUrl"].map(key => (
              <input key={key} type="text" placeholder={key} className="border p-2 rounded w-full" value={meta[key] || ""} onChange={e => setMeta({ ...meta, [key]: e.target.value })} />
            ))}
          </div>

          {/* FAQs */}
          <div className="border p-3 rounded space-y-2">
            <h4 className="font-semibold">FAQs</h4>
            <input type="text" placeholder="FAQ Description" className="border p-2 rounded w-full" value={faqs.desc} onChange={e => setFaqs({ ...faqs, desc: e.target.value })} />
            {faqs.list.map((f, idx) => (
              <div key={idx} className="flex gap-2 mb-2">
                <input type="text" placeholder="Question" className="border p-2 rounded flex-1" value={f.listTitle} onChange={e => {
                  const newList = [...faqs.list]; newList[idx].listTitle = e.target.value; setFaqs({ ...faqs, list: newList });
                }} />
                <input type="text" placeholder="Answer" className="border p-2 rounded flex-1" value={f.listdesc} onChange={e => {
                  const newList = [...faqs.list]; newList[idx].listdesc = e.target.value; setFaqs({ ...faqs, list: newList });
                }} />
                <button type="button" className="bg-red-500 text-white px-2 rounded" onClick={() => setFaqs({ ...faqs, list: faqs.list.filter((_, i) => i !== idx) })}>Remove</button>
              </div>
            ))}
            <button type="button" className="bg-green-500 text-white px-3 py-1 rounded" onClick={() => setFaqs({ ...faqs, list: [...faqs.list, { listTitle: "", listdesc: "" }] })}>Add FAQ</button>
          </div>

          <label className="font-semibold">Blog Image (.webp)</label>
          <input type="file" accept=".webp" onChange={handleImageSelect} required />

          <button type="submit" disabled={uploading} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mt-2">{uploading ? "Uploading..." : "Add Blog"}</button>
          {message && <p className={`mt-2 ${message.includes("successfully") ? "text-green-600" : "text-red-600"}`}>{message}</p>}
        </form>
      </div>

      {/* EDIT FORM ABOVE LIST */}
      {editId && (
        <div className="p-6 bg-gray-100 rounded shadow-md border border-gray-300">
          <h3 className="text-xl font-bold mb-4">Edit Blog</h3>
          <form onSubmit={handleUpdate} className="grid gap-4">
            {/* Title, Date, Link, Excerpt */}
            <label className="font-semibold">Title</label>
            <input type="text" className="border p-2 rounded w-full" value={editFields.title} onChange={e => setEditFields({ ...editFields, title: e.target.value })} required />
            <label className="font-semibold">Date</label>
            <input type="date" className="border p-2 rounded w-full" value={editFields.date} onChange={e => setEditFields({ ...editFields, date: e.target.value })} required />
            <label className="font-semibold">URL Slug</label>
            <input type="text" className="border p-2 rounded w-full" value={editFields.link} onChange={e => setEditFields({ ...editFields, link: e.target.value })} required />
            <label className="font-semibold">Excerpt</label>
            <textarea className="border p-2 rounded w-full" rows={2} value={editFields.excerpt} onChange={e => setEditFields({ ...editFields, excerpt: e.target.value })} />

            {/* Paragraphs */}
            {editFields.paragraphs?.map((p, idx) => (
              <div key={idx} className="space-y-2 border p-2 rounded">
                {p.description.map((d, i) => (
                  <div key={i} className="flex gap-2">
                    <textarea className="border p-2 rounded flex-1" rows={3} value={d.desc} onChange={e => {
                      const newP = [...editFields.paragraphs]; newP[idx].description[i].desc = e.target.value;
                      setEditFields({ ...editFields, paragraphs: newP });
                    }} />
                    <button type="button" className="bg-red-500 text-white px-2 rounded" onClick={() => {
                      const newP = [...editFields.paragraphs]; newP[idx].description.splice(i, 1);
                      setEditFields({ ...editFields, paragraphs: newP });
                    }}>Remove</button>
                  </div>
                ))}
                <button type="button" className="bg-green-500 text-white px-3 py-1 rounded" onClick={() => {
                  const newP = [...editFields.paragraphs]; newP[idx].description.push({ desc: "" });
                  setEditFields({ ...editFields, paragraphs: newP });
                }}>Add Sub-Paragraph</button>
              </div>
            ))}
            <button type="button" className="bg-blue-500 text-white px-4 py-1 rounded" onClick={() => setEditFields({ ...editFields, paragraphs: [...editFields.paragraphs, { description: [{ desc: "" }] }] })}>Add Paragraph Block</button>

            <label className="font-semibold">Change Image (.webp)</label>
            <input type="file" accept=".webp" onChange={e => handleImageSelect(e, true)} />

            <div className="flex gap-2 mt-2">
              <button type="submit" disabled={uploading} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">{uploading ? "Updating..." : "Update Blog"}</button>
              <button type="button" onClick={() => setEditId(null)} className="bg-gray-400 px-4 py-2 rounded hover:bg-gray-500">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* BLOG LIST */}
      <div className="overflow-x-auto">
        <h3 className="text-xl font-bold mb-4 mt-6">All Blogs</h3>
        <DataTable
          columns={[
            { key: "title", label: "Title" },
            { key: "excerpt", label: "Excerpt", render: r => r.excerpt?.substring(0, 40) + "..." },
            { key: "date", label: "Date", render: r => r.date ? new Date(r.date).toLocaleDateString() : "-" },
            { key: "img", label: "Image", render: r => r.img ? <a href={r.img} target="_blank" className="text-blue-600 underline">View</a> : "-" },
          ]}
          data={blogs}
          actions={row => (
            <div className="flex gap-2">
              <button className="bg-yellow-500 px-3 py-1 rounded hover:bg-yellow-600" onClick={() => handleEdit(row)}>Edit</button>
              <button className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700" onClick={() => handleDelete(row._id)}>Delete</button>
            </div>
          )}
        />
      </div>

    </div>
  );
}
