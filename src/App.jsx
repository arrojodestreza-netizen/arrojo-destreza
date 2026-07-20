import { useState, useCallback, useRef, useEffect } from "react";
import { useTranslation, I18nextProvider } from "react-i18next";
import i18n from "./i18n/index.js";

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

/* ─── LANGUAGE SELECTOR ──────────────────────────────────── */
const LANGS = [
  { code: "pt", label: "PT" },
  { code: "es", label: "ES" },
  { code: "en", label: "EN" },
  { code: "fr", label: "FR" },
  { code: "de", label: "DE" },
];

function LangSelector() {
  const { i18n: i18nInst } = useTranslation();
  const current = i18nInst.language?.slice(0, 2) || "pt";
  return (
    <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
      {LANGS.map((l, idx) => (
        <span key={l.code} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <button
            onClick={() => i18nInst.changeLanguage(l.code)}
            style={{
              background: "none", border: "none", cursor: "pointer",
              fontFamily: F.body, fontSize: "11px", letterSpacing: "0.1em",
              color: current === l.code ? C.gold : C.fog,
              fontWeight: current === l.code ? "600" : "400",
              padding: "2px 0",
              borderBottom: current === l.code ? `1px solid ${C.gold}` : "none",
              transition: "all 0.15s",
            }}
          >{l.label}</button>
          {idx < LANGS.length - 1 && (
            <span style={{ color: C.line, fontSize: "10px" }}>·</span>
          )}
        </span>
      ))}
    </div>
  );
}

/* ─── GOOGLE DRIVE BACKUP ────────────────────────────────── */
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwxd4KFABaHgab6adHw6Z2rXvKWlIR9uiHjaXzezwq0p9ain61hQFQRjM6K1lVm7fIZ/exec";
const WORKER_URL = "https://arrojo-proxy.arrojo-destreza.workers.dev/";

async function saveToGoogleDrive(company, anos, parsed) {
  try {
    const R = parsed || {};
    const payload = {
      type: "backup", empresa: R.empresa || company,
      anos: (R.anos || anos).join(", "), avaliacao: R.avaliacao_global || "",
      data: new Date().toLocaleDateString("pt-PT"), pago: false,
      sumario: R.sumario?.texto || R.sumario || "",
      destaques: R.sumario?.destaques || [],
      indicadores: R.indicadores || {}, analise: R.analise_detalhada || R.analise || {},
      swot: R.swot || {}, recomendacoes: R.recomendacoes || {}, conclusao: R.conclusao || "",
    };
    await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST", mode: "no-cors",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify(payload),
    });
  } catch (err) { console.warn("Backup Drive falhou:", err.message); }
}

/* ─── NOTIFICAÇÃO DE FATURA ──────────────────────────────── */
async function notificarFatura(metodo, selectedPlan, form, company) {
  try {
    await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST", mode: "no-cors",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify({
        type: "fatura", empresa: company,
        plano: selectedPlan.label, valor: selectedPlan.price,
        metodo: metodo === "card" ? "Cartão" : "MB WAY",
        cliente_nome: form.name, cliente_nif: form.nif,
        cliente_email: form.email, cliente_morada: form.morada,
        cliente_codigopostal: form.codigopostal,
        cliente_localidade: form.localidade,
        data: new Date().toLocaleDateString("pt-PT"),
      }),
    });
  } catch (err) { console.warn("Notificação fatura falhou:", err.message); }
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
  .nav-links { display: flex; gap: 32px; align-items: center; }
  .nav-menu-btn { display: none; background: none; border: none; cursor: pointer; font-size: 22px; color: ${C.steel}; }
  .nav-mobile-menu { display: none; position: fixed; inset: 0; background: ${C.paper}; z-index: 200; flex-direction: column; align-items: center; justify-content: center; gap: 32px; }
  .nav-mobile-menu.open { display: flex; }
  .nav-mobile-close { position: absolute; top: 20px; right: 20px; background: none; border: none; font-size: 24px; cursor: pointer; color: ${C.steel}; }
  .hero-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center; }
  .hero-visual { display: block; }
  .how-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; }
  .pricing-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; max-width: 700px; margin: 0 auto; }
  .upload-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .chart-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; }
  .analise-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
  .swot-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2px; }
  .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(155px, 1fr)); gap: 12px; }
  .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; }
  .plans-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
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
  }
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
    <span style={{ display: "inline-block", padding: "3px 12px", border: `1px solid ${C.gold}`, borderRadius: "20px", fontSize: "10px", letterSpacing: "0.22em", textTransform: "uppercase", color: C.gold, fontFamily: F.body, fontWeight: 400 }}>{children}</span>
  );
}

/* ─── UPLOAD SLOT ────────────────────────────────────────── */
function UploadSlot({ label, year, file, onUpload, onRemove }) {
  const { t } = useTranslation();
  const [over, setOver] = useState(false);
  const ref = useRef();
  const handleDrop = useCallback(e => {
    e.preventDefault(); setOver(false);
    const f = e.dataTransfer.files[0];
    if (f?.type === "application/pdf") onUpload(f);
  }, [onUpload]);
  return (
    <div onClick={() => !file && ref.current.click()}
      onDragOver={e => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)} onDrop={handleDrop}
      style={{ border: `1px solid ${file ? C.gold : over ? C.goldLt : C.line}`, borderRadius: "6px", background: file ? "#FAF6EE" : over ? "#FBF7EF" : C.white, padding: "18px 20px", cursor: file ? "default" : "pointer", transition: "all 0.2s", position: "relative", minHeight: "100px" }}>
      <input ref={ref} type="file" accept=".pdf" style={{ display: "none" }} onChange={e => e.target.files[0] && onUpload(e.target.files[0])} />
      <div style={{ fontSize: "10px", letterSpacing: "0.18em", textTransform: "uppercase", color: C.gold, marginBottom: "6px", fontFamily: F.body }}>{label} · {year}</div>
      {file ? (
        <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
          <div style={{ fontSize: "20px", lineHeight: 1 }}>📄</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: "13px", color: C.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: F.body }}>{file.name}</div>
            <div style={{ fontSize: "11px", color: C.success, marginTop: "3px", fontFamily: F.mono }}>✓ {t("tool.uploadLoaded")} · {(file.size / 1024).toFixed(0)} KB</div>
          </div>
          <button onClick={e => { e.stopPropagation(); onRemove(); }} style={{ background: "none", border: "none", color: C.fog, cursor: "pointer", fontSize: "14px", lineHeight: 1, padding: "2px" }}>✕</button>
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "36px", height: "36px", border: `1px dashed ${over ? C.gold : C.line}`, borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", color: C.fog, flexShrink: 0 }}>{over ? "⬆" : "+"}</div>
          <div style={{ fontSize: "12px", color: C.fog, fontFamily: F.body, fontStyle: "italic", lineHeight: 1.4 }}>{t("tool.uploadDrag")}</div>
        </div>
      )}
    </div>
  );
}

