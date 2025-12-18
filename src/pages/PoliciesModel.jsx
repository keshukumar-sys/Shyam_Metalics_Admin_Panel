import React, { useEffect, useState } from "react";

export default function PoliciesModel() {
  const [policyName, setPolicyName] = useState("");
  const [policyDate, setPolicyDate] = useState("");
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [list, setList] = useState([]);
  const [uploading, setUploading] = useState(false);

  const API_BASE = `${import.meta.env.VITE_API_BASE || "http://localhost:3002"}/policy`;

  useEffect(() => {
    fetchList();
  }, []);

  const fetchList = async () => {
    try {
      const res = await fetch(`${API_BASE}/get_policy`);
      if (!res.ok) throw new Error("Failed to fetch policies");
      const json = await res.json();
      console.log("Fetched policies:", json);
      setList(json.data || []);
    } catch (err) {
      console.error(err);
      setList([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!policyName || !policyDate || !file) {
      setMessage("Please provide policy name, date and a file.");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("policy_name", policyName);
      formData.append("policy_date", policyDate);
      // include both keys in case backend middleware expects a specific field
      formData.append("file", file);

      const res = await fetch(`${API_BASE}/add_policy`, {
        method: "POST",
        body: formData,
      });

      const result = await res.json();
      if (!res.ok) {
        setMessage(result.message || "Upload failed");
        return;
      }

      setMessage(result.message || "Policy added");
      setPolicyName("");
      setPolicyDate("");
      setFile(null);
      fetchList();
    } catch (err) {
      console.error(err);
      setMessage("Server error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>Policies</h2>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 8, maxWidth: 640 }}>
        <label>
          Policy Name
          <input value={policyName} onChange={(e) => setPolicyName(e.target.value)} />
        </label>

        <label>
          Date
          <input type="date" value={policyDate} onChange={(e) => setPolicyDate(e.target.value)} />
        </label>

        <label>
          File
          <input type="file" onChange={(e) => setFile(e.target.files && e.target.files[0])} />
        </label>

        <button type="submit" disabled={uploading}>{uploading ? "Uploading..." : "Add Policy"}</button>
        {message && <div>{message}</div>}
      </form>

      <section style={{ marginTop: 24 }}>
        <h3>Policies</h3>
        {list.length === 0 && <div>No records found</div>}
        <ul>
          {list.map((item, idx) => (
            <li key={idx}>
              <strong>{item.policy_name}</strong> — {new Date(item.policy_date).toLocaleDateString()}
              {item.policy_file && (
                <div>
                  <a href={item.policy_file} target="_blank" rel="noreferrer">
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
