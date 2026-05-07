import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function InquiryPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  return (
    <>
      <style>{`
        
    /* ─── TOKENS ─── */
    :root {
      --navy:       #0D1B2A;
      --navy-80:    rgba(13,27,42,0.80);
      --cream:      #F5EFE0;
      --cream-dark: #EAE0CC;
      --cream-mid:  #DDD3BC;
      --red:        #D62828;
      --red-dark:   #B52020;
      --blue:       #44BEC7;
      --blue-dark:  #37A8B0;
      --text-dark:  #1A2D3F;
      --text-mid:   #4A5E6E;
      --text-light: #8A9EAA;
      --font:       'Plus Jakarta Sans', system-ui, sans-serif;
      --ease:       cubic-bezier(0.22, 1, 0.36, 1);
      --panel-w:    480px;   /* right panel fixed width */
    }

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { height: 100%; overflow: hidden; }

    body {
      font-family: var(--font);
      font-size: 15px;
      background: var(--navy);
      color: var(--text-dark);
      display: flex;
      height: 100dvh;
    }

    /* ═══════════════════════════════════
       LEFT — BACKGROUND IMAGE STACK
    ═══════════════════════════════════ */
    .bg-stage {
      position: relative;
      flex: 1;
      overflow: hidden;
    }

    .bg-layer {
      position: absolute;
      inset: 0;
      background-size: cover;
      background-position: center;
      opacity: 0;
      transition: opacity 1.1s var(--ease);
      /* Slow Ken Burns per layer, paused mid-crossfade for smoothness */
      animation: kenburns 18s ease-in-out infinite alternate;
    }

    .bg-layer.visible { opacity: 1; }

    @keyframes kenburns {
      from { transform: scale(1.00) translate(0, 0); }
      to   { transform: scale(1.07) translate(-1%, 1%); }
    }

    /* Per-section images */
    .bg-layer[data-section="1"] { background-image: url('/images/bg1.jpg'); background-position: center 30%; }
    .bg-layer[data-section="2"] { background-image: url('/images/bg2.jpg'); background-position: center 25%; }
    .bg-layer[data-section="3"] { background-image: url('/images/bg3.jpg'); background-position: center 20%; }
    .bg-layer[data-section="4"] { background-image: url('/images/bg4.jpg'); background-position: center 35%; }
    .bg-layer[data-section="5"] { background-image: url('/images/bg5.jpg'); background-position: center 25%; }

    /* Dark vignette on right edge to blend into panel */
    .bg-stage::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(to right, transparent 55%, rgba(13,27,42,0.55) 100%);
      pointer-events: none;
    }

    /* Logo over image — bottom-left */
    .bg-logo {
      position: absolute;
      bottom: 32px;
      left: 32px;
      z-index: 10;
      width: 80px;
      height: 80px;
      border-radius: 50%;
      overflow: hidden;
      box-shadow: 0 0 0 2px rgba(68,190,199,0.6), 0 8px 32px rgba(0,0,0,0.4);
      opacity: 0;
      animation: fadeUp 1s var(--ease) 0.5s forwards;
    }

    .bg-logo img { width: 100%; height: 100%; object-fit: cover; display: block; }

    /* Contact info over image — top-left */
    .bg-contact {
      position: absolute;
      top: 28px; left: 28px;
      z-index: 10;
      opacity: 0;
      animation: fadeDown 0.9s var(--ease) 0.7s forwards;
    }

    @keyframes fadeDown {
      from { opacity: 0; transform: translateY(-10px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .bg-contact a {
      display: block;
      font-size: 0.75rem;
      font-weight: 500;
      color: rgba(255,255,255,0.75);
      text-decoration: none;
      letter-spacing: 0.03em;
      line-height: 1.9;
      text-shadow: 0 1px 4px rgba(0,0,0,0.5);
      transition: color 0.2s;
    }

    .bg-contact a:hover { color: var(--blue); }

    /* Section label over image — bottom-left above logo */
    .bg-step-label {
      position: absolute;
      bottom: 126px; left: 32px;
      z-index: 10;
      font-size: 0.68rem;
      font-weight: 700;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: rgba(255,255,255,0.45);
      text-shadow: 0 1px 4px rgba(0,0,0,0.5);
      transition: opacity 0.4s;
    }

    /* ═══════════════════════════════════
       RIGHT — FORM PANEL
    ═══════════════════════════════════ */
    .form-panel {
      width: var(--panel-w);
      flex-shrink: 0;
      background: var(--cream);
      display: flex;
      flex-direction: column;
      overflow: clip;
      position: relative;
      box-shadow: -12px 0 48px rgba(13,27,42,0.25);
    }

    /* ── PANEL SITE HEADER ── */
    .panel-header {
      flex-shrink: 0;
      background: var(--navy);
      padding: 0 24px;
      height: 62px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      border-bottom: 3px solid var(--red);
    }

    .panel-header-logo {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      overflow: hidden;
      flex-shrink: 0;
      box-shadow: 0 0 0 2px rgba(68,190,199,0.4);
    }

    .panel-header-logo img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .panel-header-title {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 1px;
    }

    .panel-header-sub {
      font-size: 0.62rem;
      font-weight: 600;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--blue);
      line-height: 1;
    }

    .panel-header-main {
      font-size: 0.88rem;
      font-weight: 700;
      color: var(--cream);
      line-height: 1;
      letter-spacing: -0.1px;
    }

    /* ── PROGRESS BAR (top of panel) ── */
    .progress-bar {
      flex-shrink: 0;
      background: #fff;
      border-bottom: 1px solid var(--cream-mid);
      padding: 0 28px;
      display: flex;
      gap: 0;
    }

    .step-btn {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      padding: 12px 4px 10px;
      background: none;
      border: none;
      cursor: pointer;
      position: relative;
      -webkit-tap-highlight-color: transparent;
      transition: background 0.15s;
    }

    .step-btn:hover { background: rgba(13,27,42,0.03); }

    .step-btn::after {
      content: '';
      position: absolute;
      bottom: 0; left: 0; right: 0;
      height: 2.5px;
      background: transparent;
      transition: background 0.35s var(--ease);
    }

    .step-btn.active::after { background: var(--red); }
    .step-btn.done::after   { background: var(--blue); }

    .step-dot {
      width: 24px; height: 24px;
      border-radius: 50%;
      background: var(--cream-mid);
      color: var(--text-light);
      font-size: 0.68rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.35s var(--ease);
    }

    .step-btn.active .step-dot {
      background: var(--red);
      color: #fff;
      box-shadow: 0 2px 8px rgba(214,40,40,0.4);
      transform: scale(1.1);
    }

    .step-btn.done .step-dot { background: var(--blue); color: #fff; }

    .step-name {
      font-size: 0.58rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.07em;
      color: var(--text-light);
      transition: color 0.2s;
    }

    .step-btn.active .step-name { color: var(--red); }
    .step-btn.done .step-name   { color: var(--blue-dark); }

    /* ── SECTIONS VIEWPORT ── */
    .sections-wrap {
      flex: 1;
      position: relative;
      overflow: clip; /* clips visually without blocking pointer events */
    }

    /* Each section fills the panel height, no scroll */
    .slide {
      position: absolute;
      inset: 0;
      padding: 32px 28px 24px;
      display: flex;
      flex-direction: column;
      gap: 0;
      opacity: 0;
      pointer-events: none;
      visibility: hidden;
      overflow-y: auto;
      overscroll-behavior: contain;
      scrollbar-width: none;
    }

    .slide::-webkit-scrollbar { display: none; }

    .slide.is-active {
      opacity: 1;
      pointer-events: auto;
      visibility: visible;
    }

    /* During animation only — visible but not interactive */
    .slide.animating {
      visibility: visible;
      pointer-events: none;
    }

    /* ── SLIDE HEADER ── */
    .slide-head {
      margin-bottom: 22px;
      flex-shrink: 0;
    }

    .slide-eyebrow {
      font-size: 0.65rem;
      font-weight: 700;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--blue-dark);
      margin-bottom: 5px;
    }

    .slide-title {
      font-size: 1.45rem;
      font-weight: 800;
      color: var(--navy);
      line-height: 1.15;
      letter-spacing: -0.3px;
    }

    .slide-sub {
      font-size: 0.82rem;
      color: var(--text-light);
      margin-top: 5px;
      font-weight: 400;
      line-height: 1.5;
    }

    /* ── FIELDS ── */
    .fields { flex: 1; display: flex; flex-direction: column; gap: 14px; }

    .field-group { display: flex; flex-direction: column; gap: 6px; }

    .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }

    .field-label {
      font-size: 0.7rem;
      font-weight: 700;
      letter-spacing: 0.07em;
      text-transform: uppercase;
      color: var(--text-mid);
    }

    .field-label .req { color: var(--red); margin-left: 1px; }

    input[type="text"],
    input[type="email"],
    input[type="tel"],
    input[type="date"],
    input[type="time"],
    select,
    textarea {
      width: 100%;
      background: #fff;
      border: 1.5px solid var(--cream-mid);
      border-radius: 8px;
      color: var(--text-dark);
      font-family: var(--font);
      font-size: 0.88rem;
      font-weight: 500;
      padding: 10px 13px;
      outline: none;
      -webkit-appearance: none;
      transition: border-color 0.2s, box-shadow 0.2s;
    }

    input::placeholder, textarea::placeholder {
      color: var(--text-light); font-weight: 400;
    }

    input:focus, select:focus, textarea:focus {
      border-color: var(--blue);
      box-shadow: 0 0 0 3px rgba(68,190,199,0.13);
    }

    select {
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='7' viewBox='0 0 11 7'%3E%3Cpath d='M1 1l4.5 4.5L10 1' stroke='%238A9EAA' stroke-width='1.6' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 12px center;
      padding-right: 32px;
      cursor: pointer;
    }

    textarea {
      resize: none;
      min-height: 88px;
      line-height: 1.55;
    }

    /* ── CHOICE CARDS (radio/checkbox) ── */
    .choice-group {
      display: flex; flex-direction: column; gap: 7px;
    }

    .choice-group.inline {
      flex-direction: row; flex-wrap: wrap; gap: 7px;
    }

    .choice-item {
      display: flex; align-items: center; gap: 9px;
      padding: 9px 13px;
      background: #fff;
      border: 1.5px solid var(--cream-mid);
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.86rem;
      font-weight: 500;
      color: var(--text-mid);
      user-select: none;
      transition: border-color 0.18s, background 0.18s, color 0.18s;
      -webkit-tap-highlight-color: transparent;
    }

    .choice-item:hover {
      border-color: var(--blue);
      background: rgba(68,190,199,0.04);
      color: var(--text-dark);
    }

    .choice-item:has(input:checked) {
      border-color: var(--blue);
      background: rgba(68,190,199,0.09);
      color: var(--navy);
      font-weight: 600;
    }

    .choice-item input[type="radio"],
    .choice-item input[type="checkbox"] {
      width: 16px; height: 16px; min-width: 16px;
      accent-color: var(--blue);
      cursor: pointer;
    }

    /* ── POLICY CARD ── */
    .policy-link {
      display: flex; align-items: center; gap: 14px;
      background: #fff;
      border: 1.5px solid var(--blue);
      border-radius: 10px;
      padding: 16px 18px;
      text-decoration: none;
      transition: background 0.2s, box-shadow 0.2s;
      flex-shrink: 0;
    }

    .policy-link:hover {
      background: rgba(68,190,199,0.05);
      box-shadow: 0 4px 16px rgba(68,190,199,0.18);
    }

    .policy-icon {
      width: 40px; height: 40px; border-radius: 9px;
      background: rgba(68,190,199,0.12);
      display: flex; align-items: center; justify-content: center;
      font-size: 18px; flex-shrink: 0;
    }

    .policy-text strong {
      display: block; font-size: 0.88rem;
      font-weight: 700; color: var(--navy); margin-bottom: 2px;
    }

    .policy-text span { font-size: 0.76rem; color: var(--blue-dark); font-weight: 500; }

    .policy-arrow { margin-left: auto; color: var(--blue); font-size: 1rem; flex-shrink: 0; }

    .policy-note {
      background: rgba(214,40,40,0.05);
      border: 1px solid rgba(214,40,40,0.15);
      border-radius: 8px;
      padding: 12px 15px;
      font-size: 0.8rem;
      color: var(--text-mid);
      line-height: 1.55;
      flex-shrink: 0;
    }

    .policy-note strong { color: var(--red); }

    .policy-contact {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 12px 16px;
      background: #fff;
      border: 1.5px solid var(--cream-mid);
      border-radius: 8px;
    }

    .policy-contact-header {
      font-size: 0.82rem;
      font-weight: 700;
      color: var(--navy);
      padding-bottom: 8px;
      border-bottom: 1px solid var(--cream-mid);
      margin-bottom: 2px;
    }

    .policy-contact a {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.84rem;
      font-weight: 600;
      color: var(--blue-dark);
      text-decoration: none;
      transition: color 0.2s;
    }

    .policy-contact a:hover { color: var(--blue); }

    /* ── REVIEW ROWS ── */
    .review-list {
      display: flex; flex-direction: column;
      gap: 0; flex: 1;
    }

    .review-row {
      display: flex; gap: 12px;
      padding: 9px 0;
      border-bottom: 1px solid var(--cream-dark);
      font-size: 0.84rem;
    }

    .review-key {
      min-width: 120px; flex-shrink: 0;
      font-size: 0.67rem; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.06em;
      color: var(--text-light); padding-top: 2px;
    }

    .review-val { color: var(--text-dark); font-weight: 500; }

    /* ── FOOTER / BUTTONS ── */
    .slide-footer {
      flex-shrink: 0;
      padding-top: 18px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
    }

    .btn {
      font-family: var(--font);
      font-size: 0.8rem;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      padding: 11px 24px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
      transition: all 0.2s var(--ease);
    }

    .btn-back {
      background: transparent;
      color: var(--text-light);
      border: 1.5px solid var(--cream-mid);
    }

    .btn-back:hover {
      border-color: var(--text-light);
      color: var(--text-dark);
    }

    .btn-next {
      background: var(--red);
      color: #fff;
      box-shadow: 0 4px 14px rgba(214,40,40,0.32);
      padding: 11px 30px;
    }

    .btn-next:hover {
      background: var(--red-dark);
      transform: translateY(-1px);
      box-shadow: 0 7px 20px rgba(214,40,40,0.38);
    }

    .btn-next:active { transform: translateY(0); }

    .btn-submit {
      background: var(--red);
      color: #fff;
      padding: 12px 36px;
      font-size: 0.84rem;
      box-shadow: 0 4px 16px rgba(214,40,40,0.32);
    }

    .btn-submit:hover {
      background: var(--red-dark);
      transform: translateY(-1px);
      box-shadow: 0 8px 24px rgba(214,40,40,0.4);
    }

    .step-counter {
      font-size: 0.72rem;
      font-weight: 600;
      color: var(--text-light);
      letter-spacing: 0.04em;
    }

    /* ── SUCCESS STATE ── */
    .success-slide {
      position: absolute; inset: 0;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      padding: 40px 28px;
      text-align: center;
      opacity: 0;
      pointer-events: none;
      visibility: hidden;
      transform: translateY(20px);
      transition: opacity 0.55s var(--ease), transform 0.55s var(--ease), visibility 0s 0.55s;
    }

    .success-slide.visible {
      opacity: 1; pointer-events: auto;
      visibility: visible;
      transform: translateY(0);
      transition: opacity 0.55s var(--ease), transform 0.55s var(--ease), visibility 0s 0s;
    }

    .success-ring {
      width: 72px; height: 72px; border-radius: 50%;
      background: linear-gradient(135deg, var(--blue), var(--blue-dark));
      display: flex; align-items: center; justify-content: center;
      margin-bottom: 22px;
      box-shadow: 0 8px 30px rgba(68,190,199,0.35);
      animation: popIn 0.5s var(--ease) both;
    }

    @keyframes popIn {
      from { transform: scale(0); opacity: 0; }
      to   { transform: scale(1); opacity: 1; }
    }

    .success-slide h2 {
      font-size: 1.5rem; font-weight: 800;
      color: var(--navy); margin-bottom: 10px;
      letter-spacing: -0.3px;
    }

    .success-slide p {
      font-size: 0.85rem; color: var(--text-mid);
      line-height: 1.65; max-width: 320px;
    }

    .success-slide a { color: var(--blue-dark); font-weight: 600; text-decoration: none; }

    /* ── ANIMATIONS ── */
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(12px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    /* ── MOBILE — stack vertically ── */
    @media (max-width: 700px) {
      body { flex-direction: column; overflow: auto; }
      html, body { height: auto; overflow: auto; }

      .bg-stage {
        height: 38vh; min-height: 200px;
        flex: none; width: 100%;
      }

      .bg-stage::after {
        background: linear-gradient(to bottom, transparent 40%, rgba(13,27,42,0.6) 100%);
      }

      .form-panel {
        width: 100%; flex: 1;
        box-shadow: none;
        min-height: 62vh;
      }

      .sections-wrap { overflow-y: auto; }
      .slide { position: relative; opacity: 1; pointer-events: auto; transform: none !important; }
      .slide:not(.is-active) { display: none; }

      :root { --panel-w: 100%; }
    }
  
      `}</style>
      <div dangerouslySetInnerHTML={{__html: `<!-- ═══ LEFT: BACKGROUND IMAGE STAGE ═══ -->
<div class="bg-stage" id="bgStage">
  <div class="bg-layer visible" data-section="1"></div>
  <div class="bg-layer"         data-section="2"></div>
  <div class="bg-layer"         data-section="3"></div>
  <div class="bg-layer"         data-section="4"></div>
  <div class="bg-layer"         data-section="5"></div>
</div>

<!-- ═══ RIGHT: FORM PANEL ═══ -->
<div class="form-panel">

  <!-- Site header -->
  <div class="panel-header">
    <div class="panel-header-logo">
      <img src="/images/logo.png" alt="Pescadero Music" />
    </div>
    <div class="panel-header-title">
      <span class="panel-header-sub">Pescadero Music</span>
      <span class="panel-header-main">Wedding Sound Inquiry</span>
    </div>
  </div>

  <!-- Progress tabs -->
  <div class="progress-bar" id="progressBar">
    <button class="step-btn active" data-step="1" onclick="tabNav(1)">
      <div class="step-dot">1</div>
      <div class="step-name">Policy</div>
    </button>
    <button class="step-btn" data-step="2" onclick="tabNav(2)">
      <div class="step-dot">2</div>
      <div class="step-name">Contact</div>
    </button>
    <button class="step-btn" data-step="3" onclick="tabNav(3)">
      <div class="step-dot">3</div>
      <div class="step-name">Event</div>
    </button>
    <button class="step-btn" data-step="4" onclick="tabNav(4)">
      <div class="step-dot">4</div>
      <div class="step-name">Services</div>
    </button>
    <button class="step-btn" data-step="5" onclick="tabNav(5)">
      <div class="step-dot">5</div>
      <div class="step-name">Review</div>
    </button>
  </div>

  <!-- Sections viewport -->
  <div class="sections-wrap" id="sectionsWrap">

    <!-- ── SLIDE 1: POLICY ── -->
    <div class="slide is-active" id="slide-1">
      <div class="slide-head">
        <div class="slide-eyebrow">Wedding Sound Service</div>
        <div class="slide-title">Service Policy</div>
        <div class="slide-sub">Please read the policy document before proceeding.</div>
      </div>

      <div class="fields" style="gap:12px;">
        <a
          class="policy-link"
          href="https://docs.google.com/document/d/1hKPT6KsR4IfH2dZr5VBUQQ-MHZjXpMycIq6akv3_WG8/edit?usp=drivesdk"
          target="_blank" rel="noopener noreferrer"
        >
          <div class="policy-icon">📋</div>
          <div class="policy-text">
            <strong>Pescadero Music — Service Policy</strong>
            <span>Tap to open the full policy document ↗</span>
          </div>
          <div class="policy-arrow">↗</div>
        </a>

        <div class="policy-note">
          <strong>Note:</strong> By continuing with this form, you confirm you have read and understood the Pescadero Music Service Policy.
        </div>

        <div class="policy-contact">
          <div class="policy-contact-header">Questions before you begin? Feel free to reach out!</div>
          <a href="mailto:garrett@pescaderomusic.com">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 7L2 7"/></svg>
            garrett@pescaderomusic.com
          </a>
          <a href="tel:2107279328">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.38 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.81A16 16 0 0 0 16 16.91l.86-.86a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92Z"/></svg>
            (210) 727-9328
          </a>
        </div>
      </div>

      <div class="slide-footer">
        <span class="step-counter">1 / 4</span>
        <button class="btn btn-next" onclick="goTo(2,'forward')">I've Read &amp; Agree →</button>
      </div>
    </div>

    <!-- ── SLIDE 2: CONTACT ── -->
    <div class="slide" id="slide-2">
      <div class="slide-head">
        <div class="slide-eyebrow">Step 1 of 4</div>
        <div class="slide-title">Contact Information</div>
        <div class="slide-sub">Tell us how to reach you.</div>
      </div>

      <div class="fields">
        <div class="field-row">
          <div class="field-group">
            <div class="field-label">First Name <span class="req">*</span></div>
            <input type="text" id="firstName" placeholder="First" />
          </div>
          <div class="field-group">
            <div class="field-label">Last Name <span class="req">*</span></div>
            <input type="text" id="lastName" placeholder="Last" />
          </div>
        </div>

        <div class="field-group">
          <div class="field-label">Email Address <span class="req">*</span></div>
          <input type="email" id="email" placeholder="you@example.com" />
        </div>

        <div class="field-group">
          <div class="field-label">Phone Number <span class="req">*</span></div>
          <input type="tel" id="phone" placeholder="(801) 555-5555" />
        </div>

        <div class="field-group">
          <div class="field-label">Preferred Contact Method <span class="req">*</span></div>
          <div class="choice-group inline">
            <label class="choice-item"><input type="radio" name="entry.1289776342" value="Call" /> Call</label>
            <label class="choice-item"><input type="radio" name="entry.1289776342" value="Email" /> Email</label>
            <label class="choice-item"><input type="radio" name="entry.1289776342" value="Text" /> Text</label>
          </div>
        </div>

        <div class="field-group">
          <div class="field-label">Name of Bride &amp; Groom <span class="req">*</span></div>
          <input type="text" id="coupleNames" placeholder="e.g. Emily &amp; James" />
        </div>
      </div>

      <div class="slide-footer">
        <button class="btn btn-back" onclick="goTo(1,'back')">← Back</button>
        <button class="btn btn-next" onclick="goTo(3,'forward')">Next →</button>
      </div>
    </div>

    <!-- ── SLIDE 3: EVENT ── -->
    <div class="slide" id="slide-3">
      <div class="slide-head">
        <div class="slide-eyebrow">Step 2 of 4</div>
        <div class="slide-title">Event Details</div>
        <div class="slide-sub">Tell us about your wedding day.</div>
      </div>

      <div class="fields">
        <div class="field-group">
          <div class="field-label">Event Name / Description <span class="req">*</span></div>
          <input type="text" id="eventName" placeholder="e.g. Smith Wedding Reception" />
        </div>

        <div class="field-group">
          <div class="field-label">Event Date <span class="req">*</span></div>
          <input type="date" id="eventDate" name="entry.1402594235" />
        </div>

        <div class="field-row">
          <div class="field-group">
            <div class="field-label">Start Time <span class="req">*</span></div>
            <input type="time" id="startTime" name="entry.1145643384" />
          </div>
          <div class="field-group">
            <div class="field-label">End Time <span class="req">*</span></div>
            <input type="time" id="endTime" name="entry.839784182" />
          </div>
        </div>

        <div class="field-group">
          <div class="field-label">Venue Name <span class="req">*</span></div>
          <input type="text" id="venue" placeholder="Venue name" />
        </div>

        <div class="field-group">
          <div class="field-label">Venue Address <span class="req">*</span></div>
          <input type="text" id="venueAddress" placeholder="Street, City, State, ZIP" />
        </div>

        <div class="field-group">
          <div class="field-label">Indoor or Outdoor? <span class="req">*</span></div>
          <div class="choice-group inline">
            <label class="choice-item"><input type="radio" name="entry.1884292728" value="Indoor" /> Indoor</label>
            <label class="choice-item"><input type="radio" name="entry.1884292728" value="Outdoor" /> Outdoor</label>
            <label class="choice-item"><input type="radio" name="entry.1884292728" value="Both" /> Both</label>
          </div>
        </div>

        <div class="field-group">
          <div class="field-label">Estimated Attendance <span class="req">*</span></div>
          <input type="text" id="attendance" placeholder="e.g. 150" />
        </div>
      </div>

      <div class="slide-footer">
        <button class="btn btn-back" onclick="goTo(2,'back')">← Back</button>
        <button class="btn btn-next" onclick="goTo(4,'forward')">Next →</button>
      </div>
    </div>

    <!-- ── SLIDE 4: SERVICES ── -->
    <div class="slide" id="slide-4">
      <div class="slide-head">
        <div class="slide-eyebrow">Step 3 of 4</div>
        <div class="slide-title">Services Requested</div>
        <div class="slide-sub">Select all that apply and your budget range.</div>
      </div>

      <div class="fields">
        <div class="field-group">
          <div class="field-label">Service Request <span class="req">*</span></div>
          <div class="choice-group">
            <label class="choice-item"><input type="checkbox" name="entry.2010812548" value="MC Service" /> MC Service</label>
            <label class="choice-item"><input type="checkbox" name="entry.2010812548" value="Ceremony Sound &amp; Wireless Microphones" /> Ceremony Sound &amp; Wireless Microphones</label>
            <label class="choice-item"><input type="checkbox" name="entry.2010812548" value="Speeches &amp; Toasts" /> Speeches &amp; Toasts</label>
            <label class="choice-item"><input type="checkbox" name="entry.2010812548" value="Dinner Background Music" /> Dinner Background Music</label>
            <label class="choice-item"><input type="checkbox" name="entry.2010812548" value="Dance Music / Lighting" /> Dance Music / Lighting</label>
          </div>
        </div>

        <div class="field-group">
          <div class="field-label">Approximate Budget <span class="req">*</span></div>
          <div class="choice-group">
            <label class="choice-item"><input type="radio" name="entry.2134853116" value="$500 - $1,000" /> $500 – $1,000</label>
            <label class="choice-item"><input type="radio" name="entry.2134853116" value="$1,000 - $2,000" /> $1,000 – $2,000</label>
            <label class="choice-item"><input type="radio" name="entry.2134853116" value="$2,000 - $3,000" /> $2,000 – $3,000</label>
            <label class="choice-item"><input type="radio" name="entry.2134853116" value="Over $3,000" /> Over $3,000</label>
          </div>
        </div>

        <div class="field-group">
          <div class="field-label">Additional Details &amp; Questions</div>
          <textarea id="additionalDetails" placeholder="Share any additional details, questions, or special requests…"></textarea>
        </div>
      </div>

      <div class="slide-footer">
        <button class="btn btn-back" onclick="goTo(3,'back')">← Back</button>
        <button class="btn btn-next" onclick="goTo(5,'forward')">Review →</button>
      </div>
    </div>

    <!-- ── SLIDE 5: REVIEW ── -->
    <div class="slide" id="slide-5">
      <div class="slide-head">
        <div class="slide-eyebrow">Step 4 of 4</div>
        <div class="slide-title">Review &amp; Submit</div>
        <div class="slide-sub">Confirm everything looks correct.</div>
      </div>

      <div class="review-list" id="reviewList"></div>

      <iframe name="hidden_iframe" style="display:none"></iframe>

      <form
        id="gform"
        action="https://docs.google.com/forms/d/e/1FAIpQLSf2DiCwlYpZOim1JBidS35KyBeIohJF8vcOzUpT0ScjSOLlww/formResponse"
        method="POST"
        target="hidden_iframe"
        onsubmit="handleSubmit(event)"
      >
        <!-- All entry IDs wired to Google Form -->
        <input type="hidden" id="h_firstName"         name="entry.315397321" />
        <input type="hidden" id="h_lastName"          name="entry.735438890" />
        <input type="hidden" id="h_email"             name="entry.1653024831" />
        <input type="hidden" id="h_phone"             name="entry.1505839442" />
        <input type="hidden" id="h_contactMethod"     name="entry.1289776342" />
        <input type="hidden" id="h_coupleNames"       name="entry.391503868" />
        <input type="hidden" id="h_eventName"         name="entry.167147996" />
        <input type="hidden" id="h_venue"             name="entry.1267295149" />
        <input type="hidden" id="h_venueAddress"      name="entry.1474838283" />
        <input type="hidden" id="h_indoorOutdoor"     name="entry.1884292728" />
        <input type="hidden" id="h_attendance"        name="entry.1801133532" />
        <input type="hidden" id="h_budget"            name="entry.2134853116" />
        <input type="hidden" id="h_additionalDetails" name="entry.1670641103" />

        <div class="slide-footer">
          <button type="button" class="btn btn-back" onclick="goTo(4,'back')">← Edit</button>
          <button type="submit" class="btn btn-submit">Submit Inquiry →</button>
        </div>
      </form>
    </div>

    <!-- ── SUCCESS ── -->
    <div class="success-slide" id="successSlide">
      <div class="success-ring">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>
      <h2>Inquiry Received!</h2>
      <p>Thank you — Garrett will review your submission and be in touch shortly.<br><br>
        Questions? <a href="mailto:garrett@pescaderomusic.com">garrett@pescaderomusic.com</a>
      </p>
    </div>

  </div><!-- /sections-wrap -->
</div><!-- /form-panel -->

<script>
  /* ─── CONFIG ─── */
  const DUR     = 400; // transition ms
  let current   = 1;
  let animating = false;

  /* ─── BACKGROUND CROSSFADE ─── */
  function showBg(step) {
    document.querySelectorAll('.bg-layer').forEach(el => {
      el.classList.toggle('visible', parseInt(el.dataset.section) === step);
    });
    const label = document.getElementById('bgStepLabel');
    if (label) {
      const labels = ['Policy', 'Contact', 'Event', 'Services', 'Review'];
      label.textContent = labels[step - 1] || '';
    }
  }

  /* ─── SLIDE TRANSITION ─── */
  function goTo(next, dir) {
    if (animating || next === current) return;
    if (next === 5) buildReview();
    animating = true;

    const out = document.getElementById('slide-' + current);
    const inn = document.getElementById('slide-' + next);

    const outTo  = dir === 'forward' ? '-48px' : '48px';
    const inFrom = dir === 'forward' ? '48px'  : '-48px';

    // Immediately block interaction on outgoing
    out.style.pointerEvents = 'none';
    out.style.visibility    = 'visible';
    out.style.zIndex        = '1';

    // Set up incoming off-screen, make it visible for animation
    inn.style.transition    = 'none';
    inn.style.visibility    = 'visible';
    inn.style.opacity       = '0';
    inn.style.transform     = \\`translateX(\${inFrom})\\`;
    inn.style.pointerEvents = 'none';
    inn.style.zIndex        = '2';

    void inn.offsetHeight; // force reflow

    const T = \\`opacity \${DUR}ms cubic-bezier(0.22,1,0.36,1), transform \${DUR}ms cubic-bezier(0.22,1,0.36,1)\\`;

    // Animate outgoing out
    out.style.transition = T;
    out.style.opacity    = '0';
    out.style.transform  = \\`translateX(\${outTo})\\`;

    // Animate incoming in
    inn.style.transition = T;
    inn.style.opacity    = '1';
    inn.style.transform  = 'translateX(0)';

    // Crossfade background image
    showBg(next);

    setTimeout(() => {
      // 1. Add is-active to incoming FIRST so CSS visibility:visible applies
      inn.classList.add('is-active');
      // 2. Then clear inline styles — CSS class now keeps it visible & interactive
      inn.style.cssText = '';

      // 3. Deactivate outgoing and clear its inline styles
      out.classList.remove('is-active');
      out.style.cssText = '';

      // 4. Safety net — ensure every other slide is fully hidden
      document.querySelectorAll('#sectionsWrap .slide').forEach(s => {
        if (s.id !== 'slide-' + next) {
          s.classList.remove('is-active');
          s.style.cssText = '';
        }
      });

      current = next;
      updateProgress(next);
      animating = false;
    }, DUR + 50);
  }

  function tabNav(step) {
    if (step === current) return;
    goTo(step, step > current ? 'forward' : 'back');
  }

  /* ─── PROGRESS ─── */
  function updateProgress(step) {
    document.querySelectorAll('.step-btn').forEach(btn => {
      const s = parseInt(btn.dataset.step);
      btn.classList.toggle('active', s === step);
      btn.classList.toggle('done',   s < step);
    });
  }

  /* ─── HELPERS ─── */
  const v  = id   => (document.getElementById(id) || {}).value || '';
  const r  = name => { const el = document.querySelector(\\`input[name="\${name}"]:checked\\`); return el ? el.value : '—'; };
  const cb = name => { const els = [...document.querySelectorAll(\\`input[name="\${name}"]:checked\\`)]; return els.length ? els.map(e => e.value).join(', ') : '—'; };

  /* ─── REVIEW ─── */
  function buildReview() {
    const rows = [
      ['Name',           \\`\${v('firstName')} \${v('lastName')}\\`],
      ['Email',          v('email')],
      ['Phone',          v('phone')],
      ['Contact Via',    r('entry.1289776342')],
      ['Bride & Groom',  v('coupleNames')],
      ['Event',          v('eventName')],
      ['Date',           v('eventDate')],
      ['Start',          v('startTime')],
      ['End',            v('endTime')],
      ['Venue',          v('venue')],
      ['Address',        v('venueAddress')],
      ['Setting',        r('entry.1884292728')],
      ['Attendance',     v('attendance')],
      ['Services',       cb('entry.2010812548')],
      ['Budget',         r('entry.2134853116')],
      ['Notes',          v('additionalDetails') || '—'],
    ];

    document.getElementById('reviewList').innerHTML = rows.map(([k, val]) =>
      \\`<div class="review-row">
        <span class="review-key">\${k}</span>
        <span class="review-val">\${val || '—'}</span>
      </div>\\`
    ).join('');

    /* Sync hidden inputs */
    document.getElementById('h_firstName').value         = v('firstName');
    document.getElementById('h_lastName').value          = v('lastName');
    document.getElementById('h_email').value             = v('email');
    document.getElementById('h_phone').value             = v('phone');
    document.getElementById('h_contactMethod').value     = r('entry.1289776342');
    document.getElementById('h_coupleNames').value       = v('coupleNames');
    document.getElementById('h_eventName').value         = v('eventName');
    document.getElementById('h_venue').value             = v('venue');
    document.getElementById('h_venueAddress').value      = v('venueAddress');
    document.getElementById('h_indoorOutdoor').value     = r('entry.1884292728');
    document.getElementById('h_attendance').value        = v('attendance');
    document.getElementById('h_budget').value            = r('entry.2134853116');
    document.getElementById('h_additionalDetails').value = v('additionalDetails');
  }

  /* ─── SUBMIT ─── */
  function handleSubmit(e) {
    setTimeout(() => {
      document.getElementById('progressBar').style.display = 'none';
      document.querySelectorAll('.slide').forEach(s => {
        s.classList.remove('is-active');
        s.style.display = 'none';
      });
      const s = document.getElementById('successSlide');
      s.classList.add('visible');
      showBg(1); // reset bg to first image on success
    }, 600);
  }

  /* Init */
  showBg(1);
</script>`}} />
      <script dangerouslySetInnerHTML={{__html: `
  /* ─── CONFIG ─── */
  const DUR     = 400; // transition ms
  let current   = 1;
  let animating = false;

  /* ─── BACKGROUND CROSSFADE ─── */
  function showBg(step) {
    document.querySelectorAll('.bg-layer').forEach(el => {
      el.classList.toggle('visible', parseInt(el.dataset.section) === step);
    });
    const label = document.getElementById('bgStepLabel');
    if (label) {
      const labels = ['Policy', 'Contact', 'Event', 'Services', 'Review'];
      label.textContent = labels[step - 1] || '';
    }
  }

  /* ─── SLIDE TRANSITION ─── */
  function goTo(next, dir) {
    if (animating || next === current) return;
    if (next === 5) buildReview();
    animating = true;

    const out = document.getElementById('slide-' + current);
    const inn = document.getElementById('slide-' + next);

    const outTo  = dir === 'forward' ? '-48px' : '48px';
    const inFrom = dir === 'forward' ? '48px'  : '-48px';

    // Immediately block interaction on outgoing
    out.style.pointerEvents = 'none';
    out.style.visibility    = 'visible';
    out.style.zIndex        = '1';

    // Set up incoming off-screen, make it visible for animation
    inn.style.transition    = 'none';
    inn.style.visibility    = 'visible';
    inn.style.opacity       = '0';
    inn.style.transform     = \\`translateX(\${inFrom})\\`;
    inn.style.pointerEvents = 'none';
    inn.style.zIndex        = '2';

    void inn.offsetHeight; // force reflow

    const T = \\`opacity \${DUR}ms cubic-bezier(0.22,1,0.36,1), transform \${DUR}ms cubic-bezier(0.22,1,0.36,1)\\`;

    // Animate outgoing out
    out.style.transition = T;
    out.style.opacity    = '0';
    out.style.transform  = \\`translateX(\${outTo})\\`;

    // Animate incoming in
    inn.style.transition = T;
    inn.style.opacity    = '1';
    inn.style.transform  = 'translateX(0)';

    // Crossfade background image
    showBg(next);

    setTimeout(() => {
      // 1. Add is-active to incoming FIRST so CSS visibility:visible applies
      inn.classList.add('is-active');
      // 2. Then clear inline styles — CSS class now keeps it visible & interactive
      inn.style.cssText = '';

      // 3. Deactivate outgoing and clear its inline styles
      out.classList.remove('is-active');
      out.style.cssText = '';

      // 4. Safety net — ensure every other slide is fully hidden
      document.querySelectorAll('#sectionsWrap .slide').forEach(s => {
        if (s.id !== 'slide-' + next) {
          s.classList.remove('is-active');
          s.style.cssText = '';
        }
      });

      current = next;
      updateProgress(next);
      animating = false;
    }, DUR + 50);
  }

  function tabNav(step) {
    if (step === current) return;
    goTo(step, step > current ? 'forward' : 'back');
  }

  /* ─── PROGRESS ─── */
  function updateProgress(step) {
    document.querySelectorAll('.step-btn').forEach(btn => {
      const s = parseInt(btn.dataset.step);
      btn.classList.toggle('active', s === step);
      btn.classList.toggle('done',   s < step);
    });
  }

  /* ─── HELPERS ─── */
  const v  = id   => (document.getElementById(id) || {}).value || '';
  const r  = name => { const el = document.querySelector(\\`input[name="\${name}"]:checked\\`); return el ? el.value : '—'; };
  const cb = name => { const els = [...document.querySelectorAll(\\`input[name="\${name}"]:checked\\`)]; return els.length ? els.map(e => e.value).join(', ') : '—'; };

  /* ─── REVIEW ─── */
  function buildReview() {
    const rows = [
      ['Name',           \\`\${v('firstName')} \${v('lastName')}\\`],
      ['Email',          v('email')],
      ['Phone',          v('phone')],
      ['Contact Via',    r('entry.1289776342')],
      ['Bride & Groom',  v('coupleNames')],
      ['Event',          v('eventName')],
      ['Date',           v('eventDate')],
      ['Start',          v('startTime')],
      ['End',            v('endTime')],
      ['Venue',          v('venue')],
      ['Address',        v('venueAddress')],
      ['Setting',        r('entry.1884292728')],
      ['Attendance',     v('attendance')],
      ['Services',       cb('entry.2010812548')],
      ['Budget',         r('entry.2134853116')],
      ['Notes',          v('additionalDetails') || '—'],
    ];

    document.getElementById('reviewList').innerHTML = rows.map(([k, val]) =>
      \\`<div class="review-row">
        <span class="review-key">\${k}</span>
        <span class="review-val">\${val || '—'}</span>
      </div>\\`
    ).join('');

    /* Sync hidden inputs */
    document.getElementById('h_firstName').value         = v('firstName');
    document.getElementById('h_lastName').value          = v('lastName');
    document.getElementById('h_email').value             = v('email');
    document.getElementById('h_phone').value             = v('phone');
    document.getElementById('h_contactMethod').value     = r('entry.1289776342');
    document.getElementById('h_coupleNames').value       = v('coupleNames');
    document.getElementById('h_eventName').value         = v('eventName');
    document.getElementById('h_venue').value             = v('venue');
    document.getElementById('h_venueAddress').value      = v('venueAddress');
    document.getElementById('h_indoorOutdoor').value     = r('entry.1884292728');
    document.getElementById('h_attendance').value        = v('attendance');
    document.getElementById('h_budget').value            = r('entry.2134853116');
    document.getElementById('h_additionalDetails').value = v('additionalDetails');
  }

  /* ─── SUBMIT ─── */
  function handleSubmit(e) {
    setTimeout(() => {
      document.getElementById('progressBar').style.display = 'none';
      document.querySelectorAll('.slide').forEach(s => {
        s.classList.remove('is-active');
        s.style.display = 'none';
      });
      const s = document.getElementById('successSlide');
      s.classList.add('visible');
      showBg(1); // reset bg to first image on success
    }, 600);
  }

  /* Init */
  showBg(1);
`}} />
    </>
  )
}
