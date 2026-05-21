import { useState, useRef } from "react";
import { useUtilizador } from "../hooks/useUtilizador"; // ← hook de dados reais

// ─── Ícones SVG inline ────────────────────────────────────────────────────────
const IcoUser = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
const IcoPhone = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.67A2 2 0 012 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 8.92a16 16 0 006.17 6.17l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
  </svg>
);
const IcoMail = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M4 4h16c1.1 0 2 .9 2 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);
const IcoMapPin = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);
const IcoHome = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
  </svg>
);
const IcoEdit = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);
const IcoCamera = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);
const IcoCheck = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const IcoX = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const IcoAlert = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);
const IcoLock = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0110 0v4" />
  </svg>
);
const IcoSpin = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    style={{ animation: "spin 1s linear infinite" }}
  >
    <path d="M21 12a9 9 0 11-6.219-8.56" />
  </svg>
);
const IcoFile = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);
const IcoText = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <line x1="17" y1="10" x2="3" y2="10" />
    <line x1="21" y1="6" x2="3" y2="6" />
    <line x1="21" y1="14" x2="3" y2="14" />
    <line x1="17" y1="18" x2="3" y2="18" />
  </svg>
);

const PROVINCIAS = [
  "Cabo Delgado",
  "Gaza",
  "Inhambane",
  "Manica",
  "Maputo",
  "Nampula",
  "Niassa",
  "Sofala",
  "Tete",
  "Zambézia",
  "Maputo Cidade",
];

// ─── Calcular completude do perfil ───────────────────────────────────────────
function calcularCompletude(dados) {
  const campos = [
    "nomeCompleto",
    "email",
    "telefone",
    "provincia",
    "cidade",
    "bairro",
    "bio",
    "avatar",
  ];
  const preenchidos = campos.filter(
    (c) => dados[c] && String(dados[c]).trim() !== "",
  ).length;
  const pct = Math.round((preenchidos / campos.length) * 100);
  if (pct < 40)
    return {
      pct,
      estado: "Incompleto",
      cor: "#EF4444",
      bg: "bg-red-50",
      border: "border-red-100",
      text: "text-red-700",
    };
  if (pct < 80)
    return {
      pct,
      estado: "Básico",
      cor: "#F59E0B",
      bg: "bg-amber-50",
      border: "border-amber-100",
      text: "text-amber-700",
    };
  return {
    pct,
    estado: "Completo",
    cor: "#16a34a",
    bg: "bg-green-50",
    border: "border-green-100",
    text: "text-green-700",
  };
}

// ─── Validações ───────────────────────────────────────────────────────────────
const EMAILS_EXISTENTES = ["outro@email.com", "admin@moztictac.mz"];
const TELEFONES_EXISTENTES = ["84 000 0000", "85 111 1111"];

