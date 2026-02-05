import React, { useEffect, useState } from "react";
import axios from "axios";
import { Edit3, Save, X } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3002";

export default function AdminJobs() {
  const [jobs, setJobs] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editJob, setEditJob] = useState({});

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await axios.get(`${API_BASE}/jobs/all`);
      setJobs(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (job) => {
    setEditId(job._id);
    setEditJob({
      title: job.title,
      description: job.description,
      location: job.location,
      salary: job.salary,
      img: null,
    });
  };

  const handleUpdate = async (id) => {
    try {
      const formData = new FormData();
      formData.append("title", editJob.title);
      formData.append("description", editJob.description);
      formData.append("location", editJob.location);
      formData.append("salary", editJob.salary);
      if (editJob.img) formData.append("img", editJob.img);

      const res = await axios.put(`${API_BASE}/jobs/update/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log(res.data);
      setEditId(null);
      fetchJobs();
    } catch (err) {
      console.error("Update error:", err);
    }
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">Jobs</h2>

      <table className="w-full border-collapse border">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">Title</th>
            <th className="p-2 border">Description</th>
            <th className="p-2 border">Location</th>
            <th className="p-2 border">Salary</th>
            <th className="p-2 border">Image</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => (
            <tr key={job._id} className="text-center">
              <td className="border p-2">
                {editId === job._id ? (
                  <input
                    type="text"
                    value={editJob.title}
                    onChange={(e) => setEditJob({ ...editJob, title: e.target.value })}
                  />
                ) : (
                  job.title
                )}
              </td>

              <td className="border p-2">
                {editId === job._id ? (
                  <textarea
                    value={editJob.description}
                    onChange={(e) =>
                      setEditJob({ ...editJob, description: e.target.value })
                    }
                    rows={2}
                  />
                ) : (
                  job.description
                )}
              </td>

              <td className="border p-2">
                {editId === job._id ? (
                  <input
                    type="text"
                    value={editJob.location}
                    onChange={(e) => setEditJob({ ...editJob, location: e.target.value })}
                  />
                ) : (
                  job.location
                )}
              </td>

              <td className="border p-2">
                {editId === job._id ? (
                  <input
                    type="number"
                    value={editJob.salary}
                    onChange={(e) => setEditJob({ ...editJob, salary: e.target.value })}
                  />
                ) : (
                  job.salary
                )}
              </td>

              <td className="border p-2">
                {editId === job._id ? (
                  <input
                    type="file"
                    onChange={(e) => setEditJob({ ...editJob, img: e.target.files[0] })}
                  />
                ) : job.img ? (
                  <a href={job.img} target="_blank" rel="noreferrer">
                    View
                  </a>
                ) : (
                  "-"
                )}
              </td>

              <td className="border p-2 flex justify-center gap-2">
                {editId === job._id ? (
                  <>
                    <button onClick={() => handleUpdate(job._id)} className="text-green-600">
                      <Save size={16} />
                    </button>
                    <button onClick={() => setEditId(null)} className="text-gray-500">
                      <X size={16} />
                    </button>
                  </>
                ) : (
                  <button onClick={() => handleEdit(job)} className="text-blue-600">
                    <Edit3 size={16} />
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
