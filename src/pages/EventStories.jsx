import React, { useEffect, useState } from "react";
import DataTable from "../components/DataTable";

export default function EventStoriesAdmin() {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [location, setLocation] = useState({ name: "", country: "" });
  const [eventType, setEventType] = useState({ name: "" });
  const [contentBlocks, setContentBlocks] = useState([{ type: "paragraph", text: "" }]);
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [stories, setStories] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editFields, setEditFields] = useState({});

  const API_BASE = `${import.meta.env.VITE_API_BASE || "http://localhost:3002"}/stories`;

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      const res = await fetch(`${API_BASE}/get_event_stories`);
      const data = await res.json();
      if (res.ok) setStories(data.data || []);
      else setStories([]);
    } catch (err) {
      console.error(err);
      setStories([]);
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

  // Add a new content block
  const addContentBlock = () => setContentBlocks([...contentBlocks, { type: "paragraph", text: "" }]);

  // Remove a content block by index
  const removeContentBlock = (index) => setContentBlocks(contentBlocks.filter((_, i) => i !== index));

  // Update a content block
  const updateContentBlock = (index, value) => {
    const newBlocks = [...contentBlocks];
    newBlocks[index].text = value;
    setContentBlocks(newBlocks);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setUploading(true);
    setMessage("");

    if (!name || !slug || !shortDescription || !startDate || !endDate || !location.name || !location.country || !eventType.name || !image) {
      setMessage("All fields including image are required.");
      setUploading(false);
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("slug", slug);
    formData.append("short_description", shortDescription);
    formData.append("event_start_date", startDate);
    formData.append("event_end_date", endDate);
    formData.append("event_location", JSON.stringify(location));
    formData.append("event_type", JSON.stringify(eventType));
    formData.append("content", JSON.stringify(contentBlocks));
    formData.append("front_image", image);

    try {
      const res = await fetch(`${API_BASE}/create_event_story`, { method: "POST", body: formData });
      const result = await res.json();
      if (!res.ok) setMessage(result.message || "Error creating story");
      else {
        setMessage("Event Story created successfully!");
        resetForm();
        fetchStories();
      }
    } catch (err) {
      console.error(err);
      setMessage("Server error");
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setName(""); setSlug(""); setShortDescription(""); setStartDate(""); setEndDate("");
    setLocation({ name: "", country: "" }); setEventType({ name: "" });
    setContentBlocks([{ type: "paragraph", text: "" }]);
    setImage(null); setEditFields({}); setEditId(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this story?")) return;
    try {
      const res = await fetch(`${API_BASE}/delete`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const result = await res.json();
      if (res.ok) fetchStories();
      else alert(result.message || "Delete failed");
    } catch (err) {
      alert("Server error");
    }
  };

  const handleEdit = (item) => {
    setEditId(item._id);
    setEditFields({
      name: item.name,
      slug: item.slug,
      short_description: item.short_description,
      event_start_date: item.event_start_date?.substring(0, 10) || "",
      event_end_date: item.event_end_date?.substring(0, 10) || "",
      event_location: item.event_location || { name: "", country: "" },
      event_type: item.event_type || { name: "" },
      contentBlocks: item.content || [{ type: "paragraph", text: "" }],
      imgFile: null,
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUploading(true);

    const formData = new FormData();
    formData.append("name", editFields.name);
    formData.append("slug", editFields.slug);
    formData.append("short_description", editFields.short_description);
    formData.append("event_start_date", editFields.event_start_date);
    formData.append("event_end_date", editFields.event_end_date);
    formData.append("event_location", JSON.stringify(editFields.event_location));
    formData.append("event_type", JSON.stringify(editFields.event_type));
    formData.append("content", JSON.stringify(editFields.contentBlocks));
    if (editFields.imgFile) formData.append("front_image", editFields.imgFile);

    try {
      const res = await fetch(`${API_BASE}/update_event_story/${editId}`, { method: "PUT", body: formData });
      const result = await res.json();
      if (res.ok) {
        resetForm();
        fetchStories();
      } else alert(result.message || "Update failed");
    } catch (err) {
      alert("Server error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Event Stories Management</h2>

      {/* Edit Form */}
      {editId && (
        <div className="mb-6 p-6 border border-gray-300 rounded bg-gray-50 shadow">
          <h3 className="text-xl font-semibold mb-4">Edit Event Story</h3>
          <form onSubmit={handleUpdate} className="grid gap-4 max-w-xl">
            <input className="border p-2 rounded mt-1" value={editFields.name} onChange={e => setEditFields({...editFields, name:e.target.value})} placeholder="Name" required />
            <input className="border p-2 rounded mt-1" value={editFields.slug} onChange={e => setEditFields({...editFields, slug:e.target.value})} placeholder="Slug" required />
            <textarea className="border p-2 rounded mt-1 h-24 resize-none" value={editFields.short_description} onChange={e=>setEditFields({...editFields, short_description:e.target.value})} placeholder="Short Description" required/>
            <input type="date" className="border p-2 rounded mt-1" value={editFields.event_start_date} onChange={e=>setEditFields({...editFields, event_start_date:e.target.value})} required/>
            <input type="date" className="border p-2 rounded mt-1" value={editFields.event_end_date} onChange={e=>setEditFields({...editFields, event_end_date:e.target.value})} required/>

            <div className="grid grid-cols-2 gap-2">
              <input className="border p-2 rounded" value={editFields.event_location.name} onChange={e=>setEditFields({...editFields, event_location:{...editFields.event_location, name:e.target.value}})} placeholder="Location Name" required/>
              <input className="border p-2 rounded" value={editFields.event_location.country} onChange={e=>setEditFields({...editFields, event_location:{...editFields.event_location, country:e.target.value}})} placeholder="Country" required/>
            </div>

            <input className="border p-2 rounded" value={editFields.event_type.name} onChange={e=>setEditFields({...editFields, event_type:{name:e.target.value}})} placeholder="Event Type" required/>

            <h4 className="font-semibold">Content Blocks</h4>
            {editFields.contentBlocks?.map((block, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <textarea className="border p-2 rounded h-16 flex-1" value={block.text} onChange={e=> {
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
            <button type="button" className="bg-green-500 text-white px-2 py-1 rounded" onClick={()=>setEditFields({...editFields, contentBlocks:[...editFields.contentBlocks, {type:"paragraph", text:""}]})}>Add Content Block</button>

            <input type="file" accept=".webp" className="mt-1" onChange={e=>handleImageSelect(e,true)}/>
            <div className="flex gap-3">
              <button type="submit" disabled={uploading} className="bg-blue-600 px-4 py-2 rounded text-white hover:bg-blue-700">{uploading?"Updating...":"Update"}</button>
              <button type="button" onClick={resetForm} className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Create Form */}
      <div className="mb-6 p-6 border border-gray-300 rounded bg-white shadow">
        <h3 className="text-xl font-semibold mb-4">Add Event Story</h3>
        <form onSubmit={handleCreate} className="grid gap-4 max-w-xl">
          <input className="border p-2 rounded mt-1" value={name} onChange={e=>setName(e.target.value)} placeholder="Name" required />
          <input className="border p-2 rounded mt-1" value={slug} onChange={e=>setSlug(e.target.value)} placeholder="Slug" required />
          <textarea className="border p-2 rounded mt-1 h-24 resize-none" value={shortDescription} onChange={e=>setShortDescription(e.target.value)} placeholder="Short Description" required/>
          <input type="date" className="border p-2 rounded mt-1" value={startDate} onChange={e=>setStartDate(e.target.value)} required/>
          <input type="date" className="border p-2 rounded mt-1" value={endDate} onChange={e=>setEndDate(e.target.value)} required/>

          <div className="grid grid-cols-2 gap-2">
            <input className="border p-2 rounded" value={location.name} onChange={e=>setLocation({...location, name:e.target.value})} placeholder="Location Name" required/>
            <input className="border p-2 rounded" value={location.country} onChange={e=>setLocation({...location, country:e.target.value})} placeholder="Country" required/>
          </div>

          <input className="border p-2 rounded" value={eventType.name} onChange={e=>setEventType({name:e.target.value})} placeholder="Event Type" required/>

          <h4 className="font-semibold">Content Blocks</h4>
          {contentBlocks.map((block, idx)=>(
            <div key={idx} className="flex gap-2 items-center">
              <textarea className="border p-2 rounded h-16 flex-1" value={block.text} onChange={e=>updateContentBlock(idx, e.target.value)} required/>
              <button type="button" className="bg-red-500 text-white px-2 py-1 rounded" onClick={()=>removeContentBlock(idx)}>Remove</button>
            </div>
          ))}
          <button type="button" className="bg-green-500 text-white px-2 py-1 rounded" onClick={addContentBlock}>Add Content Block</button>

          <input type="file" accept=".webp" className="mt-1" onChange={handleImageSelect} required/>
          <button type="submit" disabled={uploading} className="bg-green-600 px-4 py-2 rounded text-white hover:bg-green-700">{uploading?"Uploading...":"Add Event Story"}</button>
          {message && <p className={`mt-2 ${message.includes("successfully")?"text-green-600":"text-red-600"}`}>{message}</p>}
        </form>
      </div>

      {/* Table */}
      <h3 className="text-xl font-semibold mb-4">All Event Stories</h3>
      <DataTable
        columns={[
          { key:"name", label:"Name" },
          { key:"slug", label:"Slug" },
          { key:"short_description", label:"Short Description", render:(r)=>r.short_description?.substring(0,50)+"..." },
          { key:"event_start_date", label:"Start Date", render:(r)=>r.event_start_date?.substring(0,10) },
          { key:"event_end_date", label:"End Date", render:(r)=>r.event_end_date?.substring(0,10) },
          { key:"front_image", label:"Image", render:(r)=>r.front_image?.url ? <a href={r.front_image.url} target="_blank" className="text-blue-600 underline">View</a> : "-" }
        ]}
        data={stories}
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
