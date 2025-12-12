import React, { useEffect, useState } from "react";

export default function CorporateModel() {
  const [option, setOption] = useState("Newspaper Publication");
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [list, setList] = useState([]);

  const API_BASE = `${
    import.meta.env.VITE_API_BASE || "http://localhost:3002"
  }/corporate`;

  useEffect(() => {
    if (option) fetchList(option);
  }, [option]);

  const fetchList = async (opt) => {
    try {
      const res = await fetch(`${API_BASE}/get/${opt}`);

      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      setList(json.data || []);
    } catch (err) {
      console.error(err);
      setList([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!option || !name || !date || !file) {
      setMessage("Please provide option, name, date and a file.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("option", option);
      formData.append("name", name);
      formData.append("date", date);
      formData.append("file", file);

      const res = await fetch(`${API_BASE}/add`, {
        method: "POST",
        body: formData,
      });

      const result = await res.json();
      if (!res.ok) {
        setMessage(result.message || "Upload failed");
        return;
      }

      setMessage(result.message || "Announcement added");
      setName("");
      setDate("");
      setFile(null);
      fetchList(option);
    } catch (err) {
      console.error(err);
      setMessage("Server error");
    }
  };

  const options = [
    "Newspaper Publication",
    "Press Release",
    "Notices",
    "Regulation 30 Disclosures",
  ];

  return (
    <div style={{ padding: 16 }}>
      <h2>Corporate Announcements</h2>

      <form
        onSubmit={handleSubmit}
        style={{ display: "grid", gap: 8, maxWidth: 640 }}
      >
        <label>
          Option
          <select value={option} onChange={(e) => setOption(e.target.value)}>
            {options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </label>

        <label>
          Name
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </label>

        <label>
          Date
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </label>

        <label>
          File
          <input
            type="file"
            onChange={(e) => setFile(e.target.files && e.target.files[0])}
          />
        </label>

        <button type="submit">Add announcement</button>
        {message && <div>{message}</div>}
      </form>

      <section style={{ marginTop: 24 }}>
        <h3>{option} details</h3>
        {list.length === 0 && <div>No records found</div>}
        <ul>
          {list.map((item, idx) => (
            <li key={idx}>
              <strong>{item.name}</strong> — {item.date}
              {item.file && (
                <div>
                  <a href={item.file} target="_blank" rel="noreferrer">
                    View file
                  </a>
                </div>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
