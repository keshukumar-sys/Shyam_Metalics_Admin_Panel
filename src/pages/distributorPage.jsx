import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Pencil, Trash2, ChevronLeft, ChevronRight, Search, X } from 'lucide-react';

const API_URL =  `${import.meta.env.VITE_API_BASE}/distributors` || "http://localhost:3002/distributors";

const AdminDistributor = () => {
  // --- State Management ---
  const [distributors, setDistributors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ customerName: '', contactNumber: '', district: '', state: '' });
  const [editId, setEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // --- Fetch Data ---
  const fetchDistributors = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_URL);
      setDistributors(res.data.data);
    } catch (err) {
      console.error("Fetch error:", err);
    }
    setLoading(false);
  };

  useEffect(() => { fetchDistributors(); }, []);

  // --- Search & Filter Logic ---
  const filteredItems = distributors.filter(item => 
    item.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.state.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- Pagination Logic (Windowed) ---
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPageButtons = 5; 

    if (totalPages <= maxPageButtons) {
      for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
    } else {
      pageNumbers.push(1);
      if (currentPage > 3) pageNumbers.push('...');
      
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) pageNumbers.push(i);
      
      if (currentPage < totalPages - 2) pageNumbers.push('...');
      if (totalPages > 1) pageNumbers.push(totalPages);
    }
    return pageNumbers;
  };

  // --- Form Actions ---
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await axios.put(`${API_URL}/${editId}`, formData);
      } else {
        await axios.post(`${API_URL}/create`, formData);
      }
      setFormData({ customerName: '', contactNumber: '', district: '', state: '' });
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

  // --- Styles ---
  const tableHeaderStyle = { padding: '12px', textAlign: 'left', background: '#f8f9fa', whiteSpace: 'nowrap', borderBottom: '2px solid #dee2e6' };
  const tableCellStyle = { padding: '10px', borderBottom: '1px solid #eee', fontSize: '14px', whiteSpace: 'nowrap' };
  const inputStyle = { padding: '10px', borderRadius: '4px', border: '1px solid #ccc', outline: 'none' };
  const actionBtn = { background: 'none', border: 'none', cursor: 'pointer', color: '#007bff', padding: '4px' };
  const navBtn = { padding: '6px', cursor: 'pointer', border: '1px solid #ddd', borderRadius: '4px', background: '#fff', display: 'flex', alignItems: 'center' };

  return (
    <div style={{ padding: '20px', maxWidth: '60vw', margin: '40px auto', fontFamily: 'system-ui, sans-serif', color: '#333' }}>
      <h2 style={{ marginBottom: '20px', color: '#1a1a1a' }}>Distributor Management</h2>

      {/* Form Card */}
      <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', marginBottom: '30px' }}>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px' }}>
          <input style={inputStyle} name="customerName" placeholder="Customer Name" value={formData.customerName} onChange={handleChange} required />
          <input style={inputStyle} name="contactNumber" placeholder="Contact Number" value={formData.contactNumber} onChange={handleChange} required />
          <input style={inputStyle} name="district" placeholder="District" value={formData.district} onChange={handleChange} required />
          <input style={inputStyle} name="state" placeholder="State" value={formData.state} onChange={handleChange} required />
          <button type="submit" style={{ background: editId ? '#28a745' : '#007bff', color: '#fff', border: 'none', padding: '10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            {editId ? 'Update Distributor' : 'Add Distributor'}
          </button>
        </form>
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: '20px', position: 'relative' }}>
        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
        <input 
          type="text"
          placeholder="Filter by State or District..."
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          style={{ ...inputStyle, width: '100%', paddingLeft: '40px', boxSizing: 'border-box', border: '1px solid #007bff' }}
        />
        {searchTerm && (
          <X size={16} onClick={() => setSearchTerm('')} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#888' }} />
        )}
      </div>

      {/* Scrollable Table Wrapper */}
      <div style={{ width: '100%', overflowX: 'auto', border: '1px solid #dee2e6', borderRadius: '8px', background: '#fff' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
          <thead>
            <tr>
              <th style={tableHeaderStyle}>Name</th>
              <th style={tableHeaderStyle}>Contact</th>
              <th style={tableHeaderStyle}>District</th>
              <th style={tableHeaderStyle}>State</th>
              <th style={tableHeaderStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>Loading data...</td></tr>
            ) : currentItems.length > 0 ? (
              currentItems.map((item) => (
                <tr key={item._id} style={{ hover: { background: '#f9f9f9' } }}>
                  <td style={tableCellStyle}>{item.customerName}</td>
                  <td style={tableCellStyle}>{item.contactNumber}</td>
                  <td style={tableCellStyle}>{item.district}</td>
                  <td style={tableCellStyle}>{item.state}</td>
                  <td style={tableCellStyle}>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button title="Edit" onClick={() => { setEditId(item._id); setFormData(item); window.scrollTo(0,0); }} style={actionBtn}><Pencil size={18}/></button>
                      <button title="Delete" onClick={() => handleDelete(item._id)} style={{ ...actionBtn, color: '#dc3545' }}><Trash2 size={18}/></button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#888' }}>No distributors found matching your search.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Windowed Pagination Controls */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '25px' }}>
          <button disabled={currentPage === 1} onClick={() => paginate(currentPage - 1)} style={{ ...navBtn, opacity: currentPage === 1 ? 0.5 : 1 }}>
            <ChevronLeft size={18}/>
          </button>

          {getPageNumbers().map((number, index) => (
            <button 
              key={index} 
              disabled={number === '...'}
              onClick={() => paginate(number)}
              style={{ 
                padding: '8px 14px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                cursor: number === '...' ? 'default' : 'pointer',
                backgroundColor: currentPage === number ? '#007bff' : '#fff',
                color: currentPage === number ? '#fff' : '#333',
                fontWeight: currentPage === number ? 'bold' : 'normal',
                transition: 'all 0.2s'
              }}
            >
              {number}
            </button>
          ))}

          <button disabled={currentPage === totalPages} onClick={() => paginate(currentPage + 1)} style={{ ...navBtn, opacity: currentPage === totalPages ? 0.5 : 1 }}>
            <ChevronRight size={18}/>
          </button>
        </div>
      )}
      
      <div style={{ textAlign: 'center', fontSize: '13px', color: '#666', marginTop: '15px' }}>
        Showing <strong>{indexOfFirstItem + 1}</strong> - <strong>{Math.min(indexOfLastItem, filteredItems.length)}</strong> of <strong>{filteredItems.length}</strong> records
      </div>
    </div>
  );
};

export default AdminDistributor;