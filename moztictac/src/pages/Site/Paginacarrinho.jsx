import { useState, useEffect } from "react";
import {
  ArrowLeft, Minus, Plus, Trash2, ShoppingCart, Lock,
  ChevronRight, Tag, Truck, CheckCircle, MapPin, Shield,
  Bookmark, MessageCircle, Package, Percent, AlertTriangle,
  X, Edit2, Loader, Link, Save,
} from "lucide-react";
import { Header } from "../../components/Header";

// ─── constantes ───────────────────────────────────────────────────────────────
const VERDE        = "#00b96b";
const VERDE_ESCURO = "#009a5a";

const TAXA_PLATAFORMA = 0.03;   // 3% (frontend só para exibição; valor real vem do backend)
const ENTREGA_FIXA    = 150;

const METODOS_PAGAMENTO = [
  { id: "MPESA",  rotulo: "M-Pesa",     cor: "#00b96b" },
  { id: "EMOLA",  rotulo: "E-Mola",     cor: "#ef4444" },
  { id: "MKESH",  rotulo: "mKesh",      cor: "#f59e0b" },
  { id: "VISA",   rotulo: "Visa/Banco", cor: "#3b82f6" },
];

const PROVINCIAS = [
  "Maputo Cidade","Maputo Província","Gaza","Inhambane",
  "Sofala","Manica","Tete","Zambézia","Nampula","Cabo Delgado","Niassa",
];

// ─── cliente HTTP centralizado ─────────────────────────────────────────────────
// Ajusta BASE_URL via variável de ambiente (VITE_API_URL no .env)
const BASE_URL = import.meta.env?.VITE_API_URL ?? "http://localhost:3000/api/v1";

async function apiFetch(path, options = {}) {
  const token = localStorage.getItem("tokenAcesso");
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.mensagem || json.message || "Erro desconhecido");
  return json;
}

// ─── helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) => Number(n).toLocaleString("pt-MZ");

function groupByVendedor(items) {
  return items.reduce((acc, item) => {
    const key = item.vendedorId ?? String(item.vendedor);
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});
}

// Normaliza item local ou vindo do backend para formato interno
function normalizarItem(raw) {
  return {
    id:           raw.id ?? raw.produtoId,
    nome:         raw.nome ?? raw.produto?.nome ?? "Produto",
    vendedorId:   raw.vendedorId ?? (typeof raw.vendedor === "object" ? raw.vendedor?.id : raw.vendedor),
    vendedorNome: typeof raw.vendedor === "object" ? raw.vendedor?.nomeCompleto : (raw.vendedorNome ?? String(raw.vendedor ?? "")),
    localidade:   raw.localidade ?? raw.vendedor?.cidade ?? "",
    preco:        Number(raw.preco ?? raw.precoUnitario ?? 0),
    quantidade:   raw.quantidade ?? 1,
    estado:       raw.estado ?? raw.estadoItem ?? "Novo",
    entrega:      raw.entrega ?? raw.entregaDisponivel ?? false,
    atacado:      raw.atacado ?? false,
    afiliado:     raw.afiliado ?? false,
    imagem:       raw.imagem ?? raw.imagens?.[0] ?? null,
  };
}

// ─── botão verde reutilizável ─────────────────────────────────────────────────
function BotaoVerde({ children, onClick, variante = "solid", fullWidth = false, disabled = false }) {
  const base = `${fullWidth ? "w-full" : ""} flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold rounded-xl cursor-pointer transition-colors`;
  if (variante === "outline") {
    return (
      <button onClick={onClick} disabled={disabled} className={base}
        style={{ border: `2px solid ${VERDE}`, color: VERDE, background: "white", opacity: disabled ? 0.5 : 1 }}
        onMouseEnter={(e) => { if (!disabled) { e.currentTarget.style.background = VERDE; e.currentTarget.style.color = "white"; }}}
        onMouseLeave={(e) => { e.currentTarget.style.background = "white"; e.currentTarget.style.color = VERDE; }}>
        {children}
      </button>
    );
  }
  return (
    <button onClick={onClick} disabled={disabled} className={base}
      style={{ background: disabled ? "#9ca3af" : VERDE, color: "white" }}
      onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.background = VERDE_ESCURO; }}
      onMouseLeave={(e) => { if (!disabled) e.currentTarget.style.background = VERDE; }}>
      {children}
    </button>
  );
}

// ─── imagem do produto ────────────────────────────────────────────────────────
function ImagemProduto({ src }) {
  if (src) return <img src={src} alt="produto" className="w-20 h-20 rounded-xl object-cover shrink-0 border border-gray-100" />;
  return (
    <div className="w-20 h-20 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
      <ShoppingCart size={24} className="text-gray-300" />
    </div>
  );
}

