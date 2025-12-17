import React, { useState } from "react";

export default function OtherModel() {
  const [option, setOption] = useState("");
  const [file, setFile] = useState(null);

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

  // ------------------ SUBMIT FOR OTHER COMPLIANCES ------------------
  const handleOtherComplianceSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append("option", option);
      formData.append("details", JSON.stringify(details));
      formData.append("file", file);

      const res = await fetch(`${API_BASE}/add_other`, {
        method: "POST",
        body: formData,
      });

      console.log(await res.json());
    } catch (err) {
      console.error(err);
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

      console.log(await res.json());
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

          <button type="submit">Submit</button>
        </form>
      )}

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
