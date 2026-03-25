import { type FormEvent, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authApi } from "../services/api";
import { ApiError } from "../services/apiClient";

function RegisterIcon({ kind }: { kind: "user" | "mail" | "lock" }) {
  const icons = {
    user: (
      <>
        <circle cx="12" cy="8" r="3.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path d="M5.5 19a6.5 6.5 0 0 1 13 0" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
      </>
    ),
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
        <rect x="4.4" y="10.2" width="15.2" height="10.4" rx="2.6" stroke="currentColor" strokeWidth="1.8" fill="none" />
      </>
    ),
  };

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {icons[kind]}
    </svg>
  );
}

export function RegisterPage() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (session?.token) {
    return <Navigate to="/dashboard" replace />;
  }

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!name.trim() || !email.trim() || !password) {
      setError("Preencha nome, e-mail e senha.");
      return;
    }

    if (password.length < 6) {
      setError("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await authApi.register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      });
      navigate("/login", {
        replace: true,
        state: {
          registeredEmail: email.trim().toLowerCase(),
          successMessage: "Cadastro realizado com sucesso. Entre para começar seu período de teste.",
        },
      });
    } catch (nextError) {
      setError(nextError instanceof ApiError ? nextError.message : "Falha ao criar sua conta no ServiceGO Web.");
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
              Crie sua conta de motorista e comece a organizar corridas, clientes, veículos, agenda e financeiro no navegador.
            </p>
          </div>
        </div>
      </div>

      <form className="login-card" onSubmit={onSubmit}>
        <div className="login-card-head">
          <div className="login-card-badge">SG</div>
          <div>
            <span className="eyebrow">Cadastro</span>
            <p>Seu acesso já nasce como motorista com período inicial de teste.</p>
          </div>
        </div>

        <label className="field login-field">
          <span>Nome</span>
          <div className="input-shell">
            <span className="input-icon">
              <RegisterIcon kind="user" />
            </span>
            <input value={name} onChange={(event) => setName(event.target.value)} type="text" />
          </div>
        </label>

        <label className="field login-field">
          <span>E-mail</span>
          <div className="input-shell">
            <span className="input-icon">
              <RegisterIcon kind="mail" />
            </span>
            <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" />
          </div>
        </label>

        <label className="field login-field">
          <span>Senha</span>
          <div className="input-shell">
            <span className="input-icon">
              <RegisterIcon kind="lock" />
            </span>
            <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" />
          </div>
        </label>

        <p className="helper-text form-helper">Minímo de 6 caracteres. Depois você poderá alterar essa senha em Ajustes.</p>

        {error ? <div className="error-banner">{error}</div> : null}

        <div className="login-actions">
          <button className="primary-button" disabled={loading} type="submit">
            {loading ? "Criando conta..." : "Criar conta"}
          </button>
          <Link className="text-link" to="/login">
            Já tenho conta
          </Link>
        </div>
      </form>
    </div>
  );
}
