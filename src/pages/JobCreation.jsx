import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Plus,
  MapPin,
  DollarSign,
  Briefcase,
  Trash2,
  Edit3,
  ChevronRight,
  Image as ImageIcon,
  Search,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3002";
const API_URL = `${API_BASE}`;

const JobsCreation = () => {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState({});
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    salary: "",
    img: null,
  });
  const [editId, setEditId] = useState(null);
  const [openJobId, setOpenJobId] = useState(null);

  const fetchJobs = async () => {
    try {
      const res = await axios.get(`${API_URL}/jobs/all`);
      setJobs(res.data);

      const apps = {};
      await Promise.all(
        res.data.map(async (job) => {
          const appRes = await axios.get(
            `${API_URL}/jobs/applications/${job._id}`
          );
          console.log(appRes);
          apps[job._id] = appRes.data;
        })
      );
      
      setApplications(apps);
      console.log(applications)
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleChange = (e) => {
    if (e.target.name === "img") {
      setFormData({ ...formData, img: e.target.files[0] });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(formData).forEach((key) => data.append(key, formData[key]));

    try {
      if (editId) {
        await axios.put(`${API_URL}/jobs/update/${editId}`, data);
        setEditId(null);
      } else {
        await axios.post(`${API_URL}/jobs/add`, data);
      }
      setFormData({
        title: "",
        description: "",
        location: "",
        salary: "",
        img: null,
      });
      fetchJobs();
    } catch (err) {
      console.error(err);
    }
  };

 const handleDelete = async (id) => {
  if (!window.confirm("Delete this job?")) return;

  try {
    console.log("Sending request to:", `${API_URL}/jobs/delete/${id}`);

    const res = await axios.delete(`${API_URL}/jobs/delete/${id}`);
    console.log(res.data);

    fetchJobs();
  } catch (err) {
    console.error(err);
  }
};


  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">
              Job Management
            </h1>
            <p className="text-sm text-slate-500">
              Create, manage & track job listings
            </p>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              placeholder="Search jobs..."
              className="pl-9 pr-4 py-2 rounded-lg bg-white shadow-sm border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">

          {/* LEFT FORM */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-lg sticky top-6">
              <div className="flex items-center gap-2 mb-6">
                <div
                  className={`p-2 rounded-lg ${
                    editId
                      ? "bg-amber-100 text-amber-600"
                      : "bg-indigo-100 text-indigo-600"
                  }`}
                >
                  {editId ? <Edit3 size={18} /> : <Plus size={18} />}
                </div>
                <h2 className="font-bold text-lg">
                  {editId ? "Update Job" : "New Job"}
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Job Title"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                />

                <input
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Location"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                />

                <input
                  name="salary"
                  value={formData.salary}
                  onChange={handleChange}
                  placeholder="Salary (optional)"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border focus:ring-2 focus:ring-indigo-500 outline-none"
                />

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Job description"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                  required
                />

                <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed rounded-xl cursor-pointer text-slate-400 hover:text-indigo-600">
                  <ImageIcon size={18} />
                  <span className="text-sm">
                    {formData.img ? formData.img.name : "Upload thumbnail"}
                  </span>
                  <input
                    type="file"
                    name="img"
                    onChange={handleChange}
                    className="hidden"
                  />
                </label>

                <button
                  type="submit"
                  className={`w-full py-3 rounded-xl font-bold text-white ${
                    editId
                      ? "bg-amber-500 hover:bg-amber-600"
                      : "bg-indigo-600 hover:bg-indigo-700"
                  }`}
                >
                  {editId ? "Save Changes" : "Post Job"}
                </button>
              </form>
            </div>
          </div>

          {/* RIGHT JOB CARDS */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {jobs.map((job) => (
                <div
                  key={job._id}
                  className="bg-whiteborder-2px rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-1 transition"
                >
                  <div className="flex gap-3 border border-blue bg-biege" style={{backgroundColor:"beige" , border:"2px solid blue"  , padding:"10px"}}>
                    <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden flex items-center justify-center border">
                      {job.img ? (
                        <img
                          src={job.img}
                          alt={job.title}
                          className="w-[200px] h-[200px]"
                          style={{width:"200px"}}
                        />
                      ) : (
                        <Briefcase size={16} className="text-slate-400" />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex justify-between">
                        <div>
                          <h3 className="font-semibold text-[15px] text-slate-900 truncate">
                            {job.title}
                          </h3>
                          <p className="text-xs text-slate-500 flex items-center gap-1">
                            <MapPin size={12} /> {job.location}
                          </p>
                          <p className="text-xs text-indigo-600 flex items-center gap-1 font-medium">
                            <DollarSign size={12} />
                            {job.salary || "Negotiable"}
                          </p>
                        </div>

                        <div className="flex gap-1">
                          <button
                            onClick={() => setEditId(job._id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-amber-50"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(job._id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t flex justify-between items-center">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-semibold ${
                        applications[job._id]?.length
                          ? "bg-indigo-50 text-indigo-600"
                          : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {applications[job._id]?.length || 0} Applicants
                    </span>

                    <button
                      onClick={() =>
                        setOpenJobId(openJobId === job._id ? null : job._id)
                      }
                      className="text-xs font-bold text-indigo-600 flex items-center gap-1"
                    >
                      Manage
                      <ChevronRight
                        size={14}
                        className={
                          openJobId === job._id ? "rotate-90 transition" : ""
                        }
                      />
                    </button>
                  </div>

                  {openJobId === job._id && (
                    <div className="mt-3 space-y-2">
                      {applications[job._id]?.length ? (
                        applications[job._id].map((app) => (
                          <div
                            key={app._id}
                            className="bg-slate-50 rounded-lg p-3 flex justify-between"
                          >
                            <div>
                              <p className="text-xs font-bold">{app.name}</p>
                              <p className="text-[10px] text-slate-500">
                                {app.email}
                              </p>
                            </div>
                            <span className="text-xs text-indigo-600 font-semibold">
                              Resume : <a href={app.resume}>Click me </a>
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-400 italic text-center">
                          No applications yet
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default JobsCreation;
