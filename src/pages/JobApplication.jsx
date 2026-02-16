import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3002";
const ITEMS_PER_PAGE = 8;

export default function AdminApplications() {
  const [applications, setApplications] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedApp, setSelectedApp] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchApplications();
  }, []);

  // ================= FETCH =================
  const fetchApplications = async () => {
    try {
      const res = await axios.get(
        `${API_BASE}/jobs/applications/all`
      );
      setApplications(res.data || []);
    } catch (err) {
      console.error("Fetch applications error:", err);
    }
  };

  // ================= DELETE =================
  const deleteApplication = async (id) => {
    if (!window.confirm("Delete this application?")) return;

    try {
      await axios.delete(
        `${API_BASE}/jobs/applications/delete/${id}`
      );
      fetchApplications();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  // ================= UPDATE =================
  const updateApplication = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.put(
        `${API_BASE}/jobs/applications/update/${selectedApp._id}`,
        {
          status: selectedApp.status,
          adminRemark: selectedApp.adminRemark,
        }
      );

      setSelectedApp(null);
      fetchApplications();
    } catch (err) {
      console.error("Update error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ================= FILTER =================
  const filteredApplications = applications.filter((app) => {
    const term = searchTerm.toLowerCase();

    return (
      app.fullName?.toLowerCase().includes(term) ||
      app.email?.toLowerCase().includes(term) ||
      app.status?.toLowerCase().includes(term) ||
      app.jobId?.title?.toLowerCase().includes(term)
    );
  });

  // ================= PAGINATION =================
  const totalPages = Math.ceil(
    filteredApplications.length / ITEMS_PER_PAGE
  );

  const paginatedData = filteredApplications.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">
        Job Applications ({filteredApplications.length})
      </h1>

      {/* ================= SEARCH ================= */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name, email, job title or status..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full md:w-96 border p-2 rounded"
        />
      </div>

      {/* ================= TABLE ================= */}
      <div className="overflow-x-auto">
        <table className="w-full border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">Candidate</th>
              <th className="border p-2">Job</th>
              <th className="border p-2">Status</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>

          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((app) => (
                <tr key={app._id} className="text-center">
                  <td className="border p-2">{app.fullName}</td>
                  <td className="border p-2">
                    {app.jobId?.title || "Deleted Job"}
                  </td>
                  <td className="border p-2">
                    <span className="px-2 py-1 rounded bg-gray-200">
                      {app.status || "Pending"}
                    </span>
                  </td>
                  <td className="border p-2 space-x-2">
                    <button
                      onClick={() => setSelectedApp(app)}
                      className="px-3 py-1 bg-blue-600 text-white rounded"
                    >
                      View
                    </button>
                    <button
                      onClick={() => deleteApplication(app._id)}
                      className="px-3 py-1 bg-red-600 text-white rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="p-4 text-center">
                  No applications found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ================= PAGINATION ================= */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6 gap-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>

          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 border rounded ${
                currentPage === i + 1
                  ? "bg-black text-white"
                  : ""
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* ================= POPUP ================= */}
      {selectedApp && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
          <form
            onSubmit={updateApplication}
            className="bg-white p-6 rounded w-full max-w-2xl overflow-y-auto max-h-[90vh]"
          >
            <h2 className="text-xl font-bold mb-4">
              Application Details
            </h2>

            <div className="mb-4">
              <p><b>Name:</b> {selectedApp.fullName}</p>
              <p><b>Email:</b> {selectedApp.email}</p>
              <p><b>Mobile:</b> {selectedApp.mobile}</p>
              <p><b>Experience:</b> {selectedApp.totalExperience}</p>
              <p><b>Job:</b> {selectedApp.jobId?.title}</p>
            </div>

            <a
              href={selectedApp.resume}
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 underline block mb-4"
            >
              View Resume
            </a>

            <select
              className="border p-2 w-full mb-3"
              value={selectedApp.status || "Pending"}
              onChange={(e) =>
                setSelectedApp({
                  ...selectedApp,
                  status: e.target.value,
                })
              }
            >
              <option>Pending</option>
              <option>Shortlisted</option>
              <option>Rejected</option>
              <option>Selected</option>
            </select>

            <textarea
              className="border p-2 w-full mb-4"
              placeholder="Admin remark"
              value={selectedApp.adminRemark || ""}
              onChange={(e) =>
                setSelectedApp({
                  ...selectedApp,
                  adminRemark: e.target.value,
                })
              }
            />

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="px-4 py-2 border rounded"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-black text-white rounded"
              >
                {loading ? "Updating..." : "Update"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
