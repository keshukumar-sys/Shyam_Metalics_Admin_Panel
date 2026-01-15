import React, { useEffect, useState } from "react";
import DataTable from "../components/DataTable";
import "../components/css/Form.css";
import { authHeader } from "../auth";

export default function OtherModel() {
  const [option, setOption] = useState("");
  const [file, setFile] = useState(null);
  const [list, setList] = useState([]);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editFile, setEditFile] = useState(null);

  const [details, setDetails] = useState({
    name: "",
    date: "",
  });

  const [contactInfo, setContactInfo] = useState({
    name: "",
    designation: "",
    office: "",
    company: "",
    address: "",
    phone: "",
    email: "",
  });

  const API_BASE = `${
    import.meta.env.VITE_API_BASE || "http://localhost:3002"
  }/other`;

  useEffect(() => {
    if (option) fetchList();
  }, [option]);

  const fetchList = async () => {
    try {
      const res = await fetch(`${API_BASE}/get_other/${option}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      setList(json.data || []);
    } catch (err) {
      console.error(err);
      setList([]);
    }
  };

  const handleEdit = (row) => {
    setEditId(row._id);
    setEditName(row.name);
    setEditDate(row.date);
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/delete`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify({ id }),
      });
      const json = await res.json();
      if (!res.ok) return alert(json.message || "Delete failed");
      fetchList();
    } catch (e) {
      alert("Network error");
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!editName || !editDate) {
      alert("Please fill all fields");
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("name", editName);
      formData.append("date", editDate);
      if (editFile) formData.append("file", editFile);

      const headers = {};
      const token = localStorage.getItem("shyam_token");
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const res = await fetch(`${API_BASE}/update_other/${editId}`, {
        method: "PUT",
        headers: headers,
        body: formData,
      });
      const json = await res.json();
      if (!res.ok) return alert(json.message || "Update failed");
      setEditId(null);
      fetchList();
    } catch (e) {
      console.error(e);
      alert("Network error: " + e.message);
    } finally {
      setUploading(false);
    }
  };

  // ------------------ SUBMIT FOR OTHER COMPLIANCES ------------------
  const handleOtherComplianceSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setUploading(true);

    if (!option || !details.name || !details.date || !file) {
      setMessage("Please provide option, name, date and a file.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("option", option);
      formData.append("name", details.name);
      formData.append("date", details.date);
      formData.append("file", file);

      const res = await fetch(`${API_BASE}/add_other`, {
        method: "POST",
        body: formData,
      });

      const result = await res.json();
      if (!res.ok) {
        setMessage(result.message || "Upload failed");
        return;
      }

      setMessage(result.message || "Entry added");
      setDetails({ name: "", date: "" });
      setFile(null);
      fetchList();
    } catch (err) {
      console.error(err);
      setMessage("Server error");
    } finally {
      setUploading(false);
    }
  };

  // ------------------ SUBMIT FOR CONTACT DETAILS ------------------
  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setUploading(true);

    if (!option || !details.name || !details.date) {
      setMessage("Please provide option, title name and date.");
      return;
    }

    try {
      const payload = {
        option,
        name: details.name,
        date: details.date,
        contactInfo: contactInfo,
      };

      const res = await fetch(`${API_BASE}/add_other`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok) {
        setMessage(result.message || "Upload failed");
        return;
      }

      setMessage(result.message || "Contact details added");
      setDetails({ name: "", date: "" });
      setContactInfo({
        name: "",
        designation: "",
        office: "",
        company: "",
        address: "",
        phone: "",
        email: "",
      });
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
      <h2>Other Model Page</h2>

      {/* OPTION DROPDOWN */}
      <select value={option} onChange={(e) => setOption(e.target.value)} style={{ padding: 8, marginBottom: 16 }}>
        <option value="">Select Option</option>
        <option value="Other Compliances">Other Compliances</option>
        <option value="KMP Contact Details">KMP Contact Details</option>
        <option value="Investor Relations Contact">Investor Relations Contact</option>
      </select>

      {/* ========================= FORM 1: OTHER COMPLIANCES ========================= */}
      {option === "Other Compliances" && (
        <form onSubmit={handleOtherComplianceSubmit} style={{ display: "grid", gap: 8, maxWidth: 640 }}>
          <label>
            Name
            <input
              type="text"
              placeholder="Enter Name"
              value={details.name}
              onChange={(e) => setDetails({ ...details, name: e.target.value })}
            />
          </label>

          <label>
            Date
            <input
              type="date"
              value={details.date}
              onChange={(e) => setDetails({ ...details, date: e.target.value })}
            />
          </label>

          <label>
            File
            <input type="file" onChange={(e) => setFile(e.target.files && e.target.files[0])} />
          </label>

          <button type="submit" disabled={uploading}>{uploading ? "Uploading..." : "Submit"}</button>
          {message && <div>{message}</div>}
        </form>
      )}

      {/* ========================= FORM 2: CONTACT DETAILS ========================= */}
      {(option === "KMP Contact Details" ||
        option === "Investor Relations Contact") && (
        <form onSubmit={handleContactSubmit} style={{ display: "grid", gap: 8, maxWidth: 640 }}>
          <h3>Contact Information</h3>

          <label>
            Title Name (Required)
            <input
              type="text"
              placeholder="Enter Title Name"
              value={details.name}
              onChange={(e) => setDetails({ ...details, name: e.target.value })}
            />
          </label>

          <label>
            Date
            <input
              type="date"
              value={details.date}
              onChange={(e) => setDetails({ ...details, date: e.target.value })}
            />
          </label>

          <hr />

          <label>
            Contact Name
            <input
              type="text"
              placeholder="Contact Name"
              value={contactInfo.name}
              onChange={(e) =>
                setContactInfo({ ...contactInfo, name: e.target.value })
              }
            />
          </label>

          <label>
            Designation
            <input
              type="text"
              placeholder="Designation"
              value={contactInfo.designation}
              onChange={(e) =>
                setContactInfo({ ...contactInfo, designation: e.target.value })
              }
            />
          </label>

          <label>
            Office
            <input
              type="text"
              placeholder="Office"
              value={contactInfo.office}
              onChange={(e) =>
                setContactInfo({ ...contactInfo, office: e.target.value })
              }
            />
          </label>

          <label>
            Company
            <input
              type="text"
              placeholder="Company"
              value={contactInfo.company}
              onChange={(e) =>
                setContactInfo({ ...contactInfo, company: e.target.value })
              }
            />
          </label>

          <label>
            Address
            <textarea
              placeholder="Address"
              value={contactInfo.address}
              onChange={(e) =>
                setContactInfo({ ...contactInfo, address: e.target.value })
              }
            />
          </label>

          <label>
            Phone
            <input
              type="text"
              placeholder="Phone"
              value={contactInfo.phone}
              onChange={(e) =>
                setContactInfo({ ...contactInfo, phone: e.target.value })
              }
            />
          </label>

          <label>
            Email
            <input
              type="email"
              placeholder="Email"
              value={contactInfo.email}
              onChange={(e) =>
                setContactInfo({ ...contactInfo, email: e.target.value })
              }
            />
          </label>

          <button type="submit" disabled={uploading}>{uploading ? "Submitting..." : "Submit Contact Details"}</button>
          {message && <div>{message}</div>}
        </form>
      )}

      {option && list.length > 0 && (
        <section style={{ marginTop: 24 }}>
          <h3>{option} Entries</h3>
          <DataTable
            columns={[
              { key: "name", label: "Name" },
              { key: "date", label: "Date" },
            ]}
            data={list}
            actions={(row) => (
              <>
                <button className="btn-sm" style={{marginRight: 8}} onClick={() => handleEdit(row)}>Edit</button>
                <button className="btn-sm" onClick={() => handleDelete(row._id)}>Delete</button>
              </>
            )}
          />
        </section>
      )}

      {editId && (
        <div style={{ marginTop: 24, padding: 16, border: "1px solid #ddd", borderRadius: 8 }}>
          <h3>Edit Entry</h3>
          <form onSubmit={handleUpdateSubmit} style={{ display: "grid", gap: 8, maxWidth: 640 }}>
            <label>
              Name
              <input value={editName} onChange={(e) => setEditName(e.target.value)} />
            </label>
            <label>
              Date
              <input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} />
            </label>
            <label>
              File (optional)
              <input type="file" onChange={(e) => setEditFile(e.target.files && e.target.files[0])} />
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              <button type="submit">Update</button>
              <button type="button" onClick={() => setEditId(null)}>Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
