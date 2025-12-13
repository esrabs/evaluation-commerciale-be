import { useAuth } from "../auth/AuthContext";
import VentesSquadPage from "./VentesSquadPage";
import StatsSquadPage from "./StatsSquadPage";
import MessagesPage from "./MessagesPage";

export default function ManagerDashboard() {
  const { logout } = useAuth();

  return (
    <div className="container">
      <div className="flex-between">
        <h2>Dashboard GESTIONNAIRE</h2>
        <button className="danger" onClick={logout}>
          Déconnexion
        </button>
      </div>

      <div className="mt-20">
        <VentesSquadPage />
      </div>

      <div className="mt-20">
        <StatsSquadPage />
      </div>

      <div className="mt-20">
        <MessagesPage />
      </div>
    </div>
  );
}
