import { useAuth } from "../auth/AuthContext";
import AdminPage from "./AdminPage";

export default function AdminDashboard() {
  const { logout } = useAuth();

  return (
    <div className="container">
      <div className="flex-between">
        <h2>Dashboard ADMIN</h2>
        <button onClick={logout} className="danger">
          Déconnexion
        </button>
      </div>

      <AdminPage />
    </div>
  );
}
