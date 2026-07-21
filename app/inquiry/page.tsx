'use client'
import { useEffect } from 'react'

export default function InquiryPage() {
  useEffect(() => {
    // Load Adobe Fonts if not already present
    if (!document.getElementById('adobe-fonts')) {
      const link = document.createElement('link')
      link.id = 'adobe-fonts'
      link.rel = 'stylesheet'
      link.href = 'https://use.typekit.net/qmr3yfz.css'
      document.head.appendChild(link)
    }

    const style = document.createElement('style')
    style.id = 'inquiry-styles'
    style.textContent = STYLES
    document.head.appendChild(style)

    const script = document.createElement('script')
    script.id = 'inquiry-script'
    script.textContent = SCRIPT
    document.body.appendChild(script)

    return () => {
      document.getElementById('inquiry-styles')?.remove()
      document.getElementById('inquiry-script')?.remove()
    }
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: '#0D1B2A' }}>
      <div style={{ background: '#07111A', borderBottom: '1px solid rgba(79,185,175,0.15)', padding: '0 24px', height: 44, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, zIndex: 1000 }}>
        <button
          onClick={() => { try { (window as any).saveProgress?.() } catch(e) {} window.location.href = '/' }}
          style={{ fontSize: 11, color: 'rgba(232,224,213,0.4)', background: 'none', border: '1px solid rgba(232,224,213,0.2)', borderRadius: 6, padding: '5px 12px', cursor: 'pointer', letterSpacing: '1px', textTransform: 'uppercase', fontFamily: "'futura-pt-condensed', 'Barlow Condensed', sans-serif" }}
        >
          ← Save &amp; Exit
        </button>
      </div>
      <div style={{ flex: 1, overflow: 'hidden' }} dangerouslySetInnerHTML={{ __html: BODY }} />
    </div>
  )
}

