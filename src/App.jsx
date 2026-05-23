import { useState, useCallback, useRef, useEffect } from "react";

/* ─── DESIGN TOKENS ─────────────────────────────────────── */
const C = {
  ink:     "#0B0C0E",
  paper:   "#F5F0E8",
  cream:   "#EDE8DC",
  gold:    "#B8923A",
  goldLt:  "#D4A84B",
  goldDk:  "#8A6A20",
  moss:    "#2C3B2D",
  steel:   "#3A4550",
  fog:     "#8A8880",
  line:    "#D8D2C4",
  white:   "#FAFAF8",
  danger:  "#8B2020",
  success: "#2A5C2A",
};

const F = {
  display: "'Cormorant Garamond', 'Garamond', 'Times New Roman', serif",
  body:    "'Crimson Pro', 'Georgia', serif",
  mono:    "'Courier New', monospace",
};

/* ─── GOOGLE DRIVE BACKUP ────────────────────────────────────
   Envia cópia do relatório para Google Drive da Arrojo & Destreza
   assim que a análise termina — antes do cliente pagar.
─────────────────────────────────────────────────────────── */
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwxd4KFABaHgab6adHw6Z2rXvKWlIR9uiHjaXzezwq0p9ain61hQFQRjM6K1lVm7fIZ/exec";
const WORKER_URL = "https://arrojo-proxy.arrojo-destreza.workers.dev/";

async function saveToGoogleDrive(company, anos, parsed) {
  try {
    const R = parsed || {};
    const payload = {
      type:          "backup",
      empresa:       R.empresa || company,
      anos:          (R.anos || anos).join(", "),
      avaliacao:     R.avaliacao_global || "",
      data:          new Date().toLocaleDateString("pt-PT"),
      pago:          false,
      sumario:       R.sumario?.texto || R.sumario || "",
      destaques:     R.sumario?.destaques || [],
      indicadores:   R.indicadores || {},
      analise:       R.analise_detalhada || R.analise || {},
      swot:          R.swot || {},
      recomendacoes: R.recomendacoes || {},
      conclusao:     R.conclusao || "",
    };

    // Envia via Cloudflare Worker (sem CORS) para o Google Apps Script
    await fetch(GOOGLE_SCRIPT_URL, {
      method:  "POST",
      mode:    "no-cors",
      headers: { "Content-Type": "text/plain" },
      body:    JSON.stringify(payload),
    });
    console.log("Backup enviado para Google Drive");
  } catch (err) {
    console.warn("Backup Drive falhou:", err.message);
  }
}

/* ─── GLOBAL CSS ─────────────────────────────────────────── */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Crimson+Pro:ital,wght@0,300;0,400;0,500;1,300;1,400&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { background: ${C.paper}; color: ${C.ink}; font-family: ${F.body}; }
  ::selection { background: ${C.gold}; color: ${C.white}; }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: ${C.cream}; }
  ::-webkit-scrollbar-thumb { background: ${C.gold}; border-radius: 3px; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes shimmer { 0%,100% { opacity:.6 } 50% { opacity:1 } }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes progressFill { from { width: 0% } to { width: var(--target-width) } }
  @keyframes scanline { 0% { transform: translateY(-100%); } 100% { transform: translateY(100vh); } }
  .fade-up { animation: fadeUp 0.7s ease both; }
  .fade-up-1 { animation: fadeUp 0.7s 0.1s ease both; }
  .fade-up-2 { animation: fadeUp 0.7s 0.2s ease both; }
  .fade-up-3 { animation: fadeUp 0.7s 0.3s ease both; }
  .fade-up-4 { animation: fadeUp 0.7s 0.4s ease both; }
  .fade-up-5 { animation: fadeUp 0.7s 0.5s ease both; }
  .blur-locked { filter: blur(6px); user-select: none; pointer-events: none; }
  input::placeholder { color: ${C.fog}; font-style: italic; }
  input:focus { outline: none; border-color: ${C.gold} !important; }
  textarea:focus { outline: none; border-color: ${C.gold} !important; }

  /* ── MOBILE RESPONSIVE ─────────────────────────────────── */

  /* Nav mobile */
  .nav-links { display: flex; gap: 32px; align-items: center; }
  .nav-menu-btn { display: none; background: none; border: none; cursor: pointer; font-size: 22px; color: ${C.steel}; }
  .nav-mobile-menu {
    display: none; position: fixed; inset: 0; background: ${C.paper};
    z-index: 200; flex-direction: column; align-items: center;
    justify-content: center; gap: 32px;
  }
  .nav-mobile-menu.open { display: flex; }
  .nav-mobile-close { position: absolute; top: 20px; right: 20px; background: none; border: none; font-size: 24px; cursor: pointer; color: ${C.steel}; }

  /* Hero grid */
  .hero-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center; }
  .hero-visual { display: block; }

  /* How it works */
  .how-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; }

  /* Pricing */
  .pricing-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; max-width: 700px; margin: 0 auto; }

  /* Upload grid */
  .upload-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }

  /* Report charts */
  .chart-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; }
  .analise-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
  .swot-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2px; }
  .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(155px, 1fr)); gap: 12px; }
  .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; }

  /* Paywall modal plans */
  .plans-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

  /* ── TABLET (≤ 768px) ──────────────────────────────────── */
  @media (max-width: 768px) {
    .nav-links { display: none; }
    .nav-menu-btn { display: block; }

    .hero-grid { grid-template-columns: 1fr; gap: 32px; padding: 60px 5vw 48px; }
    .hero-visual { display: none; }

    .how-grid { grid-template-columns: 1fr; gap: 16px; }
    .pricing-grid { grid-template-columns: 1fr; max-width: 420px; }

    .upload-grid { grid-template-columns: 1fr; }
    .chart-grid { grid-template-columns: 1fr; gap: 24px; }
    .analise-grid { grid-template-columns: 1fr; }
    .swot-grid { grid-template-columns: 1fr; }
    .plans-grid { grid-template-columns: 1fr; }

    .kpi-grid { grid-template-columns: repeat(2, 1fr); }
    .metrics-grid { grid-template-columns: repeat(2, 1fr); }

    .cover-meta { flex-direction: column; gap: 6px; }
    .cover-highlights { flex-direction: column; }
  }

  /* ── MOBILE (≤ 480px) ──────────────────────────────────── */
  @media (max-width: 480px) {
    .kpi-grid { grid-template-columns: 1fr 1fr; }
    .metrics-grid { grid-template-columns: 1fr 1fr; }
    .pricing-grid { padding: 0 4vw; }
  }
