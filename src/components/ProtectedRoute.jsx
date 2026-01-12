import React from "react";
import { Navigate } from "react-router-dom";
import { getRole } from "../auth";

const ProtectedRoute = ({ children, allowed = ["admin"] }) => {
  const role = getRole();
  if (!role) return <Navigate to="/login" replace />;
  if (!allowed.includes(role)) return <Navigate to="/" replace />;
  return children;
};

export default ProtectedRoute;
