import { useState } from "react";
import api from "../api/axios";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await api.post("/auth/login", { email, motDePasse });
      const { token, user } = res.data;
      login({ token, role: user.role, id: user.id });
      navigate("/");
    } catch (err) {
      setError(err?.response?.data?.error || "Erreur login");
    }
  };

  return (
  <div className="login-page">
    <div className="login-card">
      <h2>Connexion</h2>

      <form onSubmit={onSubmit}>
        <div className="field">
          <label>Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="field">
          <label>Mot de passe</label>
          <input
            type="password"
            value={motDePasse}
            onChange={(e) => setMotDePasse(e.target.value)}
          />
        </div>

        {error && <p className="error">{error}</p>}

        <button className="btn primary full mt-16">
          Se connecter
        </button>
      </form>
    </div>
  </div>
);

}
