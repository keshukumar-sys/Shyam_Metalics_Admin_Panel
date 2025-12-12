import React, { useEffect, useState } from "react";

export default function FamiliarModel() {
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [list, setList] = useState([]);

  const API_BASE = `${import.meta.env.VITE_API_BASE || "http://localhost:3002"}/familiar`;

  useEffect(() => {
    fetchList();
  }, []);

  const fetchList = async () => {
    try {
      const res = await fetch(`${API_BASE}/get_familiar`);
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

    if (!name || !date || !file) {
      setMessage("Please provide name, date and a file.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("familiar_name", name);
      formData.append("familiar_date", date);
      formData.append("file", file);

      const res = await fetch(`${API_BASE}/add_familiar`, {
        method: "POST",
        body: formData,
      });

      const result = await res.json();
      if (!res.ok) {
        setMessage(result.message || "Upload failed");
        return;
      }

      setMessage(result.message || "Familiar entry added");
      setName("");
      setDate("");
      setFile(null);
      fetchList();
    } catch (err) {
      console.error(err);
      setMessage("Server error");
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>Familiar</h2>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 8, maxWidth: 640 }}>
        <label>
          Name
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </label>

        <label>
          Date
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>

        <label>
          File
          <input type="file" onChange={(e) => setFile(e.target.files && e.target.files[0])} />
        </label>

        <button type="submit">Add Familiar</button>
        {message && <div>{message}</div>}
      </form>

      <section style={{ marginTop: 24 }}>
        <h3>Entries</h3>
        {list.length === 0 && <div>No records found</div>}
        <ul>
          {list.map((item, idx) => (
            <li key={idx}>
              <strong>{item.familiar_name}</strong> — {item.familiar_date}
              {item.familiar_file && (
                <div>
                  <a href={item.familiar_file} target="_blank" rel="noreferrer">
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