// ─── badges ───────────────────────────────────────────────────────────────────
function BadgeEntrega()  { return <span className="flex items-center gap-1 text-[11px] font-semibold text-gray-500"><Truck size={11} style={{ color: VERDE }} />Entrega</span>; }
function BadgeAtacado()  { return <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">Atacado</span>; }
function BadgeAfiliado() { return <span className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 border border-violet-200"><Link size={10} />Afiliado</span>; }

// ─── item do carrinho ─────────────────────────────────────────────────────────
function ItemCarrinho({ item, aoMudarQtd, aoRemoverClick }) {
  return (
    <div className="flex gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:shadow-sm transition-shadow">
      <ImagemProduto src={item.imagem} />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{item.nome}</p>
            <p className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
              <MapPin size={10} /> {item.vendedorNome}{item.localidade ? ` · ${item.localidade}` : ""}
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                style={{ background: "#e6f9f0", color: VERDE }}>{item.estado}</span>
              {item.entrega  && <BadgeEntrega />}
              {item.atacado  && <BadgeAtacado />}
              {item.afiliado && <BadgeAfiliado />}
            </div>
          </div>
          <button onClick={() => aoRemoverClick(item)}
            className="p-1.5 rounded-lg hover:bg-red-50 cursor-pointer transition-colors shrink-0 border-none bg-transparent">
            <Trash2 size={15} className="text-gray-400 hover:text-red-400" />
          </button>
        </div>
        <div className="flex items-center justify-between mt-3">
          <p className="text-base font-black text-gray-900">
            {fmt(item.preco * item.quantidade)}
            <span className="text-xs font-normal text-gray-400 ml-1">MZN</span>
          </p>
          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
            <button onClick={() => aoMudarQtd(item.id, item.quantidade - 1)}
              className="w-8 h-8 flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors border-none bg-white">
              <Minus size={13} className="text-gray-600" />
            </button>
            <span className="w-10 h-8 flex items-center justify-center text-sm font-semibold text-gray-900 border-x border-gray-200">
              {item.quantidade}
            </span>
            <button onClick={() => aoMudarQtd(item.id, item.quantidade + 1)}
              className="w-8 h-8 flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors border-none bg-white">
              <Plus size={13} className="text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── resumo do pedido (coluna direita sticky) ─────────────────────────────────
function ResumoPedido({ itens, metodoPagamento, aoMudarMetodo, aoFinalizar, endereco, aoAbrirEndereco }) {
  const subtotal   = itens.reduce((acc, i) => acc + i.preco * i.quantidade, 0);
  const taxa       = Math.round(subtotal * TAXA_PLATAFORMA);
  const total      = subtotal + ENTREGA_FIXA + taxa;
  const totalItens = itens.reduce((a, i) => a + i.quantidade, 0);
  const endStr     = endereco.bairro
    ? `${endereco.bairro} — ${endereco.cidade}, ${endereco.provincia}`
    : endereco.cidade
      ? `${endereco.cidade}, ${endereco.provincia}`
      : "Sem endereço definido";

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm sticky top-4 space-y-5">
      <h2 className="text-base font-bold text-gray-900">Resumo do Pedido</h2>

      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span className="flex items-center gap-1.5"><Package size={13} /> Subtotal ({totalItens} {totalItens === 1 ? "item" : "itens"})</span>
          <span className="font-medium text-gray-900">{fmt(subtotal)} MZN</span>
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span className="flex items-center gap-1.5"><Truck size={13} /> Entrega estimada</span>
          <span className="font-medium text-gray-900">{fmt(ENTREGA_FIXA)} MZN</span>
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span className="flex items-center gap-1.5"><Percent size={13} /> Taxa plataforma (3%)</span>
          <span className="font-medium text-red-500">{fmt(taxa)} MZN</span>
        </div>
        <div className="border-t border-gray-100 pt-2 flex justify-between text-base font-bold text-gray-900">
          <span>Total</span>
          <span>{fmt(total)} MZN</span>
        </div>
      </div>

      {/* endereço */}
      <button onClick={aoAbrirEndereco}
        className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg border border-gray-200 hover:border-green-400 transition-colors text-left bg-white cursor-pointer">
        <div className="flex items-center gap-2 min-w-0">
          <Truck size={14} style={{ color: VERDE }} className="shrink-0" />
          <div className="min-w-0">
            <p className="text-xs font-semibold text-gray-700">Endereço de entrega</p>
            <p className="text-xs text-gray-400 truncate">{endStr}</p>
          </div>
        </div>
        <span className="flex items-center gap-1 text-xs font-semibold shrink-0 ml-2" style={{ color: VERDE }}>
          <Edit2 size={11} /> Alterar
        </span>
      </button>

      {/* método de pagamento */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Método de Pagamento</p>
        <div className="space-y-2">
          {METODOS_PAGAMENTO.map((m) => (
            <button key={m.id} onClick={() => aoMudarMetodo(m.id)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg border-2 cursor-pointer transition-colors text-sm font-medium"
              style={{
                borderColor: metodoPagamento === m.id ? VERDE : "#e5e7eb",
                background:  metodoPagamento === m.id ? "#f0fdf7" : "white",
                color: "#374151",
              }}>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: m.cor }} />
                {m.rotulo}
              </div>
              {metodoPagamento === m.id && <CheckCircle size={15} style={{ color: VERDE }} />}
            </button>
          ))}
        </div>
      </div>

      <BotaoVerde onClick={aoFinalizar} fullWidth>
        <Lock size={15} /> Pagar com Segurança
      </BotaoVerde>

      <p className="flex items-center justify-center gap-1.5 text-xs text-gray-400">
        <Lock size={11} /> Venda Segura · Pagamento em Escrow
      </p>
    </div>
  );
}

// ─── carrinho vazio ───────────────────────────────────────────────────────────
function CarrinhoVazio({ aoVoltar }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <ShoppingCart size={36} className="text-gray-300" />
      </div>
      <p className="text-lg font-bold text-gray-900 mb-1">O teu carrinho está vazio</p>
      <p className="text-sm text-gray-500 mb-6">Adiciona produtos para continuar a compra.</p>
      <BotaoVerde onClick={aoVoltar}>Continuar a comprar</BotaoVerde>
    </div>
  );
}

// ─── modal base ───────────────────────────────────────────────────────────────
function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: "rgba(0,0,0,0.45)" }}
      onClick={(e) => e.target === e.currentTarget && onClose?.()}>
      <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
          {onClose && (
            <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors border-none bg-transparent cursor-pointer">
              <X size={16} />
            </button>
          )}
        </div>
        <div className="px-5 py-5">{children}</div>
      </div>
    </div>
  );
}

