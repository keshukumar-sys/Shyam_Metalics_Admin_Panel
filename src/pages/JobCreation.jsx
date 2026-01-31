import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, MapPin, DollarSign, Briefcase, Trash2,
  Edit3, Users, ChevronDown, Image as ImageIcon,
  X, FileText, Send, Building2, TrendingUp,
  Upload, Search
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE || "https://shyam-metalics-backend-kzr8.onrender.com";

const JobsCreation = () => {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState({});
  const [formData, setFormData] = useState({
    title: "", description: "", location: "", salary: "", img: null,
  });
  const [editId, setEditId] = useState(null);
  const [openJobId, setOpenJobId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchJobs = async () => {
    try {
      const res = await axios.get(`${API_BASE}/jobs/all`);
      setJobs(res.data);
      const apps = {};
      await Promise.all(res.data.map(async (job) => {
        const appRes = await axios.get(`${API_BASE}/jobs/applications/${job._id}`);
        apps[job._id] = appRes.data;
      }));
      setApplications(apps);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchJobs(); }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData(prev => ({ ...prev, [name]: files ? files[0] : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const data = new FormData();
    Object.keys(formData).forEach(key => formData[key] && data.append(key, formData[key]));
    try {
      if (editId) await axios.put(`${API_BASE}/jobs/update/${editId}`, data);
      else await axios.post(`${API_BASE}/jobs/add`, data);
      setEditId(null);
      setFormData({ title: "", description: "", location: "", salary: "", img: null });
      fetchJobs();
    } catch (err) { console.error(err); } finally { setIsSubmitting(false); }
  };

  const totalApps = Object.values(applications).flat().length;

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-900 font-sans pb-20">
      {/* Premium Header */}
      <header className="h-20 flex items-center border-b border-slate-100 bg-white/50 backdrop-blur-md sticky top-0 z-50">
        <div className="w-[80vw] mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center shadow-2xl shadow-black/20">
              <Building2 className="text-white w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Console</h1>
              <p className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400">Management Panel</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end">
              <span className="text-lg font-bold text-indigo-600">{totalApps}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Candidates</span>
            </div>
            <div className="h-8 w-[1px] bg-slate-100" />
            <div className="flex flex-col items-end">
              <span className="text-lg font-bold text-slate-900">{jobs.length}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Live Jobs</span>
            </div>
          </div>
        </div>
      </header>

      <main className="w-[80vw] mx-auto pt-12 grid lg:grid-cols-12 gap-12">
        {/* Modern Minimalist Form */}
        <div className="lg:col-span-4">
          <div className="sticky top-32">
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-8 ml-1">
              {editId ? "Edit Position" : "Create New Position"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="group">
                  <input name="title" value={formData.title} onChange={handleChange} placeholder="Job Title" className="w-full bg-slate-100/50 px-5 py-4 rounded-2xl border-transparent focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all text-sm font-medium" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input name="location" value={formData.location} onChange={handleChange} placeholder="Location" className="w-full bg-slate-100/50 px-5 py-4 rounded-2xl border-transparent focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all text-sm font-medium" required />
                  <input name="salary" value={formData.salary} onChange={handleChange} placeholder="Salary" className="w-full bg-slate-100/50 px-5 py-4 rounded-2xl border-transparent focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all text-sm font-medium" />
                </div>
                <textarea name="description" value={formData.description} onChange={handleChange} rows={4} placeholder="Brief Description..." className="w-full bg-slate-100/50 px-5 py-4 rounded-2xl border-transparent focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all text-sm font-medium resize-none" required />
              </div>

              <div className="relative group">
                <input type="file" name="img" onChange={handleChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                <div className="border border-slate-200 border-dashed rounded-2xl p-6 flex items-center justify-center gap-3 group-hover:bg-slate-50 transition-colors">
                  <Upload className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
                  <span className="text-xs font-bold text-slate-500">{formData.img ? formData.img.name : "Company Logo / Image"}</span>
                </div>
              </div>

              <button disabled={isSubmitting} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl shadow-xl shadow-indigo-200 transition-all transform active:scale-95 disabled:opacity-50">
                {isSubmitting ? "Syncing..." : "Publish Vacancy"}
              </button>
              {editId && <button onClick={() => { setEditId(null); setFormData({ title: "", description: "", location: "", salary: "", img: null }) }} className="w-full text-xs font-bold text-slate-400 hover:text-red-500 transition-colors">Cancel Editing</button>}
            </form>
          </div>
        </div>

        {/* Minimalist Cards List */}
        <div className="lg:col-span-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Live Opportunities</h3>
            <Search className="w-4 h-4 text-slate-300 cursor-pointer" />
          </div>

          <div className="space-y-6">
            {jobs.map((job) => (
              <motion.div
                key={job._id}
                layout
                className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm hover:shadow-xl hover:shadow-slate-200/40 transition-all duration-500 group"
              >
                <div className="flex flex-col sm:flex-row gap-8 items-center">
                  {/* Fixed Small Thumbnail */}
                  <div className="w-20 h-20 rounded-2xl bg-slate-50 overflow-hidden flex-shrink-0 grayscale group-hover:grayscale-0 transition-all duration-500 border border-slate-50">
                    {job.img ? <img src={job.img} className="w-[400px] h-[400px]" style={{ width: "80%", height: "200px" }} /> : <div className="w-full h-full flex items-center justify-center text-slate-200"><Briefcase size={24} /></div>}
                  </div>

                  <div className="flex-1 text-center sm:text-left">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                      <div>
                        <h4 className="text-xl font-bold text-slate-900 mb-2">{job.title}</h4>
                        <div className="flex flex-wrap justify-center sm:justify-start gap-4">
                          <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400"><MapPin size={12} /> {job.location}</span>
                          <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400"><DollarSign size={12} /> {job.salary || "Neg"}</span>
                          <span className="flex items-center gap-1.5 text-xs font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-md">{applications[job._id]?.length || 0} Apps</span>
                        </div>
                      </div>
                      <div className="flex gap-2 self-center sm:self-start opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button onClick={() => { setEditId(job._id); setFormData(job); window.scrollTo({ top: 0, behavior: 'smooth' }) }} className="p-2.5 bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-xl transition-all"><Edit3 size={16} /></button>
                        <button onClick={async () => { if (confirm("Remove?")) { await axios.delete(`${API_BASE}/jobs/delete/${job._id}`); fetchJobs(); } }} className="p-2.5 bg-slate-50 text-slate-400 hover:text-red-500 rounded-xl transition-all"><Trash2 size={16} /></button>
                      </div>
                    </div>

                    <button
                      onClick={() => setOpenJobId(openJobId === job._id ? null : job._id)}
                      className="mt-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.15em] text-slate-300 hover:text-indigo-600 transition-colors mx-auto sm:mx-0"
                    >
                      {openJobId === job._id ? "Close Candidates" : "View Applications"}
                      <ChevronDown size={14} className={`transition-transform duration-300 ${openJobId === job._id ? "rotate-180" : ""}`} />
                    </button>
                  </div>
                </div>

                <AnimatePresence>
                  {openJobId === job._id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >


                      <div className="p-2">


                        {applications[job._id]?.length > 0 ? (


                          // <table className="w-[90%] border text-sm">
                          //   <thead className="bg-slate-100">
                          //     <tr>
                          //       <th className="border p-2">Name</th>
                          //       <th className="border p-2">Email</th>
                          //       <th className="border p-2">Mobile</th>
                          //       <th className="border p-2">Experience</th>
                          //       <th className="border p-2">Company</th>
                          //       <th className="border p-2">Designation</th>
                          //       <th className="border p-2">CTC</th>
                          //       <th className="border p-2">Expected</th>
                          //       <th className="border p-2">Location</th>
                          //       <th className="border p-2">Resume</th>
                          //     </tr>
                          //   </thead>


                          //   <tbody>
                          //     {applications[job._id].map((app) => (
                          //       <tr key={app._id} className="text-center">
                          //         <td className="border p-2">{app.fullName}</td>
                          //         <td className="border p-2">{app.email}</td>
                          //         <td className="border p-2">{app.mobile}</td>
                          //         <td className="border p-2">{app.totalExperience}</td>
                          //         <td className="border p-2">{app.currentCompany}</td>
                          //         <td className="border p-2">{app.designation}</td>
                          //         <td className="border p-2">{app.currentCTC}</td>
                          //         <td className="border p-2">{app.expectedCTC}</td>
                          //         <td className="border p-2">{app.preferredLocation}</td>
                          //         <td className="border p-2">
                          //           <a
                          //             href={`${API_BASE}/${app.resume}`}
                          //             target="_blank"
                          //             className="text-indigo-600 underline"
                          //           >
                          //             Download
                          //           </a>
                          //         </td>
                          //       </tr>
                          //     ))}
                          //   </tbody>


                          // </table>
                          <table className="w-[60vw] mx-auto border text-sm">
                            <thead className="bg-slate-100">
                              <tr>
                                <th className="border">Name</th>
                                <th className="border">Email</th>
                                <th className="border">Mobile</th>
                                <th className="border">Experience</th>
                                <th className="border">Company</th>
                                <th className="border">Designation</th>
                                <th className="border">CTC</th>
                                <th className="border">Expected</th>
                                <th className="border">Location</th>
                                <th className="border">Resume</th>
                              </tr>
                            </thead>

                            <tbody>
                              {applications[job._id].map((app) => (
                                <tr key={app._id} className="text-center">
                                  <td className="border">{app.fullName}</td>
                                  <td className="border">{app.email}</td>
                                  <td className="border">{app.mobile}</td>
                                  <td className="border">{app.totalExperience}</td>
                                  <td className="border">{app.currentCompany}</td>
                                  <td className="border">{app.designation}</td>
                                  <td className="border">{app.currentCTC}</td>
                                  <td className="border">{app.expectedCTC}</td>
                                  <td className="border">{app.preferredLocation}</td>
                                  <td className="border">
                                    <a
                                      href={`${API_BASE}/${app.resume}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-indigo-600 underline"
                                    >
                                      Download
                                    </a>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>



                        ) : (
                          <p className="text-center text-gray-400">No Applicants</p>
                        )}


                      </div>


                    </motion.div>
                  )}
                </AnimatePresence>


              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default JobsCreation;