import { useAuth } from "../auth/AuthContext";
import AdminPage from "./AdminPage";

export default function AdminDashboard() {
  const { logout } = useAuth();

  return (
    <div className="container">
      <div className="flex-between">
        <h2 className="no-margin">Dashboard ADMIN</h2>

        <button onClick={logout} className="btn danger">
          Déconnexion
        </button>
      </div>

      {/* ✅ Layout global admin : menu + contenu */}
      <div className="admin-shell mt-16">
        <AdminPage />
      </div>
    </div>
  );
}