`;

/* ─── HELPER COMPONENTS ─────────────────────────────────── */
function Divider({ style }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "16px", ...style }}>
      <div style={{ flex: 1, height: "1px", background: C.line }} />
      <div style={{ color: C.gold, fontSize: "12px", letterSpacing: "0.3em" }}>✦</div>
      <div style={{ flex: 1, height: "1px", background: C.line }} />
    </div>
  );
}

function Tag({ children }) {
  return (
    <span style={{
      display: "inline-block", padding: "3px 12px",
      border: `1px solid ${C.gold}`, borderRadius: "20px",
      fontSize: "10px", letterSpacing: "0.22em", textTransform: "uppercase",
      color: C.gold, fontFamily: F.body, fontWeight: 400,
    }}>{children}</span>
  );
}

/* ─── UPLOAD CARD ────────────────────────────────────────── */
function UploadSlot({ label, year, file, onUpload, onRemove }) {
  const [over, setOver] = useState(false);
  const ref = useRef();

  const handleDrop = useCallback(e => {
    e.preventDefault(); setOver(false);
    const f = e.dataTransfer.files[0];
    if (f?.type === "application/pdf") onUpload(f);
  }, [onUpload]);

  return (
    <div
      onClick={() => !file && ref.current.click()}
      onDragOver={e => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={handleDrop}
      style={{
        border: `1px solid ${file ? C.gold : over ? C.goldLt : C.line}`,
        borderRadius: "6px",
        background: file ? "#FAF6EE" : over ? "#FBF7EF" : C.white,
        padding: "18px 20px",
        cursor: file ? "default" : "pointer",
        transition: "all 0.2s",
        position: "relative",
        minHeight: "100px",
      }}
    >
      <input ref={ref} type="file" accept=".pdf" style={{ display: "none" }}
        onChange={e => e.target.files[0] && onUpload(e.target.files[0])} />

      <div style={{ fontSize: "10px", letterSpacing: "0.18em", textTransform: "uppercase", color: C.gold, marginBottom: "6px", fontFamily: F.body }}>
        {label} · {year}
      </div>

      {file ? (
        <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
          <div style={{ fontSize: "20px", lineHeight: 1 }}>📄</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: "13px", color: C.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: F.body }}>
              {file.name}
            </div>
            <div style={{ fontSize: "11px", color: C.success, marginTop: "3px", fontFamily: F.mono }}>
              ✓ Carregado · {(file.size / 1024).toFixed(0)} KB
            </div>
          </div>
          <button onClick={e => { e.stopPropagation(); onRemove(); }}
            style={{ background: "none", border: "none", color: C.fog, cursor: "pointer", fontSize: "14px", lineHeight: 1, padding: "2px" }}>✕</button>
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "36px", height: "36px", border: `1px dashed ${over ? C.gold : C.line}`, borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", color: C.fog, flexShrink: 0 }}>
            {over ? "⬆" : "+"}
          </div>
          <div style={{ fontSize: "12px", color: C.fog, fontFamily: F.body, fontStyle: "italic", lineHeight: 1.4 }}>
            Arraste o PDF ou clique<br />para seleccionar
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── STRIPE CONFIG ──────────────────────────────────────── */
const STRIPE_PK = "pk_test_51TZrYTKhHRQ9IixVD1yDRdj672WzMFaW2tYJOb0DrEywT8KYO5OnMctW4zhshQ6UR9i84S8k1vrC7gtiqElh21wU00oDyHn8rq";

async function loadStripe() {
  if (window.Stripe) return window.Stripe(STRIPE_PK);
  return new Promise((res, rej) => {
    const s = document.createElement("script");
    s.src = "https://js.stripe.com/v3/";
    s.onload = () => res(window.Stripe(STRIPE_PK));
    s.onerror = rej;
    document.head.appendChild(s);
  });
}

/* ─── PAYWALL MODAL ──────────────────────────────────────── */
function PaywallModal({ onClose, onPay, companyName }) {
  const [step, setStep] = useState("choose"); // choose | checkout | processing | success | error
  const [plan, setPlan] = useState("standard");
  const [form, setForm] = useState({ name: "", email: "" });
  const [errors, setErrors] = useState({});
  const [stripeError, setStripeError] = useState("");
  const [cardReady, setCardReady] = useState(false);
  const stripeRef = useRef(null);
  const cardRef = useRef(null);
  const cardMountRef = useRef(null);

  const PLANS = [
    {
      id: "standard", label: "Análise Standard", price: "79€", amount: 7900,
      features: ["Relatório completo com IA", "Indicadores financeiros", "Pontos fortes e fracos", "Recomendações", "Download PDF"],
    },
    {
      id: "premium", label: "Análise Premium", price: "149€", amount: 14900, highlight: true,
      features: ["Tudo da Standard", "Benchmarking sectorial", "Projecções a 3 anos", "Análise de risco detalhada", "Suporte por e-mail 30 dias"],
    },
  ];

  const selectedPlan = PLANS.find(p => p.id === plan);

  // Mount Stripe card element when entering checkout
  useEffect(() => {
    if (step !== "checkout") return;
    setCardReady(false);
    let mounted = true;
    loadStripe().then(stripe => {
      if (!mounted || !cardMountRef.current) return;
      stripeRef.current = stripe;
      const elements = stripe.elements();
      const card = elements.create("card", {
        style: {
          base: {
            fontFamily: "'Georgia', serif",
            fontSize: "15px",
            color: "#0B0C0E",
            "::placeholder": { color: "#8A8880" },
          },
        },
      });
      card.mount(cardMountRef.current);
      cardRef.current = card;
      card.on("ready", () => { if (mounted) setCardReady(true); });
      card.on("change", e => { if (mounted) setStripeError(e.error ? e.error.message : ""); });
    });
    return () => { mounted = false; };
  }, [step]);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Campo obrigatório";
    if (!form.email.includes("@")) e.email = "E-mail inválido";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePay = async () => {
    if (!validate()) return;
    setStripeError("");

    const stripe = stripeRef.current;
    const card = cardRef.current;

    if (!stripe || !card) {
      setStripeError("Erro ao carregar o Stripe. Recarregue a página.");
      return;
    }

    // Criar método de pagamento PRIMEIRO (antes de mudar step)
    // Isto captura os dados do cartão enquanto o Element ainda está montado
    const { error: pmError, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card: card,
      billing_details: { name: form.name, email: form.email },
    });

    if (pmError) {
      setStripeError(pmError.message);
      return;
    }

    // Só agora mudamos o step (o paymentMethod já está criado, não precisa do Element)
    setStep("processing");

    try {
      // 1. Criar PaymentIntent no Worker
      const intentResp = await fetch(WORKER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "create_payment",
          amount: selectedPlan.amount,
          currency: "eur",
          description: `${selectedPlan.label} — ${companyName}`,
          plan: plan,
        }),
      });

      const intentData = await intentResp.json();
      if (intentData.error) throw new Error(intentData.error.message || "Erro ao criar pagamento");

      // 2. Confirmar com o paymentMethod já criado (não precisa do Element)
      const { error, paymentIntent } = await stripe.confirmCardPayment(
        intentData.client_secret,
        { payment_method: paymentMethod.id }
      );

      if (error) throw new Error(error.message);
      if (paymentIntent.status === "succeeded") {
        setStep("success");
        setTimeout(() => { onPay(plan); onClose(); }, 2500);
      }
    } catch (err) {
      setStripeError(err.message);
      setStep("checkout");
    }
  };

  const overlay = { position: "fixed", inset: 0, background: "rgba(11,12,14,0.72)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", animation: "fadeIn 0.2s ease" };
  const box = { background: C.white, borderRadius: "10px", maxWidth: "560px", width: "100%", maxHeight: "90vh", overflowY: "auto", position: "relative", animation: "fadeUp 0.3s ease" };
  const inp = (err) => ({ width: "100%", padding: "10px 14px", border: `1px solid ${err ? C.danger : C.line}`, borderRadius: "5px", fontFamily: F.body, fontSize: "15px", color: C.ink, background: C.white });

  if (step === "processing") return (
    <div style={overlay}>
      <div style={{ ...box, padding: "60px 40px", textAlign: "center" }}>
        <div style={{ width: "48px", height: "48px", border: `3px solid ${C.line}`, borderTopColor: C.gold, borderRadius: "50%", margin: "0 auto 24px", animation: "spin 0.8s linear infinite" }} />
        <div style={{ fontFamily: F.display, fontSize: "22px", marginBottom: "10px" }}>A processar pagamento…</div>
        <div style={{ color: C.fog, fontSize: "14px" }}>Por favor aguarde</div>
      </div>
    </div>
  );

  if (step === "success") return (
    <div style={overlay}>
      <div style={{ ...box, padding: "60px 40px", textAlign: "center" }}>
        <div style={{ fontSize: "48px", marginBottom: "20px" }}>✦</div>
        <div style={{ fontFamily: F.display, fontSize: "26px", color: C.gold, marginBottom: "10px" }}>Pagamento Confirmado</div>
        <div style={{ color: C.fog, fontSize: "15px", fontStyle: "italic" }}>A carregar a sua análise…</div>
      </div>
    </div>
  );

  return (
    <div style={overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={box}>
        <div style={{ padding: "28px 32px 24px", borderBottom: `1px solid ${C.line}` }}>
          <button onClick={onClose} style={{ position: "absolute", top: "20px", right: "20px", background: "none", border: "none", cursor: "pointer", color: C.fog, fontSize: "18px" }}>✕</button>
          <Tag>Acesso ao Relatório</Tag>
          <div style={{ fontFamily: F.display, fontSize: "26px", marginTop: "12px", lineHeight: 1.2 }}>
            Análise Financeira<br />
            <span style={{ color: C.gold, fontStyle: "italic" }}>{companyName}</span>
          </div>
        </div>

        {step === "choose" && (
          <div style={{ padding: "24px 32px" }}>
            <div style={{ fontSize: "13px", color: C.fog, marginBottom: "20px", fontStyle: "italic" }}>
              Escolha o plano que melhor se adequa às suas necessidades:
            </div>
            <div className="plans-grid" style={{ marginBottom: "24px" }}>
              {PLANS.map(p => (
                <div key={p.id} onClick={() => setPlan(p.id)}
                  style={{ border: `2px solid ${plan === p.id ? C.gold : C.line}`, borderRadius: "8px", padding: "18px", cursor: "pointer", background: plan === p.id ? "#FBF7EF" : C.white, transition: "all 0.2s", position: "relative" }}>
                  {p.highlight && <div style={{ position: "absolute", top: "-10px", left: "50%", transform: "translateX(-50%)", background: C.gold, color: C.white, fontSize: "9px", letterSpacing: "0.15em", padding: "3px 10px", borderRadius: "10px" }}>MAIS POPULAR</div>}
                  <div style={{ fontFamily: F.display, fontSize: "17px", marginBottom: "4px" }}>{p.label}</div>
                  <div style={{ fontFamily: F.display, fontSize: "28px", color: C.gold, marginBottom: "14px" }}>{p.price}</div>
                  <ul style={{ listStyle: "none", padding: 0 }}>
                    {p.features.map((f, i) => (
                      <li key={i} style={{ fontSize: "12px", color: C.steel, marginBottom: "5px", display: "flex", gap: "7px", lineHeight: 1.4 }}>
                        <span style={{ color: C.gold, flexShrink: 0 }}>✓</span>{f}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <button onClick={() => setStep("checkout")}
              style={{ width: "100%", padding: "14px", background: C.gold, border: "none", borderRadius: "6px", color: C.white, fontFamily: F.display, fontSize: "18px", letterSpacing: "0.06em", cursor: "pointer" }}>
              Continuar para Pagamento →
            </button>
          </div>
        )}

        {step === "checkout" && (
          <div style={{ padding: "24px 32px" }}>
            <button onClick={() => setStep("choose")} style={{ background: "none", border: "none", color: C.fog, cursor: "pointer", fontSize: "13px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "6px" }}>← Voltar</button>

            <div style={{ background: "#FBF7EF", border: `1px solid ${C.line}`, borderRadius: "6px", padding: "14px 16px", marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: "13px", fontFamily: F.display }}>{selectedPlan?.label}</div>
                <div style={{ fontSize: "11px", color: C.fog }}>Análise Financeira — {companyName}</div>
              </div>
              <div style={{ fontFamily: F.display, fontSize: "22px", color: C.gold }}>{selectedPlan?.price}</div>
            </div>

            <div style={{ display: "grid", gap: "14px", marginBottom: "20px" }}>
              {[
                { key: "name", label: "Nome completo", placeholder: "João Silva", type: "text" },
                { key: "email", label: "E-mail para recibo", placeholder: "joao@empresa.pt", type: "email" },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: C.steel, display: "block", marginBottom: "6px", fontFamily: F.body }}>{f.label}</label>
                  <input type={f.type} value={form[f.key]} placeholder={f.placeholder}
                    onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                    style={{ ...inp(errors[f.key]) }} />
                  {errors[f.key] && <div style={{ fontSize: "11px", color: C.danger, marginTop: "4px" }}>{errors[f.key]}</div>}
                </div>
              ))}

              <div>
                <label style={{ fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: C.steel, display: "block", marginBottom: "6px", fontFamily: F.body }}>Dados do Cartão</label>
                <div ref={cardMountRef} style={{ padding: "11px 14px", border: `1px solid ${stripeError ? C.danger : C.line}`, borderRadius: "5px", background: C.white, minHeight: "42px" }} />
                {stripeError && <div style={{ fontSize: "11px", color: C.danger, marginTop: "4px" }}>{stripeError}</div>}
              </div>
            </div>

            <button onClick={handlePay} disabled={!cardReady}
              style={{ width: "100%", padding: "14px", background: cardReady ? C.gold : C.line, border: "none", borderRadius: "6px", color: C.white, fontFamily: F.display, fontSize: "18px", letterSpacing: "0.06em", cursor: cardReady ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", transition: "all 0.2s" }}>
              🔒 {cardReady ? `Pagar ${selectedPlan?.price} com Stripe` : "A carregar pagamento…"}
            </button>
            <div style={{ textAlign: "center", fontSize: "11px", color: C.fog, marginTop: "12px", fontStyle: "italic" }}>
              Pagamento seguro via Stripe · SSL encriptado · IVA incluído
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── CHART COMPONENTS (using SVG — no external deps needed) ── */
const CHART_COLORS = ["#B8923A", "#3A4550", "#6B8A4E", "#8A5A2A", "#2A5A8A", "#8A2A5A"];

function BarChart({ data, height = 200, yLabel = "", formatVal = v => v }) {
  if (!data || !data.length) return null;
  const vals = data.map(d => d.value).filter(v => typeof v === "number" && isFinite(v));
  if (!vals.length) return null;
  const hasNeg = vals.some(v => v < 0);
  const maxV = Math.max(...vals.map(Math.abs), 0.01);
  const W = 560, H = height, PAD = { t: 16, r: 16, b: 48, l: 56 };
  const chartW = W - PAD.l - PAD.r;
  const chartH = H - PAD.t - PAD.b;
  const barW = Math.min(48, (chartW / data.length) * 0.6);
  const gap = chartW / data.length;
  const zeroY = hasNeg ? chartH / 2 : chartH;

  const scaleY = v => {
    if (hasNeg) return zeroY - (v / maxV) * (chartH / 2);
    return chartH - (v / maxV) * chartH;
  };

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }}>
      <g transform={`translate(${PAD.l},${PAD.t})`}>
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((f, i) => {
          const y = hasNeg ? chartH * f : chartH * (1 - f);
          const val = hasNeg ? maxV * (1 - f * 2) : maxV * f;
          return (
            <g key={i}>
              <line x1={0} y1={y} x2={chartW} y2={y} stroke={C.line} strokeWidth="1" strokeDasharray="4,4" />
              <text x={-6} y={y + 4} textAnchor="end" fontSize="9" fill={C.fog} fontFamily="Georgia, serif">
                {formatVal(val)}
              </text>
            </g>
          );
        })}
        {/* Zero line */}
        {hasNeg && <line x1={0} y1={zeroY} x2={chartW} y2={zeroY} stroke={C.steel} strokeWidth="1.5" />}
        {/* Bars */}
        {data.map((d, i) => {
          const x = gap * i + gap / 2 - barW / 2;
          const v = typeof d.value === "number" && isFinite(d.value) ? d.value : 0;
          const y = scaleY(v);
          const bH = Math.abs(y - zeroY);
          const barY = v >= 0 ? y : zeroY;
          const color = v >= 0 ? CHART_COLORS[i % CHART_COLORS.length] : C.danger;
          return (
            <g key={i}>
              <rect x={x} y={barY} width={barW} height={Math.max(bH, 1)} fill={color} rx="2" opacity="0.88" />
              <text x={x + barW / 2} y={barY - 5} textAnchor="middle" fontSize="9" fill={C.steel} fontFamily="Georgia, serif" fontWeight="500">
                {formatVal(v)}
              </text>
              <text x={x + barW / 2} y={chartH + 16} textAnchor="middle" fontSize="10" fill={C.steel} fontFamily="Georgia, serif">
                {d.label}
              </text>
            </g>
          );
        })}
        {/* Axes */}
        <line x1={0} y1={0} x2={0} y2={chartH} stroke={C.line} strokeWidth="1.5" />
        <line x1={0} y1={chartH} x2={chartW} y2={chartH} stroke={C.line} strokeWidth="1.5" />
        {yLabel && <text x={-36} y={chartH / 2} textAnchor="middle" fontSize="9" fill={C.fog} fontFamily="Georgia, serif" transform={`rotate(-90,-36,${chartH/2})`}>{yLabel}</text>}
      </g>
    </svg>
  );
}

function LineChart({ series, height = 220, formatVal = v => v }) {
  if (!series || !series.length || !series[0].data?.length) return null;
  const allVals = series.flatMap(s => s.data.map(d => d.value)).filter(v => typeof v === "number" && isFinite(v));
  if (!allVals.length) return null;
  const minV = Math.min(...allVals);
  const maxV = Math.max(...allVals);
  const range = maxV - minV || 1;
  const W = 560, H = height, PAD = { t: 20, r: 20, b: 44, l: 56 };
  const chartW = W - PAD.l - PAD.r;
  const chartH = H - PAD.t - PAD.b;
  const labels = series[0].data.map(d => d.label);
  const xStep = chartW / (labels.length - 1 || 1);
  const scaleY = v => chartH - ((v - minV) / range) * chartH;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }}>
      <g transform={`translate(${PAD.l},${PAD.t})`}>
        {[0, 0.25, 0.5, 0.75, 1].map((f, i) => {
          const y = chartH * (1 - f);
          const val = minV + range * f;
          return (
            <g key={i}>
              <line x1={0} y1={y} x2={chartW} y2={y} stroke={C.line} strokeWidth="1" strokeDasharray="4,4" />
              <text x={-6} y={y + 4} textAnchor="end" fontSize="9" fill={C.fog} fontFamily="Georgia, serif">{formatVal(val)}</text>
            </g>
          );
        })}
        {labels.map((lbl, i) => (
          <text key={i} x={xStep * i} y={chartH + 16} textAnchor="middle" fontSize="10" fill={C.steel} fontFamily="Georgia, serif">{lbl}</text>
        ))}
        {series.map((s, si) => {
          const pts = s.data.map((d, i) => `${xStep * i},${scaleY(typeof d.value === "number" && isFinite(d.value) ? d.value : minV)}`).join(" ");
          const color = CHART_COLORS[si % CHART_COLORS.length];
          return (
            <g key={si}>
              <polyline points={pts} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
              {s.data.map((d, i) => (
                <g key={i}>
                  <circle cx={xStep * i} cy={scaleY(typeof d.value === "number" && isFinite(d.value) ? d.value : minV)} r="4" fill={color} stroke={C.white} strokeWidth="2" />
                  <text x={xStep * i} y={scaleY(typeof d.value === "number" && isFinite(d.value) ? d.value : minV) - 9} textAnchor="middle" fontSize="9" fill={color} fontFamily="Georgia, serif" fontWeight="600">{formatVal(d.value)}</text>
                </g>
              ))}
            </g>
          );
        })}
        {series.length > 1 && (
          <g transform={`translate(0,${chartH + 28})`}>
            {series.map((s, si) => (
              <g key={si} transform={`translate(${si * 120},0)`}>
                <rect width="12" height="3" y={-1} fill={CHART_COLORS[si % CHART_COLORS.length]} rx="1" />
                <text x={16} y={3} fontSize="9" fill={C.steel} fontFamily="Georgia, serif">{s.name}</text>
              </g>
            ))}
          </g>
        )}
        <line x1={0} y1={0} x2={0} y2={chartH} stroke={C.line} strokeWidth="1.5" />
        <line x1={0} y1={chartH} x2={chartW} y2={chartH} stroke={C.line} strokeWidth="1.5" />
      </g>
    </svg>
  );
}

function DonutChart({ segments, size = 160 }) {
  const total = segments.reduce((s, sg) => s + Math.abs(sg.value), 0) || 1;
  const cx = size / 2, cy = size / 2, r = size * 0.38, ir = size * 0.24;
  let angle = -Math.PI / 2;
  const arcs = segments.map((sg, i) => {
    const sweep = (Math.abs(sg.value) / total) * 2 * Math.PI;
    const x1 = cx + r * Math.cos(angle), y1 = cy + r * Math.sin(angle);
    angle += sweep;
    const x2 = cx + r * Math.cos(angle), y2 = cy + r * Math.sin(angle);
    const ix1 = cx + ir * Math.cos(angle - sweep), iy1 = cy + ir * Math.sin(angle - sweep);
    const ix2 = cx + ir * Math.cos(angle), iy2 = cy + ir * Math.sin(angle);
    const large = sweep > Math.PI ? 1 : 0;
    return { path: `M${x1},${y1} A${r},${r} 0 ${large},1 ${x2},${y2} L${ix2},${iy2} A${ir},${ir} 0 ${large},0 ${ix1},${iy1} Z`, color: CHART_COLORS[i % CHART_COLORS.length], label: sg.label, value: sg.value };
  });
  return (
    <svg viewBox={`0 0 ${size} ${size}`} style={{ width: size, height: size }}>
      {arcs.map((a, i) => <path key={i} d={a.path} fill={a.color} stroke={C.white} strokeWidth="2" opacity="0.9" />)}
      <text x={cx} y={cy + 5} textAnchor="middle" fontSize="11" fill={C.steel} fontFamily="Georgia, serif" fontWeight="600">Total</text>
    </svg>
  );
}

function GaugeChart({ value, min = 0, max = 100, label = "", color }) {
  const pct = Math.max(0, Math.min(1, (value - min) / (max - min)));
  const startAngle = Math.PI * 0.75;
  const endAngle = Math.PI * 2.25;
  const angle = startAngle + pct * (endAngle - startAngle);
  const W = 160, cx = 80, cy = 90, r = 60, ir = 44;
  const arcPath = (a1, a2, ri, ro) => {
    const x1 = cx + ro * Math.cos(a1), y1 = cy + ro * Math.sin(a1);
    const x2 = cx + ro * Math.cos(a2), y2 = cy + ro * Math.sin(a2);
    const ix1 = cx + ri * Math.cos(a1), iy1 = cy + ri * Math.sin(a1);
    const ix2 = cx + ri * Math.cos(a2), iy2 = cy + ri * Math.sin(a2);
    const lg = (a2 - a1) > Math.PI ? 1 : 0;
    return `M${x1},${y1} A${ro},${ro} 0 ${lg},1 ${x2},${y2} L${ix2},${iy2} A${ri},${ri} 0 ${lg},0 ${ix1},${iy1} Z`;
  };
  const trackColor = C.line;
  const fillColor = color || (pct < 0.33 ? C.danger : pct < 0.66 ? C.goldLt : C.success);
  const nx = cx + r * 0.78 * Math.cos(angle), ny = cy + r * 0.78 * Math.sin(angle);
  return (
    <svg viewBox={`0 0 ${W} 110`} style={{ width: W, height: 110 }}>
      <path d={arcPath(startAngle, endAngle, ir, r)} fill={trackColor} />
      <path d={arcPath(startAngle, angle, ir, r)} fill={fillColor} />
      <circle cx={nx} cy={ny} r="5" fill={C.white} stroke={fillColor} strokeWidth="2.5" />
      <text x={cx} y={cy - 8} textAnchor="middle" fontSize="18" fill={C.ink} fontFamily="Georgia, serif" fontWeight="400">{typeof value === "number" ? value.toFixed(value % 1 === 0 ? 0 : 1) : value}</text>
      <text x={cx} y={cy + 10} textAnchor="middle" fontSize="9" fill={C.fog} fontFamily="Georgia, serif">{label}</text>
    </svg>
  );
}

/* ─── RICH TEXT RENDERER ─────────────────────────────────── */
function RichText({ content }) {
  const lines = (content || "").split("\n").filter(Boolean);
  return (
    <div style={{ fontFamily: F.body, fontSize: "15px", lineHeight: 1.9, color: C.steel }}>
      {lines.map((line, i) => {
        if (/^#{1,3}\s/.test(line)) return <div key={i} style={{ fontFamily: F.display, fontSize: "17px", color: C.ink, marginTop: "18px", marginBottom: "6px", fontWeight: 400 }}>{line.replace(/^#+\s/, "")}</div>;
        if (/^[•\-\*]\s/.test(line.trim())) return <div key={i} style={{ display: "flex", gap: "10px", marginBottom: "7px" }}><span style={{ color: C.gold, flexShrink: 0, marginTop: "2px" }}>▸</span><span>{line.replace(/^[•\-\*]\s*/, "")}</span></div>;
        if (/^\d+\.\s/.test(line.trim())) return <div key={i} style={{ display: "flex", gap: "10px", marginBottom: "9px" }}><span style={{ color: C.gold, flexShrink: 0, minWidth: "22px", fontWeight: 500 }}>{line.match(/^\d+/)[0]}.</span><span>{line.replace(/^\d+\.\s*/, "")}</span></div>;
        if (/^(Forças|Fraquezas|Ações Imediatas|Médio Prazo|Longo Prazo|Pontos Fortes|Pontos Fracos)[:：]/i.test(line.trim())) return <div key={i} style={{ color: C.goldDk, marginTop: "16px", marginBottom: "6px", fontSize: "11px", letterSpacing: "0.18em", textTransform: "uppercase", fontFamily: F.body, borderBottom: `1px solid ${C.line}`, paddingBottom: "4px" }}>{line}</div>;
        return <p key={i} style={{ marginBottom: "8px" }}>{line}</p>;
      })}
    </div>
  );
}

/* ─── REPORT SECTION WRAPPER ─────────────────────────────── */
function ReportSection({ number, title, children }) {
  return (
    <div style={{ marginBottom: "0", pageBreakInside: "avoid" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: "16px", padding: "32px 0 20px", borderBottom: `2px solid ${C.ink}` }}>
        <span style={{ fontFamily: F.mono, fontSize: "11px", color: C.gold, letterSpacing: "0.2em", minWidth: "28px" }}>{number}</span>
        <h2 style={{ fontFamily: F.display, fontSize: "26px", fontWeight: 300, color: C.ink, margin: 0, letterSpacing: "0.02em" }}>{title}</h2>
      </div>
      <div style={{ padding: "24px 0 8px", borderBottom: `1px solid ${C.line}` }}>
        {children}
      </div>
    </div>
  );
}

/* ─── METRIC KPI CARD ────────────────────────────────────── */
function KpiCard({ label, values, unit = "", benchmark, description }) {
  const vals = Object.entries(values || {});
  const numVals = vals.map(([, v]) => parseFloat(v)).filter(v => !isNaN(v));
  const last = numVals[numVals.length - 1];
  const prev = numVals[numVals.length - 2];
  const trend = numVals.length > 1 ? (last > prev ? "up" : last < prev ? "down" : "flat") : null;
  const trendColor = trend === "up" ? C.success : trend === "down" ? C.danger : C.fog;
  const trendIcon = trend === "up" ? "↑" : trend === "down" ? "↓" : "→";
  return (
    <div style={{ background: C.white, border: `1px solid ${C.line}`, borderRadius: "8px", padding: "20px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, width: "3px", height: "100%", background: trendColor || C.line }} />
      <div style={{ fontSize: "10px", letterSpacing: "0.16em", textTransform: "uppercase", color: C.fog, fontFamily: F.body, marginBottom: "10px" }}>{label}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "10px", flexWrap: "wrap" }}>
        {vals.map(([yr, v], i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", marginRight: "8px" }}>
            <span style={{ fontFamily: F.display, fontSize: i === vals.length - 1 ? "26px" : "18px", color: i === vals.length - 1 ? C.ink : C.fog, lineHeight: 1 }}>{v}{unit}</span>
            <span style={{ fontSize: "9px", color: C.fog, letterSpacing: "0.1em", marginTop: "2px", fontFamily: F.body }}>{yr}</span>
          </div>
        ))}
        {trend && <span style={{ fontSize: "18px", color: trendColor, marginLeft: "4px" }}>{trendIcon}</span>}
      </div>
      {description && <div style={{ fontSize: "12px", color: C.fog, fontFamily: F.body, fontStyle: "italic", lineHeight: 1.5 }}>{description}</div>}
      {benchmark && <div style={{ fontSize: "10px", color: C.goldDk, fontFamily: F.body, marginTop: "4px" }}>Referência: {benchmark}</div>}
    </div>
  );
}

/* ─── SWOT TABLE ─────────────────────────────────────────── */
function SwotTable({ data }) {
  const cells = [
    { key: "forcas", label: "Forças", color: "#E8F4E8", border: "#4A8A4A", icon: "+" },
    { key: "fraquezas", label: "Fraquezas", color: "#FAE8E8", border: "#8A4A4A", icon: "−" },
    { key: "oportunidades", label: "Oportunidades", color: "#E8F0FA", border: "#4A5A8A", icon: "↗" },
    { key: "riscos", label: "Riscos / Ameaças", color: "#FAF0E8", border: "#8A6A3A", icon: "⚠" },
  ];
  return (
    <div className="swot-grid" style={{ background: C.line, border: `1px solid ${C.line}`, borderRadius: "8px", overflow: "hidden" }}>
      {cells.map(cell => (
        <div key={cell.key} style={{ background: cell.color, padding: "20px", minHeight: "140px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
            <span style={{ width: "22px", height: "22px", background: cell.border, color: C.white, borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "700", flexShrink: 0 }}>{cell.icon}</span>
            <span style={{ fontSize: "11px", letterSpacing: "0.16em", textTransform: "uppercase", color: cell.border, fontFamily: F.body, fontWeight: "500" }}>{cell.label}</span>
          </div>
          <div style={{ fontFamily: F.body, fontSize: "13px", lineHeight: 1.7, color: C.steel }}>
            {(data?.[cell.key] || []).map((item, i) => (
              <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "5px" }}>
                <span style={{ color: cell.border, flexShrink: 0 }}>▸</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── ACTION PLAN TABLE ──────────────────────────────────── */
function ActionPlan({ actions }) {
  const phases = [
    { key: "imediato", label: "Imediato", sublabel: "0 – 3 meses", color: C.danger, bg: "#FAF0F0" },
    { key: "medio", label: "Médio Prazo", sublabel: "3 – 12 meses", color: C.goldDk, bg: "#FBF7EE" },
    { key: "longo", label: "Longo Prazo", sublabel: "1 – 3 anos", color: C.moss, bg: "#EEF4EE" },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {phases.map(ph => (
        <div key={ph.key} style={{ background: ph.bg, border: `1px solid ${C.line}`, borderLeft: `4px solid ${ph.color}`, borderRadius: "6px", padding: "18px 20px" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: "10px", marginBottom: "12px" }}>
            <span style={{ fontFamily: F.display, fontSize: "16px", color: ph.color }}>{ph.label}</span>
            <span style={{ fontSize: "11px", color: C.fog, fontFamily: F.body }}>{ph.sublabel}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {(actions?.[ph.key] || []).map((a, i) => (
              <div key={i} style={{ display: "flex", gap: "10px", fontFamily: F.body, fontSize: "13.5px", color: C.steel, lineHeight: 1.6 }}>
                <span style={{ color: ph.color, flexShrink: 0, fontWeight: "600", minWidth: "18px" }}>{i + 1}.</span>
                <span>{a}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── RATING BADGE ───────────────────────────────────────── */
function RatingBadge({ rating }) {
  const map = {
    "Excelente": { color: "#2A5C2A", bg: "#E8F4E8", icon: "◆◆◆◆◆" },
    "Bom":       { color: "#3A6A3A", bg: "#EEF6EE", icon: "◆◆◆◆◇" },
    "Aceitável": { color: "#7A6A20", bg: "#FAF4E0", icon: "◆◆◆◇◇" },
    "Preocupante": { color: "#8A5020", bg: "#FAF0E8", icon: "◆◆◇◇◇" },
    "Crítico":   { color: "#8B2020", bg: "#FAE8E8", icon: "◆◇◇◇◇" },
  };
  const r = map[rating] || map["Aceitável"];
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", background: r.bg, border: `1px solid ${r.color}30`, borderRadius: "6px", padding: "8px 16px" }}>
      <span style={{ fontFamily: F.mono, fontSize: "11px", color: r.color, letterSpacing: "4px" }}>{r.icon}</span>
      <span style={{ fontFamily: F.display, fontSize: "16px", color: r.color, letterSpacing: "0.06em" }}>{rating}</span>
    </div>
  );
}

/* ─── MAIN APP ───────────────────────────────────────────── */
const DOC_TYPES = [
  { id: "balance", label: "Balanço" },
  { id: "income", label: "Dem. Resultados" },
];

function parseAnalysis(raw) {
  if (!raw) return { _fallback: raw };

  let text = raw;

  // Extrair JSON de dentro de bloco ```json ... ``` (qualquer posição)
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    text = codeBlockMatch[1].trim();
  } else {
    // Remover backticks residuais em qualquer posição
    text = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  }

  // Tentar parse directo
  try {
    return JSON.parse(text);
  } catch(e) {}

  // Encontrar o maior bloco JSON válido entre { }
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    try {
      return JSON.parse(text.slice(start, end + 1));
    } catch(e) {
      console.warn("JSON parse failed:", e.message);
    }
  }

  return { _fallback: raw };
}

export default function App() {
  const [page, setPage] = useState("home"); // home | tool | result
  const [mobileMenu, setMobileMenu] = useState(false);
  const [company, setCompany] = useState("");
  const [years, setYears] = useState(["2022", "2023"]);
  const [files, setFiles] = useState({});
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMsg, setStatusMsg] = useState("");
  const [rawResult, setRawResult] = useState(null);
  const [result, setResult] = useState(null);
  const [paid, setPaid] = useState(false);
  const [paidPlan, setPaidPlan] = useState("standard");
  const [showPaywall, setShowPaywall] = useState(false);
  const [error, setError] = useState(null);

  const uploaded = Object.keys(files).length;
  const canAnalyze = company.trim().length > 0 && uploaded >= 2;

  const setFile = (yr, dt, f) => setFiles(p => ({ ...p, [`${yr}_${dt}`]: f }));
  const removeFile = (yr, dt) => setFiles(p => { const n = { ...p }; delete n[`${yr}_${dt}`]; return n; });
  const addYear = () => { const last = parseInt(years[years.length - 1]); setYears(p => [...p, String(last + 1)]); };
  const removeYear = yr => { if (years.length <= 2) return; setYears(p => p.filter(y => y !== yr)); setFiles(p => { const n = { ...p }; for (const d of DOC_TYPES) delete n[`${yr}_${d.id}`]; return n; }); };

  const toBase64 = f => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result.split(",")[1]); r.onerror = () => rej(); r.readAsDataURL(f); });

  const analyze = async () => {
    if (!canAnalyze || loading) return;
    setLoading(true); setError(null); setRawResult(null); setResult(null); setProgress(10);
    setStatusMsg("A preparar documentos…");
    try {
      const content = [];
      for (const yr of years) {
        for (const dt of DOC_TYPES) {
          const f = files[`${yr}_${dt.id}`];
          if (f) {
            setStatusMsg(`A processar ${dt.label} ${yr}…`);
            const b64 = await toBase64(f);
            content.push({ type: "document", source: { type: "base64", media_type: "application/pdf", data: b64 } });
            content.push({ type: "text", text: `[Documento: ${dt.label} do ano ${yr} da empresa ${company}]` });
          }
        }
      }
      setProgress(40); setStatusMsg("A analisar com inteligência artificial…");

      const yearsStr = years.filter(yr => Object.keys(files).some(k => k.startsWith(yr))).join(", ");

      content.push({ type: "text", text: `Você é um analista financeiro sénior especializado em empresas portuguesas/europeias.
