import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { getRole, getToken, clearAuth } from "../auth";
import {
  LayoutDashboard,
  Building2,
  Leaf,
  Users,
  LineChart,
  Info,
  FileText,
  ShieldCheck,
  TrendingUp,
  ShieldAlert,
  BarChart3,
  FileClock,
  CalendarClock,
  Newspaper,
  Trophy,
  BookOpen,
  ClipboardList,
  Mail,
  Briefcase,
  UserPen,
  ShieldCheck as Shield,
  LogOut,
  UserPlus,
  UsersRound,
  History,
  Store,
  Truck,
  X
} from "lucide-react";
import "./css/Navbar.css";

const Navbar = ({ onLinkClick }) => {
  const role = getRole();
  const nav = useNavigate();

  const handleLogout = () => {
    clearAuth();
    nav("/login");
  };

  const navGroups = [
    // ... existing groups remain the same
    {
      label: "Main",
      links: [
        { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
      ]
    },
    {
      label: "Corporate & IR",
      links: [
        { to: "/corporate", label: "Corporate", icon: Building2 },
        { to: "/financial", label: "Financial", icon: LineChart },
        { to: "/investor-analyst", label: "Investor Analyst", icon: BarChart3 },
        { to: "/investor-info", label: "Investor Info", icon: Info },
        { to: "/stock-exchange", label: "Stock Exchange", icon: TrendingUp },
        { to: "/qip", label: "QIP", icon: TrendingUp },
      ]
    },
    {
      label: "Compliance & Legal",
      links: [
        { to: "/policies", label: "Policies", icon: ShieldCheck },
        { to: "/disclosures", label: "Disclosures", icon: BookOpen },
        { to: "/sebi-dispute", label: "SEBI Dispute", icon: ShieldAlert },
        { to: "/tds", label: "TDS", icon: ClipboardList },
      ]
    },
    {
      label: "News & Events",
      links: [
        { to: "/event-stories", label: "Event Stories", icon: CalendarClock },
        { to: "/event-news", label: "Event News", icon: Newspaper },
        { to: "/award", label: "Awards", icon: Trophy },
        { to: "/blog", label: "Blogs", icon: BookOpen },
      ]
    },
    {
      label: "Resources",
      links: [
        { to: "/environment", label: "Environment", icon: Leaf },
        { to: "/familiar", label: "Familiar", icon: Users },
        { to: "/other", label: "Other", icon: FileText },
      ]
    },
    {
      label: "HR & Business",
      links: [
        { to: "/jobs", label: "Jobs", icon: Briefcase },
        { to: "/applications", label: "Job Applications", icon: UserPen },
        { to: "/inquiries", label: "Inquiries", icon: Mail },
        { to: "/dealer", label: "Dealer", icon: Store },
        { to: "/distributor", label: "Distributor", icon: Truck },
      ]
    }
  ];

  return (
    <nav className="navbar">
      <div className="sidebar-title">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Shield size={24} color="#6366f1" />
          <span>Shyam Metalics</span>
        </div>
        <button className="mobile-close" onClick={onLinkClick}>
          <X size={20} />
        </button>
      </div>

      <div className="nav-links">
        {navGroups.map((group) => (
          <React.Fragment key={group.label}>
            <div className="nav-group-label">{group.label}</div>
            {group.links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className="nav-link"
                onClick={onLinkClick}
              >
                <link.icon />
                <span>{link.label}</span>
              </NavLink>
            ))}
          </React.Fragment>
        ))}
      </div>

      <div className="nav-right">
        {role && <div className="role-badge">{role}</div>}
        {role === "admin" && (
          <>
            <NavLink to="/create-uploader" className="nav-link" onClick={onLinkClick}>
              <UserPlus size={18} />
              <span>Create Uploader</span>
            </NavLink>
            <NavLink to="/manage-users" className="nav-link" onClick={onLinkClick}>
              <UsersRound size={18} />
              <span>Manage Users</span>
            </NavLink>
            <NavLink to="/activity-logs" className="nav-link" onClick={onLinkClick}>
              <History size={18} />
              <span>Activity Logs</span>
            </NavLink>
          </>
        )}
        {getToken() ? (
          <button className="nav-link logout-btn" onClick={() => { handleLogout(); onLinkClick(); }}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        ) : (
          <NavLink to="/login" className="nav-link" onClick={onLinkClick}>
            <LogOut size={18} />
            <span>Login</span>
          </NavLink>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