function validar(form) {
  const erros = {};
  if (!form.nomeCompleto?.trim() || form.nomeCompleto.trim().length < 3)
    erros.nomeCompleto = "Nome deve ter pelo menos 3 caracteres.";
  if (!form.email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
    erros.email = "Email inválido.";
  else if (EMAILS_EXISTENTES.includes(form.email.toLowerCase()))
    erros.email = "Este email já está em uso.";
  if (!form.telefone?.trim() || !/^[0-9\s\+\-]{8,15}$/.test(form.telefone))
    erros.telefone = "Telefone inválido. Ex: 84 321 4567";
  else if (TELEFONES_EXISTENTES.includes(form.telefone.trim()))
    erros.telefone = "Este número já está em uso.";
  if (form.bio && form.bio.length > 200)
    erros.bio = `Máximo 200 caracteres (${form.bio.length}/200).`;
  return erros;
}

function ehAlteracaoSensivel(original, novo) {
  return original.email !== novo.email || original.telefone !== novo.telefone;
}

// ─── Modal de confirmação sensível ───────────────────────────────────────────
function ModalConfirmacao({ campos, onConfirmar, onCancelar, salvando }) {
  const [senha, setSenha] = useState("");
  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
      onClick={onCancelar}
    >
      <div
        className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0"
            style={{ color: "#B45309" }}
          >
            <IcoLock />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">
              Confirmação necessária
            </p>
            <p className="text-xs text-gray-400">
              Alteração de dados sensíveis
            </p>
          </div>
        </div>
        <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg mb-4">
          <p className="text-xs text-amber-800 font-medium mb-1">
            Estás a alterar:
          </p>
          {campos.map((c) => (
            <p key={c} className="text-xs text-amber-700">
              • {c}
            </p>
          ))}
        </div>
        <div className="mb-4">
          <label className="text-xs font-medium text-gray-500 block mb-1">
            Confirma com a tua senha
          </label>
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="••••••••"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
          />
          <p className="text-xs text-gray-400 mt-1">
            Para fins de demonstração, qualquer senha funciona.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onCancelar}
            className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-500 bg-transparent cursor-pointer hover:border-gray-300"
          >
            Cancelar
          </button>
          <button
            onClick={() => senha.length >= 1 && onConfirmar()}
            disabled={!senha || salvando}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium border-0 transition-colors flex items-center justify-center gap-2
              ${!senha || salvando ? "bg-gray-200 text-gray-400 cursor-default" : "bg-green-600 hover:bg-green-700 text-white cursor-pointer"}`}
          >
            {salvando ? (
              <>
                <IcoSpin /> A guardar...
              </>
            ) : (
              "Confirmar"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
export function SecaoPerfil() {
  // ── Dados reais do utilizador autenticado ──
  const { utilizador, atualizarUtilizador } = useUtilizador();

  // Enquanto os dados do localStorage ainda não carregaram
  if (!utilizador) {
    return (
      <div className="flex items-center justify-center py-16 text-gray-400 text-sm gap-2">
        <IcoSpin /> A carregar perfil...
      </div>
    );
  }

  // Estado local derivado dos dados reais
  return (
    <FormularioPerfil
      utilizador={utilizador}
      atualizarUtilizador={atualizarUtilizador}
    />
  );
}

// Separado para garantir que o estado inicial só é criado depois de ter os dados
function FormularioPerfil({ utilizador, atualizarUtilizador }) {
  // Mapeia campos do backend → campos do formulário
  const dadosIniciais = {
    nomeCompleto: utilizador.nomeCompleto || utilizador.nome || "",
    email: utilizador.email || "",
    telefone: utilizador.telefone || "",
    provincia: utilizador.provincia || "",
    cidade: utilizador.cidade || "",
    bairro: utilizador.bairro || "",
    bio: utilizador.bio || "",
    avatar: utilizador.avatar || null,
    membro:
      utilizador.membro || utilizador.criadoEm
        ? new Date(utilizador.criadoEm).toLocaleDateString("pt-MZ", {
            month: "long",
            year: "numeric",
          })
        : "—",
  };

  const [dados, setDados] = useState({ ...dadosIniciais });
  const [form, setForm] = useState({ ...dadosIniciais });
  const [fotoPreview, setFotoPreview] = useState(null);
  const [editando, setEditando] = useState(false);
  const [erros, setErros] = useState({});
  const [modalSensivel, setModalSensivel] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const fileRef = useRef(null);

  const completude = calcularCompletude({
    ...dados,
    avatar: fotoPreview || dados.avatar,
  });

  const handleFoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("Foto muito grande. Máximo 5MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => setFotoPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleEditar = () => {
    setForm({ ...dados });
    setErros({});
    setEditando(true);
  };

  const handleCancelar = () => {
    setForm({ ...dados });
    setFotoPreview(null);
    setErros({});
    setEditando(false);
  };

  const handleGuardar = () => {
    const novosErros = validar(form);
    setErros(novosErros);
    if (Object.keys(novosErros).length > 0) return;

    if (ehAlteracaoSensivel(dados, form)) {
      const camposAlterados = [];
      if (dados.email !== form.email) camposAlterados.push("Email");
      if (dados.telefone !== form.telefone) camposAlterados.push("Telefone");
      setModalSensivel(camposAlterados);
      return;
    }
    confirmarGuardar();
  };

  const confirmarGuardar = () => {
    setSalvando(true);
    setTimeout(() => {
      const novosDados = { ...form, avatar: fotoPreview || dados.avatar };
      setDados(novosDados);
      // ← Persiste as alterações no localStorage para que a sidebar e outros
      //   componentes que usem useUtilizador() também reflitam as mudanças
      atualizarUtilizador({
        nomeCompleto: novosDados.nomeCompleto,
        email: novosDados.email,
        telefone: novosDados.telefone,
        provincia: novosDados.provincia,
        cidade: novosDados.cidade,
        bairro: novosDados.bairro,
        bio: novosDados.bio,
        avatar: novosDados.avatar,
      });
      setSalvando(false);
      setModalSensivel(false);
      setEditando(false);
      setSucesso(true);
      setTimeout(() => setSucesso(false), 3000);
    }, 1200);
  };

  const f = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  const iniciais = form.nomeCompleto
    ? form.nomeCompleto
        .trim()
        .split(" ")
        .map((p) => p[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  return (
    <div className="space-y-4">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <div>
          <p className="text-base font-semibold text-gray-900">Meu Perfil</p>
          <p className="text-xs text-gray-400">Membro desde {dados.membro}</p>
        </div>
        <div className="flex gap-2">
          {editando ? (
            <>
              <button
                onClick={handleCancelar}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-500 bg-transparent cursor-pointer hover:border-gray-300 transition-colors"
              >
                <IcoX /> Cancelar
              </button>
              <button
                onClick={handleGuardar}
                disabled={salvando}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border-0 transition-colors
                ${salvando ? "bg-gray-200 text-gray-400 cursor-default" : "bg-green-600 hover:bg-green-700 text-white cursor-pointer"}`}
              >
                {salvando ? (
                  <>
                    <IcoSpin /> A guardar...
                  </>
                ) : (
                  <>
                    <IcoCheck /> Guardar
                  </>
                )}
              </button>
            </>
          ) : (
            <button
              onClick={handleEditar}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-500 bg-transparent cursor-pointer hover:border-green-400 hover:text-green-600 transition-colors"
            >
              <IcoEdit /> Editar perfil
            </button>
          )}
        </div>
      </div>

      {/* Toast sucesso */}
      {sucesso && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-100 rounded-xl text-green-700 text-sm font-medium">
          <IcoCheck /> Perfil actualizado com sucesso!
        </div>
      )}

      {/* Estado do perfil */}
      <div
        className={`flex items-center justify-between p-3 rounded-xl border ${completude.bg} ${completude.border}`}
      >
        <div className="flex items-center gap-2">
          <div
            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${completude.bg} ${completude.text} border ${completude.border}`}
          >
            {completude.estado}
          </div>
          <p className="text-xs text-gray-500">
            Perfil {completude.pct}% completo
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${completude.pct}%`,
                background: completude.cor,
              }}
            />
          </div>
          <span
            className="text-xs font-semibold font-mono"
            style={{ color: completude.cor }}
          >
            {completude.pct}%
          </span>
        </div>
      </div>

      {/* Avatar + info principal */}
      <div className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-xl">
        <div className="relative flex-shrink-0">
          <div className="w-16 h-16 rounded-full overflow-hidden flex items-center justify-center bg-green-600 text-white text-xl font-bold">
            {fotoPreview ? (
              <img
                src={fotoPreview}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : dados.avatar ? (
              <img
                src={dados.avatar}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <span>{iniciais}</span>
            )}
          </div>
          {editando && (
            <>
              <button
                onClick={() => fileRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-green-600 border-2 border-white flex items-center justify-center cursor-pointer text-white hover:bg-green-700 transition-colors"
                title="Alterar foto"
              >
                <IcoCamera />
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFoto}
              />
            </>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-base font-semibold text-gray-900 truncate">
            {form.nomeCompleto || "—"}
          </p>
          <p className="text-xs text-gray-400 mt-0.5 truncate">
            {form.email || "—"}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {[form.cidade, form.provincia].filter(Boolean).join(", ") || "—"}
          </p>
          {editando && (
            <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
              <IcoFile /> JPG ou PNG, máx. 5MB
            </p>
          )}
        </div>
      </div>

      {/* Campos do formulário */}
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <p className="text-sm font-semibold text-gray-800">
            Informações pessoais
          </p>
        </div>
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            {
              label: "Nome completo",
              key: "nomeCompleto",
              type: "text",
              Ico: IcoUser,
              placeholder: "Ex: Ana Machava",
            },
            {
              label: "Telefone",
              key: "telefone",
              type: "tel",
              Ico: IcoPhone,
              placeholder: "Ex: 84 321 4567",
            },
            {
              label: "Email",
              key: "email",
              type: "email",
              Ico: IcoMail,
              placeholder: "Ex: ana@email.com",
              sensivel: true,
            },
            {
              label: "Província",
              key: "provincia",
              type: "select",
              Ico: IcoMapPin,
              placeholder: "",
            },
            {
              label: "Cidade",
              key: "cidade",
              type: "text",
              Ico: IcoHome,
              placeholder: "Ex: Beira",
            },
            {
              label: "Bairro",
              key: "bairro",
              type: "text",
              Ico: IcoMapPin,
              placeholder: "Ex: Chaimite",
            },
          ].map(({ label, key, type, Ico, placeholder, sensivel }) => (
            <div key={key}>
              <label className="text-xs font-medium text-gray-500 block mb-1 flex items-center gap-1">
                {label}
                {sensivel && (
                  <span className="text-xs text-amber-500 flex items-center gap-0.5">
                    <IcoLock /> sensível
                  </span>
                )}
              </label>
              {editando ? (
                <div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                      <Ico />
                    </span>
                    {type === "select" ? (
                      <select
                        value={form[key]}
                        onChange={(e) => f(key, e.target.value)}
                        className={`w-full border rounded-lg pl-8 pr-3 py-2 text-sm focus:outline-none transition-colors appearance-none
                          ${erros[key] ? "border-red-400 focus:border-red-500" : "border-gray-200 focus:border-green-500"}`}
                      >
                        <option value="">Seleccionar...</option>
                        {PROVINCIAS.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={type}
                        value={form[key]}
                        onChange={(e) => f(key, e.target.value)}
                        placeholder={placeholder}
                        className={`w-full border rounded-lg pl-8 pr-3 py-2 text-sm focus:outline-none transition-colors
                          ${erros[key] ? "border-red-400 focus:border-red-500" : "border-gray-200 focus:border-green-500"}`}
                      />
                    )}
                  </div>
                  {erros[key] && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <IcoAlert /> {erros[key]}
                    </p>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                  <span className="text-gray-400 flex-shrink-0">
                    <Ico />
                  </span>
                  <p className="text-sm text-gray-800">
                    {dados[key] || (
                      <span className="text-gray-400 italic text-xs">
                        Não preenchido
                      </span>
                    )}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Biografia */}
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
            <IcoText /> Biografia
          </p>
          {editando && (
            <span
              className={`text-xs font-mono ${form.bio?.length > 200 ? "text-red-500" : "text-gray-400"}`}
            >
              {form.bio?.length || 0}/200
            </span>
          )}
        </div>
        <div className="p-4">
          {editando ? (
            <div>
              <textarea
                value={form.bio}
                onChange={(e) => f("bio", e.target.value)}
                placeholder="Descreve-te: o que vendes, onde estás, o que te distingue..."
                rows={3}
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none resize-none transition-colors
                  ${erros.bio ? "border-red-400 focus:border-red-500" : "border-gray-200 focus:border-green-500"}`}
              />
              {erros.bio && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <IcoAlert /> {erros.bio}
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-700 leading-relaxed">
              {dados.bio || (
                <span className="text-gray-400 italic text-xs">
                  Sem biografia. Adiciona uma para ganhar mais confiança dos
                  compradores.
                </span>
              )}
            </p>
          )}
        </div>
      </div>

      {/* Dica de completude */}
      {completude.pct < 100 && !editando && (
        <div className="flex gap-3 p-3 bg-blue-50 border border-blue-100 rounded-xl items-start">
          <div className="flex-shrink-0 mt-0.5 text-blue-600">
            <IcoAlert />
          </div>
          <div>
            <p className="text-xs font-semibold text-blue-800">
              Completa o teu perfil
            </p>
            <p className="text-xs text-blue-700 mt-0.5">
              Perfis completos têm <strong>3× mais visibilidade</strong> na
              plataforma e transmitem mais confiança aos compradores.
            </p>
            <button
              onClick={handleEditar}
              className="mt-2 text-xs text-blue-700 font-semibold underline underline-offset-2 border-0 bg-transparent cursor-pointer p-0 hover:text-blue-900"
            >
              Completar agora →
            </button>
          </div>
        </div>
      )}

      {/* Modal confirmação campos sensíveis */}
      {modalSensivel && (
        <ModalConfirmacao
          campos={modalSensivel}
          onConfirmar={confirmarGuardar}
          onCancelar={() => setModalSensivel(false)}
          salvando={salvando}
        />
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
        * { box-sizing: border-box; }
        input, select, textarea, button { font-family: inherit; }
        select { background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 10px center; padding-right: 30px !important; }
      `}</style>
    </div>
  );
}

export default SecaoPerfil;
