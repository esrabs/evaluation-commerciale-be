import { useEffect, useState } from "react";
import api from "../api/axios";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // form create
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [role, setRole] = useState("COMMERCIAL");

  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const loadUsers = async () => {
    setLoading(true);
    setErr("");
    try {
      const res = await api.get("/users");
      setUsers(res.data || []);
    } catch (e) {
      setErr(e?.response?.data?.error || "Erreur chargement users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const createUser = async (e) => {
    e.preventDefault();
    setErr("");
    setMsg("");

    try {
      await api.post("/users", { nom, prenom, email, motDePasse, role });

      setMsg("Utilisateur créé ✅");
      setNom("");
      setPrenom("");
      setEmail("");
      setMotDePasse("");
      setRole("COMMERCIAL");
      await loadUsers();
    } catch (e2) {
      setErr(e2?.response?.data?.error || "Erreur création user");
    }
  };

  const toggleActif = async (id, actif) => {
    setErr("");
    setMsg("");
    try {
      await api.put(`/users/${id}`, { actif });
      setMsg(actif ? "Utilisateur activé ✅" : "Utilisateur désactivé ✅");
      await loadUsers();
    } catch (e) {
      setErr(e?.response?.data?.error || "Erreur changement actif");
    }
  };

  return (
    <div className="admin-users-layout">
      {/* Create */}
      <div className="card">
        <h3>Créer un utilisateur</h3>

        <form onSubmit={createUser}>
          {/* ✅ Nom + Prénom + Rôle sur une ligne */}
          <div className="form-row">
            <input
              placeholder="Nom"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
            />

            <input
              placeholder="Prénom"
              value={prenom}
              onChange={(e) => setPrenom(e.target.value)}
            />

            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="COMMERCIAL">COMMERCIAL</option>
              <option value="GESTIONNAIRE">GESTIONNAIRE</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>

          <input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-12"
          />

          <input
            placeholder="Mot de passe"
            type="password"
            value={motDePasse}
            onChange={(e) => setMotDePasse(e.target.value)}
            className="mt-12"
          />

          <button className="btn full mt-16">Créer</button>
        </form>

        {err && <p className="error">{err}</p>}
        {msg && <p className="success-text">{msg}</p>}
      </div>

      {/* ✅ List (sous le formulaire) */}
      <div className="card mt-20">
        <div className="flex-between">
          <h3 className="no-margin">Liste users</h3>
          <button className="btn" onClick={loadUsers} disabled={loading}>
            {loading ? "..." : "Rafraîchir"}
          </button>
        </div>
        <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th className="id">ID</th>
              <th className="nom">Nom</th>
              <th className="email">Email</th>
              <th className="role">Rôle</th>
              <th className="actif">Actif</th>
              <th className="action">Action</th>
            </tr>
          </thead>

          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td className="id">{u.id}</td>

                <td className="nom">
                  {u.prenom} {u.nom}
                </td>

                <td className="email">{u.email}</td>

                <td className="role">{u.role}</td>

                <td className="actif">{String(u.actif)}</td>

                <td className="action">
                  <button className="btn" onClick={() => toggleActif(u.id, !u.actif)}>
                    {u.actif ? "Désactiver" : "Activer"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        {err && <p className="error">{err}</p>}
        {msg && <p className="success-text">{msg}</p>}
      </div>
    </div>
  );
}