/* ─── STRIPE ─────────────────────────────────────────────── */
const STRIPE_PK = "pk_live_51TZrY746j0PZ8qyWhdsU6Z11l1lqa7YjlFIunI7wzu6iTlh1vJHEtpYcvXDnD64EkjFNV8iCgVguoEf7Eqv7CSbZ00MpyeLmib";
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
  const { t } = useTranslation();
  const [step, setStep] = useState("choose");
  const [plan, setPlan] = useState("standard");
  const [payMethod, setPayMethod] = useState("card");
  const [form, setForm] = useState({ name: "", email: "", phone: "", nif: "", morada: "", localidade: "", codigopostal: "" });
  const [errors, setErrors] = useState({});
  const [stripeError, setStripeError] = useState("");
  const [cardReady, setCardReady] = useState(false);
  const [mbwayStatus, setMbwayStatus] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [couponStatus, setCouponStatus] = useState(null); // null | "checking" | "valid" | "invalid"
  const [couponData, setCouponData] = useState(null); // { discount, couponId, name }
  const stripeRef = useRef(null);
  const cardRef = useRef(null);
  const cardMountRef = useRef(null);
  const pollRef = useRef(null);

  const PLANS = [
    { id: "standard", label: t("paywall.planFeatures.standard", { returnObjects: true })[0] ? "Análise Standard" : "Standard", labelKey: "standard", price: "79€", amount: 7900, features: t("paywall.planFeatures.standard", { returnObjects: true }) },
    { id: "premium", label: "Premium", labelKey: "premium", price: "149€", amount: 14900, highlight: true, features: t("paywall.planFeatures.premium", { returnObjects: true }) },
  ];
  const selectedPlan = PLANS.find(p => p.id === plan);

  useEffect(() => {
    if (step !== "checkout" || payMethod !== "card") return;
    setCardReady(false);
    let mounted = true;
    loadStripe().then(stripe => {
      if (!mounted || !cardMountRef.current) return;
      stripeRef.current = stripe;
      const elements = stripe.elements();
      const card = elements.create("card", { style: { base: { fontFamily: "'Georgia', serif", fontSize: "15px", color: "#0B0C0E", "::placeholder": { color: "#8A8880" } } } });
      card.mount(cardMountRef.current);
      cardRef.current = card;
      card.on("ready", () => { if (mounted) setCardReady(true); });
      card.on("change", e => { if (mounted) setStripeError(e.error ? e.error.message : ""); });
    });
    return () => { mounted = false; };
  }, [step, payMethod]);

  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current); }, []);

  const validateCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponStatus("checking");
    setCouponData(null);
    try {
      const resp = await fetch(WORKER_URL, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "validate_coupon", couponCode: couponCode.trim() }),
      });
      const data = await resp.json();
      if (data.valid) {
        setCouponStatus("valid");
        setCouponData(data);
      } else {
        setCouponStatus("invalid");
        setCouponData({ error: data.error || "Código inválido" });
      }
    } catch(e) {
      setCouponStatus("invalid");
      setCouponData({ error: "Erro ao validar código" });
    }
  };

  const getFinalAmount = () => {
    if (!couponData || couponStatus !== "valid") return selectedPlan?.amount || 0;
    if (couponData.discount?.type === "percent") {
      return Math.round((selectedPlan?.amount || 0) * (1 - couponData.discount.value / 100));
    }
    if (couponData.discount?.type === "amount") {
      return Math.max(0, (selectedPlan?.amount || 0) - couponData.discount.value);
    }
    return selectedPlan?.amount || 0;
  };

  const getFinalPrice = () => {
    const amt = getFinalAmount();
    if (amt === 0) return "0€ (Gratuito)";
    return `${(amt / 100).toFixed(0)}€`;
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = t("paywall.errors.name");
    if (!form.email.includes("@")) e.email = t("paywall.errors.email");
    if (!form.nif.trim() || form.nif.replace(/\s/g,"").length < 9) e.nif = t("paywall.errors.nif");
    if (!form.morada.trim()) e.morada = t("paywall.errors.morada");
    if (payMethod === "mbway" && !/^9[1236]\d{7}$/.test(form.phone.replace(/\s/g, ""))) e.phone = t("paywall.errors.phone");
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePayCard = async () => {
    if (!validate()) return;
    const finalAmt = getFinalAmount();

    // Cupão 100% — sem cobrar cartão
    if (finalAmt === 0) {
      setStep("processing");
      try {
        const intentResp = await fetch(WORKER_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "create_payment", amount: 0, currency: "eur", description: `${selectedPlan.label} — ${companyName}`, plan, cliente_nome: form.name, cliente_email: form.email, cliente_nif: form.nif, cliente_morada: form.morada, cliente_codigopostal: form.codigopostal, cliente_localidade: form.localidade, couponId: couponData?.couponId }) });
        const intentData = await intentResp.json();
        if (intentData.free || intentData.status === "succeeded") {
          notificarFatura("card", selectedPlan, form, companyName);
          setStep("success");
          setTimeout(() => { onPay(plan); onClose(); }, 2500);
        } else {
          throw new Error("Erro ao processar código promocional");
        }
      } catch (err) { setStripeError(err.message); setStep("checkout"); }
      return;
    }

    const stripe = stripeRef.current; const card = cardRef.current;
    if (!stripe || !card) { setStripeError("Erro ao carregar o Stripe."); return; }
    const { error: pmError, paymentMethod } = await stripe.createPaymentMethod({ type: "card", card, billing_details: { name: form.name, email: form.email, address: { line1: form.morada, postal_code: form.codigopostal, city: form.localidade, country: "PT" } } });
    if (pmError) { setStripeError(pmError.message); return; }
    setStep("processing");
    try {
      const intentResp = await fetch(WORKER_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "create_payment", amount: finalAmt, currency: "eur", description: `${selectedPlan.label} — ${companyName}`, plan, cliente_nome: form.name, cliente_email: form.email, cliente_nif: form.nif, cliente_morada: form.morada, cliente_codigopostal: form.codigopostal, cliente_localidade: form.localidade, couponId: couponData?.couponId }) });
      const intentData = await intentResp.json();
      if (intentData.error) throw new Error(intentData.error.message || "Erro ao criar pagamento");
      const { error, paymentIntent } = await stripe.confirmCardPayment(intentData.client_secret, { payment_method: paymentMethod.id });
      if (error) throw new Error(error.message);
      if (paymentIntent.status === "succeeded") {
        notificarFatura("card", selectedPlan, form, companyName);
        setStep("success");
        setTimeout(() => { onPay(plan); onClose(); }, 2500);
      }
    } catch (err) { setStripeError(err.message); setStep("checkout"); }
  };

  const handlePayMBWay = async () => {
    if (!validate()) return;
    setStep("processing");
    const orderId = `AD-${Date.now()}`;
    try {
      const resp = await fetch(WORKER_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "create_mbway", phone: form.phone.replace(/\s/g, ""), amount: selectedPlan.amount, orderId, email: form.email, description: `${selectedPlan.label} — ${companyName}`, cliente_nome: form.name, cliente_nif: form.nif, cliente_morada: form.morada, cliente_codigopostal: form.codigopostal, cliente_localidade: form.localidade }) });
      const data = await resp.json();
      const sent = data.sent || data.Estado === "000";
      if (!sent) throw new Error(`Erro MB WAY: ${data.MsgDescricao || data.raw || "Verifique o número."}`);
      const idPedido = data.idPedido || data.IdPedido || orderId;
      setStep("mbway"); setMbwayStatus("waiting");
      let attempts = 0;
      pollRef.current = setInterval(async () => {
        attempts++;
        if (attempts > 48) { clearInterval(pollRef.current); setMbwayStatus("error"); return; }
        try {
          const checkResp = await fetch(WORKER_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "check_mbway", idPedido }) });
          const checkData = await checkResp.json();
          if (checkData.paid) {
            clearInterval(pollRef.current);
            notificarFatura("mbway", selectedPlan, form, companyName);
            setMbwayStatus("success"); setStep("success");
            setTimeout(() => { onPay(plan); onClose(); }, 2500);
          }
        } catch(e) {}
      }, 5000);
    } catch (err) { setStripeError(err.message); setStep("checkout"); }
  };

  const handlePay = () => payMethod === "card" ? handlePayCard() : handlePayMBWay();
  const overlay = { position: "fixed", inset: 0, background: "rgba(11,12,14,0.72)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", animation: "fadeIn 0.2s ease" };
  const box = { background: C.white, borderRadius: "10px", maxWidth: "560px", width: "100%", maxHeight: "90vh", overflowY: "auto", position: "relative", animation: "fadeUp 0.3s ease" };
  const inp = (err) => ({ width: "100%", padding: "10px 14px", border: `1px solid ${err ? C.danger : C.line}`, borderRadius: "5px", fontFamily: F.body, fontSize: "15px", color: C.ink, background: C.white });

  if (step === "processing") return (
    <div style={overlay}><div style={{ ...box, padding: "60px 40px", textAlign: "center" }}>
      <div style={{ width: "48px", height: "48px", border: `3px solid ${C.line}`, borderTopColor: C.gold, borderRadius: "50%", margin: "0 auto 24px", animation: "spin 0.8s linear infinite" }} />
      <div style={{ fontFamily: F.display, fontSize: "22px", marginBottom: "10px" }}>{t("paywall.processing")}</div>
      <div style={{ color: C.fog, fontSize: "14px" }}>{t("paywall.processingWait")}</div>
    </div></div>
  );

  if (step === "mbway") return (
    <div style={overlay}><div style={{ ...box, padding: "48px 40px", textAlign: "center" }}>
      <div style={{ fontSize: "48px", marginBottom: "16px" }}>📱</div>
      <div style={{ fontFamily: F.display, fontSize: "24px", marginBottom: "10px" }}>{t("paywall.mbwayTitle")}</div>
      <p style={{ color: C.fog, fontSize: "14px", lineHeight: 1.7, marginBottom: "20px" }}>{t("paywall.mbwayDesc", { price: selectedPlan?.price, phone: form.phone })}</p>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", color: C.fog, fontSize: "13px" }}>
        <div style={{ width: "16px", height: "16px", border: `2px solid ${C.gold}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        {t("paywall.mbwayWaiting")}
      </div>
      <div style={{ marginTop: "20px", fontSize: "11px", color: C.fog, fontStyle: "italic" }}>{t("paywall.mbwayExpires")}</div>
      <button onClick={() => { clearInterval(pollRef.current); setStep("checkout"); }} style={{ marginTop: "16px", background: "none", border: "none", color: C.fog, cursor: "pointer", fontSize: "13px", textDecoration: "underline" }}>{t("paywall.mbwayCancel")}</button>
    </div></div>
  );

  if (step === "success") return (
    <div style={overlay}><div style={{ ...box, padding: "60px 40px", textAlign: "center" }}>
      <div style={{ fontSize: "48px", marginBottom: "20px" }}>✦</div>
      <div style={{ fontFamily: F.display, fontSize: "26px", color: C.gold, marginBottom: "10px" }}>{t("paywall.successTitle")}</div>
      <div style={{ color: C.fog, fontSize: "15px", fontStyle: "italic" }}>{t("paywall.successSub")}</div>
    </div></div>
  );

  return (
    <div style={overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={box}>
        <div style={{ padding: "28px 32px 24px", borderBottom: `1px solid ${C.line}` }}>
          <button onClick={onClose} style={{ position: "absolute", top: "20px", right: "20px", background: "none", border: "none", cursor: "pointer", color: C.fog, fontSize: "18px" }}>✕</button>
          <Tag>{t("paywall.tag")}</Tag>
          <div style={{ fontFamily: F.display, fontSize: "26px", marginTop: "12px", lineHeight: 1.2 }}>
            {t("paywall.title")}<br /><span style={{ color: C.gold, fontStyle: "italic" }}>{companyName}</span>
          </div>
        </div>

        {step === "choose" && (
          <div style={{ padding: "24px 32px" }}>
            <div style={{ fontSize: "13px", color: C.fog, marginBottom: "20px", fontStyle: "italic" }}>{t("paywall.choosePlan")}</div>
            <div className="plans-grid" style={{ marginBottom: "24px" }}>
              {PLANS.map(p => (
                <div key={p.id} onClick={() => setPlan(p.id)} style={{ border: `2px solid ${plan === p.id ? C.gold : C.line}`, borderRadius: "8px", padding: "18px", cursor: "pointer", background: plan === p.id ? "#FBF7EF" : C.white, transition: "all 0.2s", position: "relative" }}>
                  {p.highlight && <div style={{ position: "absolute", top: "-10px", left: "50%", transform: "translateX(-50%)", background: C.gold, color: C.white, fontSize: "9px", letterSpacing: "0.15em", padding: "3px 10px", borderRadius: "10px" }}>{t("pricing.mostPopular")}</div>}
                  <div style={{ fontFamily: F.display, fontSize: "17px", marginBottom: "4px" }}>{p.labelKey === "standard" ? `${t("pricing.plans.0.name")} Analysis` : "Premium"}</div>
                  <div style={{ fontFamily: F.display, fontSize: "28px", color: C.gold, marginBottom: "14px" }}>{p.price}</div>
                  <ul style={{ listStyle: "none", padding: 0 }}>
                    {(Array.isArray(p.features) ? p.features : []).map((f, i) => (
                      <li key={i} style={{ fontSize: "12px", color: C.steel, marginBottom: "5px", display: "flex", gap: "7px", lineHeight: 1.4 }}>
                        <span style={{ color: C.gold, flexShrink: 0 }}>✓</span>{f}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <button onClick={() => setStep("checkout")} style={{ width: "100%", padding: "14px", background: C.gold, border: "none", borderRadius: "6px", color: C.white, fontFamily: F.display, fontSize: "18px", letterSpacing: "0.06em", cursor: "pointer" }}>
              {t("paywall.continueBtn")}
            </button>
          </div>
        )}

        {step === "checkout" && (
          <div style={{ padding: "24px 32px" }}>
            <button onClick={() => setStep("choose")} style={{ background: "none", border: "none", color: C.fog, cursor: "pointer", fontSize: "13px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "6px" }}>{t("paywall.back")}</button>
            <div style={{ background: "#FBF7EF", border: `1px solid ${C.line}`, borderRadius: "6px", padding: "14px 16px", marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: "13px", fontFamily: F.display }}>{selectedPlan?.label}</div>
                <div style={{ fontSize: "11px", color: C.fog }}>{companyName}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                {couponStatus === "valid" && getFinalAmount() !== selectedPlan?.amount && (
                  <div style={{ fontFamily: F.display, fontSize: "14px", color: C.fog, textDecoration: "line-through" }}>{selectedPlan?.price}</div>
                )}
                <div style={{ fontFamily: F.display, fontSize: "22px", color: C.gold }}>{couponStatus === "valid" ? getFinalPrice() : selectedPlan?.price}</div>
              </div>
            </div>

            {/* Campo código promocional */}
            <div style={{ marginBottom: "20px" }}>
              <label style={{ fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: C.steel, display: "block", marginBottom: "6px", fontFamily: F.body }}>Código Promocional</label>
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  type="text"
                  value={couponCode}
                  placeholder="Ex: OCC-BASTONARIA"
                  onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponStatus(null); setCouponData(null); }}
                  style={{ flex: 1, padding: "10px 14px", border: `1px solid ${couponStatus === "valid" ? C.success : couponStatus === "invalid" ? C.danger : C.line}`, borderRadius: "5px", fontFamily: F.body, fontSize: "15px", color: C.ink, background: C.white, textTransform: "uppercase" }}
                />
                <button
                  onClick={validateCoupon}
                  disabled={!couponCode.trim() || couponStatus === "checking"}
                  style={{ padding: "10px 16px", background: couponCode.trim() ? C.gold : C.line, border: "none", borderRadius: "5px", color: C.white, fontFamily: F.body, fontSize: "13px", cursor: couponCode.trim() ? "pointer" : "not-allowed", whiteSpace: "nowrap" }}
                >
                  {couponStatus === "checking" ? "…" : "Aplicar"}
                </button>
              </div>
              {couponStatus === "valid" && (
                <div style={{ fontSize: "12px", color: C.success, marginTop: "6px", fontFamily: F.body }}>
                  ✓ Código aplicado — {couponData?.discount?.type === "percent" ? `${couponData.discount.value}% desconto` : `desconto aplicado`}
                  {getFinalAmount() === 0 && " · Acesso gratuito"}
                </div>
              )}
              {couponStatus === "invalid" && (
                <div style={{ fontSize: "12px", color: C.danger, marginTop: "6px", fontFamily: F.body }}>✕ {couponData?.error || "Código inválido"}</div>
              )}
            </div>
            <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
              {[{ id: "card", label: t("paywall.methods.card") }, { id: "mbway", label: t("paywall.methods.mbway") }].map(m => (
                <button key={m.id} onClick={() => { setPayMethod(m.id); setStripeError(""); setErrors({}); }} style={{ flex: 1, padding: "10px", border: `2px solid ${payMethod === m.id ? C.gold : C.line}`, borderRadius: "6px", background: payMethod === m.id ? "#FBF7EF" : C.white, cursor: "pointer", fontFamily: F.body, fontSize: "14px", color: payMethod === m.id ? C.gold : C.steel, fontWeight: payMethod === m.id ? "600" : "400", transition: "all 0.2s" }}>{m.label}</button>
              ))}
            </div>
            <div style={{ display: "grid", gap: "14px", marginBottom: "20px" }}>
              <div style={{ fontSize: "11px", letterSpacing: "0.18em", textTransform: "uppercase", color: C.gold, fontFamily: F.body, borderBottom: `1px solid ${C.line}`, paddingBottom: "6px", marginBottom: "2px" }}>{t("paywall.billing")}</div>
              {[
                { key: "name", label: t("paywall.fields.name"), placeholder: t("paywall.fields.namePlaceholder"), type: "text" },
                { key: "nif", label: t("paywall.fields.nif"), placeholder: t("paywall.fields.nifPlaceholder"), type: "text" },
                { key: "morada", label: t("paywall.fields.morada"), placeholder: t("paywall.fields.moradaPlaceholder"), type: "text" },
                { key: "codigopostal", label: t("paywall.fields.cp"), placeholder: t("paywall.fields.cpPlaceholder"), type: "text" },
                { key: "localidade", label: t("paywall.fields.localidade"), placeholder: t("paywall.fields.localidadePlaceholder"), type: "text" },
                { key: "email", label: t("paywall.fields.email"), placeholder: t("paywall.fields.emailPlaceholder"), type: "email" },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: C.steel, display: "block", marginBottom: "6px", fontFamily: F.body }}>{f.label}</label>
                  <input type={f.type} value={form[f.key]} placeholder={f.placeholder} onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))} style={{ ...inp(errors[f.key]) }} />
                  {errors[f.key] && <div style={{ fontSize: "11px", color: C.danger, marginTop: "4px" }}>{errors[f.key]}</div>}
                </div>
              ))}
              {payMethod === "mbway" && (
                <div>
                  <label style={{ fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: C.steel, display: "block", marginBottom: "6px", fontFamily: F.body }}>{t("paywall.fields.phone")}</label>
                  <input type="tel" value={form.phone} placeholder={t("paywall.fields.phonePlaceholder")} onChange={e => setForm(prev => ({ ...prev, phone: e.target.value }))} style={{ ...inp(errors.phone) }} />
                  {errors.phone && <div style={{ fontSize: "11px", color: C.danger, marginTop: "4px" }}>{errors.phone}</div>}
                  {stripeError && <div style={{ fontSize: "11px", color: C.danger, marginTop: "4px" }}>{stripeError}</div>}
                </div>
              )}
            </div>
            {/* Campos cartão — esconder se gratuito */}
            {payMethod === "card" && getFinalAmount() > 0 && (
              <div style={{ marginBottom: "14px" }}>
                <label style={{ fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: C.steel, display: "block", marginBottom: "6px", fontFamily: F.body }}>{t("paywall.fields.card")}</label>
                <div ref={cardMountRef} style={{ padding: "11px 14px", border: `1px solid ${stripeError ? C.danger : C.line}`, borderRadius: "5px", background: C.white, minHeight: "42px" }} />
                {stripeError && <div style={{ fontSize: "11px", color: C.danger, marginTop: "4px" }}>{stripeError}</div>}
              </div>
            )}

            <button onClick={handlePay}
              disabled={payMethod === "card" && !cardReady && getFinalAmount() > 0}
              style={{ width: "100%", padding: "14px", background: (payMethod === "mbway" || cardReady || getFinalAmount() === 0) ? C.gold : C.line, border: "none", borderRadius: "6px", color: C.white, fontFamily: F.display, fontSize: "18px", letterSpacing: "0.06em", cursor: (payMethod === "mbway" || cardReady || getFinalAmount() === 0) ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", transition: "all 0.2s" }}>
              {getFinalAmount() === 0
                ? "✦ Aceder Gratuitamente"
                : payMethod === "card"
                  ? (cardReady ? t("paywall.payCard", { price: getFinalPrice() }) : t("paywall.loading"))
                  : t("paywall.payMbway", { price: getFinalPrice() })
              }
            </button>
            <div style={{ textAlign: "center", fontSize: "11px", color: C.fog, marginTop: "12px", fontStyle: "italic" }}>{t("paywall.security")}</div>
          </div>
        )}
      </div>
    </div>
  );
}
/* ─── CHART COMPONENTS ───────────────────────────────────── */
const CHART_COLORS = ["#B8923A", "#3A4550", "#6B8A4E", "#8A5A2A", "#2A5A8A", "#8A2A5A"];

function BarChart({ data, height = 200, yLabel = "", formatVal = v => v }) {
  if (!data || !data.length) return null;
  const vals = data.map(d => d.value).filter(v => typeof v === "number" && isFinite(v));
  if (!vals.length) return null;
  const hasNeg = vals.some(v => v < 0);
  const maxV = Math.max(...vals.map(Math.abs), 0.01);
  const W = 560, H = height, PAD = { t: 16, r: 16, b: 48, l: 56 };
  const chartW = W - PAD.l - PAD.r, chartH = H - PAD.t - PAD.b;
  const barW = Math.min(48, (chartW / data.length) * 0.6);
  const gap = chartW / data.length;
  const zeroY = hasNeg ? chartH / 2 : chartH;
  const scaleY = v => hasNeg ? zeroY - (v / maxV) * (chartH / 2) : chartH - (v / maxV) * chartH;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }}>
      <g transform={`translate(${PAD.l},${PAD.t})`}>
        {[0, 0.25, 0.5, 0.75, 1].map((f, i) => {
          const y = hasNeg ? chartH * f : chartH * (1 - f);
          const val = hasNeg ? maxV * (1 - f * 2) : maxV * f;
          return (<g key={i}><line x1={0} y1={y} x2={chartW} y2={y} stroke={C.line} strokeWidth="1" strokeDasharray="4,4" /><text x={-6} y={y + 4} textAnchor="end" fontSize="9" fill={C.fog} fontFamily="Georgia, serif">{formatVal(val)}</text></g>);
        })}
        {hasNeg && <line x1={0} y1={zeroY} x2={chartW} y2={zeroY} stroke={C.steel} strokeWidth="1.5" />}
        {data.map((d, i) => {
          const x = gap * i + gap / 2 - barW / 2;
          const v = typeof d.value === "number" && isFinite(d.value) ? d.value : 0;
          const y = scaleY(v), bH = Math.abs(y - zeroY), barY = v >= 0 ? y : zeroY;
          const color = v >= 0 ? CHART_COLORS[i % CHART_COLORS.length] : C.danger;
          return (<g key={i}><rect x={x} y={barY} width={barW} height={Math.max(bH, 1)} fill={color} rx="2" opacity="0.88" /><text x={x + barW / 2} y={barY - 5} textAnchor="middle" fontSize="9" fill={C.steel} fontFamily="Georgia, serif" fontWeight="500">{formatVal(v)}</text><text x={x + barW / 2} y={chartH + 16} textAnchor="middle" fontSize="10" fill={C.steel} fontFamily="Georgia, serif">{d.label}</text></g>);
        })}
        <line x1={0} y1={0} x2={0} y2={chartH} stroke={C.line} strokeWidth="1.5" />
        <line x1={0} y1={chartH} x2={chartW} y2={chartH} stroke={C.line} strokeWidth="1.5" />
      </g>
    </svg>
  );
}

function LineChart({ series, height = 220, formatVal = v => v }) {
  if (!series || !series.length || !series[0].data?.length) return null;
  const allVals = series.flatMap(s => s.data.map(d => d.value)).filter(v => typeof v === "number" && isFinite(v));
  if (!allVals.length) return null;
  const minV = Math.min(...allVals), maxV = Math.max(...allVals), range = maxV - minV || 1;
  const W = 560, H = height, PAD = { t: 20, r: 20, b: 44, l: 56 };
  const chartW = W - PAD.l - PAD.r, chartH = H - PAD.t - PAD.b;
  const labels = series[0].data.map(d => d.label);
  const xStep = chartW / (labels.length - 1 || 1);
  const scaleY = v => chartH - ((v - minV) / range) * chartH;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }}>
      <g transform={`translate(${PAD.l},${PAD.t})`}>
        {[0, 0.25, 0.5, 0.75, 1].map((f, i) => { const y = chartH * (1 - f), val = minV + range * f; return (<g key={i}><line x1={0} y1={y} x2={chartW} y2={y} stroke={C.line} strokeWidth="1" strokeDasharray="4,4" /><text x={-6} y={y + 4} textAnchor="end" fontSize="9" fill={C.fog} fontFamily="Georgia, serif">{formatVal(val)}</text></g>); })}
        {labels.map((lbl, i) => (<text key={i} x={xStep * i} y={chartH + 16} textAnchor="middle" fontSize="10" fill={C.steel} fontFamily="Georgia, serif">{lbl}</text>))}
        {series.map((s, si) => {
          const pts = s.data.map((d, i) => `${xStep * i},${scaleY(typeof d.value === "number" && isFinite(d.value) ? d.value : minV)}`).join(" ");
          const color = CHART_COLORS[si % CHART_COLORS.length];
          return (<g key={si}><polyline points={pts} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />{s.data.map((d, i) => (<g key={i}><circle cx={xStep * i} cy={scaleY(typeof d.value === "number" && isFinite(d.value) ? d.value : minV)} r="4" fill={color} stroke={C.white} strokeWidth="2" /><text x={xStep * i} y={scaleY(typeof d.value === "number" && isFinite(d.value) ? d.value : minV) - 9} textAnchor="middle" fontSize="9" fill={color} fontFamily="Georgia, serif" fontWeight="600">{formatVal(d.value)}</text></g>))}</g>);
        })}
        {series.length > 1 && (<g transform={`translate(0,${chartH + 28})`}>{series.map((s, si) => (<g key={si} transform={`translate(${si * 120},0)`}><rect width="12" height="3" y={-1} fill={CHART_COLORS[si % CHART_COLORS.length]} rx="1" /><text x={16} y={3} fontSize="9" fill={C.steel} fontFamily="Georgia, serif">{s.name}</text></g>))}</g>)}
        <line x1={0} y1={0} x2={0} y2={chartH} stroke={C.line} strokeWidth="1.5" />
        <line x1={0} y1={chartH} x2={chartW} y2={chartH} stroke={C.line} strokeWidth="1.5" />
      </g>
    </svg>
  );
}

function GaugeChart({ value, min = 0, max = 100, label = "", color }) {
  const pct = Math.max(0, Math.min(1, (value - min) / (max - min)));
  const startAngle = Math.PI * 0.75, endAngle = Math.PI * 2.25;
  const angle = startAngle + pct * (endAngle - startAngle);
  const W = 160, cx = 80, cy = 90, r = 60, ir = 44;
  const arcPath = (a1, a2, ri, ro) => { const x1 = cx + ro * Math.cos(a1), y1 = cy + ro * Math.sin(a1), x2 = cx + ro * Math.cos(a2), y2 = cy + ro * Math.sin(a2), ix1 = cx + ri * Math.cos(a1), iy1 = cy + ri * Math.sin(a1), ix2 = cx + ri * Math.cos(a2), iy2 = cy + ri * Math.sin(a2), lg = (a2 - a1) > Math.PI ? 1 : 0; return `M${x1},${y1} A${ro},${ro} 0 ${lg},1 ${x2},${y2} L${ix2},${iy2} A${ri},${ri} 0 ${lg},0 ${ix1},${iy1} Z`; };
  const fillColor = color || (pct < 0.33 ? C.danger : pct < 0.66 ? C.goldLt : C.success);
  const nx = cx + r * 0.78 * Math.cos(angle), ny = cy + r * 0.78 * Math.sin(angle);
  return (
    <svg viewBox={`0 0 ${W} 110`} style={{ width: W, height: 110 }}>
      <path d={arcPath(startAngle, endAngle, ir, r)} fill={C.line} />
      <path d={arcPath(startAngle, angle, ir, r)} fill={fillColor} />
      <circle cx={nx} cy={ny} r="5" fill={C.white} stroke={fillColor} strokeWidth="2.5" />
      <text x={cx} y={cy - 8} textAnchor="middle" fontSize="18" fill={C.ink} fontFamily="Georgia, serif" fontWeight="400">{typeof value === "number" ? value.toFixed(value % 1 === 0 ? 0 : 1) : value}</text>
      <text x={cx} y={cy + 10} textAnchor="middle" fontSize="9" fill={C.fog} fontFamily="Georgia, serif">{label}</text>
    </svg>
  );
}

/* ─── REPORT COMPONENTS ──────────────────────────────────── */
function ReportSection({ number, title, children }) {
  return (
    <div style={{ marginBottom: "0", pageBreakInside: "avoid" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: "16px", padding: "32px 0 20px", borderBottom: `2px solid ${C.ink}` }}>
        <span style={{ fontFamily: F.mono, fontSize: "11px", color: C.gold, letterSpacing: "0.2em", minWidth: "28px" }}>{number}</span>
        <h2 style={{ fontFamily: F.display, fontSize: "26px", fontWeight: 300, color: C.ink, margin: 0, letterSpacing: "0.02em" }}>{title}</h2>
      </div>
      <div style={{ padding: "24px 0 8px", borderBottom: `1px solid ${C.line}` }}>{children}</div>
    </div>
  );
}

function KpiCard({ label, values, unit = "", benchmark, description }) {
  const vals = Object.entries(values || {});
  const numVals = vals.map(([, v]) => parseFloat(v)).filter(v => !isNaN(v));
  const last = numVals[numVals.length - 1], prev = numVals[numVals.length - 2];
  const trend = numVals.length > 1 ? (last > prev ? "up" : last < prev ? "down" : "flat") : null;
  const trendColor = trend === "up" ? C.success : trend === "down" ? C.danger : C.fog;
  const trendIcon = trend === "up" ? "↑" : trend === "down" ? "↓" : "→";
  return (
    <div style={{ background: C.white, border: `1px solid ${C.line}`, borderRadius: "8px", padding: "20px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, width: "3px", height: "100%", background: trendColor || C.line }} />
      <div style={{ fontSize: "10px", letterSpacing: "0.16em", textTransform: "uppercase", color: C.fog, fontFamily: F.body, marginBottom: "10px" }}>{label}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "10px", flexWrap: "wrap" }}>
        {vals.map(([yr, v], i) => (<div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", marginRight: "8px" }}><span style={{ fontFamily: F.display, fontSize: i === vals.length - 1 ? "26px" : "18px", color: i === vals.length - 1 ? C.ink : C.fog, lineHeight: 1 }}>{v}{unit}</span><span style={{ fontSize: "9px", color: C.fog, letterSpacing: "0.1em", marginTop: "2px", fontFamily: F.body }}>{yr}</span></div>))}
        {trend && <span style={{ fontSize: "18px", color: trendColor, marginLeft: "4px" }}>{trendIcon}</span>}
      </div>
      {description && <div style={{ fontSize: "12px", color: C.fog, fontFamily: F.body, fontStyle: "italic", lineHeight: 1.5 }}>{description}</div>}
      {benchmark && <div style={{ fontSize: "10px", color: C.goldDk, fontFamily: F.body, marginTop: "4px" }}>{benchmark}</div>}
    </div>
  );
}

function SwotTable({ data }) {
  const { t } = useTranslation();
  const cells = [
    { key: "forcas", label: t("report.swot.forcas"), color: "#E8F4E8", border: "#4A8A4A", icon: "+" },
    { key: "fraquezas", label: t("report.swot.fraquezas"), color: "#FAE8E8", border: "#8A4A4A", icon: "−" },
    { key: "oportunidades", label: t("report.swot.oportunidades"), color: "#E8F0FA", border: "#4A5A8A", icon: "↗" },
    { key: "riscos", label: t("report.swot.riscos"), color: "#FAF0E8", border: "#8A6A3A", icon: "⚠" },
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
            {(data?.[cell.key] || []).map((item, i) => (<div key={i} style={{ display: "flex", gap: "8px", marginBottom: "5px" }}><span style={{ color: cell.border, flexShrink: 0 }}>▸</span><span>{item}</span></div>))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ActionPlan({ actions }) {
  const { t } = useTranslation();
  const phases = [
    { key: "imediato", label: t("report.actions.imediato"), sublabel: t("report.actions.imediatoSub"), color: C.danger, bg: "#FAF0F0" },
    { key: "medio", label: t("report.actions.medio"), sublabel: t("report.actions.medioSub"), color: C.goldDk, bg: "#FBF7EE" },
    { key: "longo", label: t("report.actions.longo"), sublabel: t("report.actions.longoSub"), color: C.moss, bg: "#EEF4EE" },
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
            {(actions?.[ph.key] || []).map((a, i) => (<div key={i} style={{ display: "flex", gap: "10px", fontFamily: F.body, fontSize: "13.5px", color: C.steel, lineHeight: 1.6 }}><span style={{ color: ph.color, flexShrink: 0, fontWeight: "600", minWidth: "18px" }}>{i + 1}.</span><span>{a}</span></div>))}
          </div>
        </div>
      ))}
    </div>
  );
}

function RatingBadge({ rating }) {
  const { t } = useTranslation();
  const map = {
    "Excelente": { color: "#2A5C2A", bg: "#E8F4E8", icon: "◆◆◆◆◆" },
    "Bom":       { color: "#3A6A3A", bg: "#EEF6EE", icon: "◆◆◆◆◇" },
    "Aceitável": { color: "#7A6A20", bg: "#FAF4E0", icon: "◆◆◆◇◇" },
    "Preocupante": { color: "#8A5020", bg: "#FAF0E8", icon: "◆◆◇◇◇" },
    "Crítico":   { color: "#8B2020", bg: "#FAE8E8", icon: "◆◇◇◇◇" },
  };
  const r = map[rating] || map["Aceitável"];
  const label = t(`report.ratings.${rating}`, { defaultValue: rating });
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", background: r.bg, border: `1px solid ${r.color}30`, borderRadius: "6px", padding: "8px 16px" }}>
      <span style={{ fontFamily: F.mono, fontSize: "11px", color: r.color, letterSpacing: "4px" }}>{r.icon}</span>
      <span style={{ fontFamily: F.display, fontSize: "16px", color: r.color, letterSpacing: "0.06em" }}>{label}</span>
    </div>
  );
}

/* ─── PARSE ANALYSIS ─────────────────────────────────────── */
function parseAnalysis(raw) {
  if (!raw) return { _fallback: raw };
  let text = raw.replace(/`{3,}\s*json\s*/gi, "").replace(/`{3,}\s*/g, "").trim();
  try { return JSON.parse(text); } catch(e) {}
  const start = text.indexOf("{"), end = text.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    try { return JSON.parse(text.slice(start, end + 1)); } catch(e) { console.warn("JSON parse failed:", e.message); }
  }
  return { _fallback: raw };
}

/* ─── DOC TYPES ──────────────────────────────────────────── */
const DOC_TYPE_IDS = ["balance", "income"];

/* ─── MAIN APP ───────────────────────────────────────────── */
/* ─── LEGAL PAGE ─────────────────────────────────────────── */
function LegalSection({ num, titleKey, bodyKey }) {
  const { t } = useTranslation();
  return (
    <div style={{ marginBottom: "36px" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: "16px", padding: "24px 0 14px", borderBottom: `2px solid ${C.ink}` }}>
        <span style={{ fontFamily: F.mono, fontSize: "11px", color: C.gold, letterSpacing: "0.2em", minWidth: "28px" }}>{num}</span>
        <h2 style={{ fontFamily: F.display, fontSize: "22px", fontWeight: 300, color: C.ink, margin: 0 }}>{t(titleKey)}</h2>
      </div>
      <p style={{ fontFamily: F.body, fontSize: "16px", lineHeight: 1.9, color: C.steel, marginTop: "16px", paddingBottom: "8px", borderBottom: `1px solid ${C.line}` }}>{t(bodyKey)}</p>
    </div>
  );
}

function LegalPage({ onBack }) {
  const { t } = useTranslation();
  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <nav style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(245,240,232,0.95)", backdropFilter: "blur(12px)", borderBottom: `1px solid ${C.line}`, padding: "0 6vw" }}>
        <div style={{ maxWidth: "860px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: "64px" }}>
          <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ color: C.fog, fontSize: "13px" }}>←</span>
            <div style={{ fontFamily: F.display, fontSize: "18px" }}>YourCFO <span style={{ color: C.gold }}>·</span> Arrojo & Destreza</div>
          </button>
          <LangSelector />
        </div>
      </nav>

      <div style={{ maxWidth: "860px", margin: "0 auto", padding: "64px 6vw 120px" }}>

        {/* ── TERMOS E CONDIÇÕES ── */}
        <div style={{ marginBottom: "56px", paddingBottom: "32px", borderBottom: `2px solid ${C.ink}` }}>
          <span style={{ display: "inline-block", padding: "3px 12px", border: `1px solid ${C.gold}`, borderRadius: "20px", fontSize: "10px", letterSpacing: "0.22em", textTransform: "uppercase", color: C.gold, fontFamily: F.body, marginBottom: "16px" }}>{t("legal.tcTag")}</span>
          <h1 style={{ fontFamily: F.display, fontSize: "clamp(32px,5vw,48px)", fontWeight: 300, lineHeight: 1.1, color: C.ink }}>{t("legal.tcTitle")}</h1>
          <p style={{ fontSize: "13px", color: C.fog, marginTop: "12px", fontFamily: F.body }}>{t("legal.updated")} · YourCFO / Arrojo & Destreza Lda.</p>
        </div>

        {["s01","s02","s03","s04","s05","s06","s07","s08","s09","s10"].map((s, i) => (
          <LegalSection key={s} num={String(i+1).padStart(2,"0")} titleKey={`legal.tc.${s}.title`} bodyKey={`legal.tc.${s}.body`} />
        ))}

        {/* ── DIVIDER ── */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px", margin: "56px 0 48px" }}>
          <div style={{ flex: 1, height: "1px", background: C.line }} />
          <span style={{ color: C.gold, fontSize: "12px", letterSpacing: "0.3em" }}>✦</span>
          <div style={{ flex: 1, height: "1px", background: C.line }} />
        </div>

        {/* ── POLÍTICA DE PRIVACIDADE ── */}
        <div style={{ marginBottom: "56px", paddingBottom: "32px", borderBottom: `2px solid ${C.ink}` }}>
          <span style={{ display: "inline-block", padding: "3px 12px", border: `1px solid ${C.gold}`, borderRadius: "20px", fontSize: "10px", letterSpacing: "0.22em", textTransform: "uppercase", color: C.gold, fontFamily: F.body, marginBottom: "16px" }}>{t("legal.ppTag")}</span>
          <h1 style={{ fontFamily: F.display, fontSize: "clamp(32px,5vw,48px)", fontWeight: 300, lineHeight: 1.1, color: C.ink }}>{t("legal.ppTitle")}</h1>
          <p style={{ fontSize: "13px", color: C.fog, marginTop: "12px", fontFamily: F.body }}>{t("legal.updated")} · YourCFO / Arrojo & Destreza Lda.</p>
        </div>

        {["s01","s02","s03","s04","s05","s06","s07","s08","s09"].map((s, i) => (
          <LegalSection key={s} num={String(i+1).padStart(2,"0")} titleKey={`legal.pp.${s}.title`} bodyKey={`legal.pp.${s}.body`} />
        ))}

        {/* ── CONTACT BOX ── */}
        <div style={{ background: C.ink, borderRadius: "8px", padding: "32px 36px", marginTop: "16px" }}>
          <p style={{ color: "rgba(255,255,255,0.5)", fontFamily: F.body, fontSize: "14px", lineHeight: 1.8, margin: 0 }}>
            <strong style={{ color: C.white }}>Arrojo & Destreza Lda.</strong> · NIF 517 674 670<br />
            Rua do Matim, 130, 4450-736 Matosinhos, Portugal<br />
            <a href="mailto:info@yourcfo.app" style={{ color: C.gold, textDecoration: "none" }}>info@yourcfo.app</a>
          </p>
        </div>
      </div>

      <footer style={{ background: C.ink, color: "rgba(255,255,255,0.5)", padding: "40px 6vw", textAlign: "center", fontFamily: F.body, fontSize: "13px" }}>
        <div style={{ fontFamily: F.display, fontSize: "20px", color: C.white, marginBottom: "6px" }}>YourCFO <span style={{ color: C.gold }}>·</span> Arrojo & Destreza</div>
        <div>© 2025 Arrojo & Destreza Lda. · Matosinhos, Portugal</div>
      </footer>
    </>
  );
}

/* ─── CAE SECTOR MAP ─────────────────────────────────────────── */
function getCaeSector(cae) {
  if (!cae) return "";
  const div = cae.toString().slice(0, 2);
  const map = {
    "01": "Agricultura, produção animal, caça e actividades dos serviços relacionados",
    "02": "Silvicultura e exploração florestal",
    "03": "Pesca e aquicultura",
    "05": "Extracção de hulha e lenhite",
    "06": "Extracção de petróleo bruto e gás natural",
    "07": "Extracção e preparação de minérios metálicos",
    "08": "Outras indústrias extractivas",
    "09": "Actividades dos serviços relacionados com as indústrias extractivas",
    "10": "Indústrias alimentares",
    "11": "Indústria das bebidas",
    "12": "Indústria do tabaco",
    "13": "Fabricação de têxteis",
    "14": "Indústria do vestuário",
    "15": "Indústria do couro e dos produtos do couro",
    "16": "Indústrias da madeira e da cortiça",
    "17": "Fabricação de pasta, de papel, cartão e seus artigos",
    "18": "Impressão e reprodução de suportes gravados",
    "19": "Fabricação de coque, de produtos petrolíferos refinados",
    "20": "Fabricação de produtos químicos e de fibras sintéticas ou artificiais",
    "21": "Fabricação de produtos farmacêuticos de base e de preparações farmacêuticas",
    "22": "Fabricação de artigos de borracha e de matérias plásticas",
    "23": "Fabricação de outros produtos minerais não metálicos",
    "24": "Indústrias metalúrgicas de base",
    "25": "Fabricação de produtos metálicos, excepto máquinas e equipamentos",
    "26": "Fabricação de equipamentos informáticos, electrónicos e ópticos",
    "27": "Fabricação de equipamento eléctrico",
    "28": "Fabricação de máquinas e de equipamentos",
    "29": "Fabricação de veículos automóveis, reboques e semi-reboques",
    "30": "Fabricação de outro equipamento de transporte",
    "31": "Fabricação de mobiliário e de colchões",
    "32": "Outras indústrias transformadoras",
    "33": "Reparação, manutenção e instalação de máquinas e equipamentos",
    "35": "Electricidade, gás, vapor, água quente e fria e ar frio",
    "36": "Captação, tratamento e distribuição de água",
    "37": "Recolha, drenagem e tratamento de águas residuais",
    "38": "Recolha, tratamento e eliminação de resíduos",
    "39": "Descontaminação e actividades similares",
    "41": "Construção de edifícios",
    "42": "Engenharia civil",
    "43": "Actividades especializadas de construção",
    "45": "Comércio, manutenção e reparação de veículos automóveis e motociclos",
    "46": "Comércio por grosso",
    "47": "Comércio a retalho",
    "49": "Transportes terrestres e transportes por oleodutos ou gasodutos",
    "50": "Transportes por via aquática",
    "51": "Transportes aéreos",
    "52": "Armazenagem e actividades auxiliares dos transportes",
    "53": "Actividades postais e de courier",
    "55": "Alojamento",
    "56": "Restauração e similares",
    "58": "Actividades de edição",
    "59": "Actividades cinematográficas, de vídeo, de produção de programas de televisão",
    "60": "Actividades de rádio e de televisão",
    "61": "Telecomunicações",
    "62": "Consultoria e programação informática e actividades relacionadas",
    "63": "Actividades dos serviços de informação",
    "64": "Actividades de serviços financeiros",
    "65": "Seguros, resseguros e fundos de pensões",
    "66": "Actividades auxiliares de serviços financeiros e dos seguros",
    "68": "Actividades imobiliárias",
    "69": "Actividades jurídicas e de contabilidade",
    "70": "Actividades das sedes sociais e de consultoria para a gestão",
    "71": "Actividades de arquitectura, de engenharia e técnicas afins",
    "72": "Actividades de investigação científica e de desenvolvimento",
    "73": "Publicidade, estudos de mercado e sondagens de opinião",
    "74": "Outras actividades de consultoria, científicas, técnicas e similares",
    "75": "Actividades veterinárias",
    "77": "Actividades de aluguer",
    "78": "Actividades de emprego",
    "79": "Agências de viagem, operadores turísticos e outros serviços de reservas",
    "80": "Actividades de investigação e segurança",
    "81": "Actividades relacionadas com edifícios e plantação e manutenção de jardins",
    "82": "Actividades de serviços administrativos e de apoio prestados às empresas",
    "84": "Administração pública e defesa; segurança social obrigatória",
    "85": "Educação",
    "86": "Actividades de saúde humana",
    "87": "Actividades de apoio social com alojamento",
    "88": "Actividades de apoio social sem alojamento",
    "90": "Actividades de teatro, de música, de dança e outras actividades artísticas e de espectáculo",
    "91": "Actividades das bibliotecas, arquivos, museus e outras actividades culturais",
    "92": "Lotarias e outros jogos de aposta",
    "93": "Actividades desportivas, de diversão e recreativas",
    "94": "Actividades das organizações associativas",
    "95": "Reparação de computadores e de bens de uso pessoal e doméstico",
    "96": "Outras actividades de serviços pessoais",
    "97": "Actividades das famílias empregadoras de pessoal doméstico",
    "99": "Actividades dos organismos internacionais e outras instituições extraterritoriais",
  };
  return map[div] || `Sector CAE ${div}`;
}

export default function App() {
  const { t, i18n: i18nInst } = useTranslation();
  const [page, setPage] = useState("home");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [company, setCompany] = useState("");
  const [cae, setCae] = useState("");
  const [years, setYears] = useState(["2023", "2024"]);
  const [files, setFiles] = useState({});
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMsg, setStatusMsg] = useState("");
  const [rawResult, setRawResult] = useState(null);
  const [result, setResult] = useState(null);
  const [paid, setPaid] = useState(false);
  const [paidPlan, setPaidPlan] = useState("standard");
  const [showPaywall, setShowPaywall] = useState(false);
  const [showDemo, setShowDemo] = useState(false);

  const goLegal = () => { setPage("legal"); window.scrollTo(0, 0); };
  const [error, setError] = useState(null);

  const uploaded = Object.keys(files).length;
  const canAnalyze = company.trim().length > 0 && uploaded >= 2;

  const DOC_TYPES = DOC_TYPE_IDS.map(id => ({ id, label: t(`tool.docTypes.${id}`) }));

  const goHome = () => { setPage("home"); setResult(null); setRawResult(null); setFiles({}); setCompany(""); setCae(""); setPaid(false); setPaidPlan("standard"); setError(null); };

  /* ── LEGAL PAGE ── */
  if (page === "legal") return <LegalPage onBack={() => setPage("home")} />;
  const setFile = (yr, dt, f) => setFiles(p => ({ ...p, [`${yr}_${dt}`]: f }));
  const removeFile = (yr, dt) => setFiles(p => { const n = { ...p }; delete n[`${yr}_${dt}`]; return n; });
  const addYear = () => { const last = parseInt(years[years.length - 1]); setYears(p => [...p, String(last + 1)]); };
  const removeYear = yr => { if (years.length <= 2) return; setYears(p => p.filter(y => y !== yr)); setFiles(p => { const n = { ...p }; for (const d of DOC_TYPES) delete n[`${yr}_${d.id}`]; return n; }); };
  const toBase64 = f => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result.split(",")[1]); r.onerror = () => rej(); r.readAsDataURL(f); });

  const getLangName = () => {
    const code = i18nInst.language?.slice(0, 2) || "pt";
    const names = { pt: "português europeu (Portugal)", es: "español", en: "English", fr: "français", de: "Deutsch" };
    return names[code] || "português europeu";
  };

  const analyze = async () => {
    if (!canAnalyze || loading) return;
    setLoading(true); setError(null); setRawResult(null); setResult(null); setProgress(10);
    setStatusMsg(t("tool.status.preparing"));
    try {
      const content = [];
      for (const yr of years) {
        for (const dt of DOC_TYPES) {
          const f = files[`${yr}_${dt.id}`];
          if (f) {
            setStatusMsg(t("tool.status.processing", { doc: dt.label, year: yr }));
            const b64 = await toBase64(f);
            content.push({ type: "document", source: { type: "base64", media_type: "application/pdf", data: b64 } });
            content.push({ type: "text", text: `[Documento: ${dt.label} do ano ${yr} da empresa ${company}]` });
          }
        }
      }
      setProgress(40); setStatusMsg(t("tool.status.analyzing"));
      const yearsStr = years.filter(yr => Object.keys(files).some(k => k.startsWith(yr))).join(", ");
      const langName = getLangName();

      content.push({ type: "text", text: `${t("aiPrompt.role")}
${t("aiPrompt.instruction", { company, years: yearsStr })}
${cae ? t("aiPrompt.caeInstruction", { cae, sector: getCaeSector(cae) }) : ""}
${t("aiPrompt.language")}

${t("aiPrompt.sections")}` });

      setProgress(60);
      const res1 = await fetch(WORKER_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "analyze", payload: { model: "claude-sonnet-4-5", max_tokens: 4000, messages: [{ role: "user", content }] } }) });
      if (!res1.ok) { const e = await res1.json(); throw new Error(e.error?.message || "Erro na análise"); }
      const data1 = await res1.json();
      const analiseTexto = data1.content.map(b => b.text || "").join("\n");

      setProgress(75); setStatusMsg(t("tool.status.structuring"));
      const yearsFiltered = years.filter(yr => Object.keys(files).some(k => k.startsWith(yr)));
      const res2 = await fetch(WORKER_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "analyze", payload: { model: "claude-sonnet-4-5", max_tokens: 8000, system: "Convert financial analysis text to valid JSON. Respond ONLY with JSON, no markdown, no code blocks, no additional text. Response starts with { and ends with }.", messages: [{ role: "user", content: `Convert this financial analysis to JSON with exactly this structure. Use real values from the text. Respond only with valid JSON:\n\nANALYSIS:\n${analiseTexto}\n\nJSON STRUCTURE:\n{"empresa":"${company}","cae":"${cae}","setor":"${cae ? getCaeSector(cae) : ""}","anos":${JSON.stringify(yearsFiltered)},"avaliacao_global":"Bom","sumario":{"texto":"summary text","destaques":["highlight 1","highlight 2","highlight 3"]},"financeiros":{"volume_negocios":${JSON.stringify(Object.fromEntries(yearsFiltered.map(y => [y, 0])))},"resultado_liquido":${JSON.stringify(Object.fromEntries(yearsFiltered.map(y => [y, 0])))},"ebitda":${JSON.stringify(Object.fromEntries(yearsFiltered.map(y => [y, 0])))},"total_ativo":${JSON.stringify(Object.fromEntries(yearsFiltered.map(y => [y, 0])))},"capital_proprio":${JSON.stringify(Object.fromEntries(yearsFiltered.map(y => [y, 0])))},"divida_financeira":${JSON.stringify(Object.fromEntries(yearsFiltered.map(y => [y, 0])))}},"indicadores":{"liquidez_geral":${JSON.stringify({...Object.fromEntries(yearsFiltered.map(y=>[y,0])),"referencia":"> 1.5","descricao":"Current ratio"})},"liquidez_reduzida":${JSON.stringify({...Object.fromEntries(yearsFiltered.map(y=>[y,0])),"referencia":"> 1.0","descricao":"Quick ratio"})},"autonomia_financeira":${JSON.stringify({...Object.fromEntries(yearsFiltered.map(y=>[y,0])),"referencia":"> 33%","descricao":"Equity ratio"})},"roe":${JSON.stringify({...Object.fromEntries(yearsFiltered.map(y=>[y,0])),"referencia":"> 10%","descricao":"Return on equity"})},"roa":${JSON.stringify({...Object.fromEntries(yearsFiltered.map(y=>[y,0])),"referencia":"> 5%","descricao":"Return on assets"})},"margem_liquida":${JSON.stringify({...Object.fromEntries(yearsFiltered.map(y=>[y,0])),"referencia":"> 5%","descricao":"Net margin"})},"margem_ebitda":${JSON.stringify({...Object.fromEntries(yearsFiltered.map(y=>[y,0])),"referencia":"> 10%","descricao":"EBITDA margin"})},"divida_ebitda":${JSON.stringify({...Object.fromEntries(yearsFiltered.map(y=>[y,0])),"referencia":"< 3.0x","descricao":"Financial leverage"})},"pme":${JSON.stringify({...Object.fromEntries(yearsFiltered.map(y=>[y,0])),"referencia":"< 45 days","descricao":"Days sales outstanding"})},"pmp":${JSON.stringify({...Object.fromEntries(yearsFiltered.map(y=>[y,0])),"referencia":"30-60 days","descricao":"Days payable outstanding"})}},"analise_detalhada":{"rentabilidade":"text","liquidez_solvabilidade":"text","estrutura_capital":"text","eficiencia_operacional":"text"},"posicionamento_sectorial":{"cae":"${cae}","setor":"${cae ? getCaeSector(cae) : ""}","texto":"sector positioning analysis text","indicadores":[{"nome":"Liquidez Geral","empresa":0,"setor":0,"posicao":"acima","positivo":true},{"nome":"Autonomia Financeira","empresa":0,"setor":0,"posicao":"abaixo","positivo":true},{"nome":"ROE","empresa":0,"setor":0,"posicao":"acima","positivo":true},{"nome":"ROA","empresa":0,"setor":0,"posicao":"acima","positivo":true},{"nome":"Margem Líquida","empresa":0,"setor":0,"posicao":"acima","positivo":true},{"nome":"Margem EBITDA","empresa":0,"setor":0,"posicao":"acima","positivo":true},{"nome":"Dívida/EBITDA","empresa":0,"setor":0,"posicao":"abaixo","positivo":false},{"nome":"PMR","empresa":0,"setor":0,"posicao":"acima","positivo":false},{"nome":"PMP","empresa":0,"setor":0,"posicao":"ok","positivo":true}]},"swot":{"forcas":["strength 1"],"fraquezas":["weakness 1"],"oportunidades":["opportunity 1"],"riscos":["risk 1"]},"recomendacoes":{"imediato":["action 1"],"medio":["action 1"],"longo":["action 1"]},"conclusao":"conclusion text"}` }] } }) });

      setProgress(88); setStatusMsg(t("tool.status.finishing"));
      if (!res2.ok) { const e = await res2.json(); throw new Error(e.error?.message || "Erro na estruturação"); }
      const data2 = await res2.json();
      const text = data2.content.map(b => b.text || "").join("\n");
      const parsed = parseAnalysis(text);
      setRawResult(text); setResult(parsed);
      setProgress(100); setStatusMsg(t("tool.status.done"));
      saveToGoogleDrive(company, years, parsed);
      setPage("result");
    } catch (e) {
      setError(e.message || "Erro inesperado");
    } finally { setLoading(false); }
  };

  /* ── LANDING PAGE ──────────────────────────────────────── */
  if (page === "home") return (
    <>
      <style>{GLOBAL_CSS}</style>
      <nav style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(245,240,232,0.92)", backdropFilter: "blur(12px)", borderBottom: `1px solid ${C.line}`, padding: "0 6vw" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: "64px" }}>
          <div>
            <div style={{ fontFamily: F.display, fontSize: "20px", letterSpacing: "0.04em", lineHeight: 1 }}>YourCFO</div>
            <div style={{ fontSize: "9px", letterSpacing: "0.28em", color: C.fog, textTransform: "uppercase", fontFamily: F.body }}>Arrojo & Destreza</div>
          </div>
          <div className="nav-links">
            <span onClick={() => document.getElementById("servicos")?.scrollIntoView({ behavior: "smooth" })} style={{ fontSize: "13px", color: C.steel, cursor: "pointer", letterSpacing: "0.05em", fontFamily: F.body }}>{t("nav.services")}</span>
            <span onClick={() => document.getElementById("metodologia")?.scrollIntoView({ behavior: "smooth" })} style={{ fontSize: "13px", color: C.steel, cursor: "pointer", letterSpacing: "0.05em", fontFamily: F.body }}>{t("nav.methodology")}</span>
            <a href="mailto:info@yourcfo.app" style={{ fontSize: "13px", color: C.steel, cursor: "pointer", letterSpacing: "0.05em", fontFamily: F.body, textDecoration: "none" }}>{t("nav.contact")}</a>
            <LangSelector />
            <button onClick={() => setPage("tool")} style={{ padding: "9px 22px", background: C.gold, border: "none", borderRadius: "4px", color: C.white, fontFamily: F.display, fontSize: "15px", cursor: "pointer", letterSpacing: "0.06em" }}>{t("nav.startAnalysis")}</button>
          </div>
          <button className="nav-menu-btn" onClick={() => setMobileMenu(true)}>☰</button>
        </div>
      </nav>

      <div className={`nav-mobile-menu ${mobileMenu ? "open" : ""}`}>
        <button className="nav-mobile-close" onClick={() => setMobileMenu(false)}>✕</button>
        <div style={{ fontFamily: F.display, fontSize: "22px", marginBottom: "8px" }}>YourCFO</div>
        <LangSelector />
        {[
          { label: t("nav.services"), action: () => { document.getElementById("servicos")?.scrollIntoView({ behavior: "smooth" }); setMobileMenu(false); } },
          { label: t("nav.methodology"), action: () => { document.getElementById("metodologia")?.scrollIntoView({ behavior: "smooth" }); setMobileMenu(false); } },
        ].map(item => (<span key={item.label} onClick={item.action} style={{ fontSize: "20px", fontFamily: F.display, color: C.ink, cursor: "pointer", letterSpacing: "0.06em" }}>{item.label}</span>))}
        <a href="mailto:info@yourcfo.app" style={{ fontSize: "20px", fontFamily: F.display, color: C.ink, textDecoration: "none" }}>{t("nav.contact")}</a>
        <button onClick={() => { setPage("tool"); setMobileMenu(false); }} style={{ padding: "14px 32px", background: C.gold, border: "none", borderRadius: "4px", color: C.white, fontFamily: F.display, fontSize: "18px", cursor: "pointer" }}>{t("nav.startAnalysis")}</button>
      </div>

      <section style={{ maxWidth: "1100px", margin: "0 auto", padding: "100px 6vw 80px" }}>
        <div className="hero-grid">
          <div>
            <div className="fade-up" id="servicos"><Tag>{t("hero.tag")}</Tag></div>
            <h1 className="fade-up-1" style={{ fontFamily: F.display, fontSize: "clamp(42px, 5vw, 62px)", fontWeight: 300, lineHeight: 1.1, margin: "20px 0 24px", color: C.ink }}>
              {t("hero.title1")}<br /><span style={{ color: C.gold, fontStyle: "italic" }}>{t("hero.title2")}</span>
            </h1>
            <p className="fade-up-2" style={{ fontFamily: F.body, fontSize: "17px", lineHeight: 1.8, color: C.steel, marginBottom: "36px", maxWidth: "480px" }}>{t("hero.description")}</p>
            <div className="fade-up-3" style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
              <button onClick={() => setPage("tool")} style={{ padding: "14px 32px", background: C.gold, border: "none", borderRadius: "4px", color: C.white, fontFamily: F.display, fontSize: "19px", cursor: "pointer", letterSpacing: "0.06em", display: "flex", alignItems: "center", gap: "10px" }}>{t("hero.cta")} <span>→</span></button>
              <button onClick={() => setShowDemo(true)} style={{ padding: "14px 28px", background: "transparent", border: `1px solid ${C.line}`, borderRadius: "4px", color: C.steel, fontFamily: F.body, fontSize: "15px", cursor: "pointer" }}>{t("hero.ctaExample")}</button>
            </div>
          </div>
          <div className="hero-visual fade-up-2" style={{ position: "relative" }}>
            <div style={{ background: C.white, border: `1px solid ${C.line}`, borderRadius: "12px", padding: "32px", boxShadow: "0 24px 64px rgba(0,0,0,0.08)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
                <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#e85454" }} />
                <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#f5a623" }} />
                <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#4caf50" }} />
                <div style={{ flex: 1, height: "1px", background: C.line }} />
              </div>
              {[{ label: "Liquidez Geral", val: "1.84", trend: "↑", ok: true }, { label: "Autonomia Financeira", val: "42.3%", trend: "↑", ok: true }, { label: "ROE", val: "12.7%", trend: "↓", ok: false }, { label: "Margem Líquida", val: "8.2%", trend: "↑", ok: true }].map((m, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < 3 ? `1px solid ${C.line}` : "none" }}>
                  <div style={{ fontSize: "13px", color: C.fog, fontFamily: F.body }}>{m.label}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontFamily: F.mono, fontSize: "14px", color: C.ink }}>{m.val}</span>
                    <span style={{ fontSize: "12px", color: m.ok ? C.success : C.danger }}>{m.trend}</span>
                  </div>
                </div>
              ))}
              <div style={{ marginTop: "20px", padding: "14px", background: "#FBF7EF", borderRadius: "6px", border: `1px solid ${C.line}` }}>
                <div style={{ fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", color: C.gold, marginBottom: "6px", fontFamily: F.body }}>{t("hero.recommendationLabel")}</div>
                <div style={{ fontSize: "13px", color: C.steel, lineHeight: 1.6, fontStyle: "italic", fontFamily: F.body }}>"Reforçar a gestão de tesouraria e renegociar prazos de pagamento a fornecedores…"</div>
              </div>
            </div>
            <div style={{ position: "absolute", top: "-12px", right: "-12px", width: "60px", height: "60px", background: C.gold, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px" }}>✦</div>
          </div>
        </div>
      </section>

      <Divider style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 6vw" }} />

      <section id="metodologia" style={{ maxWidth: "1100px", margin: "0 auto", padding: "80px 6vw" }}>
        <div style={{ textAlign: "center", marginBottom: "56px" }}>
          <Tag>{t("how.tag")}</Tag>
          <h2 style={{ fontFamily: F.display, fontSize: "38px", fontWeight: 300, marginTop: "14px", color: C.ink }}>{t("how.title")}</h2>
        </div>
        <div className="how-grid">
          {(t("how.steps", { returnObjects: true }) || []).map((s, i) => (
            <div key={i} style={{ padding: "32px", background: C.white, border: `1px solid ${C.line}`, borderRadius: "8px" }}>
              <div style={{ fontFamily: F.display, fontSize: "52px", color: C.line, fontWeight: 300, lineHeight: 1, marginBottom: "16px" }}>{s.num}</div>
              <div style={{ fontFamily: F.display, fontSize: "22px", marginBottom: "12px", color: C.ink }}>{s.title}</div>
              <div style={{ fontFamily: F.body, fontSize: "14px", lineHeight: 1.8, color: C.fog }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ background: C.cream, borderTop: `1px solid ${C.line}`, borderBottom: `1px solid ${C.line}`, padding: "80px 6vw" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <Tag>{t("pricing.tag")}</Tag>
            <h2 style={{ fontFamily: F.display, fontSize: "38px", fontWeight: 300, marginTop: "14px" }}>{t("pricing.title")}</h2>
          </div>
          <div className="pricing-grid">
            {(t("pricing.plans", { returnObjects: true }) || []).map((p, idx) => (
              <div key={idx} style={{ background: idx === 1 ? C.gold : C.white, border: `1px solid ${idx === 1 ? C.gold : C.line}`, borderRadius: "8px", padding: "32px", position: "relative" }}>
                {idx === 1 && <div style={{ position: "absolute", top: "-12px", left: "50%", transform: "translateX(-50%)", background: C.ink, color: C.white, fontSize: "9px", letterSpacing: "0.2em", padding: "4px 14px", borderRadius: "12px", whiteSpace: "nowrap" }}>{t("pricing.mostPopular")}</div>}
                <div style={{ fontFamily: F.display, fontSize: "24px", color: idx === 1 ? C.white : C.ink, marginBottom: "8px" }}>{p.name}</div>
                <div style={{ fontFamily: F.display, fontSize: "44px", color: idx === 1 ? C.white : C.gold, marginBottom: "20px", lineHeight: 1 }}>{p.price}</div>
                <ul style={{ listStyle: "none", padding: 0, marginBottom: "24px" }}>
                  {(p.features || []).map((f, i) => (<li key={i} style={{ fontSize: "13px", color: idx === 1 ? "rgba(255,255,255,0.9)" : C.steel, marginBottom: "8px", display: "flex", gap: "8px", lineHeight: 1.5 }}><span style={{ color: idx === 1 ? "rgba(255,255,255,0.7)" : C.gold }}>✓</span>{f}</li>))}
                </ul>
                <button onClick={() => setPage("tool")} style={{ width: "100%", padding: "12px", background: idx === 1 ? C.white : C.gold, border: "none", borderRadius: "4px", color: idx === 1 ? C.gold : C.white, fontFamily: F.display, fontSize: "17px", cursor: "pointer" }}>{t("pricing.cta")}</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer style={{ background: C.ink, color: "rgba(255,255,255,0.5)", padding: "40px 6vw", textAlign: "center" }}>
        <div style={{ fontFamily: F.display, fontSize: "22px", color: C.white, marginBottom: "6px" }}>YourCFO <span style={{ color: C.gold }}>·</span> Arrojo & Destreza</div>
        <div style={{ fontSize: "12px", letterSpacing: "0.15em", marginBottom: "16px" }}>{t("footer.tagline")}</div>
        <a href="mailto:info@yourcfo.app" style={{ fontSize: "13px", color: C.gold, display: "block", marginBottom: "16px", textDecoration: "none", letterSpacing: "0.04em" }}>info@yourcfo.app</a>
        <div style={{ fontSize: "12px", marginBottom: "12px" }}>{t("footer.rights")}</div>
        <a href="/legal.html" onClick={e => { e.preventDefault(); goLegal(); }} style={{ fontSize: "11px", color: C.fog, textDecoration: "none", letterSpacing: "0.08em", borderBottom: `1px solid ${C.fog}30`, paddingBottom: "2px", cursor: "pointer" }}>{t("footer.legal")}</a>
      </footer>

      {/* ── DEMO MODAL ── */}
      {showDemo && (
        <div onClick={() => setShowDemo(false)} style={{ position: "fixed", inset: 0, background: "rgba(11,12,14,0.85)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", animation: "fadeIn 0.2s ease" }}>
          <div onClick={e => e.stopPropagation()} style={{ background: C.white, borderRadius: "10px", width: "100%", maxWidth: "860px", height: "90vh", display: "flex", flexDirection: "column", animation: "fadeUp 0.3s ease", overflow: "hidden" }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", borderBottom: `1px solid ${C.line}`, flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ fontFamily: F.display, fontSize: "18px", color: C.ink }}>Metalúrgica do Douro, S.A.</span>
                <span style={{ display: "inline-block", padding: "2px 10px", border: `1px solid ${C.gold}`, borderRadius: "20px", fontSize: "9px", letterSpacing: "0.2em", textTransform: "uppercase", color: C.gold, fontFamily: F.body }}>Sample / Modelo</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <a href="/Arrojo_Destreza_Relatorio_Financeiro.pdf" download style={{ fontSize: "12px", color: C.fog, textDecoration: "none", fontFamily: F.body, border: `1px solid ${C.line}`, borderRadius: "4px", padding: "6px 12px" }}>⬇ Download PDF</a>
                <button onClick={() => setShowDemo(false)} style={{ background: "none", border: "none", cursor: "pointer", color: C.fog, fontSize: "20px", lineHeight: 1, padding: "4px" }}>✕</button>
              </div>
            </div>
            {/* PDF iframe */}
            <iframe
              src="/Arrojo_Destreza_Relatorio_Financeiro.pdf"
              style={{ flex: 1, border: "none", width: "100%" }}
              title="Exemplo de Relatório — YourCFO"
            />
          </div>
        </div>
      )}
    </>
  );

  /* ── TOOL PAGE ─────────────────────────────────────────── */
  if (page === "tool") return (
    <>
      <style>{GLOBAL_CSS}</style>
      <nav style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(245,240,232,0.92)", backdropFilter: "blur(12px)", borderBottom: `1px solid ${C.line}`, padding: "0 6vw" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: "64px" }}>
          <button onClick={() => setPage("home")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ color: C.fog, fontSize: "13px" }}>←</span>
            <div style={{ fontFamily: F.display, fontSize: "18px", letterSpacing: "0.04em" }}>YourCFO</div>
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <LangSelector />
            <Tag>{t("hero.tag")}</Tag>
          </div>
        </div>
      </nav>
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "56px 6vw" }}>
        <div className="fade-up" style={{ marginBottom: "48px" }}>
          <h1 style={{ fontFamily: F.display, fontSize: "44px", fontWeight: 300, marginBottom: "12px", color: C.ink }}>{t("tool.title")}</h1>
          <p style={{ fontFamily: F.body, fontSize: "16px", color: C.fog, lineHeight: 1.7 }}>{t("tool.description")}</p>
        </div>
        <div style={{ marginBottom: "36px" }}>
          <label style={{ fontSize: "11px", letterSpacing: "0.18em", textTransform: "uppercase", color: C.steel, display: "block", marginBottom: "10px", fontFamily: F.body }}>{t("tool.companyLabel")}</label>
          <input value={company} onChange={e => setCompany(e.target.value)} placeholder={t("tool.companyPlaceholder")} style={{ width: "100%", padding: "13px 18px", border: `1px solid ${C.line}`, borderRadius: "6px", fontFamily: F.display, fontSize: "20px", color: C.ink, background: C.white }} />

          <label style={{ fontSize: "11px", letterSpacing: "0.18em", textTransform: "uppercase", color: C.steel, display: "block", marginBottom: "10px", marginTop: "20px", fontFamily: F.body }}>{t("tool.caeLabel")} <span style={{ color: C.fog, letterSpacing: "0.05em", textTransform: "none", fontSize: "10px" }}>{t("tool.caeOptional")}</span></label>
          <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
            <input value={cae} onChange={e => setCae(e.target.value.replace(/\D/g, "").slice(0, 5))} placeholder={t("tool.caePlaceholder")} style={{ width: "180px", padding: "13px 18px", border: `1px solid ${C.line}`, borderRadius: "6px", fontFamily: F.mono, fontSize: "18px", color: C.ink, background: C.white, letterSpacing: "0.1em" }} />
            <div style={{ flex: 1, padding: "12px 16px", background: "#FBF7EF", border: `1px solid ${C.line}`, borderRadius: "6px", fontFamily: F.body, fontSize: "13px", color: C.fog, lineHeight: 1.5 }}>{t("tool.caeHint")}</div>
          </div>
        </div>
        {years.map(yr => (
          <div key={yr} style={{ marginBottom: "28px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "14px" }}>
              <div style={{ fontFamily: F.display, fontSize: "20px", color: C.gold }}>{yr}</div>
              <div style={{ flex: 1, height: "1px", background: C.line }} />
              {years.length > 2 && (<button onClick={() => removeYear(yr)} style={{ background: "none", border: "none", color: C.fog, cursor: "pointer", fontSize: "12px", fontFamily: F.body }}>{t("tool.removeYear")}</button>)}
            </div>
            <div className="upload-grid">
              {DOC_TYPES.map(dt => (<UploadSlot key={dt.id} label={dt.label} year={yr} file={files[`${yr}_${dt.id}`] || null} onUpload={f => setFile(yr, dt.id, f)} onRemove={() => removeFile(yr, dt.id)} />))}
            </div>
          </div>
        ))}
        <button onClick={addYear} style={{ width: "100%", padding: "16px", background: "transparent", border: `1px dashed ${C.line}`, borderRadius: "6px", color: C.fog, fontFamily: F.body, fontSize: "14px", cursor: "pointer", marginBottom: "36px", letterSpacing: "0.06em" }}>{t("tool.addYear")}</button>
        {error && <div style={{ background: "#FFF5F5", border: `1px solid #E8C0C0`, borderRadius: "6px", padding: "14px 18px", color: C.danger, fontSize: "14px", marginBottom: "20px", fontFamily: F.body }}>⚠ {error}</div>}
        {loading && (
          <div style={{ marginBottom: "24px" }}>
            <div style={{ height: "2px", background: C.line, borderRadius: "2px", overflow: "hidden", marginBottom: "12px" }}>
              <div style={{ height: "100%", background: `linear-gradient(90deg, ${C.gold}, ${C.goldDk})`, width: `${progress}%`, transition: "width 0.5s ease", borderRadius: "2px" }} />
            </div>
            <div style={{ textAlign: "center", fontSize: "13px", color: C.fog, fontStyle: "italic", fontFamily: F.body }}>{statusMsg}</div>
          </div>
        )}
        <button onClick={analyze} disabled={!canAnalyze || loading} style={{ width: "100%", padding: "16px", background: canAnalyze && !loading ? C.gold : C.line, border: "none", borderRadius: "6px", color: canAnalyze && !loading ? C.white : C.fog, fontFamily: F.display, fontSize: "22px", cursor: canAnalyze && !loading ? "pointer" : "not-allowed", letterSpacing: "0.06em", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: "12px" }}>
          {loading ? (<><span style={{ display: "inline-block", animation: "spin 0.8s linear infinite" }}>⟳</span> {t("tool.analyzingBtn")}</>) : t("tool.analyzeBtn")}
        </button>
        <p style={{ textAlign: "center", fontSize: "12px", color: C.fog, marginTop: "12px", fontStyle: "italic", fontFamily: F.body }}>{t("tool.disclaimer")}</p>
      </div>
    </>
  );

  /* ── RESULT PAGE ───────────────────────────────────────── */
  if (page === "result") {
    const R = result || {};
    const anos = R.anos || years;
    const fin = R.financeiros || {};
    const ind = R.indicadores || {};
    const toBarData = (obj) => anos.map(y => ({ label: y, value: obj?.[y] ?? null })).filter(d => d.value !== null);
    const toLineData = (obj) => anos.map(y => ({ label: y, value: obj?.[y] ?? null })).filter(d => d.value !== null);
    const fmtEur = v => v == null ? "—" : v >= 1e6 ? `${(v/1e6).toFixed(2)}M€` : v >= 1e3 ? `${(v/1e3).toFixed(0)}K€` : `${v}€`;
    const fmtPct = v => v == null ? "—" : `${(+v).toFixed(1)}%`;
    const fmtX = v => v == null ? "—" : `${(+v).toFixed(2)}x`;
    const fmtDays = v => v == null ? "—" : `${Math.round(v)}d`;
    const kpiLabel = key => t(`report.kpis.${key}`, { defaultValue: key.replace(/_/g, " ") });

    return (
      <>
        <style>{GLOBAL_CSS}</style>
        <style>{`@media print { nav, .no-print { display: none !important; } body { background: white !important; } }`}</style>
        <nav className="no-print" style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(245,240,232,0.96)", backdropFilter: "blur(12px)", borderBottom: `1px solid ${C.line}`, padding: "0 6vw" }}>
          <div style={{ maxWidth: "960px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: "64px" }}>
            <button onClick={goHome} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ color: C.fog, fontSize: "13px" }}>←</span>
              <div style={{ fontFamily: F.display, fontSize: "18px" }}>YourCFO</div>
            </button>
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <LangSelector />
              {!paid && (<button onClick={() => setShowPaywall(true)} style={{ padding: "9px 22px", background: C.gold, border: "none", borderRadius: "4px", color: C.white, fontFamily: F.display, fontSize: "16px", cursor: "pointer" }}>{t("paywall.unlockAccess")}</button>)}
              {paid && (<><Tag>{t("paywall.deblocked")}</Tag><button onClick={() => window.print()} style={{ padding: "7px 16px", background: "none", border: `1px solid ${C.line}`, borderRadius: "4px", color: C.steel, fontFamily: F.body, fontSize: "13px", cursor: "pointer" }}>{t("paywall.print")}</button></>)}
            </div>
          </div>
        </nav>

        <div style={{ maxWidth: "960px", margin: "0 auto", padding: "56px 6vw 80px" }}>
          <div className="fade-up" style={{ marginBottom: "56px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "20px" }}>
              <div>
                <Tag>{t("report.tag")}</Tag>
                <h1 style={{ fontFamily: F.display, fontSize: "clamp(36px,5vw,54px)", fontWeight: 300, marginTop: "14px", marginBottom: "8px", color: C.ink, lineHeight: 1.1 }}>{R.empresa || company}</h1>
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "10px" }}>
                  {anos.map(y => <span key={y} style={{ fontSize: "13px", color: C.fog, fontFamily: F.body, borderRight: `1px solid ${C.line}`, paddingRight: "12px" }}>{t("report.exercise")} {y}</span>)}
                  <span style={{ fontSize: "12px", color: C.fog, fontFamily: F.body }}>{t("report.issued")} {new Date().toLocaleDateString()}</span>
                </div>
              </div>
              {R.avaliacao_global && <RatingBadge rating={R.avaliacao_global} />}
            </div>
            {R.sumario?.destaques && (
              <div style={{ display: "flex", gap: "12px", marginTop: "28px", flexWrap: "wrap" }}>
                {R.sumario.destaques.map((d, i) => (<div key={i} style={{ background: C.white, border: `1px solid ${C.line}`, borderRadius: "6px", padding: "10px 16px", fontSize: "13px", fontFamily: F.body, color: C.steel, flexShrink: 0 }}>{d}</div>))}
              </div>
            )}
          </div>

          <Divider style={{ marginBottom: "0" }} />

          <ReportSection number="01" title={t("report.sections.s01")}>
            {R.sumario?.texto && <p style={{ fontFamily: F.body, fontSize: "16px", lineHeight: 1.9, color: C.steel, marginBottom: "24px", maxWidth: "720px" }}>{R.sumario.texto}</p>}
            {Object.keys(fin).length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "12px", marginTop: "8px" }}>
                {[
                  { key: "volume_negocios", fmt: fmtEur }, { key: "resultado_liquido", fmt: fmtEur },
                  { key: "ebitda", fmt: fmtEur }, { key: "total_ativo", fmt: fmtEur },
                  { key: "capital_proprio", fmt: fmtEur }, { key: "divida_financeira", fmt: fmtEur },
                ].filter(m => fin[m.key]).map(m => (
                  <KpiCard key={m.key} label={kpiLabel(m.key)} values={Object.fromEntries(anos.filter(y => fin[m.key]?.[y] != null).map(y => [y, m.fmt(fin[m.key][y])]))} />
                ))}
              </div>
            )}
          </ReportSection>

          {Object.keys(fin).length > 0 && (
            <ReportSection number="02" title={t("report.sections.s02")}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px" }}>
                {fin.volume_negocios && toBarData(fin.volume_negocios).length > 0 && (<div><div style={{ fontSize: "11px", letterSpacing: "0.16em", textTransform: "uppercase", color: C.fog, fontFamily: F.body, marginBottom: "12px" }}>{t("report.charts.volume_negocios")}</div><BarChart data={toBarData(fin.volume_negocios)} formatVal={fmtEur} height={180} /></div>)}
                {fin.resultado_liquido && toBarData(fin.resultado_liquido).length > 0 && (<div><div style={{ fontSize: "11px", letterSpacing: "0.16em", textTransform: "uppercase", color: C.fog, fontFamily: F.body, marginBottom: "12px" }}>{t("report.charts.resultado_liquido")}</div><BarChart data={toBarData(fin.resultado_liquido)} formatVal={fmtEur} height={180} /></div>)}
                {fin.ebitda && toBarData(fin.ebitda).length > 0 && (<div><div style={{ fontSize: "11px", letterSpacing: "0.16em", textTransform: "uppercase", color: C.fog, fontFamily: F.body, marginBottom: "12px" }}>{t("report.charts.ebitda")}</div><BarChart data={toBarData(fin.ebitda)} formatVal={fmtEur} height={180} /></div>)}
                {(fin.total_ativo || fin.capital_proprio || fin.divida_financeira) && (() => {
                  const series = [];
                  if (fin.total_ativo) series.push({ name: t("report.activo"), data: toLineData(fin.total_ativo) });
                  if (fin.capital_proprio) series.push({ name: t("report.capProprio"), data: toLineData(fin.capital_proprio) });
                  if (fin.divida_financeira) series.push({ name: t("report.divida"), data: toLineData(fin.divida_financeira) });
                  return series.some(s => s.data.length > 0) ? (<div><div style={{ fontSize: "11px", letterSpacing: "0.16em", textTransform: "uppercase", color: C.fog, fontFamily: F.body, marginBottom: "12px" }}>{t("report.charts.capital")}</div><LineChart series={series} formatVal={fmtEur} height={200} /></div>) : null;
                })()}
              </div>
            </ReportSection>
          )}

          {!paid ? (
            <div style={{ position: "relative", marginTop: "0" }}>
              <div style={{ filter: "blur(5px)", userSelect: "none", pointerEvents: "none" }}>
                <ReportSection number="03" title={t("report.sections.s03")}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
                    {Object.entries(ind).slice(0, 6).map(([key]) => (<KpiCard key={key} label={kpiLabel(key)} values={{ "2023": "—" }} />))}
                  </div>
                </ReportSection>
              </div>
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(to bottom, transparent 0%, rgba(245,240,232,0.6) 30%, rgba(245,240,232,0.9) 100%)" }}>
                <div style={{ background: C.white, border: `1px solid ${C.line}`, borderRadius: "14px", padding: "44px 52px", textAlign: "center", boxShadow: "0 24px 72px rgba(0,0,0,0.10)", maxWidth: "500px" }}>
                  <div style={{ width: "48px", height: "48px", background: "#FAF7EE", border: `1px solid ${C.line}`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", margin: "0 auto 20px" }}>🔒</div>
                  <h2 style={{ fontFamily: F.display, fontSize: "30px", fontWeight: 300, marginBottom: "12px", color: C.ink, lineHeight: 1.2 }}>{t("paywall.paywallTitle")}<br /><span style={{ color: C.gold, fontStyle: "italic" }}>{t("paywall.paywallSub")}</span></h2>
                  <p style={{ fontFamily: F.body, fontSize: "14px", color: C.fog, lineHeight: 1.8, marginBottom: "28px" }}>{t("paywall.paywallDesc")}</p>
                  <button onClick={() => setShowPaywall(true)} style={{ width: "100%", padding: "15px", background: C.gold, border: "none", borderRadius: "6px", color: C.white, fontFamily: F.display, fontSize: "20px", cursor: "pointer", letterSpacing: "0.04em", marginBottom: "10px" }}>{t("paywall.unlockBtn")}</button>
                  <div style={{ fontSize: "11px", color: C.fog, fontStyle: "italic", fontFamily: F.body }}>{t("paywall.accessImmediate")}</div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {Object.keys(ind).length > 0 && (
                <ReportSection number="03" title={t("report.sections.s03")}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px", marginBottom: "36px" }}>
                    {Object.entries(ind).map(([key, val]) => {
                      const yVals = {}; anos.forEach(y => { if (val?.[y] != null) yVals[y] = val[y]; });
                      if (!Object.keys(yVals).length) return null;
                      const fmts = { roe: fmtPct, roa: fmtPct, margem_liquida: fmtPct, margem_ebitda: fmtPct, autonomia_financeira: fmtPct, divida_ebitda: fmtX, pme: fmtDays, pmp: fmtDays };
                      const fmt = fmts[key] || (v => typeof v === "number" ? v.toFixed(2) : v);
                      return (<KpiCard key={key} label={kpiLabel(key)} values={Object.fromEntries(Object.entries(yVals).map(([y, v]) => [y, fmt(v)]))} benchmark={val?.referencia ? `${t("report.ref")}: ${val.referencia}` : undefined} description={val?.descricao} />);
                    })}
                  </div>
                  <div className="chart-grid">
                    {(ind.liquidez_geral || ind.liquidez_reduzida) && (() => { const series = []; if (ind.liquidez_geral) series.push({ name: t("report.kpis.liquidez_geral"), data: toLineData(ind.liquidez_geral) }); if (ind.liquidez_reduzida) series.push({ name: t("report.kpis.liquidez_reduzida"), data: toLineData(ind.liquidez_reduzida) }); return (<div><div style={{ fontSize: "11px", letterSpacing: "0.16em", textTransform: "uppercase", color: C.fog, fontFamily: F.body, marginBottom: "12px" }}>{t("report.charts.liquidez")}</div><LineChart series={series} formatVal={v => v?.toFixed ? v.toFixed(2) : v} height={200} /></div>); })()}
                    {(ind.roe || ind.roa || ind.margem_liquida) && (() => { const series = []; if (ind.roe) series.push({ name: "ROE %", data: toLineData(ind.roe) }); if (ind.roa) series.push({ name: "ROA %", data: toLineData(ind.roa) }); if (ind.margem_liquida) series.push({ name: t("report.kpis.margem_liquida"), data: toLineData(ind.margem_liquida) }); return (<div><div style={{ fontSize: "11px", letterSpacing: "0.16em", textTransform: "uppercase", color: C.fog, fontFamily: F.body, marginBottom: "12px" }}>{t("report.charts.rentabilidade")}</div><LineChart series={series} formatVal={v => `${v?.toFixed ? v.toFixed(1) : v}%`} height={200} /></div>); })()}
                    {(ind.pme || ind.pmp) && (<div><div style={{ fontSize: "11px", letterSpacing: "0.16em", textTransform: "uppercase", color: C.fog, fontFamily: F.body, marginBottom: "12px" }}>{t("report.charts.ciclo")}</div><BarChart data={[...anos.filter(y => ind.pme?.[y] != null).map(y => ({ label: `PMR ${y}`, value: ind.pme[y] })), ...anos.filter(y => ind.pmp?.[y] != null).map(y => ({ label: `PMP ${y}`, value: ind.pmp[y] }))]} formatVal={fmtDays} height={180} /></div>)}
                    {ind.autonomia_financeira && (() => { const lastYr = anos.filter(y => ind.autonomia_financeira?.[y] != null).slice(-1)[0]; const val = ind.autonomia_financeira?.[lastYr]; return lastYr && val != null ? (<div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}><div style={{ fontSize: "11px", letterSpacing: "0.16em", textTransform: "uppercase", color: C.fog, fontFamily: F.body, marginBottom: "12px", alignSelf: "flex-start" }}>{t("report.charts.autonomia")} {lastYr}</div><GaugeChart value={val} min={0} max={100} label={`% (ref. > 33%)`} />{anos.length > 1 && (<div style={{ marginTop: "8px" }}><LineChart series={[{ name: t("report.kpis.autonomia_financeira"), data: toLineData(ind.autonomia_financeira) }]} formatVal={fmtPct} height={140} /></div>)}</div>) : null; })()}
                  </div>
                </ReportSection>
              )}

              {paidPlan === "premium" ? (<>
                {R.analise_detalhada && (
                  <ReportSection number="04" title={t("report.sections.s04")}>
                    <div className="analise-grid">
                      {[
                        { key: "rentabilidade", icon: "📈" },
                        { key: "liquidez_solvabilidade", icon: "💧" },
                        { key: "estrutura_capital", icon: "🏗" },
                        { key: "eficiencia_operacional", icon: "⚙️" },
                      ].filter(s => R.analise_detalhada[s.key]).map(s => (
                        <div key={s.key} style={{ background: C.white, border: `1px solid ${C.line}`, borderRadius: "8px", padding: "20px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                            <span style={{ fontSize: "16px" }}>{s.icon}</span>
                            <span style={{ fontFamily: F.display, fontSize: "17px", color: C.ink }}>{t(`report.analysis.${s.key}`)}</span>
                          </div>
                          <p style={{ fontFamily: F.body, fontSize: "14px", lineHeight: 1.8, color: C.steel }}>{R.analise_detalhada[s.key]}</p>
                        </div>
                      ))}
                    </div>
                  </ReportSection>
                )}
                {R.swot && (<ReportSection number="05" title={t("report.sections.s05")}><SwotTable data={R.swot} /></ReportSection>)}
                {R.recomendacoes && (<ReportSection number="06" title={t("report.sections.s06")}><ActionPlan actions={R.recomendacoes} /></ReportSection>)}
                {R.conclusao && (<ReportSection number="07" title={t("report.sections.s07")}><p style={{ fontFamily: F.body, fontSize: "16px", lineHeight: 1.9, color: C.steel, maxWidth: "720px" }}>{R.conclusao}</p></ReportSection>)}
                {R.posicionamento_sectorial && R.posicionamento_sectorial.indicadores && R.posicionamento_sectorial.indicadores.length > 0 && (
                  <ReportSection number="08" title={t("report.sections.s08")}>
                    <div style={{ marginBottom: "16px" }}>
                      <div style={{ display: "inline-block", padding: "3px 12px", border: `1px solid ${C.gold}`, borderRadius: "20px", fontSize: "10px", letterSpacing: "0.18em", textTransform: "uppercase", color: C.gold, fontFamily: F.body, marginBottom: "12px" }}>
                        CAE {R.posicionamento_sectorial.cae} · {R.posicionamento_sectorial.setor}
                      </div>
                      {R.posicionamento_sectorial.texto && (
                        <p style={{ fontFamily: F.body, fontSize: "15px", lineHeight: 1.8, color: C.steel, marginBottom: "24px" }}>{R.posicionamento_sectorial.texto}</p>
                      )}
                      <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: F.body }}>
                        <thead>
                          <tr style={{ borderBottom: `2px solid ${C.ink}` }}>
                            {["Indicador", "Empresa", "Média Sector", "Posição"].map(h => (
                              <th key={h} style={{ padding: "10px 14px", textAlign: h === "Indicador" ? "left" : "center", fontSize: "11px", letterSpacing: "0.15em", textTransform: "uppercase", color: C.fog, fontWeight: 400 }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {R.posicionamento_sectorial.indicadores.map((ind, i) => (
                            <tr key={i} style={{ borderBottom: `1px solid ${C.line}`, background: i % 2 === 0 ? "transparent" : "#FAFAF8" }}>
                              <td style={{ padding: "12px 14px", fontSize: "14px", color: C.ink, fontWeight: 500 }}>{ind.nome}</td>
                              <td style={{ padding: "12px 14px", textAlign: "center", fontSize: "14px", color: C.steel }}>{typeof ind.empresa === "number" ? ind.empresa.toLocaleString("pt-PT") : ind.empresa}</td>
                              <td style={{ padding: "12px 14px", textAlign: "center", fontSize: "14px", color: C.fog }}>{typeof ind.setor === "number" ? ind.setor.toLocaleString("pt-PT") : ind.setor}</td>
                              <td style={{ padding: "12px 14px", textAlign: "center" }}>
                                <span style={{
                                  display: "inline-block", padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 500,
                                  background: (() => {
                                    const bom = ind.posicao === "ok" ? true : (ind.positivo !== false ? ind.posicao === "acima" : ind.posicao === "abaixo");
                                    return ind.posicao === "ok" ? "#FFF8E1" : bom ? "#E8F5E9" : "#FFEBEE";
                                  })(),
                                  color: (() => {
                                    const bom = ind.posicao === "ok" ? true : (ind.positivo !== false ? ind.posicao === "acima" : ind.posicao === "abaixo");
                                    return ind.posicao === "ok" ? "#F57F17" : bom ? "#2E7D32" : "#C62828";
                                  })()
                                }}>
                                  {ind.posicao === "acima" ? "↑ Acima" : ind.posicao === "abaixo" ? "↓ Abaixo" : "→ OK"}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </ReportSection>
                )}
              </>) : (
                <div style={{ background: C.cream, border: `1px solid ${C.line}`, borderRadius: "10px", padding: "36px", textAlign: "center", margin: "32px 0" }}>
                  <div style={{ fontFamily: F.display, fontSize: "24px", marginBottom: "10px", color: C.ink }}>{t("paywall.upgradeTitle")} <span style={{ color: C.gold, fontStyle: "italic" }}>{t("paywall.upgradePremium")}</span></div>
                  <p style={{ fontFamily: F.body, fontSize: "14px", color: C.fog, marginBottom: "24px", lineHeight: 1.8 }}>{t("paywall.upgradeDesc")}</p>
                  <button onClick={() => setShowPaywall(true)} style={{ padding: "13px 32px", background: C.gold, border: "none", borderRadius: "6px", color: C.white, fontFamily: F.display, fontSize: "18px", cursor: "pointer" }}>{t("paywall.upgradeBtn")}</button>
                </div>
              )}

              <div style={{ textAlign: "center", padding: "48px 0 20px" }}>
                <Divider style={{ marginBottom: "20px" }} />
                <div style={{ fontSize: "11px", color: C.fog, fontStyle: "italic", fontFamily: F.body, lineHeight: 1.8 }}>
                  {t("report.footer")}<br />{t("report.poweredBy")} · {new Date().toLocaleDateString()} · Matosinhos, Portugal
                </div>
              </div>
            </>
          )}
        </div>

        {showPaywall && (
          <PaywallModal companyName={company} onClose={() => setShowPaywall(false)} onPay={(p) => { setPaid(true); setPaidPlan(p || "standard"); setShowPaywall(false); }} />
        )}
      </>
    );
  }
}