Analise TODOS os documentos financeiros fornecidos da empresa "${company}" (anos: ${yearsStr}).

Produza uma análise financeira completa e detalhada com as seguintes secções:

1. AVALIAÇÃO GLOBAL (uma palavra: Excelente, Bom, Aceitável, Preocupante ou Crítico)

2. SUMÁRIO EXECUTIVO
Texto de síntese de 3-4 frases. Depois lista de 4-5 destaques principais.

3. DADOS FINANCEIROS (valores numéricos por ano):
Volume de negócios, Resultado líquido, EBITDA, Total do activo, Capital próprio, Dívida financeira, Fundo de maneio.

4. INDICADORES E RÁCIOS (valores por ano):
Liquidez Geral, Liquidez Reduzida, Autonomia Financeira (%), ROE (%), ROA (%), Margem Líquida (%), Margem EBITDA (%), Dívida/EBITDA (x), PMR (dias), PMP (dias).

5. ANÁLISE DETALHADA
Quatro parágrafos sobre: Rentabilidade, Liquidez e Solvabilidade, Estrutura de Capital, Eficiência Operacional.

6. PONTOS FORTES E FRACOS
Lista de forças, fraquezas, oportunidades e riscos.

7. RECOMENDAÇÕES
Acções imediatas (0-3 meses), médio prazo (3-12 meses), longo prazo (1-3 anos).

