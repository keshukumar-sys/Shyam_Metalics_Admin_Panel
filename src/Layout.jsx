import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import AdminTable from "./components/AdminTable";
import "./components/css/Layout.css";

const Layout = () => {
  return (
    <div className="app-grid">
      <aside className="app-sidebar">
        <Navbar />
      </aside>
      <div className="app-main">
        <AdminTable>
          <Outlet />
        </AdminTable>
      </div>
    </div>
  );
};

export default Layout;
