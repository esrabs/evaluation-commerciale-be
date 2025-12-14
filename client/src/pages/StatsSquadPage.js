import { useEffect, useState } from "react";
import api from "../api/axios";

export default function StatsSquadPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/stats/squad");
      setData(res.data);
    } catch (err) {
      setError(err?.response?.data?.error || "Erreur stats squad");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="card">
      <div className="flex-between">
        <h3 className="no-margin">Stats squad</h3>
        <button className="btn" onClick={load} disabled={loading}>
          {loading ? "..." : "Rafraîchir"}
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      {loading ? (
        <p>Chargement...</p>
      ) : !data ? (
        <p>Aucune donnée.</p>
      ) : (
        <>
          <p>
            Squad ID : <b>{data.squadId}</b>
          </p>

          {!data.classement || data.classement.length === 0 ? (
            <p>Aucun commercial / aucune vente.</p>
          ) : (
           <div className="table-wrap"> 
            <table>
              <thead>
                <tr className="table-head">
                  <th>Rang</th>
                  <th>Commercial</th>
                  <th>Nb ventes</th>
                  <th>Total</th>
                  <th>Moyenne</th>
                </tr>
              </thead>
              <tbody>
                {data.classement.map((row, idx) => (
                  <tr key={row.commercial.id} className="table-row">
                    <td>{idx + 1}</td>
                    <td>
                      {row.commercial.prenom} {row.commercial.nom}
                    </td>
                    <td>{row.nbVentes}</td>
                    <td>{Number(row.total).toFixed(2)}</td>
                    <td>{Number(row.moyenne).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
