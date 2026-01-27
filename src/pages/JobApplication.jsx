import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
    Search,
    Trash2,
    FileText,
    Edit3,
    Save,
    X
} from "lucide-react";

const API_BASE =
    import.meta.env.VITE_API_BASE ||
    "http://localhost:3002";

const JobApplication = () => {

    const [applications, setApplications] = useState([]);
    const [search, setSearch] = useState("");
    const [editId, setEditId] = useState(null);
    const [status, setStatus] = useState("");

    // ============================
    // FETCH APPLICATIONS
    // ============================
    const fetchApplications = async () => {
        try {
            const res = await axios.get(`${API_BASE}/jobs/applications/all`);
            console.log("Applications fetched:", res.data);
            setApplications(res.data);
        } catch (err) {
            console.error("Error fetching applications:", err);
        }
    };

    useEffect(() => {
        fetchApplications();
    }, []);

    // ============================
    // DELETE
    // ============================
    const handleDelete = async (id) => {
        console.log("in the handle delete")
        if (!window.confirm("Delete this application?")) return;
        try {
            const resp =  await axios.delete(`${API_BASE}/jobs/applications/delete/${id}`);
            console.log(resp);
            fetchApplications();
        } catch (err) {
            console.error(err);
        }
    };

    // ============================
    // UPDATE STATUS
    // ============================
    const handleUpdate = async (id) => {
        try {
            await axios.put(`${API_BASE}/applications/update/${id}`, {
                status,
            });
            setEditId(null);
            setStatus("");
            fetchApplications();
        } catch (err) {
            console.error(err);
        }
    };

    // ============================
    // SEARCH FILTER
    // ============================
    const filteredApplications = applications.filter(app =>
        app.fullName?.toLowerCase().includes(search.toLowerCase()) ||
        app.email?.toLowerCase().includes(search.toLowerCase()) ||
        app.position?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-50 p-10">

            {/* HEADER */}
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold">Job Applications</h1>

                <div className="relative">
                    <Search className="absolute left-3 top-3 text-gray-400" size={16} />
                    <input
                        className="pl-10 pr-4 py-2 rounded-lg border"
                        placeholder="Search applicant..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* TABLE */}
            <div className="bg-white rounded-xl shadow overflow-x-auto">

                <table className="w-full text-sm">
                    <thead className="bg-slate-100">
                        <tr>
                            <th className="p-3 border">Name</th>
                            <th className="p-3 border">Email</th>
                            <th className="p-3 border">Mobile</th>
                            <th className="p-3 border">Experience</th>
                            <th className="p-3 border">Position</th>
                            <th className="p-3 border">Status</th>
                            <th className="p-3 border">Resume</th>
                            <th className="p-3 border">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {filteredApplications.map((app) => (
                            <motion.tr
                                key={app._id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center hover:bg-slate-50"
                            >

                                <td className="border p-2">{app.fullName}</td>
                                <td className="border p-2">{app.email}</td>
                                <td className="border p-2">{app.mobile}</td>
                                <td className="border p-2">{app.totalExperience}</td>
                                <td className="border p-2">{app.position}</td>

                                {/* STATUS */}
                                <td className="border p-2">
                                    {editId === app._id ? (
                                        <select
                                            className="border rounded px-2 py-1"
                                            value={status}
                                            onChange={(e) => setStatus(e.target.value)}
                                        >
                                            <option value="">Select</option>
                                            <option value="Applied">Applied</option>
                                            <option value="Shortlisted">Shortlisted</option>
                                            <option value="Interview">Interview</option>
                                            <option value="Rejected">Rejected</option>
                                            <option value="Hired">Hired</option>
                                        </select>
                                    ) : (
                                        <span className="font-medium">
                                            {app.status || "Applied"}
                                        </span>
                                    )}
                                </td>

                                {/* RESUME */}
                                <td className="border p-2">
                                    <a
                                        href={`${app.resume}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-indigo-600 underline flex items-center justify-center gap-1"
                                    >
                                        <FileText size={14} />
                                        View
                                    </a>
                                </td>

                                {/* ACTIONS */}
                                <td className="border p-2">
                                    <div className="flex justify-center gap-3">

                                        {editId === app._id ? (
                                            <>
                                                <button
                                                    onClick={() => handleUpdate(app._id)}
                                                    className="text-green-600"
                                                >
                                                    <Save size={16} />
                                                </button>

                                                <button
                                                    onClick={() => setEditId(null)}
                                                    className="text-gray-500"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </>
                                        ) : (
                                            <button
                                                onClick={() => {
                                                    setEditId(app._id);
                                                    setStatus(app.status || "");
                                                }}
                                                className="text-blue-600"
                                            >
                                                <Edit3 size={16} />
                                            </button>
                                        )}

                                        <button
                                            onClick={() => handleDelete(app._id)}
                                            className="text-red-500"
                                        >
                                            <Trash2 size={16} />
                                        </button>

                                    </div>
                                </td>

                            </motion.tr>
                        ))}
                    </tbody>
                </table>

                {filteredApplications.length === 0 && (
                    <p className="text-center py-10 text-gray-400">
                        No Applications Found
                    </p>
                )}

            </div>
        </div>
    );
};

export default JobApplication;
