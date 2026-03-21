import { type FormEvent, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../services/apiClient";

function LoginIcon({ kind }: { kind: "mail" | "lock" }) {
  const icons = {
    mail: (
      <path
        d="M4 6.5 12 12l8-5.5M5.6 19h12.8c1.12 0 1.68 0 2.108-.218a2 2 0 0 0 .874-.874C21.6 17.48 21.6 16.92 21.6 15.8V8.2c0-1.12 0-1.68-.218-2.108a2 2 0 0 0-.874-.874C20.08 5 19.52 5 18.4 5H5.6c-1.12 0-1.68 0-2.108.218a2 2 0 0 0-.874.874C2.4 6.52 2.4 7.08 2.4 8.2v7.6c0 1.12 0 1.68.218 2.108a2 2 0 0 0 .874.874C3.92 19 4.48 19 5.6 19Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    ),
    lock: (
      <>
        <path
          d="M7.2 10.2V8.6a4.8 4.8 0 1 1 9.6 0v1.6"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <rect
          x="4.4"
          y="10.2"
          width="15.2"
          height="10.4"
          rx="2.6"
          stroke="currentColor"
          strokeWidth="1.8"
          fill="none"
        />
      </>
    ),
  };

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {icons[kind]}
    </svg>
  );
}

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
      setError(
        nextError instanceof ApiError
          ? nextError.message
          : "Falha ao entrar no ServiceGO Web.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-hero">
        <div className="login-brand-stack">
          <img className="login-logo" src="/ServiceGO.png" alt="ServiceGO" />
          <div>
            <h1>ServiceGO Web</h1>
            <p>
              Corridas, clientes, financeiro e agenda em uma experiência pensada
              para telas maiores, com leitura clara e acesso direto.
            </p>
          </div>
        </div>
      </div>

      <form className="login-card" onSubmit={onSubmit}>
        <div className="login-card-head">
          <div className="login-card-badge">SG</div>
          <div>
            <span className="eyebrow">Acesso</span>

            <p>Entre com a mesma conta usada no aplicativo.</p>
          </div>
        </div>

        <label className="field login-field">
          <span>E-mail</span>
          <div className="input-shell">
            <span className="input-icon">
              <LoginIcon kind="mail" />
            </span>
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
            />
          </div>
        </label>

        <label className="field login-field">
          <span>Senha</span>
          <div className="input-shell">
            <span className="input-icon">
              <LoginIcon kind="lock" />
            </span>
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
            />
          </div>
        </label>

        {error ? <div className="error-banner">{error}</div> : null}

        <button className="primary-button" disabled={loading} type="submit">
          {loading ? "Entrando..." : "Entrar no painel web"}
        </button>
      </form>
    </div>
  );
}
