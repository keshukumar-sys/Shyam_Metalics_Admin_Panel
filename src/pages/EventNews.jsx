import React, { useEffect, useState } from "react";
import DataTable from "../components/DataTable";

export default function EventNewsAdmin() {
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [contentBlocks, setContentBlocks] = useState([{ type: "paragraph", text: "" }]);
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [newsList, setNewsList] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editFields, setEditFields] = useState({});

  const API_BASE = `${import.meta.env.VITE_API_BASE || "http://localhost:3002"}/news`;

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const res = await fetch(`${API_BASE}/event-news`);
      const data = await res.json();
      if (res.ok) setNewsList(data.data || []);
      else setNewsList([]);
    } catch (err) {
      console.error(err);
      setNewsList([]);
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

  // Dynamic content block functions
  const addContentBlock = () => setContentBlocks([...contentBlocks, { type: "paragraph", text: "" }]);
  const removeContentBlock = (index) => setContentBlocks(contentBlocks.filter((_, i) => i !== index));
  const updateContentBlock = (index, value) => {
    const newBlocks = [...contentBlocks];
    newBlocks[index].text = value;
    setContentBlocks(newBlocks);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setUploading(true);
    setMessage("");

    if (!slug || !category || !date || !title || !description || !image) {
      setMessage("All fields including image are required.");
      setUploading(false);
      return;
    }

    const formData = new FormData();
    formData.append("slug", slug);
    formData.append("category", category);
    formData.append("date", date);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("content", JSON.stringify(contentBlocks));
    formData.append("image", image);

    try {
      const res = await fetch(`${API_BASE}/event-news`, { method: "POST", body: formData });
      const result = await res.json();
      if (!res.ok) setMessage(result.message || "Error creating Event News");
      else {
        setMessage("Event News created successfully!");
        resetForm();
        fetchNews();
      }
    } catch (err) {
      console.error(err);
      setMessage("Server error");
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setSlug(""); setCategory(""); setDate(""); setTitle(""); setDescription(""); setImage(null);
    setContentBlocks([{ type: "paragraph", text: "" }]);
    setEditId(null); setEditFields({});
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this news item?")) return;
    try {
      const res = await fetch(`${API_BASE}/delete/${id}`, { method: "DELETE" });
      const result = await res.json();
      if (res.ok) fetchNews();
      else alert(result.message || "Delete failed");
    } catch (err) {
      alert("Server error");
    }
  };

  const handleEdit = (item) => {
    setEditId(item._id);
    setEditFields({
      slug: item.slug,
      category: item.category,
      date: item.date?.substring(0, 10) || "",
      title: item.title,
      description: item.description,
      contentBlocks: item.content || [{ type: "paragraph", text: "" }],
      imgFile: null,
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUploading(true);

    const formData = new FormData();
    formData.append("slug", editFields.slug);
    formData.append("category", editFields.category);
    formData.append("date", editFields.date);
    formData.append("title", editFields.title);
    formData.append("description", editFields.description);
    formData.append("content", JSON.stringify(editFields.contentBlocks));
    if (editFields.imgFile) formData.append("image", editFields.imgFile);

    try {
      const res = await fetch(`${API_BASE}/update_event_news/${editId}`, { method: "PUT", body: formData });
      const result = await res.json();
      if (res.ok) {
        resetForm();
        fetchNews();
      } else alert(result.message || "Update failed");
    } catch (err) {
      alert("Server error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Event News Management</h2>

      {/* Edit Form */}
      {editId && (
        <div className="mb-6 p-6 border border-gray-300 rounded bg-gray-50 shadow">
          <h3 className="text-xl font-semibold mb-4">Edit Event News</h3>
          <form onSubmit={handleUpdate} className="grid gap-4 max-w-xl">
            <input className="border p-2 rounded mt-1" value={editFields.slug} onChange={e=>setEditFields({...editFields, slug:e.target.value})} placeholder="Slug" required/>
            <input className="border p-2 rounded mt-1" value={editFields.category} onChange={e=>setEditFields({...editFields, category:e.target.value})} placeholder="Category" required/>
            <input type="date" className="border p-2 rounded mt-1" value={editFields.date} onChange={e=>setEditFields({...editFields, date:e.target.value})} placeholder="Date" required/>
            <input className="border p-2 rounded mt-1" value={editFields.title} onChange={e=>setEditFields({...editFields, title:e.target.value})} placeholder="Title" required/>
            <textarea className="border p-2 rounded mt-1 h-24 resize-none" value={editFields.description} onChange={e=>setEditFields({...editFields, description:e.target.value})} placeholder="Description" required/>

            <h4 className="font-semibold">Content Blocks</h4>
            {editFields.contentBlocks?.map((block, idx)=>(
              <div key={idx} className="flex gap-2 items-center">
                <textarea className="border p-2 rounded h-16 flex-1" value={block.text} onChange={e=>{
                  const newBlocks = [...editFields.contentBlocks];
                  newBlocks[idx].text = e.target.value;
                  setEditFields({...editFields, contentBlocks: newBlocks});
                }} required/>
                <button type="button" className="bg-red-500 text-white px-2 py-1 rounded" onClick={()=> {
                  const newBlocks = editFields.contentBlocks.filter((_, i)=>i!==idx);
                  setEditFields({...editFields, contentBlocks:newBlocks});
                }}>Remove</button>
              </div>
            ))}
            <button type="button" className="bg-green-500 text-white px-2 py-1 rounded" onClick={()=>setEditFields({...editFields, contentBlocks:[...editFields.contentBlocks,{type:"paragraph",text:""}]})}>Add Content Block</button>

            <input type="file" accept=".webp" className="mt-1" onChange={e=>handleImageSelect(e,true)} />
            <div className="flex gap-3">
              <button type="submit" disabled={uploading} className="bg-blue-600 px-4 py-2 rounded text-white hover:bg-blue-700">{uploading?"Updating...":"Update"}</button>
              <button type="button" onClick={resetForm} className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Create Form */}
      <div className="mb-6 p-6 border border-gray-300 rounded bg-white shadow">
        <h3 className="text-xl font-semibold mb-4">Add New Event News</h3>
        <form onSubmit={handleCreate} className="grid gap-4 max-w-xl">
          <input className="border p-2 rounded mt-1" value={slug} onChange={e=>setSlug(e.target.value)} placeholder="Slug" required/>
          <input className="border p-2 rounded mt-1" value={category} onChange={e=>setCategory(e.target.value)} placeholder="Category" required/>
          <input type="date" className="border p-2 rounded mt-1" value={date} onChange={e=>setDate(e.target.value)} placeholder="Date" required/>
          <input className="border p-2 rounded mt-1" value={title} onChange={e=>setTitle(e.target.value)} placeholder="Title" required/>
          <textarea className="border p-2 rounded mt-1 h-24 resize-none" value={description} onChange={e=>setDescription(e.target.value)} placeholder="Description" required/>

          <h4 className="font-semibold">Content Blocks</h4>
          {contentBlocks.map((block, idx)=>(
            <div key={idx} className="flex gap-2 items-center">
              <textarea className="border p-2 rounded h-16 flex-1" value={block.text} onChange={e=>updateContentBlock(idx,e.target.value)} required/>
              <button type="button" className="bg-red-500 text-white px-2 py-1 rounded" onClick={()=>removeContentBlock(idx)}>Remove</button>
            </div>
          ))}
          <button type="button" className="bg-green-500 text-white px-2 py-1 rounded" onClick={addContentBlock}>Add Content Block</button>

          <input type="file" accept=".webp" className="mt-1" onChange={handleImageSelect} required/>
          <button type="submit" disabled={uploading} className="bg-green-600 px-4 py-2 rounded text-white hover:bg-green-700">{uploading?"Uploading...":"Add Event News"}</button>
          {message && <p className={`mt-2 ${message.includes("successfully")?"text-green-600":"text-red-600"}`}>{message}</p>}
        </form>
      </div>

      {/* Table */}
      <h3 className="text-xl font-semibold mb-4">All Event News</h3>
      <DataTable
        columns={[
          { key:"title", label:"Title" },
          { key:"category", label:"Category" },
          { key:"date", label:"Date" },
          { key:"description", label:"Description", render:(r)=>r.description?.substring(0,50)+"..." },
          { key:"image", label:"Image", render:(r)=>r.image ? <a href={r.image} target="_blank" className="text-blue-600 underline">View</a> : "-" }
        ]}
        data={newsList}
        actions={(row)=>(
          <div className="flex gap-2">
            <button className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700" onClick={()=>handleEdit(row)}>Edit</button>
            <button className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700" onClick={()=>handleDelete(row._id)}>Delete</button>
          </div>
        )}
      />
    </div>
  );
}