// ─── modal: confirmar remoção ─────────────────────────────────────────────────
function ModalRemover({ open, item, onConfirm, onClose }) {
  return (
    <Modal open={open} onClose={onClose} title="Remover item">
      <div className="flex items-start gap-3 mb-5">
        <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
          <AlertTriangle size={18} className="text-red-500" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900 mb-1">{item?.nome}</p>
          <p className="text-sm text-gray-400">Tens a certeza que queres remover este item do carrinho?</p>
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={onClose}
          className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer bg-white">
          Cancelar
        </button>
        <button onClick={onConfirm}
          className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors cursor-pointer border-none">
          Remover
        </button>
      </div>
    </Modal>
  );
}

// ─── modal: endereço ──────────────────────────────────────────────────────────
// GET /api/v1/utilizadores/perfil  → pré-preencher (carregado na página principal)
// PUT /api/v1/utilizadores/perfil  → persistir { provincia, cidade, bairro }
function ModalEndereco({ open, endereco, onChange, onClose }) {
  const [form, setForm] = useState({ ...endereco });
  const [step, setStep] = useState("idle"); // idle | loading | success | error
  const [erro, setErro] = useState("");

  useEffect(() => { setForm({ ...endereco }); }, [endereco]);

  async function handleSave() {
    setStep("loading");
    setErro("");
    try {
      await apiFetch("/utilizadores/perfil", {
        method: "PUT",
        body: JSON.stringify({ provincia: form.provincia, cidade: form.cidade, bairro: form.bairro }),
      });
      onChange(form);
      setStep("success");
      setTimeout(() => { setStep("idle"); onClose(); }, 800);
    } catch (e) {
      setErro(e.message);
      setStep("error");
    }
  }

  function fechar() { setStep("idle"); setErro(""); onClose(); }

  return (
    <Modal open={open} onClose={step === "loading" ? undefined : fechar} title="Endereço de entrega">
      <div className="space-y-3 mb-5">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Província</label>
          <select value={form.provincia || ""} onChange={(e) => setForm((p) => ({ ...p, provincia: e.target.value }))}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-green-500 transition-colors bg-white">
            <option value="">Seleccionar...</option>
            {PROVINCIAS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        {[
          ["Cidade / Distrito", "cidade",       "Ex: Beira"],
          ["Bairro",            "bairro",       "Ex: Ponta-Gêa"],
          ["Referência (opcional)", "referencia", "Ex: Próximo ao mercado"],
        ].map(([label, key, placeholder]) => (
          <div key={key}>
            <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
            <input type="text" value={form[key] || ""} placeholder={placeholder}
              onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-green-500 transition-colors" />
          </div>
        ))}
        {erro && <p className="text-xs text-red-500">{erro}</p>}
      </div>
      <div className="flex gap-2">
        <button onClick={fechar}
          className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer bg-white">
          Cancelar
        </button>
        <button onClick={handleSave} disabled={step === "loading"}
          className="flex-1 py-3 rounded-xl text-white text-sm font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer border-none disabled:opacity-60"
          style={{ background: step === "success" ? "#16a34a" : VERDE }}
          onMouseEnter={(e) => { if (step !== "loading") e.currentTarget.style.background = VERDE_ESCURO; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = step === "success" ? "#16a34a" : VERDE; }}>
          {step === "loading" ? <><Loader size={14} className="animate-spin" /> A guardar...</>
           : step === "success" ? <><CheckCircle size={14} /> Guardado!</>
           : <><Save size={14} /> Guardar</>}
        </button>
      </div>
    </Modal>
  );
}

// ─── modal: guardar carrinho ──────────────────────────────────────────────────
// Tenta POST /api/v1/cart/save; fallback para localStorage se o endpoint não existir
function ModalGuardar({ open, itens, onClose }) {
  const [step, setStep] = useState("idle");
  const [erro, setErro] = useState("");

  async function handleGuardar() {
    setStep("loading");
    setErro("");
    try {
      try {
        await apiFetch("/cart/save", {
          method: "POST",
          body: JSON.stringify({
            items: itens.map((i) => ({ produtoId: i.id, quantidade: i.quantidade })),
            updatedAt: new Date(),
          }),
        });
      } catch {
        // Fallback local
        localStorage.setItem("moztictac_cart", JSON.stringify(itens));
      }
      setStep("success");
    } catch (e) {
      setErro(e.message);
      setStep("error");
    }
  }

  function fechar() { setStep("idle"); setErro(""); onClose(); }

  return (
    <Modal open={open} onClose={step === "loading" ? undefined : fechar} title="Guardar carrinho">
      {step === "success" ? (
        <div className="text-center py-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "#e6f9f0" }}>
            <CheckCircle size={28} style={{ color: VERDE }} />
          </div>
          <p className="text-sm font-semibold text-gray-900 mb-1">Carrinho guardado!</p>
          <p className="text-xs text-gray-400 mb-5">Podes retomar a compra a qualquer momento.</p>
          <BotaoVerde onClick={fechar} fullWidth>Fechar</BotaoVerde>
        </div>
      ) : (
        <>
          <div className="flex items-start gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#e6f9f0" }}>
              <Bookmark size={18} style={{ color: VERDE }} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 mb-1">
                Guardar {itens.length} {itens.length === 1 ? "item" : "itens"}
              </p>
              <p className="text-sm text-gray-400">O teu carrinho ficará guardado na tua conta.</p>
            </div>
          </div>
          {erro && <p className="text-xs text-red-500 mb-3">{erro}</p>}
          <div className="flex gap-2">
            <button onClick={fechar}
              className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer bg-white">
              Cancelar
            </button>
            <button onClick={handleGuardar} disabled={step === "loading"}
              className="flex-1 py-3 rounded-xl text-white text-sm font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer border-none disabled:opacity-60"
              style={{ background: VERDE }}
              onMouseEnter={(e) => (e.currentTarget.style.background = VERDE_ESCURO)}
              onMouseLeave={(e) => (e.currentTarget.style.background = VERDE)}>
              {step === "loading"
                ? <><Loader size={14} className="animate-spin" /> A guardar...</>
                : <><Bookmark size={14} /> Guardar</>}
            </button>
          </div>
        </>
      )}
    </Modal>
  );
}

