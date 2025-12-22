import React, { useState, useEffect } from "react";
import axios from "axios";

export default function BlogPage() {
  const [blogs, setBlogs] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    link: "",
    excerpt: "",
    meta: { title: "", description: "", canonical: "", ogTitle: "", ogDescription: "", ogUrl: "" },
    paragraph: [{ description: [{ desc: "" }] }],
    faqs: { desc: "<b>FAQs</b>", list: [{ listTitle: "", listdesc: "" }] },
  });
  const [imgFile, setImgFile] = useState(null);
  const API_BASE = `${import.meta.env.VITE_API_BASE || "http://localhost:3002"}`;

  // Fetch blogs
  const fetchBlogs = async () => {
    try {
      const res = await axios.get(`${API_BASE}/blog/get_blog`);
      console.log(res);
      setBlogs(res.data.blogs || []);
      

    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleMetaChange = (e, key) => {
    setFormData({ ...formData, meta: { ...formData.meta, [key]: e.target.value } });
  };

  const handleParagraphChange = (index, value) => {
    const newParagraph = [...formData.paragraph];
    newParagraph[index].description[0].desc = value;
    setFormData({ ...formData, paragraph: newParagraph });
  };

  const addParagraph = () => {
    setFormData({ ...formData, paragraph: [...formData.paragraph, { description: [{ desc: "" }] }] });
  };

  const handleFaqChange = (index, field, value) => {
    const newFaqs = { ...formData.faqs };
    newFaqs.list[index][field] = value;
    setFormData({ ...formData, faqs: newFaqs });
  };

  const addFaq = () => {
    setFormData({ ...formData, faqs: { ...formData.faqs, list: [...formData.faqs.list, { listTitle: "", listdesc: "" }] } });
  };

  const handleFileChange = (e) => setImgFile(e.target.files[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append("title", formData.title);
      data.append("date", formData.date);
      data.append("link", formData.link);
      data.append("excerpt", formData.excerpt);
      data.append("img", imgFile);
      data.append("meta", JSON.stringify(formData.meta));
      data.append("paragraph", JSON.stringify(formData.paragraph));
      data.append("faqs", JSON.stringify(formData.faqs));

      const res = await axios.post(`${API_BASE}/blog/create_blog`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert(res.data.message);
      fetchBlogs();
    } catch (err) {
      console.error(err);
      alert("Error creating blog");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Create a Blog</h1>
      <form onSubmit={handleSubmit} className="mb-8 space-y-4">
        <input type="text" name="title" placeholder="Title" value={formData.title} onChange={handleChange} className="border p-2 w-full" />
        <input type="date" name="date" value={formData.date} onChange={handleChange} className="border p-2 w-full" />
        <input type="text" name="link" placeholder="Link" value={formData.link} onChange={handleChange} className="border p-2 w-full" />
        <input type="text" name="excerpt" placeholder="Excerpt" value={formData.excerpt} onChange={handleChange} className="border p-2 w-full" />
        <input type="file" onChange={handleFileChange} className="border p-2 w-full" />

        <h2 className="font-bold mt-4">Meta</h2>
        {["title", "description", "canonical", "ogTitle", "ogDescription", "ogUrl"].map((key) => (
          <input
            key={key}
            type="text"
            placeholder={key}
            value={formData.meta[key]}
            onChange={(e) => handleMetaChange(e, key)}
            className="border p-2 w-full"
          />
        ))}

        <h2 className="font-bold mt-4">Paragraphs</h2>
        {formData.paragraph.map((p, i) => (
          <div key={i} className="mb-2">
            <textarea
              placeholder={`Paragraph ${i + 1}`}
              value={p.description[0].desc}
              onChange={(e) => handleParagraphChange(i, e.target.value)}
              className="border p-2 w-full"
            />
          </div>
        ))}
        <button type="button" onClick={addParagraph} className="bg-gray-300 px-2 py-1 rounded">Add Paragraph</button>

        <h2 className="font-bold mt-4">FAQs</h2>
        {formData.faqs.list.map((f, i) => (
          <div key={i} className="mb-2">
            <input type="text" placeholder="Question" value={f.listTitle} onChange={(e) => handleFaqChange(i, "listTitle", e.target.value)} className="border p-2 w-full mb-1" />
            <textarea placeholder="Answer" value={f.listdesc} onChange={(e) => handleFaqChange(i, "listdesc", e.target.value)} className="border p-2 w-full" />
          </div>
        ))}
        <button type="button" onClick={addFaq} className="bg-gray-300 px-2 py-1 rounded">Add FAQ</button>

        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded mt-4">Create Blog</button>
      </form>

      <h2 className="text-xl font-bold mb-4">Blogs</h2>
      <div className="space-y-4">
        {blogs.map((blog) => (
          <div key={blog._id} className="border p-4 rounded shadow">
            <h3 className="font-bold text-lg">{blog.title}</h3>
            <p className="text-sm text-gray-600">{new Date(blog.date).toDateString()}</p>
            <img src={blog.img} alt={blog.title} className="w-full max-w-md my-2" />
            <p>{blog.excerpt}</p>
            <div>{blog.paragraph?.map((para, i) => para.description?.map((d, j) => <p key={`${i}-${j}`} dangerouslySetInnerHTML={{ __html: d.desc }} />))}</div>
            <div>
              <h4 dangerouslySetInnerHTML={{ __html: blog.faqs?.desc }} className="font-bold mt-2" />
              {blog.faqs?.list?.map((f, i) => (
                <div key={i}>
                  <p dangerouslySetInnerHTML={{ __html: f.listTitle }} className="font-semibold" />
                  <p>{f.listdesc}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
