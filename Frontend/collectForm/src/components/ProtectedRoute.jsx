import React from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  // Check if session token exists in localStorage
  const isAuthenticated = localStorage.getItem('adminSessionToken');

  if (!isAuthenticated) {
    // If not authenticated, redirect to the login page
    return <Navigate to="/login" replace />;
  }

  // If authenticated, render the child components (the dashboard)
  return children;
}
