import { useEffect, useState } from "react";
import api from "../api/axios";

export default function VentesSquadPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ventes, setVentes] = useState([]);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/ventes/squad");
      setVentes(res.data || []);
    } catch (err) {
      setError(err?.response?.data?.error || "Erreur chargement ventes squad");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const total = ventes.reduce((s, v) => s + Number(v.montant || 0), 0);

  return (
    <div className="card">
      <div className="flex-between">
        <h3 className="no-margin">Ventes de ma squad</h3>
        <button className="btn" onClick={load} disabled={loading}>
          {loading ? "..." : "Rafraîchir"}
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      <p>
        Nombre ventes : <b>{ventes.length}</b> — Total : <b>{total.toFixed(2)}</b>
      </p>

      {loading ? (
        <p>Chargement...</p>
      ) : ventes.length === 0 ? (
        <p>Aucune vente.</p>
      ) : (
        <table>
          <thead>
            <tr className="table-head">
              <th>Date</th>
              <th>Montant</th>
              <th>Commercial</th>
            </tr>
          </thead>
          <tbody>
            {ventes.map((v) => (
              <tr key={v.id} className="table-row">
                <td>{v.dateVente}</td>
                <td>{Number(v.montant).toFixed(2)}</td>
                <td>
                  {v.commercial
                    ? `${v.commercial.prenom} ${v.commercial.nom} (${v.commercial.email})`
                    : v.idCommercial}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
