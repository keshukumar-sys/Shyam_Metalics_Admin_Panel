import { useEffect, useState } from "react";
import axios from "axios";
import { Trash2, Edit, X } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3002";
const API_URL = `${API_BASE}/inquiries`;

export default function ContactFormInquiries() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [statusUpdating, setStatusUpdating] = useState(false);

  // Fetch all inquiries
  const fetchInquiries = async () => {
    try {
      const res = await axios.get(API_URL);
      // Ensure we have an array
      const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setInquiries(data);
    } catch (err) {
      console.error("Failed to fetch inquiries:", err);
      setInquiries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  // Delete inquiry
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this inquiry?")) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      setInquiries(inquiries.filter((inq) => inq._id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  // Update status
  const handleStatusChange = async (id, status) => {
    setStatusUpdating(true);
    try {
      await axios.patch(`${API_URL}/${id}/status`, { status });
      setInquiries(
        inquiries.map((inq) => (inq._id === id ? { ...inq, status } : inq))
      );
    } catch (err) {
      console.error("Status update failed:", err);
    } finally {
      setStatusUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800 dark:text-gray-100">
        Admin Panel - Inquiries
      </h1>

      {loading ? (
        <p className="text-center text-gray-600 dark:text-gray-300">Loading...</p>
      ) : !Array.isArray(inquiries) || inquiries.length === 0 ? (
        <p className="text-center text-gray-600 dark:text-gray-300">No inquiries found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <thead className="bg-gray-200 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Company</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {inquiries.map((inq) => (
                <tr
                  key={inq._id}
                  className="border-b dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                >
                  <td className="px-4 py-2">{inq.fullName || "-"}</td>
                  <td className="px-4 py-2">{inq.email || "-"}</td>
                  <td className="px-4 py-2">{inq.companyName || "-"}</td>
                  <td className="px-4 py-2">
                    <select
                      value={inq.status || "Pending"}
                      onChange={(e) => handleStatusChange(inq._id, e.target.value)}
                      disabled={statusUpdating}
                      className="border rounded px-2 py-1 dark:bg-gray-700 dark:text-gray-100"
                    >
                      {["Pending", "In Progress", "Resolved", "Rejected"].map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-2 flex gap-2">
                    <button
                      onClick={() => setSelectedInquiry(inq)}
                      className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 flex items-center gap-1"
                    >
                      <Edit className="w-4 h-4" /> View
                    </button>
                    <button
                      onClick={() => handleDelete(inq._id)}
                      className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 flex items-center gap-1"
                    >
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Inquiry Details Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-lg w-full relative">
            <button
              onClick={() => setSelectedInquiry(null)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 dark:hover:text-gray-100"
            >
              <X />
            </button>
            <h2 className="text-xl font-bold mb-4">{selectedInquiry.fullName || "-"}</h2>
            <p><strong>Email:</strong> {selectedInquiry.email || "-"}</p>
            <p><strong>Company:</strong> {selectedInquiry.companyName || "-"}</p>
            <p><strong>Classification:</strong> {selectedInquiry.classification || "-"}</p>
            <p><strong>Industry:</strong> {selectedInquiry.industry || "-"}</p>
            <p><strong>Country:</strong> {selectedInquiry.country || "-"}</p>
            <p><strong>Phone:</strong> {selectedInquiry.phone || "-"}</p>
            <p className="mt-2"><strong>Inquiry Message:</strong> {selectedInquiry.inquiryMessage || "-"}</p>
            <p className="mt-2"><strong>Status:</strong> {selectedInquiry.status || "Pending"}</p>
          </div>
        </div>
      )}
    </div>
  );
}
