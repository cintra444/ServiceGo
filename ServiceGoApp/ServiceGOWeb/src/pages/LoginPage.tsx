import { type FormEvent, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL, ApiError } from "../services/apiClient";

export function LoginPage() {
  const { session, login } = useAuth();
  const [email, setEmail] = useState("admin@servicego.local");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (session?.token) {
    return <Navigate to="/dashboard" replace />;
  }

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await login(email.trim(), password);
    } catch (nextError) {
      setError(nextError instanceof ApiError ? nextError.message : "Falha ao entrar no ServiceGO Web.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-hero">
        <span className="eyebrow">Versão web separada</span>
        <h1>ServiceGO no navegador</h1>
        <p>
          Use a mesma API do app para acompanhar corridas, clientes, financeiro, agenda e preferências
          em uma interface própria para desktop.
        </p>
        <div className="api-chip">API atual: {API_BASE_URL}</div>
      </div>

      <form className="login-card" onSubmit={onSubmit}>
        <div>
          <span className="eyebrow">Acesso</span>
          <h2>Entrar</h2>
          <p>Entre com a mesma conta usada no aplicativo.</p>
        </div>

        <label className="field">
          <span>E-mail</span>
          <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" />
        </label>

        <label className="field">
          <span>Senha</span>
          <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" />
        </label>

        {error ? <div className="error-banner">{error}</div> : null}

        <button className="primary-button" disabled={loading} type="submit">
          {loading ? "Entrando..." : "Entrar no painel web"}
        </button>
      </form>
    </div>
  );
}