const STYLES = `
  :root {
    --navy: #07111A; --cream: #F5EFE0; --cream-dark: #EAE0CC; --cream-mid: #DDD3BC;
    --red: #C8202A; --red-dark: #A01822; --blue: #44BEC7; --blue-dark: #37A8B0;
    --text-dark: #1A2D3F; --text-mid: #4A5E6E; --text-light: #8A9EAA;
    --font: 'inter', system-ui, sans-serif;
    --ease: cubic-bezier(0.22, 1, 0.36, 1); --panel-w: 480px;
  }
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  #inquiry-root { font-family: var(--font); font-size: 15px; background: var(--navy); color: var(--text-dark); display: flex; height: calc(100vh - 44px); overflow: hidden; }
  .bg-stage { position: relative; flex: 1; overflow: hidden; }
  .bg-layer { position: absolute; inset: 0; background-size: cover; background-position: center; opacity: 0; transition: opacity 1.1s var(--ease); animation: kenburns 18s ease-in-out infinite alternate; }
  .bg-layer.visible { opacity: 1; }
  @keyframes kenburns { from { transform: scale(1.00) translate(0,0); } to { transform: scale(1.07) translate(-1%,1%); } }
  .bg-layer[data-section="1"] { background-image: url('https://inquiries.pescaderomusic.com/images/bg1.jpg'); background-position: center 30%; }
  .bg-layer[data-section="2"] { background-image: url('https://inquiries.pescaderomusic.com/images/bg2.jpg'); background-position: center 25%; }
  .bg-layer[data-section="3"] { background-image: url('https://inquiries.pescaderomusic.com/images/bg3.jpg'); background-position: center 20%; }
  .bg-layer[data-section="4"] { background-image: url('https://inquiries.pescaderomusic.com/images/bg4.jpg'); background-position: center 35%; }
  .bg-layer[data-section="5"] { background-image: url('https://inquiries.pescaderomusic.com/images/bg5.jpg'); background-position: center 25%; }
  .bg-stage::after { content: ''; position: absolute; inset: 0; background: linear-gradient(to right, transparent 55%, rgba(13,27,42,0.55) 100%); pointer-events: none; }
  .form-panel { width: var(--panel-w); flex-shrink: 0; background: var(--cream); display: flex; flex-direction: column; overflow: clip; position: relative; box-shadow: -12px 0 48px rgba(13,27,42,0.25); }
  .panel-header { flex-shrink: 0; background: var(--navy); padding: 0 24px; height: 62px; display: flex; align-items: center; justify-content: space-between; gap: 16px; border-bottom: 3px solid var(--red); }
  .panel-header-logo { width: 40px; height: 40px; border-radius: 50%; overflow: hidden; flex-shrink: 0; box-shadow: 0 0 0 2px rgba(68,190,199,0.4); }
  .panel-header-logo img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .panel-header-title { display: flex; flex-direction: column; align-items: flex-end; gap: 1px; }
  .panel-header-sub { font-size: 0.62rem; font-weight: 500; letter-spacing: 0.16em; text-transform: uppercase; color: var(--blue); line-height: 1; font-family: 'futura-pt-condensed', 'Barlow Condensed', sans-serif; }
  .panel-header-main { font-size: 0.9rem; font-weight: 400; color: var(--cream); line-height: 1; font-family: 'freight-display-pro', Georgia, serif; }
  .progress-bar { flex-shrink: 0; background: #fff; border-bottom: 1px solid var(--cream-mid); padding: 0 28px; display: flex; }
  .step-btn { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 12px 4px 10px; background: none; border: none; cursor: pointer; position: relative; -webkit-tap-highlight-color: transparent; transition: background 0.15s; }
  .step-btn:hover { background: rgba(13,27,42,0.03); }
  .step-btn::after { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 2.5px; background: transparent; transition: background 0.35s var(--ease); }
  .step-btn.active::after { background: var(--red); }
  .step-btn.done::after { background: var(--blue); }
  .step-dot { width: 24px; height: 24px; border-radius: 50%; background: var(--cream-mid); color: var(--text-light); font-size: 0.68rem; font-weight: 700; display: flex; align-items: center; justify-content: center; transition: all 0.35s var(--ease); }
  .step-btn.active .step-dot { background: var(--red); color: #fff; box-shadow: 0 2px 8px rgba(200,32,42,0.4); transform: scale(1.1); }
  .step-btn.done .step-dot { background: var(--blue); color: #fff; }
  .step-name { font-size: 0.58rem; font-weight: 500; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-light); transition: color 0.2s; font-family: 'futura-pt-condensed', 'Barlow Condensed', sans-serif; }
  .step-btn.active .step-name { color: var(--red); }
  .step-btn.done .step-name { color: var(--blue-dark); }
  .sections-wrap { flex: 1; position: relative; overflow: clip; }
  .slide { position: absolute; inset: 0; padding: 32px 28px 24px; display: flex; flex-direction: column; gap: 0; opacity: 0; pointer-events: none; visibility: hidden; overflow-y: auto; overscroll-behavior: contain; scrollbar-width: none; }
  .slide::-webkit-scrollbar { display: none; }
  .slide.is-active { opacity: 1; pointer-events: auto; visibility: visible; }
  .slide-head { margin-bottom: 22px; flex-shrink: 0; }
  .slide-eyebrow { font-size: 0.65rem; font-weight: 500; letter-spacing: 0.16em; text-transform: uppercase; color: var(--blue-dark); margin-bottom: 5px; font-family: 'futura-pt-condensed', 'Barlow Condensed', sans-serif; }
  .slide-title { font-size: 1.45rem; font-weight: 700; color: var(--navy); line-height: 1.15; letter-spacing: -0.2px; font-family: 'freight-display-pro', Georgia, serif; }
  .slide-sub { font-size: 0.82rem; color: var(--text-light); margin-top: 5px; font-weight: 400; line-height: 1.5; }
  .fields { flex: 1; display: flex; flex-direction: column; gap: 14px; }
  .field-group { display: flex; flex-direction: column; gap: 6px; }
  .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .field-label { font-size: 0.68rem; font-weight: 500; letter-spacing: 0.12em; text-transform: uppercase; color: var(--text-mid); font-family: 'futura-pt-condensed', 'Barlow Condensed', sans-serif; }
  .field-label .req { color: var(--red); margin-left: 1px; }
  input[type="text"], input[type="email"], input[type="tel"], input[type="date"], input[type="time"], select, textarea { width: 100%; background: #fff; border: 1.5px solid var(--cream-mid); border-radius: 8px; color: var(--text-dark); font-family: var(--font); font-size: 0.88rem; font-weight: 500; padding: 10px 13px; outline: none; -webkit-appearance: none; transition: border-color 0.2s, box-shadow 0.2s; }
  input::placeholder, textarea::placeholder { color: var(--text-light); font-weight: 400; }
  input:focus, select:focus, textarea:focus { border-color: var(--blue); box-shadow: 0 0 0 3px rgba(68,190,199,0.13); }
  input.error, select.error, textarea.error { border-color: var(--red); box-shadow: 0 0 0 3px rgba(200,32,42,0.1); }
  textarea { resize: none; min-height: 88px; line-height: 1.55; }
  .choice-group { display: flex; flex-direction: column; gap: 7px; }
  .choice-group.inline { flex-direction: row; flex-wrap: wrap; gap: 7px; }
  .choice-item { display: flex; align-items: center; gap: 9px; padding: 9px 13px; background: #fff; border: 1.5px solid var(--cream-mid); border-radius: 8px; cursor: pointer; font-size: 0.86rem; font-weight: 500; color: var(--text-mid); user-select: none; transition: border-color 0.18s, background 0.18s, color 0.18s; -webkit-tap-highlight-color: transparent; }
  .choice-item:hover { border-color: var(--blue); background: rgba(68,190,199,0.04); color: var(--text-dark); }
  .choice-item:has(input:checked) { border-color: var(--blue); background: rgba(68,190,199,0.09); color: var(--navy); font-weight: 600; }
  .choice-item input[type="radio"], .choice-item input[type="checkbox"] { width: 16px; height: 16px; min-width: 16px; accent-color: var(--blue); cursor: pointer; }
  .choice-group.error .choice-item { border-color: rgba(200,32,42,0.4); }
  .form-error { background: rgba(200,32,42,0.08); border: 1px solid rgba(200,32,42,0.25); border-radius: 8px; padding: 10px 14px; font-size: 0.78rem; color: var(--red); margin-bottom: 4px; flex-shrink: 0; display: none; }
  .form-error.visible { display: block; }
  .review-list { display: flex; flex-direction: column; gap: 0; flex: 1; }
  .review-row { display: flex; gap: 12px; padding: 9px 0; border-bottom: 1px solid var(--cream-dark); font-size: 0.84rem; }
  .review-key { min-width: 120px; flex-shrink: 0; font-size: 0.67rem; font-weight: 500; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-light); padding-top: 2px; font-family: 'futura-pt-condensed', 'Barlow Condensed', sans-serif; }
  .review-val { color: var(--text-dark); font-weight: 500; }
  .slide-footer { flex-shrink: 0; padding-top: 18px; display: flex; align-items: center; justify-content: flex-end; gap: 10px; }
  .btn { font-family: 'futura-pt-condensed', 'Barlow Condensed', sans-serif; font-size: 0.82rem; font-weight: 500; letter-spacing: 0.12em; text-transform: uppercase; padding: 11px 24px; border: none; border-radius: 8px; cursor: pointer; -webkit-tap-highlight-color: transparent; transition: all 0.2s var(--ease); }
  .btn-back { background: transparent; color: var(--text-light); border: 1.5px solid var(--cream-mid); }
  .btn-back:hover { border-color: var(--text-light); color: var(--text-dark); }
  .btn-next { background: var(--red); color: #fff; box-shadow: 0 4px 14px rgba(200,32,42,0.32); padding: 11px 30px; }
  .btn-next:hover { background: var(--red-dark); transform: translateY(-1px); box-shadow: 0 7px 20px rgba(200,32,42,0.38); }
  .btn-submit { background: var(--red); color: #fff; padding: 12px 36px; font-size: 0.84rem; box-shadow: 0 4px 16px rgba(200,32,42,0.32); }
  .btn-submit:hover { background: var(--red-dark); transform: translateY(-1px); }
  .slide-footer-split { justify-content: space-between; }
  .success-slide { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px 28px; text-align: center; opacity: 0; pointer-events: none; visibility: hidden; transform: translateY(20px); transition: opacity 0.55s var(--ease), transform 0.55s var(--ease), visibility 0s 0.55s; }
  .success-slide.visible { opacity: 1; pointer-events: auto; visibility: visible; transform: translateY(0); transition: opacity 0.55s var(--ease), transform 0.55s var(--ease), visibility 0s 0s; }
  .success-ring { width: 72px; height: 72px; border-radius: 50%; background: linear-gradient(135deg, var(--blue), var(--blue-dark)); display: flex; align-items: center; justify-content: center; margin-bottom: 22px; box-shadow: 0 8px 30px rgba(68,190,199,0.35); animation: popIn 0.5s var(--ease) both; }
  @keyframes popIn { from { transform: scale(0); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  .success-slide h2 { font-size: 1.5rem; font-weight: 300; color: var(--navy); margin-bottom: 10px; font-family: 'freight-display-pro', Georgia, serif; }
  .success-slide p { font-size: 0.85rem; color: var(--text-mid); line-height: 1.65; max-width: 320px; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
  @media (max-width: 700px) {
    #inquiry-root { flex-direction: column !important; }
    .bg-stage { height: 30vh; min-height: 160px; flex: none; width: 100%; }
    .bg-stage::after { background: linear-gradient(to bottom, transparent 40%, rgba(13,27,42,0.6) 100%); }
    .form-panel { width: 100%; flex: 1; box-shadow: none; min-height: 0; }
    .panel-header { height: 52px; padding: 0 16px; }
    .panel-header-logo { width: 32px; height: 32px; }
    .sections-wrap { overflow-y: auto; -webkit-overflow-scrolling: touch; }
    .slide { position: relative; opacity: 1; pointer-events: auto; transform: none !important; padding: 20px 16px 16px; }
    .slide:not(.is-active) { display: none; }
    .field-row { grid-template-columns: 1fr !important; }
    .slide-footer { flex-direction: row; padding-top: 14px; }
    .btn { padding: 10px 18px; font-size: 0.78rem; }
    .btn-next { padding: 10px 20px; }
    .btn-submit { padding: 11px 24px; }
    .slide-title { font-size: 1.2rem; }
    :root { --panel-w: 100%; }
  }
`

