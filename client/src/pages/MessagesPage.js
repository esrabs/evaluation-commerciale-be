import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";

export default function MessagesPage() {
  const [tab, setTab] = useState("recus"); // "recus" | "envoyes"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [recus, setRecus] = useState([]);
  const [envoyes, setEnvoyes] = useState([]);

  // contacts
  const [contacts, setContacts] = useState([]);
  const [contactsLoading, setContactsLoading] = useState(false);

  // form envoyer
  const [destId, setDestId] = useState("");
  const [titre, setTitre] = useState("");
  const [contenu, setContenu] = useState("");
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState("");

  // recherche destinataire
  const [search, setSearch] = useState("");

  const loadMessages = async () => {
    setLoading(true);
    setError("");
    try {
      const [r1, r2] = await Promise.all([api.get("/messages/recus"), api.get("/messages/envoyes")]);
      setRecus(r1.data || []);
      setEnvoyes(r2.data || []);
    } catch (err) {
      setError(err?.response?.data?.error || "Erreur chargement messages");
    } finally {
      setLoading(false);
    }
  };

  const loadContacts = async () => {
    setContactsLoading(true);
    setError("");
    try {
      const res = await api.get("/users/contacts");
      setContacts(res.data || []);
    } catch (err) {
      setError(err?.response?.data?.error || "Erreur chargement contacts");
    } finally {
      setContactsLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
    loadContacts();
  }, []);

  const markAsRead = async (id) => {
    setError("");
    try {
      await api.put(`/messages/${id}/lu`);
      await loadMessages();
    } catch (err) {
      setError(err?.response?.data?.error || "Erreur marquer lu");
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const idDestinataire = Number(destId);
    if (!idDestinataire || Number.isNaN(idDestinataire)) return setError("Choisis un destinataire");
    if (!titre.trim()) return setError("Titre requis");
    if (!contenu.trim()) return setError("Contenu requis");

    setSending(true);
    try {
      await api.post("/messages", { idDestinataire, titre, contenu });
      setSuccess("Message envoyé ✅");
      setDestId("");
      setTitre("");
      setContenu("");
      await loadMessages();
      setTab("envoyes");
    } catch (err) {
      setError(err?.response?.data?.error || "Erreur envoi message");
    } finally {
      setSending(false);
    }
  };

  const list = tab === "recus" ? recus : envoyes;

  const filteredContacts = useMemo(() => {
    const q = search.trim().toLowerCase();
    const base = contacts.slice().sort((a, b) => {
      const A = `${a.prenom} ${a.nom}`.toLowerCase();
      const B = `${b.prenom} ${b.nom}`.toLowerCase();
      return A.localeCompare(B);
    });

    if (!q) return base;
    return base.filter((u) => {
      const s = `${u.prenom} ${u.nom} ${u.email} ${u.role}`.toLowerCase();
      return s.includes(q);
    });
  }, [contacts, search]);

  return (
    <div className="container">
      <h2>Messagerie</h2>

      <div className="grid-2">
        {/* Envoyer */}
        <div className="card">
          <h3>Envoyer un message</h3>

          <form onSubmit={sendMessage}>
            <div className="field">
              <label>Rechercher destinataire (optionnel)</label>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ex: selma, admin, @test.com"
              />
            </div>

            <div className="field">
              <label>Destinataire</label>
              <select
                value={destId}
                onChange={(e) => setDestId(e.target.value)}
                disabled={contactsLoading}
              >
                <option value="">
                  {contactsLoading ? "Chargement..." : "— Choisir un utilisateur —"}
                </option>
                {filteredContacts.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.prenom} {u.nom} — {u.email} ({u.role})
                  </option>
                ))}
              </select>

              <div className="help-row">
                <span className="muted">
                  {contactsLoading
                    ? "Chargement des contacts..."
                    : `${filteredContacts.length} contacts`}
                </span>

                <button
                  type="button"
                  onClick={loadContacts}
                  disabled={contactsLoading}
                  className="btn"
                >
                  Rafraîchir
                </button>
              </div>
            </div>

            <div className="field">
              <label>Titre</label>
              <input value={titre} onChange={(e) => setTitre(e.target.value)} />
            </div>

            <div className="field">
              <label>Contenu</label>
              <textarea
                value={contenu}
                onChange={(e) => setContenu(e.target.value)}
                rows={5}
              />
            </div>

            {error && <p className="error">{error}</p>}
            {success && <p className="success-text">{success}</p>}

            <button disabled={sending} className="btn primary full">
              {sending ? "Envoi..." : "Envoyer"}
            </button>
          </form>
        </div>

        {/* Boîte */}
        <div className="card">
          <div className="flex box-header">
            <h3 className="no-margin">Boîte</h3>

            <button className="btn" onClick={() => setTab("recus")} disabled={tab === "recus"}>
              Reçus
            </button>
            <button className="btn" onClick={() => setTab("envoyes")} disabled={tab === "envoyes"}>
              Envoyés
            </button>

            <button className="btn ml-auto" onClick={loadMessages} disabled={loading}>
              {loading ? "..." : "Rafraîchir"}
            </button>
          </div>

          <div className="mt-12">
            {loading ? (
              <p>Chargement...</p>
            ) : list.length === 0 ? (
              <p>Aucun message.</p>
            ) : (
              list.map((m) => (
                <div
                  key={m.id}
                  className={`message-row ${tab === "recus" && m.lu ? "is-read" : ""}`}
                >
                  <div className="message-top">
                    <div className="message-main">
                      <div className="message-title">
                        <b>{m.titre}</b>{" "}
                        {tab === "recus" && !m.lu && <span className="new">(Nouveau)</span>}
                      </div>

                      <div className="message-meta">
                        {tab === "recus"
                          ? `De: ${m.expediteur?.prenom || ""} ${m.expediteur?.nom || ""} (${m.expediteur?.email || ""})`
                          : `À: ${m.destinataire?.prenom || ""} ${m.destinataire?.nom || ""} (${m.destinataire?.email || ""})`}
                      </div>

                      <div className="message-content">{m.contenu}</div>

                      <div className="message-date">{m.dateEnvoi}</div>
                    </div>

                    {tab === "recus" && !m.lu && (
                      <button className="btn" onClick={() => markAsRead(m.id)}>
                        Marquer lu
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

