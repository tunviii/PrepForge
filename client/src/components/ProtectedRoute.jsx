import React from "react";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ user, children }) {
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return children;
}

export default ProtectedRoute;
