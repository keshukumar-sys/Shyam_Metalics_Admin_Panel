import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";

const Layout = () => {
  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "Arial, sans-serif" }}>
      {/* Sidebar / Navbar */}
      <aside
        style={{
          color: "#fff",
          display: "flex",
          flexDirection: "column",
          padding: "20px",
          boxSizing: "border-box",
        }}
      >
        <Navbar style={{width:"100%"}} />
      </aside>

      {/* Main content */}
      <main
        style={{
          flex: 1,
          backgroundColor: "#f3f4f6",
          maringTop:"10%", // light background
          padding: "20px",
          overflowY: "auto",
        }}
      >
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