const BODY = `<div id="inquiry-root">
<div class="bg-stage" id="bgStage">
  <div class="bg-layer visible" data-section="1"></div>
  <div class="bg-layer" data-section="2"></div>
  <div class="bg-layer" data-section="3"></div>
  <div class="bg-layer" data-section="4"></div>
  <div class="bg-layer" data-section="5"></div>
</div>

<div class="form-panel">
  <div class="panel-header">
    <div class="panel-header-logo"><img src="https://shxcw5yjydy1kgql.public.blob.vercel-storage.com/logo.png" alt="Pescadero Music" /></div>
    <div class="panel-header-title">
      <span class="panel-header-sub">Pescadero Music</span>
      <span class="panel-header-main" id="headerTitle">Sound Inquiry</span>
    </div>
  </div>

  <div class="progress-bar" id="progressBar">
    <button class="step-btn active" data-step="1" onclick="tabNav(1)"><div class="step-dot">1</div><div class="step-name">Check Date</div></button>
    <button class="step-btn" data-step="2" onclick="tabNav(2)"><div class="step-dot">2</div><div class="step-name">Contact</div></button>
    <button class="step-btn" data-step="3" onclick="tabNav(3)"><div class="step-dot">3</div><div class="step-name">Event</div></button>
    <button class="step-btn" data-step="4" onclick="tabNav(4)"><div class="step-dot">4</div><div class="step-name">Details</div></button>
    <button class="step-btn" data-step="5" onclick="tabNav(5)"><div class="step-dot">5</div><div class="step-name">Review</div></button>
  </div>

  <div class="sections-wrap" id="sectionsWrap">

    <!-- SLIDE 1: CHECK AVAILABILITY -->
    <div class="slide is-active" id="slide-1">
      <div class="slide-head">
        <div class="slide-eyebrow">Welcome to Pescadero Music</div>
        <div class="slide-title" id="slide1Title">Check Availability</div>
        <div class="slide-sub">Pick your event type and date to get started. Takes about 3 minutes.</div>
      </div>
      <div id="error-1" class="form-error"></div>
      <div class="fields" style="gap:14px;">
        <div class="field-group">
          <div class="field-label">What kind of event? <span class="req">*</span></div>
          <div style="display:flex;flex-direction:column;gap:8px;margin-top:4px;" id="typeGroup">
            <label class="choice-item"><input type="radio" name="inquiryType" value="wedding" onchange="selectType('wedding')" /> \ud83d\udc8d Wedding</label>
            <label class="choice-item"><input type="radio" name="inquiryType" value="event" onchange="selectType('event')" /> \ud83c\udfb6 DJ / Party / Event</label>
            <label class="choice-item"><input type="radio" name="inquiryType" value="movie" onchange="selectType('movie')" /> \ud83c\udfac Outdoor Movie Night</label>
          </div>
        </div>
        <div class="field-group">
          <div class="field-label">Event Date <span class="req">*</span></div>
          <input type="date" id="checkDate" onchange="checkDateAvailability(this.value)" />
        </div>
        <div id="dateStatusBox" style="display:none;"></div>
        <div style="background:rgba(68,190,199,0.06);border:1px solid rgba(68,190,199,0.18);border-radius:8px;padding:12px 15px;font-size:0.78rem;color:#4A5E6E;line-height:1.55;" id="slide1Notice">\ud83d\udd12 Your information is only shared with Garrett \u2014 never sold or shared with third parties.</div>
      </div>
      <div class="slide-footer">
        <a href="/policy" target="_blank" style="font-size:0.72rem;color:#37A8B0;text-decoration:none;letter-spacing:0.1em;text-transform:uppercase;font-family:'futura-pt-condensed','Barlow Condensed',sans-serif;">View Service Policy</a>
        <button class="btn btn-next" onclick="prefillFromSlide1(); goTo(2,'forward')">Continue \u2192</button>
      </div>
    </div>

    <!-- SLIDE 2: CONTACT -->
    <div class="slide" id="slide-2">
      <div class="slide-head">
        <div class="slide-eyebrow">Step 1 of 4</div>
        <div class="slide-title">Contact Information</div>
        <div class="slide-sub">Tell us how to reach you.</div>
      </div>
      <div id="error-2" class="form-error"></div>
      <div class="fields">
        <div class="field-row">
          <div class="field-group"><div class="field-label">First Name <span class="req">*</span></div><input type="text" id="firstName" placeholder="First" /></div>
          <div class="field-group"><div class="field-label">Last Name <span class="req">*</span></div><input type="text" id="lastName" placeholder="Last" /></div>
        </div>
        <div class="field-group"><div class="field-label">Email Address <span class="req">*</span></div><input type="email" id="email" placeholder="you@example.com" /></div>
        <div class="field-group"><div class="field-label">Phone Number <span class="req">*</span></div><input type="tel" id="phone" placeholder="(801) 555-5555" /></div>
        <div class="field-group">
          <div class="field-label">Preferred Contact Method <span class="req">*</span></div>
          <div class="choice-group inline" id="contactGroup">
            <label class="choice-item"><input type="radio" name="entry.1289776342" value="Call" /> Call</label>
            <label class="choice-item"><input type="radio" name="entry.1289776342" value="Email" /> Email</label>
            <label class="choice-item"><input type="radio" name="entry.1289776342" value="Text" /> Text</label>
          </div>
        </div>
        <!-- Wedding only: couple names -->
        <div class="field-group" id="coupleNamesGroup">
          <div class="field-label">Name of Bride &amp; Groom <span class="req">*</span></div>
          <input type="text" id="coupleNames" placeholder="e.g. Emily &amp; James" />
        </div>
        <!-- How did you hear about us -->
        <div class="field-group">
          <div class="field-label">How did you hear about us? <span class="req">*</span></div>
          <div style="display:flex;flex-direction:column;gap:8px;margin-top:4px;">
            <label style="display:flex;align-items:center;gap:10px;cursor:pointer;font-size:0.88rem;color:#1A2D3F;padding:8px 12px;border-radius:8px;border:1.5px solid #DDD3BC;background:#fff;"><input type="radio" name="hearAbout" value="Google / Internet Search" style="accent-color:#C8202A;" onchange="toggleReferralFields(this.value)"> Google / Internet Search</label>
            <label style="display:flex;align-items:center;gap:10px;cursor:pointer;font-size:0.88rem;color:#1A2D3F;padding:8px 12px;border-radius:8px;border:1.5px solid #DDD3BC;background:#fff;"><input type="radio" name="hearAbout" value="Instagram" style="accent-color:#C8202A;" onchange="toggleReferralFields(this.value)"> Instagram</label>
            <label style="display:flex;align-items:center;gap:10px;cursor:pointer;font-size:0.88rem;color:#1A2D3F;padding:8px 12px;border-radius:8px;border:1.5px solid #DDD3BC;background:#fff;"><input type="radio" name="hearAbout" value="TikTok" style="accent-color:#C8202A;" onchange="toggleReferralFields(this.value)"> TikTok</label>
            <label style="display:flex;align-items:center;gap:10px;cursor:pointer;font-size:0.88rem;color:#1A2D3F;padding:8px 12px;border-radius:8px;border:1.5px solid #DDD3BC;background:#fff;"><input type="radio" name="hearAbout" value="Facebook" style="accent-color:#C8202A;" onchange="toggleReferralFields(this.value)"> Facebook</label>
            <label style="display:flex;align-items:center;gap:10px;cursor:pointer;font-size:0.88rem;color:#1A2D3F;padding:8px 12px;border-radius:8px;border:1.5px solid #DDD3BC;background:#fff;"><input type="radio" name="hearAbout" value="Word of Mouth" style="accent-color:#C8202A;" onchange="toggleReferralFields(this.value)"> Word of Mouth</label>
            <label style="display:flex;align-items:center;gap:10px;cursor:pointer;font-size:0.88rem;color:#1A2D3F;padding:8px 12px;border-radius:8px;border:1.5px solid #DDD3BC;background:#fff;"><input type="radio" name="hearAbout" value="Friend of Garrett's" style="accent-color:#C8202A;" onchange="toggleReferralFields(this.value)"> Friend of Garrett's</label>
            <label style="display:flex;align-items:center;gap:10px;cursor:pointer;font-size:0.88rem;color:#1A2D3F;padding:8px 12px;border-radius:8px;border:1.5px solid #DDD3BC;background:#fff;" id="vendorReferralLabel"><input type="radio" name="hearAbout" value="Another Vendor / Referral" style="accent-color:#C8202A;" onchange="toggleReferralFields(this.value)"> Another Vendor / Referral</label>
            <label style="display:flex;align-items:center;gap:10px;cursor:pointer;font-size:0.88rem;color:#1A2D3F;padding:8px 12px;border-radius:8px;border:1.5px solid #DDD3BC;background:#fff;"><input type="radio" name="hearAbout" value="Wedding Wire / The Knot" style="accent-color:#C8202A;" onchange="toggleReferralFields(this.value)"> Wedding Wire / The Knot</label>
            <label style="display:flex;align-items:center;gap:10px;cursor:pointer;font-size:0.88rem;color:#1A2D3F;padding:8px 12px;border-radius:8px;border:1.5px solid #DDD3BC;background:#fff;"><input type="radio" name="hearAbout" value="Other" style="accent-color:#C8202A;" onchange="toggleReferralFields(this.value)"> Other</label>
          </div>
          <div id="vendorNameGroup" style="display:none;margin-top:10px;">
            <div class="field-label" style="margin-bottom:6px;">Vendor Type</div>
            <select id="vendorType" style="width:100%;padding:11px 14px;border-radius:8px;border:1.5px solid #DDD3BC;font-size:0.9rem;color:#1A2D3F;outline:none;font-family:inherit;background:#fff;margin-bottom:10px;">
              <option value="">Select vendor type...</option>
              <option value="Photographer">Photographer</option>
              <option value="Videographer">Videographer</option>
              <option value="Florist">Florist</option>
              <option value="Venue">Venue</option>
              <option value="Wedding Planner / Coordinator">Wedding Planner / Coordinator</option>
              <option value="Caterer">Caterer</option>
              <option value="Hair & Makeup">Hair &amp; Makeup</option>
              <option value="DJ / Entertainment">DJ / Entertainment</option>
              <option value="Other">Other</option>
            </select>
            <div class="field-label" style="margin-bottom:6px;">Vendor / Referral Name</div>
            <input type="text" id="vendorName" placeholder="e.g. Sarah Johnson Photography" style="width:100%;padding:11px 14px;border-radius:8px;border:1.5px solid #DDD3BC;font-size:0.9rem;color:#1A2D3F;outline:none;font-family:inherit;" />
          </div>
          <div id="otherHearGroup" style="display:none;margin-top:10px;">
            <div class="field-label" style="margin-bottom:6px;">Tell us more</div>
            <input type="text" id="otherHear" placeholder="How did you find us?" style="width:100%;padding:11px 14px;border-radius:8px;border:1.5px solid #DDD3BC;font-size:0.9rem;color:#1A2D3F;outline:none;font-family:inherit;" />
          </div>
        </div>
      </div>
      <div class="slide-footer slide-footer-split">
        <button class="btn btn-back" onclick="goTo(1,'back')">\u2190 Back</button>
        <button class="btn btn-next" onclick="goTo(3,'forward')">Next \u2192</button>
      </div>
    </div>

    <!-- SLIDE 3: EVENT DETAILS -->
    <div class="slide" id="slide-3">
      <div class="slide-head">
        <div class="slide-eyebrow">Step 2 of 4</div>
        <div class="slide-title">Event Details</div>
        <div class="slide-sub" id="slide3Sub">Tell us about your event.</div>
      </div>
      <div id="error-3" class="form-error"></div>
      <div class="fields">
        <div class="field-group"><div class="field-label">Event Name <span class="req">*</span></div><input type="text" id="eventName" placeholder="e.g. Smith Wedding Reception" /></div>

        <!-- Wedding: event type checkboxes -->
        <div class="field-group" id="weddingTypesGroup">
          <div class="field-label">What parts need coverage? <span style="font-size:11px;color:#8A9EAA;font-weight:400;">(select all that apply)</span></div>
          <div class="choice-group" style="display:flex;flex-wrap:wrap;gap:8px;margin-top:6px;">
            <label class="choice-item"><input type="checkbox" name="eventType" value="Ceremony" /> Ceremony</label>
            <label class="choice-item"><input type="checkbox" name="eventType" value="Cocktail Hour" /> Cocktail Hour</label>
            <label class="choice-item"><input type="checkbox" name="eventType" value="Reception" /> Reception</label>
            <label class="choice-item"><input type="checkbox" name="eventType" value="Dinner" /> Dinner</label>
            <label class="choice-item"><input type="checkbox" name="eventType" value="Dancing" /> Dancing</label>
          </div>
        </div>

        <!-- Event: second date, for multi-night bookings -->
        <div class="field-group" id="secondDateGroup" style="display:none;">
          <div class="field-label">Second Date <span style="font-size:11px;color:#8A9EAA;font-weight:400;">(only if this is a multi-night booking)</span></div>
          <input type="date" id="secondDate" />
        </div>

        <!-- Movie: location type -->
        <div class="field-group" id="movieLocationGroup" style="display:none;">
          <div class="field-label">Location Type <span class="req">*</span></div>
          <div class="choice-group inline">
            <label class="choice-item"><input type="radio" name="movieLocation" value="Private Backyard" /> Private Backyard</label>
            <label class="choice-item"><input type="radio" name="movieLocation" value="HOA / Neighborhood" /> HOA / Neighborhood</label>
            <label class="choice-item"><input type="radio" name="movieLocation" value="Private Venue" /> Private Venue</label>
            <label class="choice-item"><input type="radio" name="movieLocation" value="Other" /> Other</label>
          </div>
        </div>

        <div class="field-group"><div class="field-label">Event Date <span class="req">*</span></div><input type="date" id="eventDate" /></div>
        <div class="field-row">
          <div class="field-group"><div class="field-label">Start Time <span class="req">*</span></div><input type="time" id="startTime" /></div>
          <div class="field-group"><div class="field-label" id="endTimeLabel">End Time <span class="req">*</span></div><input type="time" id="endTime" /></div>
        </div>
        <div class="field-group"><div class="field-label" id="venueLabel">Venue / Location Name <span class="req">*</span></div><input type="text" id="venue" placeholder="Venue or location name" /></div>
        <div class="field-group"><div class="field-label">Address <span class="req">*</span></div><input type="text" id="venueAddress" placeholder="Street, City, State, ZIP" /></div>
        <div class="field-group">
          <div class="field-label">Indoor or Outdoor? <span class="req">*</span></div>
          <div class="choice-group inline" id="settingGroup">
            <label class="choice-item"><input type="radio" name="entry.1884292728" value="Indoor" /> Indoor</label>
            <label class="choice-item"><input type="radio" name="entry.1884292728" value="Outdoor" /> Outdoor</label>
            <label class="choice-item"><input type="radio" name="entry.1884292728" value="Both" /> Both</label>
          </div>
        </div>
        <div class="field-group"><div class="field-label">Estimated Attendance <span class="req">*</span></div><input type="text" id="attendance" placeholder="e.g. 50" /></div>
      </div>
      <div class="slide-footer slide-footer-split">
        <button class="btn btn-back" onclick="goTo(2,'back')">\u2190 Back</button>
        <button class="btn btn-next" onclick="goTo(4,'forward')">Next \u2192</button>
      </div>
    </div>

    <!-- SLIDE 4: SERVICE DETAILS (type-specific) -->
    <div class="slide" id="slide-4">
      <div class="slide-head">
        <div class="slide-eyebrow">Step 3 of 4</div>
        <div class="slide-title" id="slide4Title">What\u2019s Included</div>
        <div class="slide-sub" id="slide4Sub">Review your package and add any notes.</div>
      </div>
      <div id="error-4" class="form-error"></div>
      <div class="fields" style="gap:12px;" id="slide4Content">
        <!-- Populated by JS based on event type -->
      </div>
      <div class="slide-footer slide-footer-split">
        <button class="btn btn-back" onclick="goTo(3,'back')">\u2190 Back</button>
        <button class="btn btn-next" onclick="goTo(5,'forward')">Review \u2192</button>
      </div>
    </div>

    <!-- SLIDE 5: REVIEW -->
    <div class="slide" id="slide-5">
      <div class="slide-head">
        <div class="slide-eyebrow">Step 4 of 4</div>
        <div class="slide-title">Review &amp; Submit</div>
        <div class="slide-sub">Confirm everything looks correct.</div>
      </div>
      <div class="review-list" id="reviewList"></div>
      <div id="gform">
        <div class="slide-footer slide-footer-split">
          <button type="button" class="btn btn-back" onclick="goTo(4,'back')">&#x2190; Edit</button>
          <button type="button" class="btn btn-submit" onclick="handleSubmit(event)">Submit Inquiry &#x2192;</button>
        </div>
      </div>
    </div>

    <!-- SUCCESS -->
    <div class="success-slide" id="successSlide">
      <div class="success-ring">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
      </div>
      <h2>Inquiry Received!</h2>
      <p style="margin:0 0 8px;">Garrett will reach out within <strong>24\u201348 hours</strong> to follow up.</p>
      <p style="font-size:13px;color:#888;margin:0 0 20px;">Questions? <a href="mailto:garrett@pescaderomusic.com" style="color:#44BEC7;">garrett@pescaderomusic.com</a></p>
      <a href="/" style="display:inline-block;padding:12px 28px;background:#C8202A;color:#fff;text-decoration:none;border-radius:8px;font-weight:700;font-size:14px;">Back to Home \u2192</a>
    </div>

  </div>
</div>
</div>`

