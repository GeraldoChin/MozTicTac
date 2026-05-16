// ─────────────────────────────────────────────
// MOZTICTAC — Sistema de Autenticação Admin
// Inclui: AdminLogin, AdminGuard, useAdminAuth
// ─────────────────────────────────────────────
import { useState, useEffect, createContext, useContext, useCallback } from "react";

const BASE_URL = import.meta.env?.VITE_API_URL || "http://localhost:3000/api/v1";

// ── CONTEXTO ──────────────────────────────────────────────────────────────────
const AdminAuthContext = createContext(null);

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth deve ser usado dentro de AdminAuthProvider");
  return ctx;
}

// ── HELPERS ───────────────────────────────────────────────────────────────────
function salvarSessao(tokenAcesso, tokenRefresh, admin) {
  localStorage.setItem("adminToken",        tokenAcesso);
  localStorage.setItem("adminRefreshToken", tokenRefresh);
  localStorage.setItem("adminDados",        JSON.stringify(admin));
}

function limparSessao() {
  localStorage.removeItem("adminToken");
  localStorage.removeItem("adminRefreshToken");
  localStorage.removeItem("adminDados");
}

function lerSessao() {
  try {
    const token  = localStorage.getItem("adminToken");
    const dados  = localStorage.getItem("adminDados");
    if (!token || !dados) return null;

    // Verificar se o token não expirou (decode JWT sem biblioteca)
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      limparSessao();
      return null;
    }

    return { token, admin: JSON.parse(dados) };
  } catch {
    limparSessao();
    return null;
  }
}

const TIPOS_ADMIN = {
  MASTER:      { label: "Master",      cor: "#7c3aed", icone: "👑" },
  FINANCEIRO:  { label: "Financeiro",  cor: "#0369a1", icone: "💰" },
  OPERACIONAL: { label: "Operacional", cor: "#065f46", icone: "⚙️" },
  SUPORTE:     { label: "Suporte",     cor: "#92400e", icone: "🎧" },
  AUDITOR:     { label: "Auditor",     cor: "#1e3a5f", icone: "🔍" },
};

// Permissões por tipo de admin
const PERMISSOES = {
  MASTER: [
    "dashboard", "kpis", "utilizadores", "bloquear", "kyc", "produtos",
    "aprovar_produto", "pedidos", "saques", "disputas", "financeiro",
    "ajustar_saldo", "auditoria", "afiliados", "configuracoes",
  ],
  FINANCEIRO: [
    "dashboard", "kpis", "saques", "financeiro", "auditoria",
    "disputas", "afiliados",
  ],
  OPERACIONAL: [
    "dashboard", "utilizadores", "bloquear", "kyc", "produtos",
    "aprovar_produto", "pedidos", "disputas",
  ],
  SUPORTE: [
    "dashboard", "utilizadores", "kyc", "pedidos",
  ],
  AUDITOR: [
    "dashboard", "kpis", "financeiro", "auditoria", "afiliados",
  ],
};

