import React from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children, role }) => {
  const token = localStorage.getItem("userToken"); 
  const user = JSON.parse(localStorage.getItem("userData") || "{}");
      if (!token) return <Navigate to="/profil" replace />; 
  if (role && user.role !== role) return <Navigate to="/" replace />; 

   return children;
};

export default PrivateRoute;