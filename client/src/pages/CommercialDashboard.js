import { useAuth } from "../auth/AuthContext";
import VentesPage from "./VentesPage";
import MessagesPage from "./MessagesPage";

export default function CommercialDashboard() {
  const { logout } = useAuth();

  return (
    <div className="container">
      <div className="flex-between">
        <h2>Dashboard COMMERCIAL</h2>
        <button className="danger" onClick={logout}>
          Déconnexion
        </button>
      </div>

      <div className="mt-20">
        <VentesPage />
      </div>

      <div className="mt-20">
        <MessagesPage />
      </div>
    </div>
  );
}