// ── PROVIDER ──────────────────────────────────────────────────────────────────
export function AdminAuthProvider({ children }) {
  const [admin, setAdmin]           = useState(null);
  const [token, setToken]           = useState(null);
  const [carregando, setCarregando] = useState(true);

  // Inicializar sessão do localStorage
  useEffect(() => {
    const sessao = lerSessao();
    if (sessao) {
      setToken(sessao.token);
      setAdmin(sessao.admin);
    }
    setCarregando(false);
  }, []);

  const login = useCallback(async (email, senha) => {
    const resp = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha }),
    });
    const dados = await resp.json();
    if (!resp.ok) throw new Error(dados.mensagem || dados.message || "Credenciais inválidas");

    const d = dados.sucesso ? dados.dados : dados.data;
    const tokenAcesso  = d.tokenAcesso  || d.accessToken  || d.token;
    const tokenRefresh = d.tokenRefresh || d.refreshToken || "";

    // Verificar se é admin
    if (!d.admin && !d.isAdmin && !d.tipoAdmin) {
      throw new Error("Acesso negado. Esta conta não tem permissões de administrador.");
    }

    const adminInfo = {
      id:         d.usuario?.id    || d.user?.id    || d.id,
      nome:       d.usuario?.nomeCompleto || d.user?.name || d.nome || email,
      email:      d.usuario?.email || d.user?.email || email,
      tipoAdmin:  d.admin?.tipoAdmin || d.tipoAdmin || d.role || "OPERACIONAL",
      fotoPerfil: d.usuario?.fotoPerfil || d.user?.avatar || null,
    };

    salvarSessao(tokenAcesso, tokenRefresh, adminInfo);
    setToken(tokenAcesso);
    setAdmin(adminInfo);
    return adminInfo;
  }, []);

  const logout = useCallback(async () => {
    try {
      const tk = localStorage.getItem("adminToken");
      if (tk) {
        await fetch(`${BASE_URL}/auth/logout`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${tk}` },
          body: JSON.stringify({ tokenRefresh: localStorage.getItem("adminRefreshToken") }),
        });
      }
    } catch { /* silencioso */ }
    finally {
      limparSessao();
      setToken(null);
      setAdmin(null);
    }
  }, []);

  const temPermissao = useCallback((permissao) => {
    if (!admin) return false;
    const perms = PERMISSOES[admin.tipoAdmin] ?? [];
    return perms.includes(permissao);
  }, [admin]);

  const verificarAdmin = useCallback(async () => {
    const tk = localStorage.getItem("adminToken");
    if (!tk) return false;
    try {
      const resp = await fetch(`${BASE_URL}/admin/dashboard`, {
        headers: { Authorization: `Bearer ${tk}` },
      });
      return resp.ok;
    } catch {
      return false;
    }
  }, []);

  return (
    <AdminAuthContext.Provider value={{ admin, token, carregando, login, logout, temPermissao, verificarAdmin, TIPOS_ADMIN, PERMISSOES }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

// ── GUARD — Protege rotas admin ───────────────────────────────────────────────
export function AdminGuard({ children, permissao }) {
  const { admin, carregando, temPermissao } = useAdminAuth();

  if (carregando) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#f8fafc" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 40, height: 40, border: "3px solid #e2e8f0", borderTopColor: "#16a34a", borderRadius: "50%", animation: "spin 0.7s linear infinite", margin: "0 auto 12px" }} />
          <p style={{ fontSize: 13, color: "#64748b" }}>A verificar permissões...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!admin) return <AdminLogin />;

  if (permissao && !temPermissao(permissao)) {
    return <AcessoNegado permissao={permissao} tipoAdmin={admin.tipoAdmin} />;
  }

  return children;
}

// ── PÁGINA DE LOGIN ───────────────────────────────────────────────────────────
export function AdminLogin() {
  const { login } = useAdminAuth();
  const [email, setEmail]       = useState("");
  const [senha, setSenha]       = useState("");
  const [erro, setErro]         = useState(null);
  const [loading, setLoading]   = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email || !senha) { setErro("Preenche todos os campos."); return; }
    setLoading(true);
    setErro(null);
    try {
      await login(email, senha);
    } catch (err) {
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:none; } }
      `}</style>

      <div style={{ width: "100%", maxWidth: 420, animation: "fadeUp 0.4s ease" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 60, height: 60, borderRadius: 16, background: "linear-gradient(135deg, #16a34a, #15803d)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", boxShadow: "0 8px 24px rgba(22,163,74,0.35)" }}>
            <span style={{ fontSize: 28 }}>🛡️</span>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>MozTicTac Admin</h1>
          <p style={{ fontSize: 13, color: "#94a3b8", marginTop: 4 }}>Painel de Administração</p>
        </div>

        {/* Card */}
        <div style={{ background: "#fff", borderRadius: 20, padding: 32, boxShadow: "0 24px 80px rgba(0,0,0,0.3)" }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>Entrar</h2>
          <p style={{ fontSize: 13, color: "#64748b", marginBottom: 24 }}>Acesso restrito a administradores.</p>

          {erro && (
            <div style={{ padding: "10px 14px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, marginBottom: 16, display: "flex", gap: 8, alignItems: "flex-start" }}>
              <span style={{ fontSize: 14 }}>⚠️</span>
              <p style={{ fontSize: 13, color: "#dc2626", lineHeight: 1.4 }}>{erro}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@moztictac.mz"
                autoComplete="email"
                style={{ width: "100%", padding: "10px 14px", fontSize: 14, border: "1.5px solid #e2e8f0", borderRadius: 10, fontFamily: "inherit", color: "#0f172a", outline: "none", boxSizing: "border-box", transition: "border-color 0.2s" }}
                onFocus={e => e.target.style.borderColor = "#16a34a"}
                onBlur={e => e.target.style.borderColor = "#e2e8f0"}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Senha</label>
              <div style={{ position: "relative" }}>
                <input
                  type={mostrarSenha ? "text" : "password"}
                  value={senha}
                  onChange={e => setSenha(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  style={{ width: "100%", padding: "10px 40px 10px 14px", fontSize: 14, border: "1.5px solid #e2e8f0", borderRadius: 10, fontFamily: "inherit", color: "#0f172a", outline: "none", boxSizing: "border-box", transition: "border-color 0.2s" }}
                  onFocus={e => e.target.style.borderColor = "#16a34a"}
                  onBlur={e => e.target.style.borderColor = "#e2e8f0"}
                />
                <button type="button" onClick={() => setMostrarSenha(v => !v)}
                  style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#94a3b8" }}>
                  {mostrarSenha ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              style={{ padding: "12px", fontSize: 14, fontWeight: 700, background: loading ? "#e2e8f0" : "linear-gradient(135deg, #16a34a, #15803d)", color: loading ? "#94a3b8" : "#fff", border: "none", borderRadius: 10, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 4, fontFamily: "inherit", transition: "opacity 0.2s" }}>
              {loading && <div style={{ width: 16, height: 16, border: "2px solid #94a3b8", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />}
              {loading ? "A verificar..." : "Entrar no Painel"}
            </button>
          </form>

          {/* Contas de teste */}
          <div style={{ marginTop: 20, padding: "12px 14px", background: "#f8fafc", borderRadius: 10, border: "1px solid #e2e8f0" }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: 8 }}>Contas de teste</p>
            {[
              { label: "👑 Master",     email: "admin.master@moztictac.mz" },
              { label: "💰 Financeiro", email: "admin.financeiro@moztictac.mz" },
            ].map(c => (
              <button key={c.email} onClick={() => { setEmail(c.email); setSenha("12345678"); }}
                style={{ display: "block", width: "100%", textAlign: "left", padding: "6px 10px", background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "#374151", borderRadius: 6, fontFamily: "inherit" }}
                onMouseEnter={e => e.target.style.background = "#e2e8f0"}
                onMouseLeave={e => e.target.style.background = "none"}>
                {c.label} — <span style={{ color: "#94a3b8" }}>{c.email}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── PÁGINA DE ACESSO NEGADO ───────────────────────────────────────────────────
function AcessoNegado({ permissao, tipoAdmin }) {
  const { admin, logout } = useAdminAuth();
  const info = TIPOS_ADMIN[tipoAdmin] ?? { label: tipoAdmin, cor: "#64748b", icone: "🔒" };

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ textAlign: "center", maxWidth: 400 }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🚫</div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", marginBottom: 8 }}>Acesso Restrito</h2>
        <p style={{ fontSize: 14, color: "#64748b", marginBottom: 20, lineHeight: 1.6 }}>
          O teu perfil <span style={{ fontWeight: 700, color: info.cor }}>{info.icone} {info.label}</span> não tem permissão para aceder a esta área.
        </p>
        <div style={{ padding: "12px 16px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, marginBottom: 20, textAlign: "left" }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 6 }}>PERMISSÃO NECESSÁRIA</p>
          <code style={{ fontSize: 13, color: "#ef4444", background: "#fef2f2", padding: "2px 8px", borderRadius: 6 }}>{permissao}</code>
        </div>
        <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 16 }}>
          Sessão activa: <strong style={{ color: "#0f172a" }}>{admin?.nome}</strong>
        </p>
        <button onClick={logout}
          style={{ padding: "10px 24px", background: "#0f172a", color: "#fff", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
          Sair e entrar com outra conta
        </button>
      </div>
    </div>
  );
}

// ── PÁGINA DE GESTÃO DE PERMISSÕES ────────────────────────────────────────────
export function PagePermissoes() {
  const { admin, logout, temPermissao, TIPOS_ADMIN, PERMISSOES } = useAdminAuth();
  const [verificando, setVerificando] = useState(false);
  const [estadoServidor, setEstadoServidor] = useState(null);

  const { verificarAdmin } = useAdminAuth();

  async function handleVerificar() {
    setVerificando(true);
    const ok = await verificarAdmin();
    setEstadoServidor(ok);
    setVerificando(false);
  }

  const todasPermissoes = [...new Set(Object.values(PERMISSOES).flat())].sort();
  const info = TIPOS_ADMIN[admin?.tipoAdmin] ?? { label: admin?.tipoAdmin, cor: "#64748b", icone: "👤" };
  const minhasPerms = PERMISSOES[admin?.tipoAdmin] ?? [];

  return (
    <div style={{ fontFamily: "'DM Sans','Inter',system-ui,sans-serif", padding: 24, maxWidth: 900, margin: "0 auto" }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.02em" }}>Gestão de Permissões</h2>
        <p style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>Sessão activa e permissões do utilizador admin.</p>
      </div>

      {/* Card da sessão activa */}
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 24, marginBottom: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: info.cor + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>
              {info.icone}
            </div>
            <div>
              <p style={{ fontSize: 16, fontWeight: 700, color: "#0f172a" }}>{admin?.nome}</p>
              <p style={{ fontSize: 13, color: "#64748b" }}>{admin?.email}</p>
              <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99, background: info.cor + "18", color: info.cor, display: "inline-block", marginTop: 4 }}>
                {info.icone} {info.label}
              </span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={handleVerificar} disabled={verificando}
              style={{ padding: "8px 16px", fontSize: 12, fontWeight: 600, background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: 8, cursor: verificando ? "not-allowed" : "pointer", fontFamily: "inherit", color: "#374151", display: "flex", alignItems: "center", gap: 6 }}>
              {verificando
                ? <><div style={{ width: 12, height: 12, border: "2px solid #e2e8f0", borderTopColor: "#16a34a", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} /> A verificar...</>
                : "🔄 Verificar sessão"}
            </button>
            <button onClick={logout}
              style={{ padding: "8px 16px", fontSize: 12, fontWeight: 600, background: "#fef2f2", border: "1.5px solid #fecaca", borderRadius: 8, cursor: "pointer", fontFamily: "inherit", color: "#dc2626" }}>
              🚪 Terminar sessão
            </button>
          </div>
        </div>

        {estadoServidor !== null && (
          <div style={{ marginTop: 14, padding: "10px 14px", background: estadoServidor ? "#dcfce7" : "#fef2f2", border: `1px solid ${estadoServidor ? "#bbf7d0" : "#fecaca"}`, borderRadius: 10 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: estadoServidor ? "#16a34a" : "#dc2626" }}>
              {estadoServidor ? "✅ Sessão válida — servidor confirmou acesso admin." : "❌ Sessão inválida ou expirada. Faz login novamente."}
            </p>
          </div>
        )}
      </div>

      {/* Tabela de permissões */}
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, overflow: "hidden", marginBottom: 20 }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #e2e8f0" }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>Matriz de Permissões</p>
          <p style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>✅ = tem acesso · ✗ = sem acesso · <strong>Coluna verde</strong> = o teu perfil</p>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                <th style={{ padding: "10px 16px", textAlign: "left", fontWeight: 700, color: "#64748b", borderBottom: "1px solid #e2e8f0", whiteSpace: "nowrap" }}>PERMISSÃO</th>
                {Object.entries(TIPOS_ADMIN).map(([tipo, info]) => (
                  <th key={tipo} style={{ padding: "10px 14px", textAlign: "center", fontWeight: 700, color: tipo === admin?.tipoAdmin ? info.cor : "#64748b", borderBottom: "1px solid #e2e8f0", whiteSpace: "nowrap", background: tipo === admin?.tipoAdmin ? info.cor + "08" : "transparent" }}>
                    {info.icone} {info.label}
                    {tipo === admin?.tipoAdmin && <div style={{ fontSize: 9, color: info.cor }}>← você</div>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {todasPermissoes.map((perm, i) => (
                <tr key={perm} style={{ background: i % 2 === 0 ? "#fff" : "#f8fafc", borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "8px 16px", fontWeight: 500, color: "#374151" }}>
                    <code style={{ fontSize: 11, background: "#f1f5f9", padding: "2px 6px", borderRadius: 4 }}>{perm}</code>
                  </td>
                  {Object.keys(TIPOS_ADMIN).map(tipo => {
                    const temAcesso = (PERMISSOES[tipo] ?? []).includes(perm);
                    const eMeu = tipo === admin?.tipoAdmin;
                    return (
                      <td key={tipo} style={{ padding: "8px 14px", textAlign: "center", background: eMeu ? TIPOS_ADMIN[tipo].cor + "06" : "transparent" }}>
                        {temAcesso
                          ? <span style={{ color: "#16a34a", fontSize: 16, fontWeight: 700 }}>✅</span>
                          : <span style={{ color: "#e2e8f0", fontSize: 14 }}>✗</span>}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resumo do teu perfil */}
      <div style={{ background: "#fff", border: `1.5px solid ${info.cor}30`, borderRadius: 16, padding: 20 }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 12 }}>
          {info.icone} O teu perfil tem acesso a {minhasPerms.length} de {todasPermissoes.length} permissões
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {todasPermissoes.map(perm => {
            const tem = minhasPerms.includes(perm);
            return (
              <span key={perm} style={{ fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 99, background: tem ? info.cor + "15" : "#f1f5f9", color: tem ? info.cor : "#94a3b8", border: `1px solid ${tem ? info.cor + "30" : "#e2e8f0"}` }}>
                {tem ? "✓" : "✗"} {perm}
              </span>
            );
          })}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}