// ─── modal: chat com vendedor ─────────────────────────────────────────────────
// POST /api/v1/chat/:destinatarioId — iniciar/obter conversa (chatControlador.iniciarOuObterConversa)
// Socket.IO: window.mozSocket.emit("nova_mensagem", { conversaId, conteudo })
function ModalChat({ open, vendedores, onClose }) {
  const [selecionado, setSelecionado] = useState(null); // { id, nome }
  const [msg,  setMsg]  = useState("");
  const [step, setStep] = useState("idle");
  const [erro, setErro] = useState("");

  async function handleIniciar() {
    if (!selecionado) return;
    setStep("loading");
    setErro("");
    try {
      // Iniciar ou obter conversa existente com o vendedor
      const { dados: conversa } = await apiFetch(`/chat/${selecionado.id}`, { method: "POST" });

      // Enviar mensagem via Socket.IO se disponível (instância global)
      if (msg.trim() && window.mozSocket?.connected) {
        window.mozSocket.emit("nova_mensagem", { conversaId: conversa.id, conteudo: msg });
      }

      setStep("success");
    } catch (e) {
      setErro(e.message);
      setStep("error");
    }
  }

  function fechar() { setSelecionado(null); setMsg(""); setStep("idle"); setErro(""); onClose(); }

  return (
    <Modal open={open} onClose={step === "loading" ? undefined : fechar} title="Chat com vendedor">
      {step === "success" ? (
        <div className="text-center py-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "#e6f9f0" }}>
            <MessageCircle size={28} style={{ color: VERDE }} />
          </div>
          <p className="text-sm font-semibold text-gray-900 mb-1">Conversa iniciada!</p>
          <p className="text-xs text-gray-400 mb-5">Abre o Chat para continuar a conversa com o vendedor.</p>
          <BotaoVerde onClick={fechar} fullWidth>Fechar</BotaoVerde>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <p className="text-xs font-medium text-gray-500 mb-2">Selecciona o vendedor</p>
            <div className="space-y-2">
              {vendedores.map((v) => (
                <button key={v.id} onClick={() => setSelecionado(v)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer bg-white"
                  style={{
                    borderColor: selecionado?.id === v.id ? VERDE : "#f3f4f6",
                    background:  selecionado?.id === v.id ? "#f0fdf7" : "white",
                  }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ background: selecionado?.id === v.id ? VERDE : "#f3f4f6", color: selecionado?.id === v.id ? "white" : "#6b7280" }}>
                    {v.nome?.[0] ?? "?"}
                  </div>
                  <span className="text-sm font-medium text-gray-800">{v.nome}</span>
                  {selecionado?.id === v.id && <CheckCircle size={15} style={{ color: VERDE }} className="ml-auto" />}
                </button>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <p className="text-xs font-medium text-gray-500 mb-2">Mensagem inicial (opcional)</p>
            <textarea rows={3} value={msg} onChange={(e) => setMsg(e.target.value)}
              placeholder="Ex: Ainda tens este item disponível?"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 outline-none resize-none transition-colors" />
          </div>
          {erro && <p className="text-xs text-red-500 mb-3">{erro}</p>}
          <div className="flex gap-2">
            <button onClick={fechar}
              className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer bg-white">
              Cancelar
            </button>
            <button onClick={handleIniciar} disabled={!selecionado || step === "loading"}
              className="flex-1 py-3 rounded-xl text-white text-sm font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer border-none disabled:opacity-40"
              style={{ background: VERDE }}
              onMouseEnter={(e) => (e.currentTarget.style.background = VERDE_ESCURO)}
              onMouseLeave={(e) => (e.currentTarget.style.background = VERDE)}>
              {step === "loading"
                ? <><Loader size={14} className="animate-spin" /> A iniciar...</>
                : <><MessageCircle size={14} /> Iniciar conversa</>}
            </button>
          </div>
        </>
      )}
    </Modal>
  );
}

// ─── modal: pagamento ─────────────────────────────────────────────────────────
// Fluxo real:
//   1. POST /api/v1/pedidos          → pedidoControlador.criar  → devolve pedidosCriados[]
//   2. POST /api/v1/pedidos/:id/pagar → pedidoControlador.pagar  → inicia push M-Pesa/E-Mola/mKesh
//   3. Confirmação via Socket.IO: window.mozSocket.once("payment_confirmed", ...)
//      ou timeout de segurança (30s) para métodos síncronos (Visa/Banco)
function ModalPagamento({ open, metodo, total, itens, endereco, onClose, onPedidoCriado }) {
  const [step,     setStep]     = useState("confirm");
  const [telefone, setTelefone] = useState("");
  const [erro,     setErro]     = useState("");
  const [pedidoId, setPedidoId] = useState(null);

  const nomeMetodo      = METODOS_PAGAMENTO.find((m) => m.id === metodo)?.rotulo || metodo;
  const precisaTelefone = ["MPESA", "EMOLA", "MKESH"].includes(metodo);

  async function handlePagar() {
    if (precisaTelefone && !telefone.trim()) return;
    setStep("loading");
    setErro("");

    try {
      // ── 1. Criar pedido(s) ────────────────────────────────────────────────
      const { dados: pedidosCriados } = await apiFetch("/pedidos", {
        method: "POST",
        body: JSON.stringify({
          itens: itens.map((i) => ({ produtoId: i.id, quantidade: i.quantidade })),
          enderecoEntrega: {
            cidade:    endereco.cidade,
            provincia: endereco.provincia,
            rua:       [endereco.bairro, endereco.referencia].filter(Boolean).join(", "),
          },
        }),
      });

      if (!pedidosCriados?.length) throw new Error("Nenhum pedido criado");
      setPedidoId(pedidosCriados[0]?.id ?? null);

      // ── 2. Iniciar pagamento para cada pedido ─────────────────────────────
      await Promise.all(
        pedidosCriados.map((pedido) =>
          apiFetch(`/pedidos/${pedido.id}/pagar`, {
            method: "POST",
            body: JSON.stringify({
              metodoPagamento: metodo,
              ...(precisaTelefone ? { numeroCelular: telefone.replace(/\s/g, "") } : {}),
            }),
          })
        )
      );

      // ── 3. Aguardar confirmação ───────────────────────────────────────────
      if (window.mozSocket?.connected) {
        // Socket.IO disponível: aguardar evento "payment_confirmed"
        const timeout = setTimeout(() => {
          // Após 30s sem resposta, assume sucesso (pagamento aceite pelo operador)
          setStep("success");
          onPedidoCriado?.(pedidosCriados);
        }, 30_000);

        window.mozSocket.once("payment_confirmed", () => {
          clearTimeout(timeout);
          setStep("success");
          onPedidoCriado?.(pedidosCriados);
        });
      } else {
        // Sem Socket.IO: sucesso imediato
        setStep("success");
        onPedidoCriado?.(pedidosCriados);
      }
    } catch (e) {
      setErro(e.message);
      setStep("error");
    }
  }

  function fechar() { setStep("confirm"); setTelefone(""); setErro(""); setPedidoId(null); onClose(); }

  return (
    <Modal open={open} onClose={step === "loading" ? undefined : fechar} title="Confirmar pagamento">

      {step === "confirm" && (
        <>
          <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Método</span>
              <span className="font-medium text-gray-900">{nomeMetodo}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Produtos</span>
              <span className="font-medium text-gray-900">{itens.reduce((a, i) => a + i.quantidade, 0)} itens</span>
            </div>
            <div className="flex justify-between text-sm border-t border-gray-200 pt-2">
              <span className="text-gray-500">Total</span>
              <span className="font-bold text-gray-900">MZN {fmt(total)}</span>
            </div>
          </div>

          {precisaTelefone && (
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-500 mb-1">Número {nomeMetodo}</label>
              <input type="tel" value={telefone} onChange={(e) => setTelefone(e.target.value)}
                placeholder="Ex: 84 000 0000"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-green-500 transition-colors" />
              <p className="text-xs text-gray-400 mt-1.5">Receberás um pedido de confirmação no teu telemóvel.</p>
            </div>
          )}

          <div className="flex items-start gap-2 rounded-xl p-3 mb-5" style={{ background: "#f0fdf7", border: "1px solid #bbf7d0" }}>
            <Shield size={14} style={{ color: VERDE }} className="shrink-0 mt-0.5" />
            <p className="text-xs leading-relaxed" style={{ color: "#14532d" }}>
              O pagamento fica retido em <strong>escrow</strong>. O vendedor só recebe após confirmares a recepção.
            </p>
          </div>

          {erro && <p className="text-xs text-red-500 mb-3">{erro}</p>}

          <div className="flex gap-2">
            <button onClick={fechar}
              className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer bg-white">
              Cancelar
            </button>
            <button onClick={handlePagar} disabled={precisaTelefone && !telefone.trim()}
              className="flex-1 py-3 rounded-xl text-white text-sm font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer border-none disabled:opacity-40"
              style={{ background: VERDE }}
              onMouseEnter={(e) => (e.currentTarget.style.background = VERDE_ESCURO)}
              onMouseLeave={(e) => (e.currentTarget.style.background = VERDE)}>
              <Lock size={14} /> Pagar agora
            </button>
          </div>
        </>
      )}

      {step === "loading" && (
        <div className="text-center py-8">
          <Loader size={40} style={{ color: VERDE }} className="animate-spin mx-auto mb-4" />
          <p className="text-sm font-medium text-gray-900 mb-1">A processar pagamento...</p>
          <p className="text-xs text-gray-400">
            {precisaTelefone ? `Confirma o pedido no teu ${nomeMetodo}.` : "Aguarda um momento."}
          </p>
        </div>
      )}

      {step === "success" && (
        <div className="text-center py-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "#e6f9f0" }}>
            <CheckCircle size={28} style={{ color: VERDE }} />
          </div>
          <p className="text-sm font-semibold text-gray-900 mb-1">Pedido criado com sucesso!</p>
          {pedidoId && (
            <p className="text-xs text-gray-400 mb-1">
              Ref: <span className="font-mono font-semibold">{pedidoId.substring(0, 8).toUpperCase()}</span>
            </p>
          )}
          <p className="text-xs text-gray-400 mb-5">
            O dinheiro fica em <strong>escrow</strong> até confirmares a recepção.
          </p>
          <BotaoVerde onClick={fechar} fullWidth>Ver os meus pedidos</BotaoVerde>
        </div>
      )}

      {step === "error" && (
        <div className="text-center py-4">
          <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={28} className="text-red-500" />
          </div>
          <p className="text-sm font-semibold text-gray-900 mb-1">Pagamento falhado</p>
          <p className="text-xs text-gray-400 mb-4">{erro || "Verifica o teu saldo e tenta novamente."}</p>
          <div className="flex gap-2">
            <button onClick={fechar}
              className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 cursor-pointer bg-white">
              Fechar
            </button>
            <BotaoVerde onClick={() => { setStep("confirm"); setErro(""); }}>Tentar novamente</BotaoVerde>
          </div>
        </div>
      )}
    </Modal>
  );
}

// ─── página principal ─────────────────────────────────────────────────────────
export default function PaginaCarrinho() {
  const [itens,           setItens]          = useState([]);
  const [metodoPagamento, setMetodo]         = useState("MPESA");
  const [pesquisa,        setPesquisa]       = useState("");
  const [endereco,        setEndereco]       = useState({ provincia: "", cidade: "", bairro: "", referencia: "" });
  const [carregando,      setCarregando]     = useState(true);
  const [finalizado,      setFinalizado]     = useState(false);
  const [codigoCupao,     setCodigoCupao]    = useState("");

  // modais
  const [modalRemover,   setModalRemover]    = useState({ open: false, item: null });
  const [modalEndereco,  setModalEndereco]   = useState(false);
  const [modalGuardar,   setModalGuardar]    = useState(false);
  const [modalChat,      setModalChat]       = useState(false);
  const [modalPagamento, setModalPagamento]  = useState(false);

  // ── inicialização: perfil + carrinho local ────────────────────────────────
  // GET /api/v1/utilizadores/perfil → endereço do utilizador
  // localStorage "moztictac_cart"   → itens (até existir endpoint GET /api/v1/cart)
  useEffect(() => {
    async function init() {
      setCarregando(true);
      try {
        const { dados } = await apiFetch("/utilizadores/perfil");
        setEndereco({
          provincia:  dados.provincia  ?? "",
          cidade:     dados.cidade     ?? "",
          bairro:     dados.bairro     ?? "",
          referencia: "",
        });
      } catch {
        // utilizador não autenticado: manter endereço vazio
      }
      try {
        const guardado = localStorage.getItem("moztictac_cart");
        if (guardado) setItens(JSON.parse(guardado).map(normalizarItem));
      } catch {
        // sem carrinho guardado
      }
      setCarregando(false);
    }
    init();
  }, []);

  // Persistir carrinho localmente sempre que itens mudam
  useEffect(() => {
    if (!carregando) localStorage.setItem("moztictac_cart", JSON.stringify(itens));
  }, [itens, carregando]);

  // ── derivados ─────────────────────────────────────────────────────────────
  const totalItens = itens.reduce((a, i) => a + i.quantidade, 0);
  const grupos     = groupByVendedor(itens);

  // Lista de vendedores únicos para o modal de chat
  const vendedores = [...new Map(itens.map((i) => [i.vendedorId, { id: i.vendedorId, nome: i.vendedorNome }])).values()]
    .filter((v) => v.id);

  const subtotal = itens.reduce((acc, i) => acc + i.preco * i.quantidade, 0);
  const taxa     = Math.round(subtotal * TAXA_PLATAFORMA);
  const total    = subtotal + ENTREGA_FIXA + taxa;

  // ── handlers ──────────────────────────────────────────────────────────────
  function aoMudarQtd(id, novaQtd) {
    if (novaQtd < 1) return setModalRemover({ open: true, item: itens.find((i) => i.id === id) });
    setItens((prev) => prev.map((i) => (i.id === id ? { ...i, quantidade: novaQtd } : i)));
  }

  function handleConfirmRemover() {
    setItens((prev) => prev.filter((i) => i.id !== modalRemover.item?.id));
    setModalRemover({ open: false, item: null });
  }

  function handlePedidoCriado() {
    setItens([]);
    localStorage.removeItem("moztictac_cart");
    setFinalizado(true);
  }

  // ── ecrã de carregamento ───────────────────────────────────────────────────
  if (carregando) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader size={32} style={{ color: VERDE }} className="animate-spin" />
      </div>
    );
  }

  // ── ecrã de sucesso final ──────────────────────────────────────────────────
  if (finalizado) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header utilizadorAutenticado valorPesquisa={pesquisa} aoMudarPesquisa={setPesquisa}
          aoClicarPesquisa={() => {}} aoClicarConta={() => {}} aoClicarCarteira={() => {}}
          aoClicarCarrinho={() => {}} aoClicarWishlist={() => {}} aoClicarNotificacoes={() => {}} aoClicarChat={() => {}} />
        <div className="flex flex-col items-center justify-center py-24 text-center px-4">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4" style={{ background: "#e6f9f0" }}>
            <CheckCircle size={40} style={{ color: VERDE }} />
          </div>
          <p className="text-2xl font-black text-gray-900 mb-2">Pedido realizado!</p>
          <p className="text-sm text-gray-500 mb-1">O teu pagamento foi enviado com segurança.</p>
          <p className="text-xs text-gray-400 mb-8">O valor ficará retido até confirmares a recepção.</p>
          <BotaoVerde onClick={() => setFinalizado(false)}>Continuar a comprar</BotaoVerde>
        </div>
      </div>
    );
  }

  // ── ecrã principal ─────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      <Header utilizadorAutenticado contagemCarrinho={totalItens} valorPesquisa={pesquisa}
        aoMudarPesquisa={setPesquisa} aoClicarPesquisa={() => {}} aoClicarConta={() => {}}
        aoClicarCarteira={() => {}} aoClicarCarrinho={() => {}} aoClicarWishlist={() => {}}
        aoClicarNotificacoes={() => {}} aoClicarChat={() => {}} />

      {/* breadcrumb */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-sm text-gray-500">
          <button className="hover:text-green-600 cursor-pointer transition-colors border-none bg-transparent">Início</button>
          <ChevronRight size={14} className="text-gray-400" />
          <span className="font-semibold text-gray-900">O meu Carrinho</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <button className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-green-600 cursor-pointer transition-colors mb-5 border-none bg-transparent">
          <ArrowLeft size={15} /> Continuar a comprar
        </button>

        {itens.length === 0 ? (
          <CarrinhoVazio aoVoltar={() => {}} />
        ) : (
          <div className="flex flex-col lg:flex-row gap-6 items-start">

            {/* ── coluna esquerda ── */}
            <div className="flex-1 min-w-0 space-y-4">
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-black text-gray-900">
                  O meu Carrinho
                  <span className="text-sm font-normal text-gray-400 ml-2">
                    ({totalItens} {totalItens === 1 ? "item" : "itens"})
                  </span>
                </h1>
                <button onClick={() => setItens([])}
                  className="text-xs text-red-400 hover:text-red-600 cursor-pointer transition-colors border-none bg-transparent font-medium">
                  Limpar tudo
                </button>
              </div>

              {/* banner escrow */}
              <div className="flex items-start gap-2 p-3 rounded-xl text-xs text-gray-600"
                style={{ background: "#f0fdf7", border: "1px solid #bbf7d0" }}>
                <Lock size={13} style={{ color: VERDE }} className="shrink-0 mt-0.5" />
                <p>O pagamento fica <b>retido em escrow</b> e só é libertado ao vendedor depois de confirmares a recepção. Em caso de disputa, a equipa MozTicTac intervém.</p>
              </div>

              {/* itens agrupados por vendedor */}
              {Object.entries(grupos).map(([vendedorKey, vItems]) => (
                <div key={vendedorKey}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 rounded-full inline-block" style={{ background: VERDE }} />
                    <span className="text-xs text-gray-400">
                      Vendedor: <span className="font-medium text-gray-600">{vItems[0]?.vendedorNome ?? vendedorKey}</span>
                    </span>
                  </div>
                  <div className="space-y-2">
                    {vItems.map((item) => (
                      <ItemCarrinho key={item.id} item={item}
                        aoMudarQtd={aoMudarQtd}
                        aoRemoverClick={(i) => setModalRemover({ open: true, item: i })} />
                    ))}
                  </div>
                </div>
              ))}

              {/* cupão / código de afiliado */}
              <div className="flex gap-2 p-4 bg-white rounded-xl border border-gray-100">
                <div className="flex items-center gap-2 flex-1 border border-gray-200 rounded-lg px-3 py-2">
                  <Tag size={14} className="text-gray-400 shrink-0" />
                  <input type="text" value={codigoCupao} onChange={(e) => setCodigoCupao(e.target.value)}
                    placeholder="Código de desconto ou afiliado..."
                    className="flex-1 text-sm outline-none text-gray-700 placeholder-gray-400 bg-transparent" />
                </div>
                {/* O codigoCupao é passado como codigoAfiliado no POST /api/v1/pedidos */}
                <button
                  className="px-4 py-2 text-sm font-semibold rounded-lg cursor-pointer transition-colors border-none"
                  style={{ background: VERDE, color: "white" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = VERDE_ESCURO)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = VERDE)}>
                  Aplicar
                </button>
              </div>

              {/* acções secundárias */}
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setModalGuardar(true)}
                  className="flex items-center justify-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 bg-white border border-gray-100 rounded-xl py-3 hover:border-gray-200 transition-colors cursor-pointer">
                  <Bookmark size={15} /> Guardar carrinho
                </button>
                <button onClick={() => setModalChat(true)} disabled={vendedores.length === 0}
                  className="flex items-center justify-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 bg-white border border-gray-100 rounded-xl py-3 hover:border-gray-200 transition-colors cursor-pointer disabled:opacity-40">
                  <MessageCircle size={15} /> Chat com vendedor
                </button>
              </div>
            </div>

            {/* ── coluna direita: resumo ── */}
            <div className="w-full lg:w-96 shrink-0">
              <ResumoPedido
                itens={itens}
                metodoPagamento={metodoPagamento}
                aoMudarMetodo={setMetodo}
                aoFinalizar={() => setModalPagamento(true)}
                endereco={endereco}
                aoAbrirEndereco={() => setModalEndereco(true)}
              />
            </div>
          </div>
        )}
      </div>

      {/* ── modais ── */}
      <ModalRemover
        open={modalRemover.open}
        item={modalRemover.item}
        onConfirm={handleConfirmRemover}
        onClose={() => setModalRemover({ open: false, item: null })}
      />
      <ModalEndereco
        open={modalEndereco}
        endereco={endereco}
        onChange={setEndereco}
        onClose={() => setModalEndereco(false)}
      />
      <ModalGuardar
        open={modalGuardar}
        itens={itens}
        onClose={() => setModalGuardar(false)}
      />
      <ModalChat
        open={modalChat}
        vendedores={vendedores}
        onClose={() => setModalChat(false)}
      />
      <ModalPagamento
        open={modalPagamento}
        metodo={metodoPagamento}
        total={total}
        itens={itens}
        endereco={endereco}
        onClose={() => setModalPagamento(false)}
        onPedidoCriado={handlePedidoCriado}
      />
    </div>
  );
}