const SCRIPT = `
  const DUR = 400;
  let current = 1, animating = false;

  // ── Detect event type from URL ─────────────────────────────────────────────
  var urlParams = new URLSearchParams(window.location.search);
  var EVENT_TYPE = (urlParams.get('type') || 'wedding').toLowerCase();
  // Normalize
  if (EVENT_TYPE !== 'event' && EVENT_TYPE !== 'movie') EVENT_TYPE = 'wedding';

  // ── Apply type-specific UI (callable again when user picks a type on Slide 1) ──
  function applyEventType() {
    var titles = {
      wedding: 'Wedding Sound Inquiry',
      event:   'DJ & Event Inquiry',
      movie:   'Outdoor Movie Night Inquiry',
    };
    var slide3Subs = {
      wedding: 'Tell us about your wedding day.',
      event:   'Tell us about your event.',
      movie:   'Tell us about your screening.',
    };

    // Header title
    var ht = document.getElementById('headerTitle');
    if (ht) ht.textContent = titles[EVENT_TYPE];

    // Slide 3 sub
    var s3sub = document.getElementById('slide3Sub');
    if (s3sub) s3sub.textContent = slide3Subs[EVENT_TYPE];

    // Couple names — wedding only
    var cnGroup = document.getElementById('coupleNamesGroup');
    if (cnGroup) cnGroup.style.display = EVENT_TYPE === 'wedding' ? '' : 'none';

    // Wedding event type checkboxes — wedding only
    var wtGroup = document.getElementById('weddingTypesGroup');
    if (wtGroup) wtGroup.style.display = EVENT_TYPE === 'wedding' ? '' : 'none';

    // Movie location type — movie only
    var mlGroup = document.getElementById('movieLocationGroup');
    if (mlGroup) mlGroup.style.display = EVENT_TYPE === 'movie' ? '' : 'none';

    // Second date (multi-night bookings) — event only
    var sdGroup = document.getElementById('secondDateGroup');
    if (sdGroup) sdGroup.style.display = EVENT_TYPE === 'event' ? '' : 'none';

    // Event name placeholder
    var enPlaceholders = { wedding: 'e.g. Smith Wedding Reception', event: 'e.g. Johnson House Party / Grand Opening', movie: 'e.g. Martinez Backyard Movie Night' };
    var enEl = document.getElementById('eventName');
    if (enEl) enEl.placeholder = enPlaceholders[EVENT_TYPE] || enPlaceholders.wedding;

    // Venue label tweak for movie
    var vl = document.getElementById('venueLabel');
    if (vl && EVENT_TYPE === 'movie') vl.innerHTML = 'Location / Host Name <span style="color:#C8202A;">*</span>';

    // Slide 4 content
    buildSlide4();
  }
  applyEventType();

  function buildSlide4() {
    var container = document.getElementById('slide4Content');
    if (!container) return;

    if (EVENT_TYPE === 'wedding') {
      document.getElementById('slide4Title').textContent = 'Choose Your Package';
      document.getElementById('slide4Sub').textContent = 'Select the tier that fits your wedding.';
      container.innerHTML = \`
        <div style="display:flex;flex-direction:column;gap:10px;">
          <label style="display:flex;gap:14px;align-items:flex-start;background:#fff;border:2px solid #DDD3BC;border-radius:10px;padding:16px;cursor:pointer;transition:border-color 0.2s;" id="pkg-dance-label">
            <input type="radio" name="weddingPackage" value="Dance DJ - $600" style="margin-top:3px;accent-color:#C8202A;flex-shrink:0;" onchange="highlightPackage()" />
            <div>
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
                <span style="font-size:0.95rem;font-weight:700;color:#0D1B2A;">Dance DJ</span>
                <span style="font-size:1.1rem;font-weight:700;color:#C8202A;">$600</span>
              </div>
              <div style="font-size:0.8rem;color:#4A5E6E;line-height:1.55;">One sound system. Up to 4 hours of DJ service \u2014 reception, party, or grand opening. Travel fees additional.</div>
              <div style="margin-top:8px;display:flex;flex-direction:column;gap:4px;">
                <div style="font-size:0.78rem;color:#37A8B0;">\u2713 Up to 4 hours</div>
                <div style="font-size:0.78rem;color:#37A8B0;">\u2713 One pro sound system</div>
                <div style="font-size:0.78rem;color:#37A8B0;">\u2713 DJ-curated or custom playlist</div>
                <div style="font-size:0.78rem;color:#37A8B0;">\u2713 Wired MC mic</div>
              </div>
            </div>
          </label>
          <label style="display:flex;gap:14px;align-items:flex-start;background:#fff;border:2px solid #DDD3BC;border-radius:10px;padding:16px;cursor:pointer;transition:border-color 0.2s;" id="pkg-full-label">
            <input type="radio" name="weddingPackage" value="Full-Service Sound - $850" style="margin-top:3px;accent-color:#C8202A;flex-shrink:0;" onchange="highlightPackage()" />
            <div style="width:100%;">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
                <div style="display:flex;align-items:center;gap:8px;">
                  <span style="font-size:0.95rem;font-weight:700;color:#0D1B2A;">Full-Service Sound</span>
                  <span style="background:#C8202A;color:#fff;font-size:0.6rem;font-weight:700;letter-spacing:0.1em;padding:2px 7px;border-radius:20px;text-transform:uppercase;">Popular</span>
                </div>
                <span style="font-size:1.1rem;font-weight:700;color:#C8202A;">$850</span>
              </div>
              <div style="font-size:0.8rem;color:#4A5E6E;line-height:1.55;">Two independent sound systems \u2014 ceremony/speeches + dance floor. The complete wedding experience. Travel fees additional.</div>
              <div style="margin-top:8px;display:flex;flex-direction:column;gap:4px;">
                <div style="font-size:0.78rem;color:#37A8B0;">\u2713 Up to 4 hours</div>
                <div style="font-size:0.78rem;color:#37A8B0;">\u2713 Two independent sound systems</div>
                <div style="font-size:0.78rem;color:#37A8B0;">\u2713 Ceremony &amp; cocktail hour sound</div>
                <div style="font-size:0.78rem;color:#37A8B0;">\u2713 Two wireless mics for vows, speeches &amp; toasts</div>
                <div style="font-size:0.78rem;color:#37A8B0;">\u2713 DJ-curated or custom playlist</div>
              </div>
            </div>
          </label>
        </div>
        <div class="field-group" style="margin-top:4px;">
          <div class="field-label">Additional Details &amp; Questions</div>
          <textarea id="additionalDetails" placeholder="Share any questions, special requests, or details\u2026"></textarea>
        </div>
      \`;
    } else if (EVENT_TYPE === 'event') {
      document.getElementById('slide4Title').textContent = 'Your DJ Package';
      document.getElementById('slide4Sub').textContent = 'Flat rate, no surprises.';
      container.innerHTML = \`
        <div style="background:#fff;border:1.5px solid #DDD3BC;border-radius:10px;padding:16px 18px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
            <span style="font-size:1rem;font-weight:700;color:#0D1B2A;">Dance DJ</span>
            <span style="font-size:1.2rem;font-weight:700;color:#C8202A;">$600</span>
          </div>
          <div style="font-size:0.82rem;color:#4A5E6E;line-height:1.6;margin-bottom:12px;">One sound system. Up to 4 hours. Perfect for parties, grand openings, corporate events, and private celebrations. Travel fees additional.</div>
          <div style="display:flex;flex-direction:column;gap:5px;">
            <div style="font-size:0.8rem;color:#37A8B0;">\u2713 Up to 4 hours</div>
            <div style="font-size:0.8rem;color:#37A8B0;">\u2713 One pro sound system</div>
            <div style="font-size:0.8rem;color:#37A8B0;">\u2713 DJ-curated or custom playlist</div>
            <div style="font-size:0.8rem;color:#37A8B0;">\u2713 Wired MC mic</div>
          </div>
        </div>
        <div style="background:rgba(68,190,199,0.06);border:1px solid rgba(68,190,199,0.2);border-radius:8px;padding:12px 15px;font-size:0.8rem;color:#4A5E6E;line-height:1.6;">
          Need more than 4 hours or a second sound system? Mention it in the notes below and Garrett will put together a custom quote.
        </div>
        <div class="field-group">
          <div class="field-label">Additional Details &amp; Questions</div>
          <textarea id="additionalDetails" placeholder="Share any questions, special requests, or details\u2026"></textarea>
        </div>
      \`;
    } else if (EVENT_TYPE === 'movie') {
      document.getElementById('slide4Title').textContent = 'Outdoor Movie Night';
      document.getElementById('slide4Sub').textContent = 'Private events only \u2014 review your package.';
      container.innerHTML = \`
        <div style="background:#fff;border:1.5px solid #DDD3BC;border-radius:10px;padding:16px 18px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
            <span style="font-size:1rem;font-weight:700;color:#0D1B2A;">Private Outdoor Cinema</span>
          </div>
          <div style="font-size:0.82rem;color:#4A5E6E;line-height:1.6;margin-bottom:12px;">Self-contained rig with inflatable screen, HD projector, and outdoor sound. Runs up to 3 hours with no power hookup required.</div>
          <div style="display:flex;flex-direction:column;gap:5px;margin-bottom:14px;">
            <div style="font-size:0.8rem;color:#37A8B0;">\u2713 Up to 3 hours</div>
            <div style="font-size:0.8rem;color:#37A8B0;">\u2713 Large inflatable screen</div>
            <div style="font-size:0.8rem;color:#37A8B0;">\u2713 HD projector</div>
            <div style="font-size:0.8rem;color:#37A8B0;">\u2713 Outdoor speaker system</div>
            <div style="font-size:0.8rem;color:#37A8B0;">\u2713 No power hookup needed</div>
          </div>
          <div style="border-top:1px solid #EAE0CC;padding-top:12px;display:flex;justify-content:space-between;align-items:center;">
            <span style="font-size:0.82rem;color:#4A5E6E;">Mon \u2013 Thu</span>
            <span style="font-size:1rem;font-weight:700;color:#0D1B2A;">$250</span>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-top:6px;">
            <span style="font-size:0.82rem;color:#4A5E6E;">Fri \u2013 Sat</span>
            <span style="font-size:1rem;font-weight:700;color:#0D1B2A;">$350</span>
          </div>
          <div style="margin-top:8px;font-size:0.75rem;color:#8A9EAA;font-style:italic;">Travel fees may apply. Summer availability only.</div>
        </div>
        <div style="background:rgba(200,32,42,0.06);border:1.5px solid rgba(200,32,42,0.2);border-radius:8px;padding:14px 16px;">
          <label style="display:flex;align-items:flex-start;gap:12px;cursor:pointer;">
            <input type="checkbox" id="privateEventConfirm" style="margin-top:2px;accent-color:#C8202A;width:16px;height:16px;flex-shrink:0;" />
            <span style="font-size:0.83rem;color:#1A2D3F;line-height:1.6;"><strong>I confirm this is a private event.</strong> Public screenings require separate licensing. Pescadero Music provides outdoor cinema for private gatherings only.</span>
          </label>
        </div>
        <div class="field-group">
          <div class="field-label">What movie / what are you celebrating?</div>
          <textarea id="additionalDetails" placeholder="Tell us what you\u2019d like to screen, the occasion, and any other details\u2026" style="min-height:72px;"></textarea>
        </div>
      \`;
    }
  }

  // ── Availability checker (Slide 1) ──────────────────────────────────────────
  var busyDates = [];
  fetch('/api/busy-dates')
    .then(function(r) { return r.json(); })
    .then(function(d) {
      busyDates = d.dates || [];
      var existing = v('checkDate');
      if (existing) checkDateAvailability(existing);
    })
    .catch(function() {});

  function selectType(type) {
    EVENT_TYPE = type;
    applyEventType();
  }

  function checkDateAvailability(val) {
    var box = document.getElementById('dateStatusBox');
    if (!box) return;
    if (!val) { box.style.display = 'none'; return; }
    var busy = busyDates.indexOf(val) !== -1;
    box.style.display = 'block';
    box.style.borderRadius = '8px'; box.style.padding = '10px 14px';
    box.style.fontSize = '0.82rem'; box.style.marginTop = '2px';
    if (busy) {
      box.style.background = 'rgba(200,32,42,0.08)'; box.style.border = '1px solid rgba(200,32,42,0.25)'; box.style.color = '#C8202A';
      box.innerHTML = '\u2717 That date is already booked. Try another date or reach out to ask.';
    } else {
      box.style.background = 'rgba(68,190,199,0.08)'; box.style.border = '1px solid rgba(68,190,199,0.25)'; box.style.color = '#37A8B0';
      box.innerHTML = '\u2713 That date looks open \u2014 continue below to send your inquiry.';
    }
  }

  function prefillFromSlide1() {
    var d = v('checkDate');
    var dateEl = document.getElementById('eventDate');
    if (dateEl && d) dateEl.value = d;
  }

  function highlightPackage() {
    var dance = document.getElementById('pkg-dance-label');
    var full = document.getElementById('pkg-full-label');
    var checked = document.querySelector('input[name="weddingPackage"]:checked');
    if (!checked || !dance || !full) return;
    dance.style.borderColor = checked.value.includes('Dance') ? '#C8202A' : '#DDD3BC';
    full.style.borderColor = checked.value.includes('Full') ? '#C8202A' : '#DDD3BC';
  }

  function showBg(step) {
    document.querySelectorAll('.bg-layer').forEach(function(el) {
      el.classList.toggle('visible', parseInt(el.dataset.section) === step);
    });
  }

  function toggleReferralFields(val) {
    document.getElementById('vendorNameGroup').style.display = val === 'Another Vendor / Referral' ? 'block' : 'none';
    document.getElementById('otherHearGroup').style.display = val === 'Other' ? 'block' : 'none';
  }

  function v(id) { var el = document.getElementById(id); return el ? el.value.trim() : ''; }
  function r(name) { var el = document.querySelector('input[name="' + name + '"]:checked'); return el ? el.value : ''; }

  function showError(slideNum, msg) {
    var err = document.getElementById('error-' + slideNum);
    if (!err) return;
    err.textContent = msg;
    err.classList.add('visible');
    setTimeout(function() { err.classList.remove('visible'); }, 4000);
  }

  function validate(slide) {
    if (slide === 1) {
      if (!r('inquiryType')) { showError(1, 'Please select an event type.'); return false; }
      var checkD = v('checkDate');
      if (!checkD) { showError(1, 'Please select an event date.'); return false; }
      if (busyDates.indexOf(checkD) !== -1) { showError(1, 'That date is already booked \u2014 please choose another.'); return false; }
    }
    if (slide === 2) {
      if (!v('firstName')) { showError(2, 'First name is required.'); return false; }
      if (!v('lastName'))  { showError(2, 'Last name is required.'); return false; }
      if (!v('email'))     { showError(2, 'Email address is required.'); return false; }
      if (!v('phone'))     { showError(2, 'Phone number is required.'); return false; }
      if (!r('entry.1289776342')) { showError(2, 'Please select a preferred contact method.'); return false; }
      if (EVENT_TYPE === 'wedding' && !v('coupleNames')) { showError(2, 'Please enter the names of the bride & groom.'); return false; }
      if (!r('hearAbout')) { showError(2, 'Please tell us how you heard about us.'); return false; }
      if (r('hearAbout') === 'Another Vendor / Referral' && !v('vendorName')) { showError(2, 'Please enter the vendor name.'); return false; }
    }
    if (slide === 3) {
      if (!v('eventName'))    { showError(3, 'Event name is required.'); return false; }
      if (!v('eventDate'))    { showError(3, 'Event date is required.'); return false; }
      if (!v('startTime'))    { showError(3, 'Start time is required.'); return false; }
      if (!v('endTime'))      { showError(3, 'End time is required.'); return false; }
      if (!v('venue'))        { showError(3, 'Venue / location name is required.'); return false; }
      if (!v('venueAddress')) { showError(3, 'Address is required.'); return false; }
      if (!r('entry.1884292728')) { showError(3, 'Please select indoor or outdoor.'); return false; }
      if (!v('attendance'))   { showError(3, 'Estimated attendance is required.'); return false; }
      if (EVENT_TYPE === 'movie' && !r('movieLocation')) { showError(3, 'Please select a location type.'); return false; }
    }
    if (slide === 4) {
      if (EVENT_TYPE === 'wedding' && !r('weddingPackage')) { showError(4, 'Please select a package.'); return false; }
      if (EVENT_TYPE === 'movie') {
        var confirm = document.getElementById('privateEventConfirm');
        if (!confirm || !confirm.checked) { showError(4, 'Please confirm this is a private event to continue.'); return false; }
      }
    }
    return true;
  }

  function goTo(next, dir) {
    if (animating || next === current) return;
    if (dir === 'forward' && !validate(current)) return;
    if (next === 5) buildReview();
    animating = true;
    var out = document.getElementById('slide-' + current);
    var inn = document.getElementById('slide-' + next);
    var outTo = dir === 'forward' ? '-48px' : '48px';
    var inFrom = dir === 'forward' ? '48px' : '-48px';
    out.style.pointerEvents = 'none'; out.style.visibility = 'visible'; out.style.zIndex = '1';
    inn.style.transition = 'none'; inn.style.visibility = 'visible'; inn.style.opacity = '0';
    inn.style.transform = 'translateX(' + inFrom + ')'; inn.style.pointerEvents = 'none'; inn.style.zIndex = '2';
    void inn.offsetHeight;
    var T = 'opacity ' + DUR + 'ms cubic-bezier(0.22,1,0.36,1), transform ' + DUR + 'ms cubic-bezier(0.22,1,0.36,1)';
    out.style.transition = T; out.style.opacity = '0'; out.style.transform = 'translateX(' + outTo + ')';
    inn.style.transition = T; inn.style.opacity = '1'; inn.style.transform = 'translateX(0)';
    showBg(next);
    setTimeout(function() {
      inn.classList.add('is-active'); inn.style.cssText = '';
      out.classList.remove('is-active'); out.style.cssText = '';
      document.querySelectorAll('#sectionsWrap .slide').forEach(function(s) {
        if (s.id !== 'slide-' + next) { s.classList.remove('is-active'); s.style.cssText = ''; }
      });
      current = next; updateProgress(next); animating = false;
      applyResponsiveLayout();
    }, DUR + 50);
  }

  function tabNav(step) { if (step !== current) goTo(step, step > current ? 'forward' : 'back'); }

  function updateProgress(step) {
    document.querySelectorAll('.step-btn').forEach(function(btn) {
      var s = parseInt(btn.dataset.step);
      btn.classList.toggle('active', s === step);
      btn.classList.toggle('done', s < step);
    });
  }

  function buildReview() {
    var packageVal = r('weddingPackage') || (EVENT_TYPE === 'event' ? 'Dance DJ - $600' : '');
    var movieLoc = r('movieLocation') || '';
    var eventTypesChecked = Array.from(document.querySelectorAll('input[name="eventType"]:checked')).map(function(cb){return cb.value;}).join(', ');

    var typeLabel = { wedding: 'Wedding Sound', event: 'DJ / Event', movie: 'Outdoor Movie Night' }[EVENT_TYPE];

    var rows = [
      ['Inquiry Type', typeLabel],
      ['Name', v('firstName') + ' ' + v('lastName')],
      ['Email', v('email')],
      ['Phone', v('phone')],
      ['Contact Via', r('entry.1289776342') || '\u2014'],
    ];
    if (EVENT_TYPE === 'wedding') rows.push(['Bride & Groom', v('coupleNames')]);
    rows.push(
      ['Event', v('eventName')],
      ['Date', v('eventDate')],
      ['Start', v('startTime')],
      ['End', v('endTime')],
      ['Venue', v('venue')],
      ['Address', v('venueAddress')],
      ['Setting', r('entry.1884292728') || '\u2014'],
      ['Attendance', v('attendance')]
    );
    if (EVENT_TYPE === 'wedding' && eventTypesChecked) rows.push(['Coverage', eventTypesChecked]);
    if (EVENT_TYPE === 'movie') rows.push(['Location Type', movieLoc]);
    if (EVENT_TYPE === 'event' && v('secondDate')) rows.push(['Second Date', v('secondDate')]);
    if (packageVal) rows.push(['Package', packageVal]);
    rows.push(
      ['Heard About Us', r('hearAbout') || '\u2014'],
      ['Vendor Referral', v('vendorName') || '\u2014'],
      ['Notes', v('additionalDetails') || '\u2014']
    );

    document.getElementById('reviewList').innerHTML = rows.map(function(row) {
      return '<div class="review-row"><span class="review-key">' + row[0] + '</span><span class="review-val">' + (row[1] || '\u2014') + '</span></div>';
    }).join('');
  }

  function saveProgress() {
    try {
      localStorage.setItem('pescadero_inquiry', JSON.stringify({
        firstName: v('firstName'), lastName: v('lastName'),
        email: v('email'), phone: v('phone'),
        contactMethod: r('entry.1289776342'),
        coupleNames: v('coupleNames'),
        eventName: v('eventName'),
        eventTypes: Array.from(document.querySelectorAll('input[name="eventType"]:checked')).map(function(cb){return cb.value;}),
        eventDate: v('eventDate'), startTime: v('startTime'), endTime: v('endTime'),
        secondDate: v('secondDate'),
        venue: v('venue'), venueAddress: v('venueAddress'),
        indoorOutdoor: r('entry.1884292728'),
        attendance: v('attendance'), additionalDetails: v('additionalDetails'),
        hearAbout: r('hearAbout'), vendorName: v('vendorName'), vendorType: v('vendorType'), otherHear: v('otherHear'),
        weddingPackage: r('weddingPackage'), movieLocation: r('movieLocation'),
        eventCategory: EVENT_TYPE,
      }));
    } catch(e) {}
  }

  function restoreProgress() {
    try {
      // Auto-fill from Supabase session
      (function() {
        try {
          var keys = Object.keys(localStorage);
          var sessionKey = keys.find(function(k) { return k.includes('auth-token') || k.includes('supabase'); });
          if (!sessionKey) return;
          var session = JSON.parse(localStorage.getItem(sessionKey));
          var user = session && (session.user || (session[0] && session[0].user));
          if (!user) return;
          var emailEl = document.getElementById('email');
          if (emailEl && !emailEl.value) emailEl.value = user.email || '';
          var meta = user.user_metadata || {};
          var fullName = meta.full_name || meta.name || '';
          if (fullName) {
            var parts = fullName.trim().split(' ');
            var firstEl = document.getElementById('firstName');
            var lastEl  = document.getElementById('lastName');
            if (firstEl && !firstEl.value) firstEl.value = parts[0] || '';
            if (lastEl  && !lastEl.value)  lastEl.value  = parts.slice(1).join(' ') || '';
          }
        } catch(e) {}
      })();

      var saved = localStorage.getItem('pescadero_inquiry');
      if (!saved) return;
      var d = JSON.parse(saved);
      // Only restore if same event type
      if (d.eventCategory && d.eventCategory !== EVENT_TYPE) return;
      var set = function(id, val) { var el = document.getElementById(id); if (el && val) el.value = val; };
      var setR = function(name, val) { if (!val) return; var el = document.querySelector('input[name="' + name + '"][value="' + val + '"]'); if (el) el.checked = true; };
      set('firstName', d.firstName); set('lastName', d.lastName);
      set('email', d.email); set('phone', d.phone);
      setR('entry.1289776342', d.contactMethod);
      set('coupleNames', d.coupleNames);
      set('eventName', d.eventName);
      if (d.eventTypes) { d.eventTypes.forEach(function(val) { var cb = document.querySelector('input[name="eventType"][value="' + val + '"]'); if (cb) cb.checked = true; }); }
      set('eventDate', d.eventDate); set('startTime', d.startTime); set('endTime', d.endTime);
      set('secondDate', d.secondDate);
      set('venue', d.venue); set('venueAddress', d.venueAddress);
      setR('entry.1884292728', d.indoorOutdoor);
      set('attendance', d.attendance); set('additionalDetails', d.additionalDetails);
      if (d.hearAbout) { var el = document.querySelector('input[name="hearAbout"][value="' + d.hearAbout + '"]'); if (el) { el.checked = true; toggleReferralFields(d.hearAbout); } }
      set('vendorName', d.vendorName); set('otherHear', d.otherHear);
      if (d.vendorType) { var vt = document.getElementById('vendorType'); if (vt) vt.value = d.vendorType; }
      if (d.weddingPackage) { var wp = document.querySelector('input[name="weddingPackage"][value="' + d.weddingPackage + '"]'); if (wp) { wp.checked = true; highlightPackage(); } }
      if (d.movieLocation) { var ml = document.querySelector('input[name="movieLocation"][value="' + d.movieLocation + '"]'); if (ml) ml.checked = true; }
    } catch(e) {}
  }

  function handleSubmit(e) {
    var packageSel = r('weddingPackage') || (EVENT_TYPE === 'event' ? 'Dance DJ - $600' : '');
    var notes = v('additionalDetails');
    var secondDateVal = v('secondDate');
    if (EVENT_TYPE === 'event' && secondDateVal) {
      notes = 'Multi-night booking \u2014 second date requested: ' + secondDateVal + (notes ? '. ' + notes : '.');
    }
    var formData = {
      firstName: v('firstName'), lastName: v('lastName'),
      email: v('email'), phone: v('phone'),
      contactMethod: r('entry.1289776342'),
      coupleNames: v('coupleNames'),
      eventName: v('eventName'),
      eventTypes: Array.from(document.querySelectorAll('input[name="eventType"]:checked')).map(function(cb){return cb.value;}),
      eventDate: v('eventDate'), startTime: v('startTime'), endTime: v('endTime'),
      venue: v('venue'), venueAddress: v('venueAddress'),
      indoorOutdoor: r('entry.1884292728'),
      attendance: v('attendance'),
      additionalDetails: notes,
      hearAbout: r('hearAbout'), vendorName: v('vendorName'), vendorType: v('vendorType'), otherHear: v('otherHear'),
      weddingPackage: packageSel,
      movieLocation: r('movieLocation'),
      eventCategory: EVENT_TYPE,
    };
    fetch('/api/inquiry/submit', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      credentials: 'include', body: JSON.stringify(formData),
    }).catch(function(err) { console.error('Save error:', err); });
    setTimeout(function() {
      try { localStorage.removeItem('pescadero_inquiry'); } catch(e) {}
      document.getElementById('progressBar').style.display = 'none';
      document.querySelectorAll('.slide').forEach(function(s) { s.classList.remove('is-active'); s.style.display = 'none'; });
      document.getElementById('successSlide').classList.add('visible');
      showBg(1);
    }, 600);
  }

  // ── JS-enforced mobile layout (belt-and-suspenders alongside the CSS media query) ──
  function applyResponsiveLayout() {
    var mobile = window.innerWidth <= 700;

    var root = document.getElementById('inquiry-root');
    if (root) root.style.flexDirection = mobile ? 'column' : '';

    var bg = document.getElementById('bgStage');
    if (bg) {
      bg.style.height = mobile ? '30vh' : '';
      bg.style.minHeight = mobile ? '160px' : '';
      bg.style.flex = mobile ? 'none' : '';
      bg.style.width = mobile ? '100%' : '';
    }

    var panel = document.querySelector('.form-panel');
    if (panel) {
      panel.style.width = mobile ? '100%' : '';
      panel.style.flex = mobile ? '1' : '';
      panel.style.boxShadow = mobile ? 'none' : '';
      panel.style.minHeight = mobile ? '0' : '';
    }

    var header = document.querySelector('.panel-header');
    if (header) {
      header.style.height = mobile ? '52px' : '';
      header.style.padding = mobile ? '0 16px' : '';
    }

    var logo = document.querySelector('.panel-header-logo');
    if (logo) {
      logo.style.width = mobile ? '32px' : '';
      logo.style.height = mobile ? '32px' : '';
    }

    var wrap = document.getElementById('sectionsWrap');
    if (wrap) {
      wrap.style.overflowY = mobile ? 'auto' : '';
      wrap.style.webkitOverflowScrolling = mobile ? 'touch' : '';
    }

    document.querySelectorAll('.slide').forEach(function(s) {
      if (mobile) {
        s.style.position = 'relative';
        s.style.opacity = '1';
        s.style.pointerEvents = 'auto';
        s.style.transform = 'none';
        s.style.padding = '20px 16px 16px';
        s.style.display = s.classList.contains('is-active') ? '' : 'none';
      } else {
        s.style.position = ''; s.style.opacity = ''; s.style.pointerEvents = '';
        s.style.transform = ''; s.style.padding = ''; s.style.display = '';
      }
    });

    document.querySelectorAll('.field-row').forEach(function(fr) {
      fr.style.gridTemplateColumns = mobile ? '1fr' : '';
    });

    document.querySelectorAll('.slide-footer').forEach(function(f) {
      f.style.flexDirection = mobile ? 'row' : '';
      f.style.paddingTop = mobile ? '14px' : '';
    });

    document.querySelectorAll('.btn').forEach(function(b) {
      b.style.padding = mobile ? '10px 18px' : '';
      b.style.fontSize = mobile ? '0.78rem' : '';
    });
    document.querySelectorAll('.btn-next').forEach(function(b) { b.style.padding = mobile ? '10px 20px' : ''; });
    document.querySelectorAll('.btn-submit').forEach(function(b) { b.style.padding = mobile ? '11px 24px' : ''; });
    document.querySelectorAll('.slide-title').forEach(function(t) { t.style.fontSize = mobile ? '1.2rem' : ''; });
  }

  showBg(1);
  restoreProgress();
  applyResponsiveLayout();
  window.addEventListener('resize', applyResponsiveLayout);
  window.addEventListener('orientationchange', applyResponsiveLayout);

  // Set min date to today on the Slide 1 checker
  try {
    var checkDateEl0 = document.getElementById('checkDate');
    if (checkDateEl0) checkDateEl0.min = new Date().toISOString().split('T')[0];
  } catch(e) {}

  // Pre-fill Slide 1 (type + date) from URL params, e.g. coming from the homepage checker
  try {
    var typeParam = urlParams.get('type');
    if (typeParam && ['wedding','event','movie'].indexOf(typeParam) !== -1) {
      var typeRadio = document.querySelector('input[name="inquiryType"][value="' + typeParam + '"]');
      if (typeRadio) typeRadio.checked = true;
    }
    var dateParamSlide1 = urlParams.get('date');
    var checkDateEl1 = document.getElementById('checkDate');
    if (dateParamSlide1 && checkDateEl1) {
      checkDateEl1.value = dateParamSlide1;
    }
  } catch(e) {}

  // Pre-fill date from URL param (?date=YYYY-MM-DD) into Slide 3 as well
  try {
    var dateParam = urlParams.get('date');
    if (dateParam) {
      var dateEl = document.getElementById('eventDate');
      if (dateEl && !dateEl.value) dateEl.value = dateParam;
    }
  } catch(e) {}

  // Direct entry from the homepage checker (type + date already chosen there):
  // skip the in-form availability check and jump straight to Contact.
  try {
    var directType = urlParams.get('type');
    var directDate = urlParams.get('date');
    if (directType && directDate && ['wedding','event','movie'].indexOf(directType) !== -1) {
      document.getElementById('slide-1').classList.remove('is-active');
      document.getElementById('slide-2').classList.add('is-active');
      current = 2;
      updateProgress(2);
      showBg(2);
      applyResponsiveLayout();
    }
  } catch(e) {}

  window.saveProgress = saveProgress;
`
