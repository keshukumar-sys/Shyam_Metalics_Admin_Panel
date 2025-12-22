import React, { useState, useEffect } from "react";

export default function OtherModel() {
  const [option, setOption] = useState("");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [details, setDetails] = useState({ name: "", date: "" });
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
  const [list, setList] = useState([]);

  useEffect(() => {
    fetchList();
  }, []);

  const fetchList = async () => {
    try {
      const res = await fetch(`${API_BASE}/get_other`);
      if (!res.ok) throw new Error("Failed to fetch items");
      const json = await res.json();
      setList(json.data || json || []);
    } catch (err) {
      console.error(err);
      setList([]);
    }
  };

  const handleOtherComplianceSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("option", option);
      formData.append("details", JSON.stringify(details));
      formData.append("file", file);

      const res = await fetch(`${API_BASE}/add_other`, {
        method: "POST",
        body: formData,
      });
      const result = await res.json();
      console.log(result);
      if (res.ok) fetchList();
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        option,
        details: [
          {
            name: details.name,
            date: details.date,
            contactInfo: contactInfo,
          },
        ],
      };
      const res = await fetch(`${API_BASE}/add_other`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      console.log(result);
      if (res.ok) fetchList();
    } catch (err) {
      console.error(err);
      console.log("Error submitting contact details");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      const res = await fetch(`${API_BASE}/delete`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const json = await res.json();
      alert(json.message || "Deleted");
      fetchList();
    } catch (err) {
      console.error(err);
      alert("Error deleting item");
    }
  };

  return (
    <div
      style={{
        maxWidth: 900,
        margin: "0 auto",
        padding: 20,
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1 style={{ textAlign: "center" }}>Other Model Page</h1>

      {/* OPTION DROPDOWN */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ marginRight: 10 }}>Select Option:</label>
        <select
          value={option}
          onChange={(e) => setOption(e.target.value)}
          style={{ padding: 5 }}
        >
          <option value="">Select Option</option>
          <option value="Other Compliances">Other Compliances</option>
          <option value="KMP Contact Details">KMP Contact Details</option>
          <option value="Investor Relations Contact">
            Investor Relations Contact
          </option>
        </select>
      </div>

      {/* OTHER COMPLIANCES FORM */}
      {option === "Other Compliances" && (
        <form
          onSubmit={handleOtherComplianceSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
            marginBottom: 30,
          }}
        >
          <input
            type="text"
            placeholder="Enter Name"
            onChange={(e) => setDetails({ ...details, name: e.target.value })}
            required
            style={{ padding: 8, borderRadius: 4, border: "1px solid #ccc" }}
          />
          <input
            type="date"
            onChange={(e) => setDetails({ ...details, date: e.target.value })}
            required
            style={{ padding: 8, borderRadius: 4, border: "1px solid #ccc" }}
          />
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            required
          />
          <button
            type="submit"
            disabled={uploading}
            style={{
              padding: 10,
              border: "none",
              borderRadius: 4,
              backgroundColor: "#007BFF",
              color: "white",
              cursor: "pointer",
            }}
          >
            {uploading ? "Uploading..." : "Submit"}
          </button>
        </form>
      )}

      {/* CONTACT DETAILS FORM */}
      {(option === "KMP Contact Details" ||
        option === "Investor Relations Contact") && (
        <form
          onSubmit={handleContactSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
            marginBottom: 30,
          }}
        >
          <h3>Contact Information</h3>
          <input
            type="text"
            placeholder="Enter Title Name (Required)"
            onChange={(e) => setDetails({ ...details, name: e.target.value })}
            required
            style={{ padding: 8, borderRadius: 4, border: "1px solid #ccc" }}
          />
          <input
            type="date"
            onChange={(e) => setDetails({ ...details, date: e.target.value })}
            required
            style={{ padding: 8, borderRadius: 4, border: "1px solid #ccc" }}
          />

          <input
            type="text"
            placeholder="Contact Name"
            onChange={(e) =>
              setContactInfo({ ...contactInfo, name: e.target.value })
            }
            style={{ padding: 8, borderRadius: 4, border: "1px solid #ccc" }}
          />
          <input
            type="text"
            placeholder="Designation"
            onChange={(e) =>
              setContactInfo({ ...contactInfo, designation: e.target.value })
            }
            style={{ padding: 8, borderRadius: 4, border: "1px solid #ccc" }}
          />
          <input
            type="text"
            placeholder="Office"
            onChange={(e) =>
              setContactInfo({ ...contactInfo, office: e.target.value })
            }
            style={{ padding: 8, borderRadius: 4, border: "1px solid #ccc" }}
          />
          <input
            type="text"
            placeholder="Company"
            onChange={(e) =>
              setContactInfo({ ...contactInfo, company: e.target.value })
            }
            style={{ padding: 8, borderRadius: 4, border: "1px solid #ccc" }}
          />
          <textarea
            placeholder="Address"
            onChange={(e) =>
              setContactInfo({ ...contactInfo, address: e.target.value })
            }
            style={{ padding: 8, borderRadius: 4, border: "1px solid #ccc" }}
          />
          <input
            type="text"
            placeholder="Phone"
            onChange={(e) =>
              setContactInfo({ ...contactInfo, phone: e.target.value })
            }
            style={{ padding: 8, borderRadius: 4, border: "1px solid #ccc" }}
          />
          <input
            type="email"
            placeholder="Email"
            onChange={(e) =>
              setContactInfo({ ...contactInfo, email: e.target.value })
            }
            style={{ padding: 8, borderRadius: 4, border: "1px solid #ccc" }}
          />

          <button
            type="submit"
            style={{
              padding: 10,
              border: "none",
              borderRadius: 4,
              backgroundColor: "#28a745",
              color: "white",
              cursor: "pointer",
            }}
          >
            Submit Contact Details
          </button>
        </form>
      )}

      {/* LIST OF ITEMS */}
      <section>
        <h3 style={{ marginBottom: 15 }}>Uploaded Items</h3>
        {list.length === 0 && <div>No records found</div>}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
          {list.map((item, idx) => {
            const optionLabel = item.option || item.type || "Other";
            const detailsObj =
              item.details || (item.details && item.details[0]) || item;
            const fileUrl =
              item.file || item.other_file || item.file_url || item.filepath;

            // Determine file type
            const isPDF = fileUrl?.endsWith(".pdf");
            const isImage = fileUrl?.match(/\.(jpeg|jpg|png|gif)$/i);

            return (
              <div
                key={item._id || idx}
                style={{
                  border: "1px solid #ccc",
                  borderRadius: 8,
                  padding: 12,
                  width: 300,
                  boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                  backgroundColor: "#fff",
                }}
              >
                <strong style={{ display: "block", marginBottom: 6 }}>
                  {optionLabel}
                </strong>

                <div style={{ fontSize: 14, marginBottom: 6 }}>
                  {detailsObj && typeof detailsObj === "object"
                    ? JSON.stringify(detailsObj, null, 2)
                    : detailsObj}
                </div>

                {item.date && (
                  <div style={{ fontSize: 12, color: "#555" }}>
                    {new Date(item.date).toLocaleDateString()}
                  </div>
                )}

                {fileUrl && (
                  <div style={{ marginTop: 8 }}>
                    

                    {isImage && (
                      <img
                        src={fileUrl}
                        alt={`Uploaded ${idx}`}
                        style={{ width: "100%", borderRadius: 4 }}
                      />
                    )}

                    {!isPDF && !isImage && (
                      <a href={fileUrl} target="_blank" rel="noreferrer">
                        View file
                      </a>
                    )}
                    <div style={{ marginTop: 8 }}>
                      <button
                        onClick={() => handleDelete(item._id || item.id)}
                        style={{
                          backgroundColor: "#dc2626",
                          color: "white",
                          border: "none",
                          padding: "6px 10px",
                          borderRadius: 4,
                          cursor: "pointer",
                          marginTop: 8,
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
