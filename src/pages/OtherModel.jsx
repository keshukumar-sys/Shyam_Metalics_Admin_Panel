import React, { useState, useEffect } from "react";

export default function OtherModel() {
  const [option, setOption] = useState("");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

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

  const [list, setList] = useState([]);

  useEffect(() => {
    fetchList();
  }, []);

  const fetchList = async () => {
    try {
      const res = await fetch(`${API_BASE}/get_other`);
      if (!res.ok) throw new Error("Failed to fetch items");
      const json = await res.json();
      // backend may return { data: [...] } or an array directly
      setList(json.data || json || []);
    } catch (err) {
      console.error(err);
      setList([]);
    }
  };

  // ------------------ SUBMIT FOR OTHER COMPLIANCES ------------------
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
      // refresh list after successful upload
      if (res.ok) fetchList();
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  // ------------------ SUBMIT FOR CONTACT DETAILS ------------------
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

  return (
    <div>
      <h2>Other Model Page</h2>

      {/* OPTION DROPDOWN */}
      <select value={option} onChange={(e) => setOption(e.target.value)}>
        <option value="">Select Option</option>
        <option value="Other Compliances">Other Compliances</option>
        <option value="KMP Contact Details">KMP Contact Details</option>
        <option value="Investor Relations Contact">Investor Relations Contact</option>
      </select>

      <br /><br />

      {/* ========================= FORM 1: OTHER COMPLIANCES ========================= */}
      {option === "Other Compliances" && (
        <form onSubmit={handleOtherComplianceSubmit}>
          <input
            type="text"
            placeholder="Enter Name"
            onChange={(e) => setDetails({ ...details, name: e.target.value })}
          />

          <input
            type="date"
            onChange={(e) => setDetails({ ...details, date: e.target.value })}
          />

          <input type="file" onChange={(e) => setFile(e.target.files[0])} />

          <button type="submit" disabled={uploading}>{uploading ? "Uploading..." : "Submit"}</button>
        </form>
      )}

      {/* ========================= LIST OF ITEMS ========================= */}
      <section style={{ marginTop: 24 }}>
        <h3>Items</h3>
        {list.length === 0 && <div>No records found</div>}
        <ul>
          {list.map((item, idx) => {
            // try to read common shapes coming from backend
            const optionLabel = item.option || item.type || "Other";
            const detailsObj =
              item.details || (item.details && item.details[0]) || item;
            const fileUrl = item.file || item.other_file || item.file_url || item.filepath;

            return (
              <li key={item._id || idx} style={{ marginBottom: 12 }}>
                <div>
                  <strong>{optionLabel}</strong>
                </div>
                <div>
                  {detailsObj && typeof detailsObj === "object"
                    ? JSON.stringify(detailsObj)
                    : detailsObj}
                </div>
                {item.date && <div>{new Date(item.date).toLocaleDateString()}</div>}
                {fileUrl && (
                  <div>
                    <a href={fileUrl} target="_blank" rel="noreferrer">
                      View file
                    </a>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      {/* ========================= FORM 2: CONTACT DETAILS ========================= */}
      {(option === "KMP Contact Details" ||
        option === "Investor Relations Contact") && (
        <form onSubmit={handleContactSubmit}>
          <h3>Contact Information</h3>

          {/* date + name required for parent details */}
          <input
            type="text"
            placeholder="Enter Title Name (Required)"
            onChange={(e) => setDetails({ ...details, name: e.target.value })}
          />

          <input
            type="date"
            onChange={(e) => setDetails({ ...details, date: e.target.value })}
          />

          <br /><br />

          <input
            type="text"
            placeholder="Contact Name"
            onChange={(e) =>
              setContactInfo({ ...contactInfo, name: e.target.value })
            }
          />

          <input
            type="text"
            placeholder="Designation"
            onChange={(e) =>
              setContactInfo({ ...contactInfo, designation: e.target.value })
            }
          />

          <input
            type="text"
            placeholder="Office"
            onChange={(e) =>
              setContactInfo({ ...contactInfo, office: e.target.value })
            }
          />

          <input
            type="text"
            placeholder="Company"
            onChange={(e) =>
              setContactInfo({ ...contactInfo, company: e.target.value })
            }
          />

          <textarea
            placeholder="Address"
            onChange={(e) =>
              setContactInfo({ ...contactInfo, address: e.target.value })
            }
          />

          <input
            type="text"
            placeholder="Phone"
            onChange={(e) =>
              setContactInfo({ ...contactInfo, phone: e.target.value })
            }
          />

          <input
            type="email"
            placeholder="Email"
            onChange={(e) =>
              setContactInfo({ ...contactInfo, email: e.target.value })
            }
          />

          <button type="submit">Submit Contact Details</button>
        </form>
      )}
    </div>
  );
}
