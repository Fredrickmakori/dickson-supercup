import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  // if no user, send to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // otherwise show the protected page
  return children;
}
