import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { getRole, getToken, clearAuth } from "../auth";
import "./css/Navbar.css";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const role = getRole();
  const nav = useNavigate();

  const handleLogout = () => {
    clearAuth();
    nav("/login");
  };

  return (
    <nav className="navbar">
      <div className="sidebar-title">Shyam Metalics</div>

      <div className={`nav-links ${open ? "open" : ""}`}>
        <NavLink to="/" end className="nav-link">Dashboard</NavLink>
        <NavLink to="/corporate" className="nav-link">Corporate</NavLink>
        <NavLink to="/environment" className="nav-link">Environment</NavLink>
        <NavLink to="/familiar" className="nav-link">Familiar</NavLink>
        <NavLink to="/financial" className="nav-link">Financial</NavLink>
        <NavLink to="/investor-analyst" className="nav-link">Investor Analyst</NavLink>
        <NavLink to="/investor-info" className="nav-link">Investor Info</NavLink>
        <NavLink to="/other" className="nav-link">Other</NavLink>
        <NavLink to="/policies" className="nav-link">Policies</NavLink>
        <NavLink to="/qip" className="nav-link">QIP</NavLink>
        <NavLink to="/sebi-dispute" className="nav-link">SEBI</NavLink>
        <NavLink to="/stock-exchange" className="nav-link">Stock Exchange</NavLink>
        <NavLink to="/tds" className="nav-link">TDS</NavLink>
      </div>

      <div className="nav-right">
        {role && <div className="role-badge">{role}</div>}
        {role === "admin" && <>
          <NavLink to="/create-uploader" className="auth-btn">Create Uploader</NavLink>
          <NavLink to="/manage-users" className="auth-btn" style={{ marginTop: 6 }}>Manage Users</NavLink>
        </>}
        {getToken() ? (
          <button className="auth-btn" onClick={handleLogout}>Logout</button>
        ) : (
          <NavLink to="/login" className="auth-btn">Login</NavLink>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
