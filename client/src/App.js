import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import ProtectedRoute from "./auth/ProtectedRoute";

import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import ManagerDashboard from "./pages/ManagerDashboard";
import CommercialDashboard from "./pages/CommercialDashboard";

import "./App.css";

function HomeRedirect() {
  const { role } = useAuth();
  if (role === "ADMIN") return <Navigate to="/admin" replace />;
  if (role === "GESTIONNAIRE") return <Navigate to="/gestionnaire" replace />;
  if (role === "COMMERCIAL") return <Navigate to="/commercial" replace />;
  return <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/login" element={<Login />} />

          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={["ADMIN"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/gestionnaire"
            element={
              <ProtectedRoute roles={["GESTIONNAIRE"]}>
                <ManagerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/commercial"
            element={
              <ProtectedRoute roles={["COMMERCIAL"]}>
                <CommercialDashboard />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
