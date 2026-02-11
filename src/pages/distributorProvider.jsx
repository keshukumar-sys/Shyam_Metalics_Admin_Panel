import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
} from "lucide-react";

const API_URL =
  `${import.meta.env.VITE_API_BASE}/distributor-providers` ||
  "http://localhost:3002/base/distributor-providers";

const AdminDistributorProvider = () => {
  // --- State ---
  const [distributors, setDistributors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    number: "",
    district: "",
    state: "",
  });
  const [editId, setEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // --- Fetch ---
  const fetchDistributors = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_URL);
      setDistributors(res.data.data || []);
    } catch (err) {
      console.error("Fetch error:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDistributors();
  }, []);

  // --- Filter ---
  const filteredItems = distributors.filter((item) =>
    item.district?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.state?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- Pagination ---
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // --- Form ---
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await axios.put(`${API_URL}/${editId}`, formData);
      } else {
        await axios.post(API_URL, formData);
      }

      setFormData({ name: "", number: "", district: "", state: "" });
      setEditId(null);
      fetchDistributors();
    } catch (err) {
      alert("Operation failed");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this record?")) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        fetchDistributors();
      } catch (err) {
        alert("Delete failed");
      }
    }
  };

  // --- UI ---
  return (
    <div style={{ padding: "20px", maxWidth: "60vw", margin: "40px auto" }}>
      <h2>Distributor Provider Management</h2>

      {/* Form */}
      <div
        style={{
          background: "#fff",
          padding: "20px",
          borderRadius: "8px",
          marginBottom: "30px",
        }}
      >
        <form
          onSubmit={handleSubmit}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "15px",
          }}
        >
          <input
            name="name"
            placeholder="Distributor Name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <input
            name="number"
            placeholder="Contact Number"
            value={formData.number}
            onChange={handleChange}
            required
          />
          <input
            name="district"
            placeholder="District"
            value={formData.district}
            onChange={handleChange}
            required
          />
          <input
            name="state"
            placeholder="State"
            value={formData.state}
            onChange={handleChange}
            required
          />
          <button type="submit">
            {editId ? "Update Distributor" : "Add Distributor"}
          </button>
        </form>
      </div>

      {/* Search */}
      <div style={{ marginBottom: "20px" }}>
        <Search size={16} />
        <input
          type="text"
          placeholder="Filter by State or District..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
        />
        {searchTerm && (
          <X size={16} onClick={() => setSearchTerm("")} />
        )}
      </div>

      {/* Table */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Contact</th>
              <th>District</th>
              <th>State</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5">Loading...</td>
              </tr>
            ) : currentItems.length > 0 ? (
              currentItems.map((item) => (
                <tr key={item._id}>
                  <td>{item.name}</td>
                  <td>{item.number}</td>
                  <td>{item.district}</td>
                  <td>{item.state}</td>
                  <td>
                    <button
                      onClick={() => {
                        setEditId(item._id);
                        setFormData({
                          name: item.name,
                          number: item.number,
                          district: item.district,
                          state: item.state,
                        });
                        window.scrollTo(0, 0);
                      }}
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      onClick={() => handleDelete(item._id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5">No distributors found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ marginTop: "20px" }}>
          <button
            disabled={currentPage === 1}
            onClick={() => paginate(currentPage - 1)}
          >
            <ChevronLeft size={16} />
          </button>

          <span>
            Page {currentPage} of {totalPages}
          </span>

          <button
            disabled={currentPage === totalPages}
            onClick={() => paginate(currentPage + 1)}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminDistributorProvider;
