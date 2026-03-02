import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import { Menu, X } from "lucide-react";

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className={`app-grid ${isSidebarOpen ? "sidebar-open" : ""}`}>
      {/* Mobile Header */}
      <header className="mobile-header">
        <div className="mobile-logo">
          <img src="/logo.png" alt="" style={{ height: "24px", display: "none" }} />
          <span>Shyam Metalics</span>
        </div>
        <button className="hamburger" onClick={toggleSidebar}>
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Sidebar Overlay */}
      {isSidebarOpen && <div className="sidebar-overlay" onClick={closeSidebar}></div>}

      <aside className={`app-sidebar ${isSidebarOpen ? "active" : ""}`}>
        <Navbar onLinkClick={closeSidebar} />
      </aside>

      <main className="app-main">
        <div className="content-container">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