8. CONCLUSÃO
Parágrafo final com perspectivas.

Use português europeu. Seja específico com números e comparações entre anos.` });

      setProgress(60);

      // PASSO 1: Análise em texto livre
      const res1 = await fetch(WORKER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "analyze",
          payload: {
            model: "claude-sonnet-4-5",
            max_tokens: 4000,
            messages: [{ role: "user", content }]
          }
        }),
      });
      if (!res1.ok) { const e = await res1.json(); throw new Error(e.error?.message || "Erro na análise"); }
      const data1 = await res1.json();
      const analiseTexto = data1.content.map(b => b.text || "").join("\n");

      setProgress(75); setStatusMsg("A estruturar o relatório…");

      // PASSO 2: Converter análise para JSON estruturado
      const yearsFiltered = years.filter(yr => Object.keys(files).some(k => k.startsWith(yr)));
      const res2 = await fetch(WORKER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "analyze",
          payload: {
            model: "claude-sonnet-4-5",
            max_tokens: 4000,
            system: "Converte texto de análise financeira para JSON válido. Responde APENAS com JSON, sem markdown, sem blocos de código, sem texto adicional. A resposta começa com { e termina com }.",
            messages: [{
              role: "user",
              content: `Converte esta análise financeira para JSON com exactamente esta estrutura. Usa os valores reais do texto. Responde só com JSON válido, sem blocos de código:

