import { useEffect, useState } from "react";
import api from "../api/axios";
import MessagesPage from "./MessagesPage";
import AdminUsers from "./AdminUsers";

export default function AdminPage() {
  const [tab, setTab] = useState("users"); // users | squads | classement | messages

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar card">
        <h3 className="no-top-margin">ADMIN</h3>

        <button className="btn full" onClick={() => setTab("users")} disabled={tab === "users"}>
          Users
        </button>

        <button className="btn full" onClick={() => setTab("squads")} disabled={tab === "squads"}>
          Squads
        </button>

        <button
          className="btn full"
          onClick={() => setTab("classement")}
          disabled={tab === "classement"}
        >
          Classement
        </button>

        <button
          className="btn full"
          onClick={() => setTab("messages")}
          disabled={tab === "messages"}
        >
          Messages
        </button>
      </aside>

      <main>
        {tab === "users" && <AdminUsers />}
        {tab === "squads" && <SquadsAdmin />}
        {tab === "classement" && <ClassementAdmin />}
        {tab === "messages" && <MessagesPage />}
      </main>
    </div>
  );
}

/* ===================== SQUADS ADMIN ===================== */
function SquadsAdmin() {
  const [squads, setSquads] = useState([]);
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  // create squad
  const [nomSquad, setNomSquad] = useState("");
  const [idGestionnaire, setIdGestionnaire] = useState("");

  // assign
  const [selectedSquad, setSelectedSquad] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);

  const load = async () => {
    setLoading(true);
    setErr("");
    try {
      const [sRes, uRes] = await Promise.all([api.get("/squads"), api.get("/users")]);
      setSquads(sRes.data || []);
      setUsers(uRes.data || []);
    } catch (e) {
      setErr(e?.response?.data?.error || "Erreur chargement squads/users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const createSquad = async (e) => {
    e.preventDefault();
    setErr("");
    setMsg("");

    if (!nomSquad.trim()) return setErr("nomSquad requis");

    const payload = { nomSquad: nomSquad.trim() };
    if (idGestionnaire) payload.idGestionnaire = Number(idGestionnaire);

    try {
      await api.post("/squads", payload);
      setMsg("Squad créée ✅");
      setNomSquad("");
      setIdGestionnaire("");
      await load();
    } catch (e) {
      setErr(e?.response?.data?.error || "Erreur création squad");
    }
  };

  const updateGestionnaire = async () => {
    setErr("");
    setMsg("");

    if (!selectedSquad) return setErr("Choisis une squad");
    if (!idGestionnaire) return setErr("Choisis un gestionnaire");

    try {
      await api.put(`/squads/${Number(selectedSquad)}`, {
        idGestionnaire: Number(idGestionnaire),
      });
      setMsg("Gestionnaire assigné ✅");
      await load();
    } catch (e) {
      setErr(e?.response?.data?.error || "Erreur assign gestionnaire");
    }
  };

  const affectMembers = async () => {
    setErr("");
    setMsg("");

    if (!selectedSquad) return setErr("Choisis une squad");
    if (selectedMembers.length === 0) return setErr("Choisis au moins un commercial");

    try {
      await api.put(`/squads/${Number(selectedSquad)}/members`, {
        userIds: selectedMembers,
      });
      setMsg("Membres affectés ✅");
      setSelectedMembers([]);
      await load();
    } catch (e) {
      setErr(e?.response?.data?.error || "Erreur affectation membres");
    }
  };

  const gestionnaires = users.filter((u) => u.role === "GESTIONNAIRE" && u.actif);
  const commerciaux = users.filter((u) => u.role === "COMMERCIAL" && u.actif);

  const toggleMember = (id, checked) => {
    setSelectedMembers((prev) => {
      if (checked) return prev.includes(id) ? prev : [...prev, id];
      return prev.filter((x) => x !== id);
    });
  };

  return (
    <section className="card">
      <h2 className="no-top-margin">Gestion des squads</h2>

      {/* ✅ proportions: gauche + large / droite + petite */}
      <div className="squads-grid">
        {/* LEFT */}
        <div className="card inner-card squads-form-box">
          <h3 className="no-top-margin">Créer une squad</h3>

          <form onSubmit={createSquad}>
            <div className="field">
              <label>Nom squad</label>
              <input
                placeholder="ex: Squad A"
                value={nomSquad}
                onChange={(e) => setNomSquad(e.target.value)}
              />
            </div>

            <div className="field">
              <label>Gestionnaire (optionnel)</label>
              <select value={idGestionnaire} onChange={(e) => setIdGestionnaire(e.target.value)}>
                <option value="">—</option>
                {gestionnaires.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.prenom} {g.nom} — {g.email}
                  </option>
                ))}
              </select>
            </div>

            <button className="btn full primary">Créer</button>
          </form>

          <hr className="hr" />

          <h3 className="no-top-margin">Assigner gestionnaire / membres</h3>

          <div className="field">
            <label>Squad</label>
            <select
              value={selectedSquad}
              onChange={(e) => {
                setSelectedSquad(e.target.value);
                setMsg("");
                setErr("");
                setSelectedMembers([]);
              }}
            >
              <option value="">—</option>
              {squads.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nomSquad}
                </option>
              ))}
            </select>
          </div>

          <div className="field squads-row">
            <div className="grow">
              <label>Nouveau gestionnaire</label>
              <select value={idGestionnaire} onChange={(e) => setIdGestionnaire(e.target.value)}>
                <option value="">—</option>
                {gestionnaires.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.prenom} {g.nom} — {g.email}
                  </option>
                ))}
              </select>
            </div>

            <button type="button" className="btn" onClick={updateGestionnaire}>
              Assigner
            </button>
          </div>

          <div className="field">
            <label>Membres (commerciaux)</label>

            <div className="checkbox-box">
              {commerciaux.length === 0 ? (
                <p className="no-margin muted">Aucun commercial actif.</p>
              ) : (
                commerciaux.map((c) => (
                  <label key={c.id} className="checkbox-row">
                    <input
                      type="checkbox"
                      checked={selectedMembers.includes(c.id)}
                      onChange={(e) => toggleMember(c.id, e.target.checked)}
                    />
                    <span className="checkbox-text">
                      {c.prenom} {c.nom} — {c.email}
                    </span>
                  </label>
                ))
              )}
            </div>

            <button type="button" className="btn full mt-10" onClick={affectMembers}>
              Affecter membres
            </button>
          </div>

          {msg && <p className="success-text">{msg}</p>}
          {err && <p className="error">{err}</p>}
        </div>

        {/* RIGHT */}
        <div className="card inner-card squads-list-card">
          <div className="flex-between">
            <h3 className="no-margin">Liste squads</h3>
            <button className="btn" onClick={load} disabled={loading}>
              {loading ? "..." : "Rafraîchir"}
            </button>
          </div>

          {loading ? (
            <p className="mt-10 muted">Chargement...</p>
          ) : (
            <div className="squads-list-box mt-10">
              {squads.length === 0 ? (
                <p className="muted">Aucune squad.</p>
              ) : (
                squads.map((s) => (
                  <div key={s.id} className="squad-item">
                    <div className="squad-title">
                      <b>{s.nomSquad}</b>
                      <span className="muted">#{s.id}</span>
                    </div>

                    <div className="squad-line">
                      <span className="muted">Gestionnaire :</span>{" "}
                      {s.gestionnaire ? (
                        <span>
                          {s.gestionnaire.prenom} {s.gestionnaire.nom}
                        </span>
                      ) : (
                        <span className="muted">—</span>
                      )}
                    </div>

                    <div className="squad-line">
                      <span className="muted">Membres :</span>{" "}
                      {s.membres && s.membres.length ? (
                        <span>
                          {s.membres.map((m) => `${m.prenom} ${m.nom}`).join(", ")}
                        </span>
                      ) : (
                        <span className="muted">—</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {!loading && err && <p className="error mt-10">{err}</p>}
        </div>
      </div>
    </section>
  );
}

/* ===================== CLASSEMENT ADMIN ===================== */
function ClassementAdmin() {
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [rows, setRows] = useState([]);

  const load = async () => {
    setLoading(true);
    setErr("");
    try {
      const res = await api.get(`/stats/classement?limit=${limit}`);
      setRows(res.data?.classement || []);
    } catch (e) {
      setErr(e?.response?.data?.error || "Erreur classement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []); // eslint-disable-line

  return (
    <section className="card">
      <div className="flex-between">
        <h2 className="no-top-margin">Classement global</h2>

        <div className="flex">
          <label className="muted">Top</label>
          <input
            type="number"
            min="1"
            max="50"
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
            className="input-small"
          />
          <button className="btn" onClick={load} disabled={loading}>
            {loading ? "..." : "Charger"}
          </button>
        </div>
      </div>

      {err && <p className="error">{err}</p>}

      {loading ? (
        <p className="muted">Chargement...</p>
      ) : rows.length === 0 ? (
        <p className="muted">Aucune donnée.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Rang</th>
              <th>Commercial</th>
              <th>Email</th>
              <th>Nb ventes</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.rank}>
                <td>{r.rank}</td>
                <td>
                  {r.commercial?.prenom} {r.commercial?.nom}
                </td>
                <td>{r.commercial?.email}</td>
                <td>{r.nbVentes}</td>
                <td>{Number(r.total).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
