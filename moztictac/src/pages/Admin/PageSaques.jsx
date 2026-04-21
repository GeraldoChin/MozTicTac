// ═══════════════════════════════════════════════════════════════════════════════
// SUB 3 — SAQUES / CASHOUT
// ═══════════════════════════════════════════════════════════════════════════════
export default function PageSaques() {
  const [saques, setSaques] = useState(SAQUES_MOCK);
  const [filtro, setFiltro] = useState("todos");
  const [modalOTP, setModalOTP] = useState(null);
  const [otp, setOtp] = useState("");

  const lista = filtro === "todos" ? saques : saques.filter(s=>s.estado===filtro);
  const totalPendente = saques.filter(s=>s.estado==="pendente").reduce((sum,s)=>sum+s.valor,0);

  const aprovar = (id) => {
    setSaques(prev => prev.map(s => s.id===id ? {...s, estado:"aprovado"} : s));
    setModalOTP(null);
    setOtp("");
  };
  const rejeitar = (id) => setSaques(prev => prev.map(s => s.id===id ? {...s, estado:"rejeitado"} : s));
  const pagar = (id) => setSaques(prev => prev.map(s => s.id===id ? {...s, estado:"pago"} : s));

  const estadoCor = { pendente:"warning", aprovado:"info", pago:"success", rejeitado:"danger" };
  const riscoColor = (r) => r >= 70 ? C.red : r >= 40 ? C.amber : C.green;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
        <StatCard label="Pendentes"         value={saques.filter(s=>s.estado==="pendente").length} icon="clock"  color={C.amber} />
        <StatCard label="Total Pendente"    value={`${(totalPendente/1000).toFixed(0)}k MZN`} icon="dollar" color={C.amber} />
        <StatCard label="Pagos este mês"    value={saques.filter(s=>s.estado==="pago").length} icon="check"  color={C.green} />
        <StatCard label="Rejeitados"        value={saques.filter(s=>s.estado==="rejeitado").length} icon="x"  color={C.red} />
      </div>

      {/* Alerta saque grande pendente */}
      {saques.some(s=>s.estado==="pendente"&&s.valor>=10000) && (
        <div style={{ background:C.amberDim, border:`1.5px solid ${C.amber}30`, borderRadius:12, padding:14, display:"flex", alignItems:"center", gap:10 }}>
          <Icon name="alert-triangle" size={16} color={C.amber} />
          <p style={{ fontSize:13, color:C.amber, fontWeight:600 }}>⚠️ Há saques de valor elevado (≥10 000 MZN) pendentes. Requerem aprovação dupla + OTP.</p>
        </div>
      )}

      {/* Filtro */}
      <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:14, display:"flex", gap:10, alignItems:"center" }}>
        <Icon name="inbox" size={14} color={C.textMute} />
        <span style={{ fontSize:13, color:C.textSub, fontWeight:500 }}>Filtrar:</span>
        {[["todos","Todos"],["pendente","Pendentes"],["aprovado","Aprovados"],["pago","Pagos"],["rejeitado","Rejeitados"]].map(([v,l]) => (
          <button key={v} onClick={()=>setFiltro(v)}
            style={{ padding:"5px 14px", fontSize:12, fontWeight:600, borderRadius:7, border:"none", cursor:"pointer", background:filtro===v?C.green:"transparent", color:filtro===v?"#fff":C.textSub, fontFamily:"inherit" }}>
            {l}
          </button>
        ))}
        <div style={{ marginLeft:"auto" }}>
          <Btn label="Exportar" icon="download" size="sm" variant="secondary" />
        </div>
      </div>

      {/* Tabela de saques */}
      <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, overflow:"hidden" }}>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
            <thead>
              <tr style={{ borderBottom:`1.5px solid ${C.border}`, background:C.bg }}>
                {["ID","Utilizador","Valor","Taxa (2%)","Líquido","Método","Solicitado","Risco","Estado","Ações"].map((c,i)=>(
                  <th key={i} style={{ padding:"10px 14px", textAlign:"left", fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.05em", color:C.textMute, whiteSpace:"nowrap" }}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lista.map((s,i) => (
                <tr key={s.id} style={{ borderBottom:`1px solid ${C.border}` }}
                  onMouseEnter={e=>e.currentTarget.style.background=C.bg}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <td style={{ padding:"11px 14px", fontFamily:"monospace", fontSize:12, color:C.textSub }}>{s.id}</td>
                  <td style={{ padding:"11px 14px", fontWeight:700, color:C.text }}>{s.nome}</td>
                  <td style={{ padding:"11px 14px", fontWeight:800, color:C.text }}>{s.valor.toLocaleString("pt-MZ")} MZN</td>
                  <td style={{ padding:"11px 14px", color:C.red, fontWeight:600 }}>−{s.taxa.toLocaleString("pt-MZ")}</td>
                  <td style={{ padding:"11px 14px", fontWeight:800, color:C.green }}>{s.liquido.toLocaleString("pt-MZ")} MZN</td>
                  <td style={{ padding:"11px 14px" }}><Badge label={s.metodo} type="default" /></td>
                  <td style={{ padding:"11px 14px", color:C.textSub, fontSize:12, whiteSpace:"nowrap" }}>{s.solicitado}</td>
                  <td style={{ padding:"11px 14px" }}>
                    <span style={{ fontSize:12, fontWeight:700, color:riscoColor(s.risco) }}>{s.risco >= 70 ? "🚨" : s.risco >= 40 ? "⚠️" : "✅"} {s.risco}</span>
                  </td>
                  <td style={{ padding:"11px 14px" }}><Badge label={s.estado.charAt(0).toUpperCase()+s.estado.slice(1)} type={estadoCor[s.estado]} /></td>
                  <td style={{ padding:"11px 14px" }}>
                    <div style={{ display:"flex", gap:4 }}>
                      {s.estado === "pendente" && (
                        <>
                          <Btn label="Aprovar" icon="check" size="sm" variant="ghost" onClick={()=>s.valor>=10000?setModalOTP(s):aprovar(s.id)} />
                          <Btn label="Rejeitar" icon="x" size="sm" variant="secondary" onClick={()=>rejeitar(s.id)} />
                        </>
                      )}
                      {s.estado === "aprovado" && (
                        <Btn label="Marcar pago" icon="check" size="sm" variant="primary" onClick={()=>pagar(s.id)} />
                      )}
                      {(s.estado === "pago" || s.estado === "rejeitado") && (
                        <Btn label="Comprovativo" icon="file-text" size="sm" variant="secondary" />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ padding:"10px 16px", borderTop:`1px solid ${C.border}`, fontSize:11, color:C.textMute }}>
          Saque mínimo: 500 MZN · Taxa: 2% · OTP obrigatório para saques ≥10 000 MZN · Processamento em 1-3 dias úteis
        </div>
      </div>

      {/* Modal OTP aprovação */}
      <Modal open={!!modalOTP} onClose={()=>setModalOTP(null)} width={400}>
        {modalOTP && (
          <div style={{ padding:24 }}>
            <div style={{ width:48, height:48, borderRadius:12, background:C.amberDim, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:14 }}>
              <Icon name="lock" size={22} color={C.amber} />
            </div>
            <h3 style={{ fontSize:16, fontWeight:800, color:C.text, marginBottom:4 }}>Aprovação com OTP</h3>
            <p style={{ fontSize:13, color:C.textSub, marginBottom:20 }}>
              Saque de <strong>{modalOTP.valor.toLocaleString("pt-MZ")} MZN</strong> para <strong>{modalOTP.nome}</strong> requer verificação.<br/>
              Código enviado para o email do administrador.
            </p>
            <div style={{ marginBottom:16 }}>
              <label style={{ fontSize:11, fontWeight:700, color:C.textMute, textTransform:"uppercase", display:"block", marginBottom:6 }}>Código OTP (6 dígitos)</label>
              <input type="text" maxLength={6} value={otp} onChange={e=>setOtp(e.target.value.replace(/\D/g,""))} placeholder="000000"
                style={{ width:"100%", padding:"12px 14px", fontSize:22, fontWeight:800, letterSpacing:"0.3em", textAlign:"center", border:`2px solid ${otp.length===6?C.green:C.border}`, borderRadius:8, fontFamily:"monospace", color:C.text, outline:"none", boxSizing:"border-box" }} />
            </div>
            <div style={{ padding:"10px 12px", background:C.amberDim, borderRadius:8, fontSize:12, color:C.amber, fontWeight:500, marginBottom:20 }}>
              🔐 Esta ação ficará registada no log de auditoria com timestamp e IP.
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <Btn label="Cancelar" variant="secondary" onClick={()=>setModalOTP(null)} />
              <Btn label="Confirmar aprovação" variant="primary" disabled={otp.length!==6} onClick={()=>aprovar(modalOTP.id)} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}