ANÁLISE:
${analiseTexto}

ESTRUTURA JSON:
{
  "empresa": "${company}",
  "anos": ${JSON.stringify(yearsFiltered)},
  "avaliacao_global": "Bom",
  "sumario": {
    "texto": "texto do sumário executivo",
    "destaques": ["destaque 1", "destaque 2", "destaque 3"]
  },
  "financeiros": {
    "volume_negocios": ${JSON.stringify(Object.fromEntries(yearsFiltered.map(y => [y, 0])))},
    "resultado_liquido": ${JSON.stringify(Object.fromEntries(yearsFiltered.map(y => [y, 0])))},
    "ebitda": ${JSON.stringify(Object.fromEntries(yearsFiltered.map(y => [y, 0])))},
    "total_ativo": ${JSON.stringify(Object.fromEntries(yearsFiltered.map(y => [y, 0])))},
    "capital_proprio": ${JSON.stringify(Object.fromEntries(yearsFiltered.map(y => [y, 0])))},
    "divida_financeira": ${JSON.stringify(Object.fromEntries(yearsFiltered.map(y => [y, 0])))}
  },
  "indicadores": {
    "liquidez_geral": ${JSON.stringify({...Object.fromEntries(yearsFiltered.map(y => [y, 0])), "referencia": "> 1.5", "descricao": "Capacidade de cumprir obrigações de curto prazo"})},
    "liquidez_reduzida": ${JSON.stringify({...Object.fromEntries(yearsFiltered.map(y => [y, 0])), "referencia": "> 1.0", "descricao": "Liquidez excluindo existências"})},
    "autonomia_financeira": ${JSON.stringify({...Object.fromEntries(yearsFiltered.map(y => [y, 0])), "referencia": "> 33%", "descricao": "Percentagem de activos financiada por capitais próprios"})},
    "roe": ${JSON.stringify({...Object.fromEntries(yearsFiltered.map(y => [y, 0])), "referencia": "> 10%", "descricao": "Retorno sobre o capital próprio"})},
    "roa": ${JSON.stringify({...Object.fromEntries(yearsFiltered.map(y => [y, 0])), "referencia": "> 5%", "descricao": "Retorno sobre o activo total"})},
    "margem_liquida": ${JSON.stringify({...Object.fromEntries(yearsFiltered.map(y => [y, 0])), "referencia": "> 5%", "descricao": "Resultado líquido / Volume de negócios"})},
    "margem_ebitda": ${JSON.stringify({...Object.fromEntries(yearsFiltered.map(y => [y, 0])), "referencia": "> 10%", "descricao": "EBITDA / Volume de negócios"})},
    "divida_ebitda": ${JSON.stringify({...Object.fromEntries(yearsFiltered.map(y => [y, 0])), "referencia": "< 3.0x", "descricao": "Alavancagem financeira"})},
    "pme": ${JSON.stringify({...Object.fromEntries(yearsFiltered.map(y => [y, 0])), "referencia": "< 45 dias", "descricao": "Prazo médio de recebimentos"})},
    "pmp": ${JSON.stringify({...Object.fromEntries(yearsFiltered.map(y => [y, 0])), "referencia": "30-60 dias", "descricao": "Prazo médio de pagamentos"})}
  },
  "analise_detalhada": {
    "rentabilidade": "texto",
    "liquidez_solvabilidade": "texto",
    "estrutura_capital": "texto",
    "eficiencia_operacional": "texto"
  },
  "swot": {
    "forcas": ["força 1"],
    "fraquezas": ["fraqueza 1"],
    "oportunidades": ["oportunidade 1"],
    "riscos": ["risco 1"]
  },
  "recomendacoes": {
    "imediato": ["acção 1"],
    "medio": ["acção 1"],
    "longo": ["acção 1"]
  },
  "conclusao": "texto da conclusão"
}`
            }]
          }
        }),
      });

      setProgress(88); setStatusMsg("A preparar relatório…");
      if (!res2.ok) { const e = await res2.json(); throw new Error(e.error?.message || "Erro na estruturação"); }
      const data2 = await res2.json();
      const text = data2.content.map(b => b.text || "").join("\n");
      console.log("JSON recebido (primeiros 500 chars):", text.slice(0, 500));
      console.log("Começa com {:", text.trim().startsWith("{"));
      console.log("Termina com }:", text.trim().endsWith("}"));
      const parsed = parseAnalysis(text);
      setRawResult(text);
      setResult(parsed);
      setProgress(100); setStatusMsg("Análise concluída");

      // Guarda cópia no Google Drive da Arrojo & Destreza (antes do pagamento)
      saveToGoogleDrive(company, years, parsed);

      setPage("result");
    } catch (e) {
      setError(e.message || "Erro inesperado");
    } finally {
      setLoading(false);
    }
  };

  /* ── LANDING PAGE ──────────────────────────────────────── */
  if (page === "home") return (
    <>
      <style>{GLOBAL_CSS}</style>

      {/* NAV */}
      <nav style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(245,240,232,0.92)", backdropFilter: "blur(12px)", borderBottom: `1px solid ${C.line}`, padding: "0 6vw" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: "64px" }}>
          <div>
            <div style={{ fontFamily: F.display, fontSize: "20px", letterSpacing: "0.04em", lineHeight: 1 }}>Arrojo <span style={{ color: C.gold }}>&</span> Destreza</div>
            <div style={{ fontSize: "9px", letterSpacing: "0.28em", color: C.fog, textTransform: "uppercase", fontFamily: F.body }}>Consultoria Financeira</div>
          </div>
          <div className="nav-links">
            <span onClick={() => document.getElementById("servicos")?.scrollIntoView({ behavior: "smooth" })} style={{ fontSize: "13px", color: C.steel, cursor: "pointer", letterSpacing: "0.05em", fontFamily: F.body }}>Serviços</span>
            <span onClick={() => document.getElementById("metodologia")?.scrollIntoView({ behavior: "smooth" })} style={{ fontSize: "13px", color: C.steel, cursor: "pointer", letterSpacing: "0.05em", fontFamily: F.body }}>Metodologia</span>
            <a href="mailto:arrojo.destreza@gmail.com" style={{ fontSize: "13px", color: C.steel, cursor: "pointer", letterSpacing: "0.05em", fontFamily: F.body, textDecoration: "none" }}>Contacto</a>
            <button onClick={() => setPage("tool")} style={{ padding: "9px 22px", background: C.gold, border: "none", borderRadius: "4px", color: C.white, fontFamily: F.display, fontSize: "15px", cursor: "pointer", letterSpacing: "0.06em" }}>
              Iniciar Análise
            </button>
          </div>
          <button className="nav-menu-btn" onClick={() => setMobileMenu(true)}>☰</button>
        </div>
      </nav>

      {/* MOBILE MENU */}
      <div className={`nav-mobile-menu ${mobileMenu ? "open" : ""}`}>
        <button className="nav-mobile-close" onClick={() => setMobileMenu(false)}>✕</button>
        <div style={{ fontFamily: F.display, fontSize: "22px", marginBottom: "8px" }}>Arrojo <span style={{ color: C.gold }}>&</span> Destreza</div>
        {[
          { label: "Serviços", action: () => { document.getElementById("servicos")?.scrollIntoView({ behavior: "smooth" }); setMobileMenu(false); } },
          { label: "Metodologia", action: () => { document.getElementById("metodologia")?.scrollIntoView({ behavior: "smooth" }); setMobileMenu(false); } },
        ].map(item => (
          <span key={item.label} onClick={item.action} style={{ fontSize: "20px", fontFamily: F.display, color: C.ink, cursor: "pointer", letterSpacing: "0.06em" }}>{item.label}</span>
        ))}
        <a href="mailto:arrojo.destreza@gmail.com" style={{ fontSize: "20px", fontFamily: F.display, color: C.ink, textDecoration: "none" }}>Contacto</a>
        <button onClick={() => { setPage("tool"); setMobileMenu(false); }}
          style={{ padding: "14px 32px", background: C.gold, border: "none", borderRadius: "4px", color: C.white, fontFamily: F.display, fontSize: "18px", cursor: "pointer" }}>
          Iniciar Análise
        </button>
      </div>

      {/* HERO */}
      <section style={{ maxWidth: "1100px", margin: "0 auto", padding: "100px 6vw 80px" }}>
        <div className="hero-grid">
        <div>
          <div className="fade-up" id="servicos">
            <Tag>Análise Financeira com IA</Tag>
          </div>
          <h1 className="fade-up-1" style={{ fontFamily: F.display, fontSize: "clamp(42px, 5vw, 62px)", fontWeight: 300, lineHeight: 1.1, margin: "20px 0 24px", color: C.ink }}>
            Diagnóstico financeiro<br />
            <span style={{ color: C.gold, fontStyle: "italic" }}>preciso e accionável</span>
          </h1>
          <p className="fade-up-2" style={{ fontFamily: F.body, fontSize: "17px", lineHeight: 1.8, color: C.steel, marginBottom: "36px", maxWidth: "480px" }}>
            Carregue os documentos financeiros da sua empresa — balanços e demonstrações de resultados — e receba em minutos uma análise profissional completa com recomendações concretas de melhoria.
          </p>
          <div className="fade-up-3" style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
            <button onClick={() => setPage("tool")}
              style={{ padding: "14px 32px", background: C.gold, border: "none", borderRadius: "4px", color: C.white, fontFamily: F.display, fontSize: "19px", cursor: "pointer", letterSpacing: "0.06em", display: "flex", alignItems: "center", gap: "10px" }}>
              Analisar a minha empresa <span>→</span>
            </button>
            <button style={{ padding: "14px 28px", background: "transparent", border: `1px solid ${C.line}`, borderRadius: "4px", color: C.steel, fontFamily: F.body, fontSize: "15px", cursor: "pointer" }}>
              Ver exemplo de relatório
            </button>
          </div>
        </div>

        {/* Visual card */}
        <div className="hero-visual fade-up-2" style={{ position: "relative" }}>
          <div style={{ background: C.white, border: `1px solid ${C.line}`, borderRadius: "12px", padding: "32px", boxShadow: "0 24px 64px rgba(0,0,0,0.08)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
              <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#e85454" }} />
              <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#f5a623" }} />
              <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#4caf50" }} />
              <div style={{ flex: 1, height: "1px", background: C.line }} />
            </div>
            {[
              { label: "Liquidez Geral", val: "1.84", trend: "↑", ok: true },
              { label: "Autonomia Financeira", val: "42.3%", trend: "↑", ok: true },
              { label: "ROE", val: "12.7%", trend: "↓", ok: false },
              { label: "Margem Líquida", val: "8.2%", trend: "↑", ok: true },
            ].map((m, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < 3 ? `1px solid ${C.line}` : "none" }}>
                <div style={{ fontSize: "13px", color: C.fog, fontFamily: F.body }}>{m.label}</div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontFamily: F.mono, fontSize: "14px", color: C.ink }}>{m.val}</span>
                  <span style={{ fontSize: "12px", color: m.ok ? C.success : C.danger }}>{m.trend}</span>
                </div>
              </div>
            ))}
            <div style={{ marginTop: "20px", padding: "14px", background: "#FBF7EF", borderRadius: "6px", border: `1px solid ${C.line}` }}>
              <div style={{ fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", color: C.gold, marginBottom: "6px", fontFamily: F.body }}>Recomendação Principal</div>
              <div style={{ fontSize: "13px", color: C.steel, lineHeight: 1.6, fontStyle: "italic", fontFamily: F.body }}>
                "Reforçar a gestão de tesouraria e renegociar prazos de pagamento a fornecedores…"
              </div>
            </div>
          </div>
          <div style={{ position: "absolute", top: "-12px", right: "-12px", width: "60px", height: "60px", background: C.gold, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px" }}>✦</div>
        </div>
        </div>{/* end hero-grid */}
      </section>

      <Divider style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 6vw" }} />

      {/* HOW IT WORKS */}
      <section id="metodologia" style={{ maxWidth: "1100px", margin: "0 auto", padding: "80px 6vw" }}>
        <div style={{ textAlign: "center", marginBottom: "56px" }}>
          <Tag>Como Funciona</Tag>
          <h2 style={{ fontFamily: F.display, fontSize: "38px", fontWeight: 300, marginTop: "14px", color: C.ink }}>
            Três passos para o diagnóstico completo
          </h2>
        </div>
        <div className="how-grid">
          {[
            { num: "01", title: "Carregue os documentos", desc: "Faça upload dos balanços e demonstrações de resultados em PDF de 2 ou mais anos. O processo é seguro e confidencial." },
            { num: "02", title: "A IA analisa tudo", desc: "A nossa inteligência artificial lê e interpreta todos os documentos, calculando rácios, identificando tendências e comparando períodos." },
            { num: "03", title: "Aceda ao relatório completo", desc: "Após confirmação do pagamento, acede imediatamente ao relatório detalhado com indicadores, pontos críticos e plano de acção." },
          ].map((s, i) => (
            <div key={i} style={{ padding: "32px", background: C.white, border: `1px solid ${C.line}`, borderRadius: "8px", position: "relative" }}>
              <div style={{ fontFamily: F.display, fontSize: "52px", color: C.line, fontWeight: 300, lineHeight: 1, marginBottom: "16px" }}>{s.num}</div>
              <div style={{ fontFamily: F.display, fontSize: "22px", marginBottom: "12px", color: C.ink }}>{s.title}</div>
              <div style={{ fontFamily: F.body, fontSize: "14px", lineHeight: 1.8, color: C.fog }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section style={{ background: C.cream, borderTop: `1px solid ${C.line}`, borderBottom: `1px solid ${C.line}`, padding: "80px 6vw" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <Tag>Preços</Tag>
            <h2 style={{ fontFamily: F.display, fontSize: "38px", fontWeight: 300, marginTop: "14px" }}>
              Relatório único por análise
            </h2>
          </div>
          <div className="pricing-grid">
            {[
              { name: "Standard", price: "79€", features: ["Relatório IA completo", "Indicadores financeiros", "Pontos fortes e fracos", "Recomendações prioritizadas", "Download PDF"] },
              { name: "Premium", price: "149€", highlight: true, features: ["Tudo da Standard", "Benchmarking sectorial", "Projecções a 3 anos", "Análise de risco detalhada", "Suporte e-mail 30 dias"] },
            ].map(p => (
              <div key={p.name} style={{ background: p.highlight ? C.gold : C.white, border: `1px solid ${p.highlight ? C.gold : C.line}`, borderRadius: "8px", padding: "32px", position: "relative" }}>
                {p.highlight && <div style={{ position: "absolute", top: "-12px", left: "50%", transform: "translateX(-50%)", background: C.ink, color: C.white, fontSize: "9px", letterSpacing: "0.2em", padding: "4px 14px", borderRadius: "12px", whiteSpace: "nowrap" }}>MAIS POPULAR</div>}
                <div style={{ fontFamily: F.display, fontSize: "24px", color: p.highlight ? C.white : C.ink, marginBottom: "8px" }}>{p.name}</div>
                <div style={{ fontFamily: F.display, fontSize: "44px", color: p.highlight ? C.white : C.gold, marginBottom: "20px", lineHeight: 1 }}>{p.price}</div>
                <ul style={{ listStyle: "none", padding: 0, marginBottom: "24px" }}>
                  {p.features.map((f, i) => (
                    <li key={i} style={{ fontSize: "13px", color: p.highlight ? "rgba(255,255,255,0.9)" : C.steel, marginBottom: "8px", display: "flex", gap: "8px", lineHeight: 1.5 }}>
                      <span style={{ color: p.highlight ? "rgba(255,255,255,0.7)" : C.gold }}>✓</span>{f}
                    </li>
                  ))}
                </ul>
                <button onClick={() => setPage("tool")}
                  style={{ width: "100%", padding: "12px", background: p.highlight ? C.white : C.gold, border: "none", borderRadius: "4px", color: p.highlight ? C.gold : C.white, fontFamily: F.display, fontSize: "17px", cursor: "pointer" }}>
                  Começar →
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: C.ink, color: "rgba(255,255,255,0.5)", padding: "40px 6vw", textAlign: "center" }}>
        <div style={{ fontFamily: F.display, fontSize: "22px", color: C.white, marginBottom: "6px" }}>
          Arrojo <span style={{ color: C.gold }}>&</span> Destreza
        </div>
        <div style={{ fontSize: "12px", letterSpacing: "0.15em", marginBottom: "16px" }}>CONSULTORIA FINANCEIRA</div>
        <a href="mailto:arrojo.destreza@gmail.com" style={{ fontSize: "13px", color: C.gold, display: "block", marginBottom: "16px", textDecoration: "none", letterSpacing: "0.04em" }}>arrojo.destreza@gmail.com</a>
        <div style={{ fontSize: "12px" }}>© 2025 Arrojo & Destreza · Todos os direitos reservados · Matosinhos, Portugal</div>
      </footer>
    </>
  );

  /* ── TOOL PAGE ─────────────────────────────────────────── */
  if (page === "tool") return (
    <>
      <style>{GLOBAL_CSS}</style>

      {/* NAV */}
      <nav style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(245,240,232,0.92)", backdropFilter: "blur(12px)", borderBottom: `1px solid ${C.line}`, padding: "0 6vw" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: "64px" }}>
          <button onClick={() => setPage("home")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ color: C.fog, fontSize: "13px" }}>←</span>
            <div>
              <div style={{ fontFamily: F.display, fontSize: "18px", letterSpacing: "0.04em" }}>Arrojo <span style={{ color: C.gold }}>&</span> Destreza</div>
            </div>
          </button>
          <Tag>Análise Financeira</Tag>
        </div>
      </nav>

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "56px 6vw" }}>
        <div className="fade-up" style={{ marginBottom: "48px" }}>
          <h1 style={{ fontFamily: F.display, fontSize: "44px", fontWeight: 300, marginBottom: "12px", color: C.ink }}>
            Análise da sua empresa
          </h1>
          <p style={{ fontFamily: F.body, fontSize: "16px", color: C.fog, lineHeight: 1.7 }}>
            Carregue os documentos financeiros abaixo. A análise fica pronta em segundos — e é desbloqueada após confirmação de pagamento.
          </p>
        </div>

        {/* Company */}
        <div style={{ marginBottom: "36px" }}>
          <label style={{ fontSize: "11px", letterSpacing: "0.18em", textTransform: "uppercase", color: C.steel, display: "block", marginBottom: "10px", fontFamily: F.body }}>Nome da Empresa</label>
          <input value={company} onChange={e => setCompany(e.target.value)} placeholder="Ex: Silva & Associados, Lda."
            style={{ width: "100%", padding: "13px 18px", border: `1px solid ${C.line}`, borderRadius: "6px", fontFamily: F.display, fontSize: "20px", color: C.ink, background: C.white }} />
        </div>

        {/* Documents */}
        {years.map(yr => (
          <div key={yr} style={{ marginBottom: "28px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "14px" }}>
              <div style={{ fontFamily: F.display, fontSize: "20px", color: C.gold }}>{yr}</div>
              <div style={{ flex: 1, height: "1px", background: C.line }} />
              {years.length > 2 && (
                <button onClick={() => removeYear(yr)} style={{ background: "none", border: "none", color: C.fog, cursor: "pointer", fontSize: "12px", fontFamily: F.body }}>Remover</button>
              )}
            </div>
            <div className="upload-grid">
              {DOC_TYPES.map(dt => (
                <UploadSlot key={dt.id} label={dt.label} year={yr} file={files[`${yr}_${dt.id}`] || null}
                  onUpload={f => setFile(yr, dt.id, f)} onRemove={() => removeFile(yr, dt.id)} />
              ))}
            </div>
          </div>
        ))}

        <button onClick={addYear} style={{ width: "100%", padding: "16px", background: "transparent", border: `1px dashed ${C.line}`, borderRadius: "6px", color: C.fog, fontFamily: F.body, fontSize: "14px", cursor: "pointer", marginBottom: "36px", letterSpacing: "0.06em" }}>
          + Adicionar ano adicional
        </button>

        {error && <div style={{ background: "#FFF5F5", border: `1px solid #E8C0C0`, borderRadius: "6px", padding: "14px 18px", color: C.danger, fontSize: "14px", marginBottom: "20px", fontFamily: F.body }}>⚠ {error}</div>}

        {loading && (
          <div style={{ marginBottom: "24px" }}>
            <div style={{ height: "2px", background: C.line, borderRadius: "2px", overflow: "hidden", marginBottom: "12px" }}>
              <div style={{ height: "100%", background: `linear-gradient(90deg, ${C.gold}, ${C.goldDk})`, width: `${progress}%`, transition: "width 0.5s ease", borderRadius: "2px" }} />
            </div>
            <div style={{ textAlign: "center", fontSize: "13px", color: C.fog, fontStyle: "italic", fontFamily: F.body }}>{statusMsg}</div>
          </div>
        )}

        <button onClick={analyze} disabled={!canAnalyze || loading}
          style={{ width: "100%", padding: "16px", background: canAnalyze && !loading ? C.gold : C.line, border: "none", borderRadius: "6px", color: canAnalyze && !loading ? C.white : C.fog, fontFamily: F.display, fontSize: "22px", cursor: canAnalyze && !loading ? "pointer" : "not-allowed", letterSpacing: "0.06em", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: "12px" }}>
          {loading ? (<><span style={{ display: "inline-block", animation: "spin 0.8s linear infinite" }}>⟳</span> A analisar…</>) : "Analisar Empresa ✦"}
        </button>
        <p style={{ textAlign: "center", fontSize: "12px", color: C.fog, marginTop: "12px", fontStyle: "italic", fontFamily: F.body }}>
          Carregue pelo menos 2 documentos para iniciar · O resultado é desbloqueado mediante pagamento
        </p>
      </div>
    </>
  );

  /* ── RESULT PAGE ───────────────────────────────────────── */
  if (page === "result") {
    const R = result || {};
    const anos = R.anos || years;
    const fin = R.financeiros || {};
    const ind = R.indicadores || {};

    // Build chart data helpers
    const toBarData = (obj) => anos.map(y => ({ label: y, value: obj?.[y] ?? null })).filter(d => d.value !== null);
    const toLineData = (obj) => anos.map(y => ({ label: y, value: obj?.[y] ?? null })).filter(d => d.value !== null);
    const fmtEur = v => v == null ? "—" : v >= 1e6 ? `${(v/1e6).toFixed(2)}M€` : v >= 1e3 ? `${(v/1e3).toFixed(0)}K€` : `${v}€`;
    const fmtPct = v => v == null ? "—" : `${(+v).toFixed(1)}%`;
    const fmtX = v => v == null ? "—" : `${(+v).toFixed(2)}x`;
    const fmtDays = v => v == null ? "—" : `${Math.round(v)}d`;

    return (
    <>
      <style>{GLOBAL_CSS}</style>
      <style>{`
        @media print {
          nav, .no-print { display: none !important; }
          body { background: white !important; }
          .page-break { page-break-before: always; }
        }
      `}</style>

      {/* NAV */}
      <nav className="no-print" style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(245,240,232,0.96)", backdropFilter: "blur(12px)", borderBottom: `1px solid ${C.line}`, padding: "0 6vw" }}>
        <div style={{ maxWidth: "960px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: "64px" }}>
          <div style={{ fontFamily: F.display, fontSize: "18px" }}>Arrojo <span style={{ color: C.gold }}>&</span> Destreza</div>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            {!paid && (
              <button onClick={() => setShowPaywall(true)}
                style={{ padding: "9px 22px", background: C.gold, border: "none", borderRadius: "4px", color: C.white, fontFamily: F.display, fontSize: "16px", cursor: "pointer" }}>
                Desbloquear Relatório Completo
              </button>
            )}
            {paid && (
              <>
                <Tag>Desbloqueado ✓</Tag>
                <button onClick={() => window.print()} style={{ padding: "7px 16px", background: "none", border: `1px solid ${C.line}`, borderRadius: "4px", color: C.steel, fontFamily: F.body, fontSize: "13px", cursor: "pointer" }}>
                  ⬇ Imprimir / PDF
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: "960px", margin: "0 auto", padding: "56px 6vw 80px" }}>

        {/* ── COVER ── */}
        <div className="fade-up" style={{ marginBottom: "56px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "20px" }}>
            <div>
              <Tag>Relatório de Análise Financeira</Tag>
              <h1 style={{ fontFamily: F.display, fontSize: "clamp(36px,5vw,54px)", fontWeight: 300, marginTop: "14px", marginBottom: "8px", color: C.ink, lineHeight: 1.1 }}>
                {R.empresa || company}
              </h1>
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "10px" }}>
                {anos.map(y => <span key={y} style={{ fontSize: "13px", color: C.fog, fontFamily: F.body, borderRight: `1px solid ${C.line}`, paddingRight: "12px" }}>Exercício {y}</span>)}
                <span style={{ fontSize: "12px", color: C.fog, fontFamily: F.body }}>Emitido em {new Date().toLocaleDateString("pt-PT")}</span>
              </div>
            </div>
            {R.avaliacao_global && <RatingBadge rating={R.avaliacao_global} />}
          </div>

          {/* Summary highlights */}
          {R.sumario?.destaques && (
            <div style={{ display: "flex", gap: "12px", marginTop: "28px", flexWrap: "wrap" }}>
              {R.sumario.destaques.map((d, i) => (
                <div key={i} style={{ background: C.white, border: `1px solid ${C.line}`, borderRadius: "6px", padding: "10px 16px", fontSize: "13px", fontFamily: F.body, color: C.steel, flexShrink: 0 }}>
                  {d}
                </div>
              ))}
            </div>
          )}
        </div>

        <Divider style={{ marginBottom: "0" }} />

        {/* ── SECTION 1 — SUMÁRIO EXECUTIVO ── */}
        <ReportSection number="01" title="Sumário Executivo">
          {R.sumario?.texto && (
            <p style={{ fontFamily: F.body, fontSize: "16px", lineHeight: 1.9, color: C.steel, marginBottom: "24px", maxWidth: "720px" }}>
              {R.sumario.texto}
            </p>
          )}

          {/* Top KPIs strip */}
          {Object.keys(fin).length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "12px", marginTop: "8px" }}>
              {[
                { key: "volume_negocios", label: "Volume de Negócios", fmt: fmtEur },
                { key: "resultado_liquido", label: "Resultado Líquido", fmt: fmtEur },
                { key: "ebitda", label: "EBITDA", fmt: fmtEur },
                { key: "total_ativo", label: "Total do Activo", fmt: fmtEur },
                { key: "capital_proprio", label: "Capital Próprio", fmt: fmtEur },
                { key: "divida_financeira", label: "Dívida Financeira", fmt: fmtEur },
              ].filter(m => fin[m.key]).map(m => (
                <KpiCard key={m.key} label={m.label} values={Object.fromEntries(anos.filter(y => fin[m.key]?.[y] != null).map(y => [y, m.fmt(fin[m.key][y])]))} />
              ))}
            </div>
          )}
        </ReportSection>

        {/* ── SECTION 2 — EVOLUÇÃO FINANCEIRA (charts) ── */}
        {Object.keys(fin).length > 0 && (
          <ReportSection number="02" title="Evolução Financeira">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px" }}>
              {fin.volume_negocios && toBarData(fin.volume_negocios).length > 0 && (
                <div>
                  <div style={{ fontSize: "11px", letterSpacing: "0.16em", textTransform: "uppercase", color: C.fog, fontFamily: F.body, marginBottom: "12px" }}>Volume de Negócios</div>
                  <BarChart data={toBarData(fin.volume_negocios)} formatVal={fmtEur} height={180} />
                </div>
              )}
              {fin.resultado_liquido && toBarData(fin.resultado_liquido).length > 0 && (
                <div>
                  <div style={{ fontSize: "11px", letterSpacing: "0.16em", textTransform: "uppercase", color: C.fog, fontFamily: F.body, marginBottom: "12px" }}>Resultado Líquido</div>
                  <BarChart data={toBarData(fin.resultado_liquido)} formatVal={fmtEur} height={180} />
                </div>
              )}
              {fin.ebitda && toBarData(fin.ebitda).length > 0 && (
                <div>
                  <div style={{ fontSize: "11px", letterSpacing: "0.16em", textTransform: "uppercase", color: C.fog, fontFamily: F.body, marginBottom: "12px" }}>EBITDA</div>
                  <BarChart data={toBarData(fin.ebitda)} formatVal={fmtEur} height={180} />
                </div>
              )}
              {(fin.total_ativo || fin.capital_proprio || fin.divida_financeira) && (() => {
                const series = [];
                if (fin.total_ativo) series.push({ name: "Activo Total", data: toLineData(fin.total_ativo) });
                if (fin.capital_proprio) series.push({ name: "Cap. Próprio", data: toLineData(fin.capital_proprio) });
                if (fin.divida_financeira) series.push({ name: "Dívida", data: toLineData(fin.divida_financeira) });
                return series.some(s => s.data.length > 0) ? (
                  <div>
                    <div style={{ fontSize: "11px", letterSpacing: "0.16em", textTransform: "uppercase", color: C.fog, fontFamily: F.body, marginBottom: "12px" }}>Estrutura de Capital</div>
                    <LineChart series={series} formatVal={fmtEur} height={200} />
                  </div>
                ) : null;
              })()}
            </div>
          </ReportSection>
        )}

        {/* ── SECTION 3 — INDICADORES & RÁCIOS ── */}
        {!paid ? (
          /* PAYWALL for sections 3+ */
          <div style={{ position: "relative", marginTop: "0" }}>
            <div style={{ filter: "blur(5px)", userSelect: "none", pointerEvents: "none" }}>
              <ReportSection number="03" title="Indicadores e Rácios Financeiros">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
                  {Object.entries(ind).slice(0, 6).map(([key, val]) => (
                    <KpiCard key={key} label={key.replace(/_/g, " ").toUpperCase()} values={{ "2023": "—" }} />
                  ))}
                </div>
              </ReportSection>
            </div>
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(to bottom, transparent 0%, rgba(245,240,232,0.6) 30%, rgba(245,240,232,0.9) 100%)" }}>
              <div style={{ background: C.white, border: `1px solid ${C.line}`, borderRadius: "14px", padding: "44px 52px", textAlign: "center", boxShadow: "0 24px 72px rgba(0,0,0,0.10)", maxWidth: "500px" }}>
                <div style={{ width: "48px", height: "48px", background: "#FAF7EE", border: `1px solid ${C.line}`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", margin: "0 auto 20px" }}>🔒</div>
                <h2 style={{ fontFamily: F.display, fontSize: "30px", fontWeight: 300, marginBottom: "12px", color: C.ink, lineHeight: 1.2 }}>
                  Análise completa<br /><span style={{ color: C.gold, fontStyle: "italic" }}>disponível após pagamento</span>
                </h2>
                <p style={{ fontFamily: F.body, fontSize: "14px", color: C.fog, lineHeight: 1.8, marginBottom: "28px" }}>
                  O sumário e a evolução financeira estão disponíveis gratuitamente. Para aceder a todos os rácios, gráficos detalhados, análise SWOT e plano de recomendações, confirme o pagamento.
                </p>
                <button onClick={() => setShowPaywall(true)}
                  style={{ width: "100%", padding: "15px", background: C.gold, border: "none", borderRadius: "6px", color: C.white, fontFamily: F.display, fontSize: "20px", cursor: "pointer", letterSpacing: "0.04em", marginBottom: "10px" }}>
                  Ver Relatório Completo → a partir de 79€
                </button>
                <div style={{ fontSize: "11px", color: C.fog, fontStyle: "italic", fontFamily: F.body }}>Acesso imediato · IVA incluído · Garantia de satisfação</div>
              </div>
            </div>
          </div>
        ) : (
          <>
          {/* FULL PAID CONTENT */}

          {/* Indicadores — Standard e Premium */}
          {Object.keys(ind).length > 0 && (
            <ReportSection number="03" title="Indicadores e Rácios Financeiros">
              {/* KPI cards grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px", marginBottom: "36px" }}>
                {Object.entries(ind).map(([key, val]) => {
                  const yVals = {};
                  anos.forEach(y => { if (val?.[y] != null) yVals[y] = val[y]; });
                  if (!Object.keys(yVals).length) return null;
                  const fmts = { roe: fmtPct, roa: fmtPct, margem_liquida: fmtPct, margem_ebitda: fmtPct, autonomia_financeira: fmtPct, divida_ebitda: fmtX, pme: fmtDays, pmp: fmtDays };
                  const fmt = fmts[key] || (v => typeof v === "number" ? v.toFixed(2) : v);
                  const labels = { liquidez_geral: "Liquidez Geral", liquidez_reduzida: "Liquidez Reduzida", autonomia_financeira: "Autonomia Financeira", roe: "ROE", roa: "ROA", margem_liquida: "Margem Líquida", margem_ebitda: "Margem EBITDA", divida_ebitda: "Dívida / EBITDA", pme: "Prazo Méd. Recebimentos", pmp: "Prazo Méd. Pagamentos" };
                  return (
                    <KpiCard key={key}
                      label={labels[key] || key.replace(/_/g, " ")}
                      values={Object.fromEntries(Object.entries(yVals).map(([y, v]) => [y, fmt(v)]))}
                      benchmark={val?.referencia}
                      description={val?.descricao}
                    />
                  );
                })}
              </div>

              {/* Ratio charts */}
              <div className="chart-grid">
                {/* Liquidity */}
                {(ind.liquidez_geral || ind.liquidez_reduzida) && (() => {
                  const series = [];
                  if (ind.liquidez_geral) series.push({ name: "Liquidez Geral", data: toLineData(ind.liquidez_geral) });
                  if (ind.liquidez_reduzida) series.push({ name: "Liquidez Reduzida", data: toLineData(ind.liquidez_reduzida) });
                  return (
                    <div>
                      <div style={{ fontSize: "11px", letterSpacing: "0.16em", textTransform: "uppercase", color: C.fog, fontFamily: F.body, marginBottom: "12px" }}>Rácios de Liquidez</div>
                      <LineChart series={series} formatVal={v => v?.toFixed ? v.toFixed(2) : v} height={200} />
                    </div>
                  );
                })()}

                {/* Rentabilidade */}
                {(ind.roe || ind.roa || ind.margem_liquida) && (() => {
                  const series = [];
                  if (ind.roe) series.push({ name: "ROE %", data: toLineData(ind.roe) });
                  if (ind.roa) series.push({ name: "ROA %", data: toLineData(ind.roa) });
                  if (ind.margem_liquida) series.push({ name: "Margem Liq. %", data: toLineData(ind.margem_liquida) });
                  return (
                    <div>
                      <div style={{ fontSize: "11px", letterSpacing: "0.16em", textTransform: "uppercase", color: C.fog, fontFamily: F.body, marginBottom: "12px" }}>Rentabilidade</div>
                      <LineChart series={series} formatVal={v => `${v?.toFixed ? v.toFixed(1) : v}%`} height={200} />
                    </div>
                  );
                })()}

                {/* PMR/PMP */}
                {(ind.pme || ind.pmp) && (
                  <div>
                    <div style={{ fontSize: "11px", letterSpacing: "0.16em", textTransform: "uppercase", color: C.fog, fontFamily: F.body, marginBottom: "12px" }}>Ciclo de Exploração (dias)</div>
                    <BarChart data={[
                      ...anos.filter(y => ind.pme?.[y] != null).map(y => ({ label: `PMR ${y}`, value: ind.pme[y] })),
                      ...anos.filter(y => ind.pmp?.[y] != null).map(y => ({ label: `PMP ${y}`, value: ind.pmp[y] })),
                    ]} formatVal={fmtDays} height={180} />
                  </div>
                )}

                {/* Autonomia Financeira Gauge (last year) */}
                {ind.autonomia_financeira && (() => {
                  const lastYr = anos.filter(y => ind.autonomia_financeira?.[y] != null).slice(-1)[0];
                  const val = ind.autonomia_financeira?.[lastYr];
                  return lastYr && val != null ? (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <div style={{ fontSize: "11px", letterSpacing: "0.16em", textTransform: "uppercase", color: C.fog, fontFamily: F.body, marginBottom: "12px", alignSelf: "flex-start" }}>Autonomia Financeira {lastYr}</div>
                      <GaugeChart value={val} min={0} max={100} label={`% (ref. > 33%)`} />
                      {anos.length > 1 && (
                        <div style={{ marginTop: "8px" }}>
                          <LineChart series={[{ name: "Autonomia %", data: toLineData(ind.autonomia_financeira) }]} formatVal={fmtPct} height={140} />
                        </div>
                      )}
                    </div>
                  ) : null;
                })()}
              </div>
            </ReportSection>
          )}

          {/* Secções 04-07 — apenas Premium */}
          {paidPlan === "premium" ? (<>

          {/* Análise Detalhada */}
          {R.analise_detalhada && (
            <ReportSection number="04" title="Análise Detalhada">
              <div className="analise-grid">
                {[
                  { key: "rentabilidade", title: "Rentabilidade", icon: "📈" },
                  { key: "liquidez_solvabilidade", title: "Liquidez e Solvabilidade", icon: "💧" },
                  { key: "estrutura_capital", title: "Estrutura de Capital", icon: "🏗" },
                  { key: "eficiencia_operacional", title: "Eficiência Operacional", icon: "⚙️" },
                ].filter(s => R.analise_detalhada[s.key]).map(s => (
                  <div key={s.key} style={{ background: C.white, border: `1px solid ${C.line}`, borderRadius: "8px", padding: "20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                      <span style={{ fontSize: "16px" }}>{s.icon}</span>
                      <span style={{ fontFamily: F.display, fontSize: "17px", color: C.ink }}>{s.title}</span>
                    </div>
                    <p style={{ fontFamily: F.body, fontSize: "14px", lineHeight: 1.8, color: C.steel }}>{R.analise_detalhada[s.key]}</p>
                  </div>
                ))}
              </div>
            </ReportSection>
          )}

          {/* SWOT */}
          {R.swot && (
            <ReportSection number="05" title="Pontos Fortes, Fracos, Oportunidades e Riscos">
              <SwotTable data={R.swot} />
            </ReportSection>
          )}

          {/* Recomendações */}
          {R.recomendacoes && (
            <ReportSection number="06" title="Recomendações e Plano de Acção">
              <ActionPlan actions={R.recomendacoes} />
            </ReportSection>
          )}

          {/* Conclusão */}
          {R.conclusao && (
            <ReportSection number="07" title="Conclusão">
              <p style={{ fontFamily: F.body, fontSize: "16px", lineHeight: 1.9, color: C.steel, maxWidth: "720px" }}>{R.conclusao}</p>
            </ReportSection>
          )}

          {/* Fallback for unparsed text */}
          {R._fallback && (
            <ReportSection number="03" title="Análise Completa">
              <RichText content={R._fallback} />
            </ReportSection>
          )}

          </>) : (
            /* Standard — upgrade CTA para Premium */
            <div style={{ background: C.cream, border: `1px solid ${C.line}`, borderRadius: "10px", padding: "36px", textAlign: "center", margin: "32px 0" }}>
              <div style={{ fontFamily: F.display, fontSize: "24px", marginBottom: "10px", color: C.ink }}>
                Actualize para <span style={{ color: C.gold, fontStyle: "italic" }}>Premium</span>
              </div>
              <p style={{ fontFamily: F.body, fontSize: "14px", color: C.fog, marginBottom: "24px", lineHeight: 1.8 }}>
                O plano Standard inclui Sumário, Evolução Financeira e Indicadores.<br />
                Para aceder à Análise Detalhada, SWOT, Recomendações e Conclusão actualize para Premium (149€).
              </p>
              <button onClick={() => setShowPaywall(true)}
                style={{ padding: "13px 32px", background: C.gold, border: "none", borderRadius: "6px", color: C.white, fontFamily: F.display, fontSize: "18px", cursor: "pointer" }}>
                Actualizar para Premium → 149€
              </button>
            </div>
          )}

          {/* Footer */}
          <div style={{ textAlign: "center", padding: "48px 0 20px" }}>
            <Divider style={{ marginBottom: "20px" }} />
            <div style={{ fontSize: "11px", color: C.fog, fontStyle: "italic", fontFamily: F.body, lineHeight: 1.8 }}>
              Relatório produzido por <strong>Arrojo & Destreza — Consultoria Financeira</strong><br />
              Powered by Claude AI · {new Date().toLocaleDateString("pt-PT")} · Matosinhos, Portugal
            </div>
          </div>
          </>
        )}
      </div>

      {showPaywall && (
        <PaywallModal
          companyName={company}
          onClose={() => setShowPaywall(false)}
          onPay={(p) => { setPaid(true); setPaidPlan(p || "standard"); setShowPaywall(false); }}
        />
      )}
    </>
    );
  }
}
