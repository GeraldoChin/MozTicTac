import { useState } from "react";
import { Gift, Lock, Mail, CheckCircle } from "lucide-react";

const G  = "#00b96b";
const GD = "#009a5a";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [focused, setFocused] = useState(false);

  return (
    <section style={{
      background: `linear-gradient(135deg, ${GD} 0%, ${G} 50%, ${GD} 100%)`,
      padding: "48px 24px",
      position: "relative",
      overflow: "hidden",
      fontFamily: "Manrope, sans-serif",
    }}>

      {/* Glow decorativo */}
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: 600, height: 300,
        background: "radial-gradient(ellipse, rgba(255,255,255,.12) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div style={{
        position: "relative", maxWidth: 520, margin: "0 auto", textAlign: "center",
      }}>

        {/* Badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "5px 14px", borderRadius: 100, marginBottom: 16,
          background: "rgba(255,255,255,.18)", border: "1px solid rgba(255,255,255,.3)",
        }}>
          <Gift size={13} color="#fff" />
          <span style={{
            fontSize: 11, fontWeight: 800, textTransform: "uppercase",
            letterSpacing: "0.1em", color: "#fff", fontFamily: "Syne, sans-serif",
          }}>
            Oferta Exclusiva
          </span>
        </div>

        {/* Título */}
        <h2 style={{
          fontSize: 30, fontWeight: 900, color: "#fff",
          lineHeight: 1.1, letterSpacing: "-1px", margin: "0 0 10px",
          fontFamily: "Syne, sans-serif",
        }}>
          Subscreve e <span style={{ color: "#111827" }}>Poupa 20%</span>
        </h2>

        {/* Subtítulo */}
        <p style={{
          fontSize: 13, lineHeight: 1.6, marginBottom: 24,
          color: "rgba(255,255,255,.8)",
        }}>
          Recebe as melhores ofertas directamente no teu email.
        </p>

        {/* Form ou sucesso */}
        {subscribed ? (
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 12,
            padding: "14px 24px", borderRadius: 12,
            background: "rgba(255,255,255,.18)", border: "1px solid rgba(255,255,255,.3)",
          }}>
            <CheckCircle size={22} color="#fff" />
            <div style={{ textAlign: "left" }}>
              <p style={{ fontSize: 14, fontWeight: 800, color: "#fff", margin: 0, fontFamily: "Syne, sans-serif" }}>
                Subscrição confirmada!
              </p>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,.75)", margin: "2px 0 0" }}>
                Cupão de 20% enviado para {email}
              </p>
            </div>
          </div>
        ) : (
          <>
            <div style={{
              display: "flex",
              background: "rgba(255,255,255,.18)",
              border: `1.5px solid ${focused ? "#fff" : "rgba(255,255,255,.3)"}`,
              borderRadius: 12, overflow: "hidden", padding: 5,
              transition: "border-color .2s",
              maxWidth: 440, margin: "0 auto",
            }}>
              <div style={{
                display: "flex", alignItems: "center", paddingLeft: 12,
                color: "rgba(255,255,255,.6)",
              }}>
                <Mail size={15} />
              </div>
              <input
                type="email"
                placeholder="O teu endereço de email..."
                value={email}
                onChange={e => setEmail(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                onKeyDown={e => e.key === "Enter" && email && setSubscribed(true)}
                style={{
                  flex: 1, background: "transparent", border: "none", outline: "none",
                  padding: "9px 14px", fontSize: 13, color: "#fff",
                  fontFamily: "Manrope, sans-serif",
                }}
              />
              <button
                onClick={() => email && setSubscribed(true)}
                style={{
                  padding: "9px 20px", borderRadius: 8, fontSize: 13,
                  fontWeight: 800, color: G, background: "#fff",
                  border: "none", cursor: "pointer",
                  fontFamily: "Syne, sans-serif",
                  opacity: email ? 1 : 0.7,
                  transition: "opacity .15s, transform .15s",
                }}
                onMouseEnter={e => { if (email) e.currentTarget.style.transform = "scale(1.03)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}>
                Subscrever →
              </button>
            </div>

            <p style={{
              fontSize: 11, color: "rgba(255,255,255,.6)", marginTop: 12,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
            }}>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <Lock size={10} /> Sem spam
              </span>
              <span>·</span>
              <span>Cancela a qualquer momento</span>
            </p>
          </>
        )}
      </div>
    </section>
  );
}

export default Newsletter;