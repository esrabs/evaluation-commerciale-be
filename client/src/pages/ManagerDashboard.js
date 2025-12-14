import { useAuth } from "../auth/AuthContext";
import MessagesPage from "./MessagesPage";
import VentesSquadPage from "./VentesSquadPage";
import StatsSquadPage from "./StatsSquadPage";

export default function GestionnaireDashboard() {
  const { logout } = useAuth();

  return (
    <div className="container">
      <div className="page-header">
        <h2 className="page-title">Dashboard GESTIONNAIRE</h2>
        <button className="btn danger" onClick={logout}>Déconnexion</button>
      </div>

      {/* 🔹 GRILLE IDENTIQUE AU COMMERCIAL */}
      <div className="dashboard-grid">
        {/* COLONNE GAUCHE */}
        <VentesSquadPage />

        {/* COLONNE DROITE */}
        <StatsSquadPage />

        {/* 🔹 MESSAGERIE EN PLEINE LARGEUR */}
        <div className="dashboard-full">
          <h3 className="section-title">Messagerie</h3>
          <MessagesPage />
        </div>
      </div>
    </div>
  );
}

