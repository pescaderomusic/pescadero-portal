'use client'
import { useEffect } from 'react'

export default function InquiryPage() {
  useEffect(() => {
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
      <div style={{ background: '#0F1F35', borderBottom: '1px solid rgba(79,185,175,0.15)', padding: '0 24px', height: 44, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, zIndex: 1000 }}>
        <button
          onClick={() => { try { (window as any).saveProgress?.() } catch(e) {} window.location.href = '/dashboard' }}
          style={{ fontSize: 11, color: 'rgba(232,224,213,0.4)', background: 'none', border: '1px solid rgba(232,224,213,0.2)', borderRadius: 6, padding: '5px 12px', cursor: 'pointer', letterSpacing: '1px', textTransform: 'uppercase', fontFamily: 'monospace' }}
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
    --navy: #0D1B2A; --cream: #F5EFE0; --cream-dark: #EAE0CC; --cream-mid: #DDD3BC;
    --red: #D62828; --red-dark: #B52020; --blue: #44BEC7; --blue-dark: #37A8B0;
    --text-dark: #1A2D3F; --text-mid: #4A5E6E; --text-light: #8A9EAA;
    --font: 'Plus Jakarta Sans', system-ui, sans-serif;
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
  .panel-header-sub { font-size: 0.62rem; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: var(--blue); line-height: 1; }
  .panel-header-main { font-size: 0.88rem; font-weight: 700; color: var(--cream); line-height: 1; }
  .progress-bar { flex-shrink: 0; background: #fff; border-bottom: 1px solid var(--cream-mid); padding: 0 28px; display: flex; }
  .step-btn { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 12px 4px 10px; background: none; border: none; cursor: pointer; position: relative; -webkit-tap-highlight-color: transparent; transition: background 0.15s; }
  .step-btn:hover { background: rgba(13,27,42,0.03); }
  .step-btn::after { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 2.5px; background: transparent; transition: background 0.35s var(--ease); }
  .step-btn.active::after { background: var(--red); }
  .step-btn.done::after { background: var(--blue); }
  .step-dot { width: 24px; height: 24px; border-radius: 50%; background: var(--cream-mid); color: var(--text-light); font-size: 0.68rem; font-weight: 700; display: flex; align-items: center; justify-content: center; transition: all 0.35s var(--ease); }
  .step-btn.active .step-dot { background: var(--red); color: #fff; box-shadow: 0 2px 8px rgba(214,40,40,0.4); transform: scale(1.1); }
  .step-btn.done .step-dot { background: var(--blue); color: #fff; }
  .step-name { font-size: 0.58rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; color: var(--text-light); transition: color 0.2s; }
  .step-btn.active .step-name { color: var(--red); }
  .step-btn.done .step-name { color: var(--blue-dark); }
  .sections-wrap { flex: 1; position: relative; overflow: clip; }
  .slide { position: absolute; inset: 0; padding: 32px 28px 24px; display: flex; flex-direction: column; gap: 0; opacity: 0; pointer-events: none; visibility: hidden; overflow-y: auto; overscroll-behavior: contain; scrollbar-width: none; }
  .slide::-webkit-scrollbar { display: none; }
  .slide.is-active { opacity: 1; pointer-events: auto; visibility: visible; }
  .slide-head { margin-bottom: 22px; flex-shrink: 0; }
  .slide-eyebrow { font-size: 0.65rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: var(--blue-dark); margin-bottom: 5px; }
  .slide-title { font-size: 1.45rem; font-weight: 800; color: var(--navy); line-height: 1.15; letter-spacing: -0.3px; }
  .slide-sub { font-size: 0.82rem; color: var(--text-light); margin-top: 5px; font-weight: 400; line-height: 1.5; }
  .fields { flex: 1; display: flex; flex-direction: column; gap: 14px; }
  .field-group { display: flex; flex-direction: column; gap: 6px; }
  .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .field-label { font-size: 0.7rem; font-weight: 700; letter-spacing: 0.07em; text-transform: uppercase; color: var(--text-mid); }
  .field-label .req { color: var(--red); margin-left: 1px; }
  input[type="text"], input[type="email"], input[type="tel"], input[type="date"], input[type="time"], select, textarea { width: 100%; background: #fff; border: 1.5px solid var(--cream-mid); border-radius: 8px; color: var(--text-dark); font-family: var(--font); font-size: 0.88rem; font-weight: 500; padding: 10px 13px; outline: none; -webkit-appearance: none; transition: border-color 0.2s, box-shadow 0.2s; }
  input::placeholder, textarea::placeholder { color: var(--text-light); font-weight: 400; }
  input:focus, select:focus, textarea:focus { border-color: var(--blue); box-shadow: 0 0 0 3px rgba(68,190,199,0.13); }
  input.error, select.error, textarea.error { border-color: var(--red); box-shadow: 0 0 0 3px rgba(214,40,40,0.1); }
  textarea { resize: none; min-height: 88px; line-height: 1.55; }
  .choice-group { display: flex; flex-direction: column; gap: 7px; }
  .choice-group.inline { flex-direction: row; flex-wrap: wrap; gap: 7px; }
  .choice-item { display: flex; align-items: center; gap: 9px; padding: 9px 13px; background: #fff; border: 1.5px solid var(--cream-mid); border-radius: 8px; cursor: pointer; font-size: 0.86rem; font-weight: 500; color: var(--text-mid); user-select: none; transition: border-color 0.18s, background 0.18s, color 0.18s; -webkit-tap-highlight-color: transparent; }
  .choice-item:hover { border-color: var(--blue); background: rgba(68,190,199,0.04); color: var(--text-dark); }
  .choice-item:has(input:checked) { border-color: var(--blue); background: rgba(68,190,199,0.09); color: var(--navy); font-weight: 600; }
  .choice-item input[type="radio"], .choice-item input[type="checkbox"] { width: 16px; height: 16px; min-width: 16px; accent-color: var(--blue); cursor: pointer; }
  .choice-group.error .choice-item { border-color: rgba(214,40,40,0.4); }
  .form-error { background: rgba(214,40,40,0.08); border: 1px solid rgba(214,40,40,0.25); border-radius: 8px; padding: 10px 14px; font-size: 0.78rem; color: var(--red); margin-bottom: 4px; flex-shrink: 0; display: none; }
  .form-error.visible { display: block; }
  .review-list { display: flex; flex-direction: column; gap: 0; flex: 1; }
  .review-row { display: flex; gap: 12px; padding: 9px 0; border-bottom: 1px solid var(--cream-dark); font-size: 0.84rem; }
  .review-key { min-width: 120px; flex-shrink: 0; font-size: 0.67rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-light); padding-top: 2px; }
  .review-val { color: var(--text-dark); font-weight: 500; }
  .slide-footer { flex-shrink: 0; padding-top: 18px; display: flex; align-items: center; justify-content: flex-end; gap: 10px; }
  .btn { font-family: var(--font); font-size: 0.8rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; padding: 11px 24px; border: none; border-radius: 8px; cursor: pointer; -webkit-tap-highlight-color: transparent; transition: all 0.2s var(--ease); }
  .btn-back { background: transparent; color: var(--text-light); border: 1.5px solid var(--cream-mid); }
  .btn-back:hover { border-color: var(--text-light); color: var(--text-dark); }
  .btn-next { background: var(--red); color: #fff; box-shadow: 0 4px 14px rgba(214,40,40,0.32); padding: 11px 30px; }
  .btn-next:hover { background: var(--red-dark); transform: translateY(-1px); box-shadow: 0 7px 20px rgba(214,40,40,0.38); }
  .btn-submit { background: var(--red); color: #fff; padding: 12px 36px; font-size: 0.84rem; box-shadow: 0 4px 16px rgba(214,40,40,0.32); }
  .btn-submit:hover { background: var(--red-dark); transform: translateY(-1px); }
  .slide-footer-split { justify-content: space-between; }
  .success-slide { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px 28px; text-align: center; opacity: 0; pointer-events: none; visibility: hidden; transform: translateY(20px); transition: opacity 0.55s var(--ease), transform 0.55s var(--ease), visibility 0s 0.55s; }
  .success-slide.visible { opacity: 1; pointer-events: auto; visibility: visible; transform: translateY(0); transition: opacity 0.55s var(--ease), transform 0.55s var(--ease), visibility 0s 0s; }
  .success-ring { width: 72px; height: 72px; border-radius: 50%; background: linear-gradient(135deg, var(--blue), var(--blue-dark)); display: flex; align-items: center; justify-content: center; margin-bottom: 22px; box-shadow: 0 8px 30px rgba(68,190,199,0.35); animation: popIn 0.5s var(--ease) both; }
  @keyframes popIn { from { transform: scale(0); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  .success-slide h2 { font-size: 1.5rem; font-weight: 800; color: var(--navy); margin-bottom: 10px; }
  .success-slide p { font-size: 0.85rem; color: var(--text-mid); line-height: 1.65; max-width: 320px; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
  @media (max-width: 700px) {
    .bg-stage { height: 38vh; min-height: 200px; flex: none; width: 100%; }
    .bg-stage::after { background: linear-gradient(to bottom, transparent 40%, rgba(13,27,42,0.6) 100%); }
    .form-panel { width: 100%; flex: 1; box-shadow: none; min-height: 62vh; }
    .sections-wrap { overflow-y: auto; }
    .slide { position: relative; opacity: 1; pointer-events: auto; transform: none !important; }
    .slide:not(.is-active) { display: none; }
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
    <div class="panel-header-logo"><img src="https://inquiries.pescaderomusic.com/images/logo.png" alt="Pescadero Music" /></div>
    <div class="panel-header-title">
      <span class="panel-header-sub">Pescadero Music</span>
      <span class="panel-header-main">Wedding Sound Inquiry</span>
    </div>
  </div>

  <div class="progress-bar" id="progressBar">
    <button class="step-btn active" data-step="1" onclick="tabNav(1)"><div class="step-dot">1</div><div class="step-name">Intro</div></button>
    <button class="step-btn" data-step="2" onclick="tabNav(2)"><div class="step-dot">2</div><div class="step-name">Contact</div></button>
    <button class="step-btn" data-step="3" onclick="tabNav(3)"><div class="step-dot">3</div><div class="step-name">Event</div></button>
    <button class="step-btn" data-step="4" onclick="tabNav(4)"><div class="step-dot">4</div><div class="step-name">Services</div></button>
    <button class="step-btn" data-step="5" onclick="tabNav(5)"><div class="step-dot">5</div><div class="step-name">Review</div></button>
  </div>

  <div class="sections-wrap" id="sectionsWrap">

    <!-- SLIDE 1: HOW IT WORKS -->
    <div class="slide is-active" id="slide-1">
      <div class="slide-head">
        <div class="slide-eyebrow">Welcome to Pescadero Music</div>
        <div class="slide-title">Let\u2019s Get You Booked</div>
        <div class="slide-sub">This takes about 3 minutes.</div>
      </div>
      <div class="fields" style="gap:12px;">
        <div style="display:flex;align-items:flex-start;gap:14px;background:#fff;border:1.5px solid #DDD3BC;border-radius:10px;padding:16px 18px;">
          <div style="width:40px;height:40px;border-radius:50%;background:rgba(68,190,199,0.12);border:1.5px solid rgba(68,190,199,0.3);display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;">\u270f\ufe0f</div>
          <div><div style="font-size:0.9rem;font-weight:700;color:#0D1B2A;margin-bottom:4px;">1 \u2014 Submit Your Inquiry</div><div style="font-size:0.83rem;color:#6A7E8E;line-height:1.6;">Tell us about your event \u2014 your contact info, date, venue, and any questions.</div></div>
        </div>
        <div style="display:flex;align-items:flex-start;gap:14px;background:#fff;border:1.5px solid #DDD3BC;border-radius:10px;padding:16px 18px;">
          <div style="width:40px;height:40px;border-radius:50%;background:rgba(68,190,199,0.12);border:1.5px solid rgba(68,190,199,0.3);display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;">\ud83d\udcde</div>
          <div><div style="font-size:0.9rem;font-weight:700;color:#0D1B2A;margin-bottom:4px;">2 \u2014 Garrett Reaches Out</div><div style="font-size:0.83rem;color:#6A7E8E;line-height:1.6;">Within 24\u201348 hours, Garrett will contact you directly to talk through your vision, answer questions, and confirm availability.</div></div>
        </div>
        <div style="background:rgba(68,190,199,0.06);border:1px solid rgba(68,190,199,0.18);border-radius:8px;padding:12px 15px;font-size:0.78rem;color:#4A5E6E;line-height:1.55;">\ud83d\udd12 Your information is only shared with Garrett \u2014 never sold or shared with third parties.</div>
      </div>
      <div class="slide-footer">
        <button class="btn btn-next" onclick="goTo(2,'forward')">Get Started \u2192</button>
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
        <div class="field-group"><div class="field-label">Name of Bride &amp; Groom <span class="req">*</span></div><input type="text" id="coupleNames" placeholder="e.g. Emily &amp; James" /></div>
      </div>
      <div class="slide-footer slide-footer-split">
        <button class="btn btn-back" onclick="goTo(1,'back')">\u2190 Back</button>
        <button class="btn btn-next" onclick="goTo(3,'forward')">Next \u2192</button>
      </div>
    </div>

    <!-- SLIDE 3: EVENT -->
    <div class="slide" id="slide-3">
      <div class="slide-head">
        <div class="slide-eyebrow">Step 2 of 4</div>
        <div class="slide-title">Event Details</div>
        <div class="slide-sub">Tell us about your wedding day.</div>
      </div>
      <div id="error-3" class="form-error"></div>
      <div class="fields">
        <div class="field-group"><div class="field-label">Event Name <span class="req">*</span></div><input type="text" id="eventName" placeholder="e.g. Smith Wedding" /></div>
        <div class="field-group">
          <div class="field-label">Event Type <span style="font-size:11px;color:#8A9EAA;font-weight:400;">(select all that apply)</span></div>
          <div class="choice-group" id="eventTypeGroup" style="display:flex;flex-wrap:wrap;gap:8px;margin-top:6px;">
            <label class="choice-item"><input type="checkbox" name="eventType" value="Ceremony" /> Ceremony</label>
            <label class="choice-item"><input type="checkbox" name="eventType" value="Cocktail Hour" /> Cocktail Hour</label>
            <label class="choice-item"><input type="checkbox" name="eventType" value="Reception" /> Reception</label>
            <label class="choice-item"><input type="checkbox" name="eventType" value="Dinner" /> Dinner</label>
            <label class="choice-item"><input type="checkbox" name="eventType" value="Dancing" /> Dancing</label>
            <label class="choice-item"><input type="checkbox" name="eventType" value="Open House" /> Open House</label>
          </div>
        </div>
        <div class="field-group"><div class="field-label">Event Date <span class="req">*</span></div><input type="date" id="eventDate" name="entry.1402594235" /></div>
        <div class="field-row">
          <div class="field-group"><div class="field-label">Start Time <span class="req">*</span></div><input type="time" id="startTime" name="entry.1145643384" /></div>
          <div class="field-group"><div class="field-label">End Time <span class="req">*</span></div><input type="time" id="endTime" name="entry.839784182" /></div>
        </div>
        <div class="field-group"><div class="field-label">Venue Name <span class="req">*</span></div><input type="text" id="venue" placeholder="Venue name" /></div>
        <div class="field-group"><div class="field-label">Venue Address <span class="req">*</span></div><input type="text" id="venueAddress" placeholder="Street, City, State, ZIP" /></div>
        <div class="field-group">
          <div class="field-label">Indoor or Outdoor? <span class="req">*</span></div>
          <div class="choice-group inline" id="settingGroup">
            <label class="choice-item"><input type="radio" name="entry.1884292728" value="Indoor" /> Indoor</label>
            <label class="choice-item"><input type="radio" name="entry.1884292728" value="Outdoor" /> Outdoor</label>
            <label class="choice-item"><input type="radio" name="entry.1884292728" value="Both" /> Both</label>
          </div>
        </div>
        <div class="field-group"><div class="field-label">Estimated Attendance <span class="req">*</span></div><input type="text" id="attendance" placeholder="e.g. 150" /></div>
      </div>
      <div class="slide-footer slide-footer-split">
        <button class="btn btn-back" onclick="goTo(2,'back')">\u2190 Back</button>
        <button class="btn btn-next" onclick="goTo(4,'forward')">Next \u2192</button>
      </div>
    </div>

    <!-- SLIDE 4: WHAT'S INCLUDED -->
    <div class="slide" id="slide-4">
      <div class="slide-head">
        <div class="slide-eyebrow">Step 3 of 4</div>
        <div class="slide-title">What\u2019s Included</div>
        <div class="slide-sub">Every booking includes the full premium experience.</div>
      </div>
      <div class="fields" style="gap:10px;">
        <div style="background:#fff;border:1.5px solid #DDD3BC;border-radius:10px;padding:14px 16px;">
          <div style="font-size:0.62rem;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#4A5E6E;margin-bottom:10px;">Full Premium Experience \u2014 Included in Every Booking</div>
          <div style="display:flex;flex-direction:column;gap:8px;">
            <div style="display:flex;gap:10px;font-size:0.84rem;color:#1A2D3F;line-height:1.4;"><span style="color:#37A8B0;font-weight:700;flex-shrink:0;">\u2713</span><span>Full Day Coverage \u2014 Sound for ceremony and or reception needs such as dinner, speeches, toasts, dance, and send-off</span></div>
            <div style="display:flex;gap:10px;font-size:0.84rem;color:#1A2D3F;line-height:1.4;"><span style="color:#37A8B0;font-weight:700;flex-shrink:0;">\u2713</span><span>Design Consultations \u2014 Customizable lighting &amp; music planning</span></div>
            <div style="display:flex;gap:10px;font-size:0.84rem;color:#1A2D3F;line-height:1.4;"><span style="color:#37A8B0;font-weight:700;flex-shrink:0;">\u2713</span><span>Two Independent Sound Systems \u2014 Ceremony/reception + dance floor</span></div>
            <div style="display:flex;gap:10px;font-size:0.84rem;color:#1A2D3F;line-height:1.4;"><span style="color:#37A8B0;font-weight:700;flex-shrink:0;">\u2713</span><span>Dual-Channel Professional Microphones \u2014 Handheld or lapel</span></div>
            <div style="display:flex;gap:10px;font-size:0.84rem;color:#1A2D3F;line-height:1.4;"><span style="color:#37A8B0;font-weight:700;flex-shrink:0;">\u2713</span><span>Professional MC Service \u2014 Entrances, announcements, event flow, etc.</span></div>
            <div style="display:flex;gap:10px;font-size:0.84rem;color:#1A2D3F;line-height:1.4;"><span style="color:#37A8B0;font-weight:700;flex-shrink:0;">\u2713</span><span>Seamless Aesthetic \u2014 Ultra-clean, handcrafted wood and white setups that look like a natural extension of your reception space</span></div>
          </div>
        </div>
        <div style="background:#fff;border:1.5px solid #DDD3BC;border-radius:10px;padding:14px 16px;">
          <div style="font-size:0.62rem;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#4A5E6E;margin-bottom:10px;">Investment \u2014 Based on Day of the Week</div>
          <div>
            <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid #EAE0CC;"><span style="font-size:0.86rem;color:#4A5E6E;">Saturdays (Prime Time)</span><span style="font-size:0.92rem;font-weight:700;color:#0D1B2A;">$1,500</span></div>
            <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid #EAE0CC;"><span style="font-size:0.86rem;color:#4A5E6E;">Fridays &amp; Thursdays</span><span style="font-size:0.92rem;font-weight:700;color:#0D1B2A;">$1,400</span></div>
            <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;"><span style="font-size:0.86rem;color:#4A5E6E;">Monday \u2013 Wednesday</span><span style="font-size:0.92rem;font-weight:700;color:#0D1B2A;">$1,200</span></div>
          </div>
        </div>
        <div style="background:rgba(68,190,199,0.06);border:1px solid rgba(68,190,199,0.2);border-radius:8px;padding:12px 15px;font-size:0.8rem;color:#4A5E6E;line-height:1.6;flex-shrink:0;">
          <strong style="color:#0D1B2A;">No selections needed.</strong> All services are included. We\u2019ll tailor the details during your consultation.
        </div>
        <div class="field-group">
          <div class="field-label">Additional Details &amp; Questions</div>
          <textarea id="additionalDetails" placeholder="Share any additional details, questions, or special requests\u2026"></textarea>
        </div>
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
      <iframe name="hidden_iframe" style="display:none"></iframe>
      <form id="gform" action="https://docs.google.com/forms/d/e/1FAIpQLSf2DiCwlYpZOim1JBidS35KyBeIohJF8vcOzUpT0ScjSOLlww/formResponse" method="POST" target="hidden_iframe" onsubmit="handleSubmit(event)">
        <input type="hidden" id="h_firstName" name="entry.315397321" />
        <input type="hidden" id="h_lastName" name="entry.735438890" />
        <input type="hidden" id="h_email" name="entry.1653024831" />
        <input type="hidden" id="h_phone" name="entry.1505839442" />
        <input type="hidden" id="h_contactMethod" name="entry.1289776342" />
        <input type="hidden" id="h_coupleNames" name="entry.391503868" />
        <input type="hidden" id="h_eventName" name="entry.167147996" />
        <input type="hidden" id="h_venue" name="entry.1267295149" />
        <input type="hidden" id="h_venueAddress" name="entry.1474838283" />
        <input type="hidden" id="h_indoorOutdoor" name="entry.1884292728" />
        <input type="hidden" id="h_attendance" name="entry.1801133532" />
        <input type="hidden" id="h_additionalDetails" name="entry.1670641103" />
        <div class="slide-footer slide-footer-split">
          <button type="button" class="btn btn-back" onclick="goTo(4,'back')">\u2190 Edit</button>
          <button type="submit" class="btn btn-submit">Submit Inquiry \u2192</button>
        </div>
      </form>
    </div>

    <!-- SUCCESS -->
    <div class="success-slide" id="successSlide">
      <div class="success-ring">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
      </div>
      <h2>Inquiry Received!</h2>
      <p style="margin:0 0 8px;">We\u2019ve received your inquiry and will reach out within <strong>24\u201348 hours</strong>.</p>
      <p style="font-size:13px;color:#888;margin:0 0 20px;">Questions? <a href="mailto:garrett@pescaderomusic.com" style="color:#44BEC7;">garrett@pescaderomusic.com</a></p>
      <a href="/dashboard" style="display:inline-block;padding:12px 28px;background:#D62828;color:#fff;text-decoration:none;border-radius:8px;font-weight:700;font-size:14px;">Back to Dashboard \u2192</a>
    </div>

  </div>
</div>


</div>`
const SCRIPT = `
  const DUR = 400;
  let current = 1, animating = false;

  function showBg(step) {
    document.querySelectorAll('.bg-layer').forEach(function(el) {
      el.classList.toggle('visible', parseInt(el.dataset.section) === step);
    });
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
    if (slide === 2) {
      if (!v('firstName')) { showError(2, 'First name is required.'); return false; }
      if (!v('lastName'))  { showError(2, 'Last name is required.'); return false; }
      if (!v('email'))     { showError(2, 'Email address is required.'); return false; }
      if (!v('phone'))     { showError(2, 'Phone number is required.'); return false; }
      if (!r('entry.1289776342')) { showError(2, 'Please select a preferred contact method.'); return false; }
      if (!v('coupleNames')) { showError(2, 'Please enter the names of the bride & groom.'); return false; }
    }
    if (slide === 3) {
      if (!v('eventName'))    { showError(3, 'Event name is required.'); return false; }
      if (!v('eventDate'))    { showError(3, 'Event date is required.'); return false; }
      if (!v('startTime'))    { showError(3, 'Start time is required.'); return false; }
      if (!v('endTime'))      { showError(3, 'End time is required.'); return false; }
      if (!v('venue'))        { showError(3, 'Venue name is required.'); return false; }
      if (!v('venueAddress')) { showError(3, 'Venue address is required.'); return false; }
      if (!r('entry.1884292728')) { showError(3, 'Please select indoor or outdoor.'); return false; }
      if (!v('attendance'))   { showError(3, 'Estimated attendance is required.'); return false; }
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
    var rows = [
      ['Name', v('firstName') + ' ' + v('lastName')],
      ['Email', v('email')],
      ['Phone', v('phone')],
      ['Contact Via', r('entry.1289776342') || '\u2014'],
      ['Bride & Groom', v('coupleNames')],
      ['Event', v('eventName')],
      ['Date', v('eventDate')],
      ['Start', v('startTime')],
      ['End', v('endTime')],
      ['Venue', v('venue')],
      ['Address', v('venueAddress')],
      ['Setting', r('entry.1884292728') || '\u2014'],
      ['Attendance', v('attendance')],
      ['Notes', v('additionalDetails') || '\u2014'],
    ];
    document.getElementById('reviewList').innerHTML = rows.map(function(row) {
      return '<div class="review-row"><span class="review-key">' + row[0] + '</span><span class="review-val">' + (row[1] || '\u2014') + '</span></div>';
    }).join('');
    document.getElementById('h_firstName').value = v('firstName');
    document.getElementById('h_lastName').value = v('lastName');
    document.getElementById('h_email').value = v('email');
    document.getElementById('h_phone').value = v('phone');
    document.getElementById('h_contactMethod').value = r('entry.1289776342');
    document.getElementById('h_coupleNames').value = v('coupleNames');
    document.getElementById('h_eventName').value = v('eventName');
    document.getElementById('h_venue').value = v('venue');
    document.getElementById('h_venueAddress').value = v('venueAddress');
    document.getElementById('h_indoorOutdoor').value = r('entry.1884292728');
    document.getElementById('h_attendance').value = v('attendance');
    document.getElementById('h_additionalDetails').value = v('additionalDetails');
  }

  function saveProgress() {
    try {
      localStorage.setItem('pescadero_inquiry', JSON.stringify({
        firstName: v('firstName'), lastName: v('lastName'),
        email: v('email'), phone: v('phone'),
        contactMethod: r('entry.1289776342'),
        coupleNames: v('coupleNames'), eventName: v('eventName'), eventTypes: Array.from(document.querySelectorAll('input[name="eventType"]:checked')).map(function(cb){return cb.value;}),
        eventDate: v('eventDate'), startTime: v('startTime'), endTime: v('endTime'),
        venue: v('venue'), venueAddress: v('venueAddress'),
        indoorOutdoor: r('entry.1884292728'),
        attendance: v('attendance'), additionalDetails: v('additionalDetails'),
      }));
    } catch(e) {}
  }

  function restoreProgress() {
    try {

      // ── Auto-fill from account ─────────────────────────────
      (function() {
        try {
          // Supabase stores session in localStorage as sb-*-auth-token
          var keys = Object.keys(localStorage);
          var sessionKey = keys.find(function(k) { return k.includes('auth-token') || k.includes('supabase'); });
          if (!sessionKey) return;
          var session = JSON.parse(localStorage.getItem(sessionKey));
          var user = session && (session.user || (session[0] && session[0].user));
          if (!user) return;

          // Fill email
          var emailEl = document.getElementById('email');
          if (emailEl && !emailEl.value) emailEl.value = user.email || '';

          // Fill name from user_metadata
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
      // ─────────────────────────────────────────────────────────

      var saved = localStorage.getItem('pescadero_inquiry');
      if (!saved) return;
      var d = JSON.parse(saved);
      var set = function(id, val) { var el = document.getElementById(id); if (el && val) el.value = val; };
      var setR = function(name, val) { if (!val) return; var el = document.querySelector('input[name="' + name + '"][value="' + val + '"]'); if (el) el.checked = true; };
      set('firstName', d.firstName); set('lastName', d.lastName);
      set('email', d.email); set('phone', d.phone);
      setR('entry.1289776342', d.contactMethod);
      set('coupleNames', d.coupleNames); set('eventName', d.eventName); if(d.eventTypes){d.eventTypes.forEach(function(v){var cb=document.querySelector('input[name="eventType"][value="'+v+'"]');if(cb)cb.checked=true;});}
      set('eventDate', d.eventDate); set('startTime', d.startTime); set('endTime', d.endTime);
      set('venue', d.venue); set('venueAddress', d.venueAddress);
      setR('entry.1884292728', d.indoorOutdoor);
      set('attendance', d.attendance); set('additionalDetails', d.additionalDetails);
    } catch(e) {}
  }

  function handleSubmit(e) {
    var formData = {
      firstName: v('firstName'), lastName: v('lastName'),
      email: v('email'), phone: v('phone'),
      contactMethod: r('entry.1289776342'),
      coupleNames: v('coupleNames'), eventName: v('eventName'), eventTypes: Array.from(document.querySelectorAll('input[name="eventType"]:checked')).map(function(cb){return cb.value;}),
      eventDate: v('eventDate'), startTime: v('startTime'), endTime: v('endTime'),
      venue: v('venue'), venueAddress: v('venueAddress'),
      indoorOutdoor: r('entry.1884292728'), attendance: v('attendance'),
      additionalDetails: v('additionalDetails'),
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

  showBg(1);
  restoreProgress();
`

