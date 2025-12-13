import { useEffect, useState } from "react";
import api from "../api/axios";

export default function VentesPage() {
  const [dateVente, setDateVente] = useState(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  });

  const [montant, setMontant] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [ventes, setVentes] = useState([]);

  const loadVentes = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/ventes/me");
      setVentes(res.data || []);
    } catch (err) {
      setError(err?.response?.data?.error || "Erreur chargement ventes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVentes();
  }, []);

  const onAddVente = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const montantNum = Number(montant);
    if (!dateVente) return setError("Date requise");
    if (!montant || Number.isNaN(montantNum)) return setError("Montant invalide");
    if (montantNum <= 0) return setError("Montant doit être > 0");

    setSaving(true);
    try {
      await api.post("/ventes", { dateVente, montant: montantNum });
      setSuccess("Vente ajoutée ✅");
      setMontant("");
      await loadVentes();
    } catch (err) {
      setError(err?.response?.data?.error || "Erreur ajout vente");
    } finally {
      setSaving(false);
    }
  };

  const total = ventes.reduce((sum, v) => sum + Number(v.montant || 0), 0);

  return (
    <div className="container">
      <h2>Mes ventes</h2>

      <div className="grid-2">
        {/* Formulaire */}
        <div className="card">
          <h3>Ajouter une vente</h3>

          <form onSubmit={onAddVente}>
            <div className="field">
              <label>Date</label>
              <input
                type="date"
                value={dateVente}
                onChange={(e) => setDateVente(e.target.value)}
              />
            </div>

            <div className="field">
              <label>Montant</label>
              <input
                type="number"
                step="0.01"
                value={montant}
                onChange={(e) => setMontant(e.target.value)}
                placeholder="ex: 250.50"
              />
            </div>

            {error && <p className="error">{error}</p>}
            {success && <p className="success-text">{success}</p>}

            <button disabled={saving} className="btn primary full">
              {saving ? "Ajout..." : "Ajouter"}
            </button>
          </form>
        </div>

        {/* Résumé */}
        <div className="card">
          <h3>Résumé</h3>
          <p>
            Nombre de ventes : <b>{ventes.length}</b>
          </p>
          <p>
            Total : <b>{total.toFixed(2)}</b>
          </p>
          <button onClick={loadVentes} disabled={loading} className="btn full">
            {loading ? "Chargement..." : "Rafraîchir"}
          </button>
        </div>
      </div>

      {/* Liste */}
      <div className="card mt-20">
        <h3>Historique</h3>

        {loading ? (
          <p>Chargement...</p>
        ) : ventes.length === 0 ? (
          <p>Aucune vente pour le moment.</p>
        ) : (
          <table>
            <thead>
              <tr className="table-head">
                <th>ID</th>
                <th>Date</th>
                <th>Montant</th>
              </tr>
            </thead>
            <tbody>
              {ventes.map((v) => (
                <tr key={v.id} className="table-row">
                  <td>{v.id}</td>
                  <td>{v.dateVente}</td>
                  <td>{Number(v.montant).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
