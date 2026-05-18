// ===== NAVIGATION =====
function go(n) {
  ['home','water','air','safety'].forEach(s => {
    const e = document.getElementById('scr-' + s); if (e) e.classList.remove('active');
    const ni = document.getElementById('ni-' + s); if (ni) ni.classList.remove('act');
  });
  const t = document.getElementById('scr-' + n); if (t) t.classList.add('active');
  const nt = document.getElementById('ni-' + n); if (nt) nt.classList.add('act');
}

// ===== + BUTTON: PIN FIRST → CONTROLS SHEET =====
function openAddFlow() {
  requirePin('Controls', 'openCtrlSheet', null);
}
function openCtrlSheet() {
  document.getElementById('ctrl-sheet-ov').classList.add('show');
}
function closeCtrlSheet(e) {
  if (!e || e.target === document.getElementById('ctrl-sheet-ov'))
    document.getElementById('ctrl-sheet-ov').classList.remove('show');
}

// ===== PIN SYSTEM =====
const PIN = '1234';
let pwEntry = '', pwCb = null, pwArg = null;

function requirePin(name, fn, arg) {
  pwEntry = ''; pwCb = fn; pwArg = arg;
  document.getElementById('pw-name').textContent = name;
  updateDots();
  document.getElementById('pw-ov').classList.add('show');
}

function pwKey(k) {
  if (pwEntry.length >= 4) return;
  pwEntry += k; updateDots();
  if (pwEntry.length === 4) {
    setTimeout(() => {
      if (pwEntry === PIN) {
        document.getElementById('pw-ov').classList.remove('show');
        if (pwCb) {
          if (pwArg !== null && pwArg !== undefined) window[pwCb](pwArg);
          else window[pwCb]();
        }
      } else {
        const box = document.getElementById('pw-box');
        for (let i = 0; i < 4; i++) {
          const d = document.getElementById('d' + i);
          d.classList.remove('filled'); d.classList.add('error');
        }
        box.classList.add('pw-shake');
        setTimeout(() => { box.classList.remove('pw-shake'); pwEntry = ''; updateDots(); }, 500);
      }
    }, 80);
  }
}

function pwDel() { if (pwEntry.length > 0) { pwEntry = pwEntry.slice(0, -1); updateDots(); } }
function pwCancel() { document.getElementById('pw-ov').classList.remove('show'); pwEntry = ''; }
function updateDots() {
  for (let i = 0; i < 4; i++) {
    const d = document.getElementById('d' + i);
    d.classList.remove('filled', 'error');
    if (i < pwEntry.length) d.classList.add('filled');
  }
}

// ===== STATE =====
let vOpen = false, fanSpeed = 75, garOpen = false, powOn = true;
let litOn = true, irrOn = true, acOn = true, alrmOn = true;

// ===== VALVE =====
function setValve(op) {
  if (op === null) op = !vOpen;
  vOpen = op;
  ['vtog', 'cs-vtog'].forEach(id => {
    const el = document.getElementById(id); if (!el) return;
    el.classList.remove('on', 'ron'); el.classList.add(op ? 'on' : 'ron');
  });
  const vtxt = document.getElementById('vtxt');
  if (vtxt) { vtxt.textContent = op ? 'Open' : 'Closed'; vtxt.className = 'dv ' + (op ? 'gn' : 'rd'); }
  const vic = document.getElementById('vic');
  if (vic) {
    vic.innerHTML = op
      ? '<i class="fa-solid fa-lock-open" style="font-size:11px;color:var(--gn)"></i>'
      : '<i class="fa-solid fa-lock" style="font-size:11px;color:var(--rd2)"></i>';
    vic.style.background = op ? 'rgba(0,217,126,.12)' : 'rgba(232,0,28,.14)';
    vic.style.borderColor = op ? 'rgba(0,217,126,.25)' : 'rgba(232,0,28,.28)';
  }
  const vsi = document.getElementById('vsi');
  if (vsi) {
    vsi.innerHTML = op
      ? '<i class="fa-solid fa-lock-open" style="font-size:19px;color:var(--gn)"></i>'
      : '<i class="fa-solid fa-lock" style="font-size:19px;color:var(--rd2)"></i>';
    vsi.style.background = op ? 'rgba(0,217,126,.1)' : 'rgba(232,0,28,.11)';
    vsi.style.borderColor = op ? 'rgba(0,217,126,.22)' : 'rgba(232,0,28,.22)';
  }
  const vstt = document.getElementById('vstt');
  if (vstt) { vstt.textContent = op ? 'Valve \u2014 Open' : 'Valve \u2014 Closed'; vstt.style.color = op ? 'var(--gn)' : 'var(--rd2)'; }
  const vsub = document.getElementById('vsub');
  if (vsub) vsub.textContent = op ? 'Water flowing \u2014 monitor pressure' : 'PIN required to change';
  const csub = document.getElementById('cs-valve-sub');
  if (csub) csub.textContent = op ? 'Open \u00b7 Water flowing' : 'Closed \u00b7 Leak detected';
  const bop = document.getElementById('btn-op'); if (bop) bop.style.opacity = op ? '.45' : '1';
  const bcl = document.getElementById('btn-cl'); if (bcl) bcl.style.opacity = op ? '1' : '.45';
}

// ===== FAN =====
function setFan(s) {
  fanSpeed = s;
  const fanSvg = document.getElementById('fan-svg');
  document.getElementById('fpct').textContent = s + '%';
  document.getElementById('frpm').textContent = s === 0 ? '0 RPM' : Math.round(s * 18) + ' RPM';
  document.getElementById('fbf').style.width = s + '%';
  document.getElementById('fplbl').textContent = s + '%';
  const fp = document.getElementById('fpill'), fd = document.getElementById('fdot');
  const fsub_ = document.getElementById('fsub'), fl = document.getElementById('flbl');
  const cft = document.getElementById('cs-ftog');
  if (s === 0) {
    fp.style.cssText = 'background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);color:var(--t2)';
    fl.textContent = 'Off'; fd.style.cssText = 'background:var(--t2);box-shadow:none;animation:none';
    fsub_.textContent = 'Fan stopped'; fanSvg.className = 'fan-svg stopped';
    if (cft) cft.classList.remove('on');
    const cs = document.getElementById('cs-fan-sub'); if (cs) cs.textContent = 'Off';
  } else {
    fp.style.cssText = 'background:rgba(56,168,255,.07);border:1px solid rgba(56,168,255,.18);color:var(--bl)';
    fl.textContent = s <= 30 ? 'Low' : s <= 60 ? 'Medium' : s < 100 ? 'Active' : 'Max';
    fd.style.cssText = 'background:var(--bl);box-shadow:0 0 5px var(--bl);animation:bk 1.5s ease infinite';
    fsub_.textContent = s >= 75 ? 'Auto-triggered \u00b7 CO\u2082 high' : 'Manual control';
    fanSvg.style.animationDuration = Math.max(0.4, 2 - (s / 100) * 1.6) + 's';
    fanSvg.style.animationPlayState = 'running'; fanSvg.className = 'fan-svg';
    if (cft) cft.classList.add('on');
    const cs = document.getElementById('cs-fan-sub');
    if (cs) cs.textContent = 'On \u00b7 ' + s + '% \u00b7 ' + Math.round(s * 18) + ' RPM';
  }
  ['fo','fl_','fm','fh','fx'].forEach(id => { const b = document.getElementById(id); if (b) b.className = 'fcb ina'; });
  const m = { 0: 'fo', 25: 'fl_', 55: 'fm', 75: 'fh', 100: 'fx' };
  if (m[s]) document.getElementById(m[s]).className = 'fcb act';
}
function toggleFanHome() { setFan(fanSpeed > 0 ? 0 : 75); }

// ===== GARAGE =====
function toggleGarage() {
  garOpen = !garOpen;
  ['gar-tog', 'cs-gtog'].forEach(id => {
    const el = document.getElementById(id); if (!el) return;
    el.classList.remove('on'); if (garOpen) el.classList.add('on');
  });
  const gv = document.getElementById('gar-val');
  if (gv) { gv.textContent = garOpen ? 'Open' : 'Closed'; gv.style.color = garOpen ? 'var(--gn)' : 'var(--pu)'; }
  const gs = document.getElementById('gar-sub');
  if (gs) gs.textContent = garOpen ? 'Door open \u2014 car ready' : 'Tap to open (PIN required)';
  const gl = document.getElementById('gar-lbl'); if (gl) gl.textContent = garOpen ? 'Open' : 'Closed';
  const csub = document.getElementById('cs-gar-sub'); if (csub) csub.textContent = garOpen ? 'Open' : 'Closed';
  document.querySelectorAll('.gar-slat').forEach((sl, i) => {
    sl.style.transform = garOpen ? `translateY(-${(i + 1) * 14}px)` : '';
    sl.style.opacity = garOpen ? '0' : '1';
  });
}

// ===== POWER =====
function setPow(on) {
  powOn = on;
  const bon = document.getElementById('bpow-on'); if (bon) bon.style.opacity = on ? '.45' : '1';
  const bof = document.getElementById('bpow-off'); if (bof) bof.style.opacity = on ? '1' : '.45';
  const cpt = document.getElementById('cs-ptog'); if (cpt) { cpt.classList.remove('on'); if (on) cpt.classList.add('on'); }
  const cs = document.getElementById('cs-pow-sub'); if (cs) cs.textContent = on ? 'On \u00b7 Overheating alert' : 'Off \u00b7 Lines cut';
}
function togglePower() { setPow(!powOn); }

function toggleLights() {
  litOn = !litOn;
  const ct = document.getElementById('cs-ltog'); if (ct) { ct.classList.remove('on'); if (litOn) ct.classList.add('on'); }
  const cs = document.getElementById('cs-lit-sub'); if (cs) cs.textContent = litOn ? 'On \u00b7 6 rooms active' : 'Off';
}
function toggleIrr() {
  irrOn = !irrOn;
  const ct = document.getElementById('cs-itog'); if (ct) { ct.classList.remove('on'); if (irrOn) ct.classList.add('on'); }
  const cs = document.getElementById('cs-irr-sub'); if (cs) cs.textContent = irrOn ? 'On \u00b7 Next 6:30 AM' : 'Off';
}
function toggleAC() {
  acOn = !acOn;
  const ct = document.getElementById('cs-actog'); if (ct) { ct.classList.remove('on'); if (acOn) ct.classList.add('on'); }
  const cs = document.getElementById('cs-ac-sub'); if (cs) cs.textContent = acOn ? 'On \u00b7 22\u00b0C cooling' : 'Off';
}
function toggleAlarm() {
  alrmOn = !alrmOn;
  const ct = document.getElementById('cs-alrmtog'); if (ct) { ct.classList.remove('on'); if (alrmOn) ct.classList.add('on'); }
  const cs = document.getElementById('cs-alrm-sub'); if (cs) cs.textContent = alrmOn ? 'Armed \u00b7 Away mode' : 'Disarmed';
}

// ===== CLOCK =====
function updateClock() {
  const now = new Date();
  const el = document.getElementById('clk');
  if (el) el.textContent = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
}
setInterval(updateClock, 10000); updateClock();

// ===== SCENARIO ROTATION =====
const scnMsgs = [
  'Lights dimmed \u00b7 Sleep pattern detected',
  'Blinds lowered \u00b7 High sunlight',
  'AC set to 22\u00b0C \u00b7 Hot day ahead',
  'Front door secured \u00b7 Night mode'
];
let scnIdx = 0;
setInterval(() => {
  scnIdx = (scnIdx + 1) % scnMsgs.length;
  const el = document.getElementById('scn-msg');
  if (el) el.textContent = scnMsgs[scnIdx];
}, 4000);

// ===== INIT =====
setValve(false); setFan(75); setPow(true);
document.getElementById('btn-cl').style.opacity = '.45';
document.getElementById('bpow-on').style.opacity = '.45';

// ===== CO2 GAUGE =====
(function () {
  const cx = 160, cy = 165, R = 122, full = 383, mn = 400, mx = 1000;
  const SVG_NS = 'http://www.w3.org/2000/svg';
  function d2r(d) { return d * Math.PI / 180; }
  function ppm2ang(p) { return 180 - Math.min(1, Math.max(0, (p - mn) / (mx - mn))) * 180; }
  function ang2xy(deg, r) { const rad = d2r(deg); return { x: cx + r * Math.cos(rad), y: cy - r * Math.sin(rad) }; }

  const tg = document.getElementById('tks');
  for (let i = 0; i <= 10; i++) {
    const deg = 180 - i * 18, a = ang2xy(deg, R - 18), b = ang2xy(deg, R - (i % 5 === 0 ? 4 : 8));
    const l = document.createElementNS(SVG_NS, 'line');
    l.setAttribute('x1', a.x); l.setAttribute('y1', a.y); l.setAttribute('x2', b.x); l.setAttribute('y2', b.y);
    l.setAttribute('stroke-width', i % 5 === 0 ? '2' : '1'); l.setAttribute('stroke-opacity', i % 5 === 0 ? '.38' : '.16');
    tg.appendChild(l);
  }

  let cur = 820, tgt = 820, af;
  function col(p) {
    if (p < 600) return { c: 'gd', t: 'Good air quality' };
    if (p < 800) return { c: 'wa', t: 'Moderate CO\u2082 level' };
    if (p < 950) return { c: 'wa', t: 'High CO\u2082 \u2014 ventilate now' };
    return { c: 'da', t: 'Danger \u2014 evacuate area' };
  }
  function upd(p) {
    const t2 = Math.min(1, Math.max(0, (p - mn) / (mx - mn)));
    const off = full * (1 - t2), deg = ppm2ang(p), tip = ang2xy(deg, R - 18);
    document.getElementById('arc').setAttribute('stroke-dashoffset', off.toFixed(1));
    document.getElementById('ndl').setAttribute('x2', tip.x.toFixed(1));
    document.getElementById('ndl').setAttribute('y2', tip.y.toFixed(1));
    document.getElementById('cv').textContent = Math.round(p);
    const info = col(p);
    document.getElementById('spl').className = 'spl ' + info.c;
    document.getElementById('pd').className = 'pd_ ' + info.c;
    document.getElementById('st').textContent = info.t;
  }
  function animTo(p) {
    cancelAnimationFrame(af);
    const s = cur, d = p - s, dur = 900, t0 = performance.now();
    function step(now) {
      const pr = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - pr, 3);
      cur = s + d * e; upd(cur);
      if (pr < 1) af = requestAnimationFrame(step); else cur = p;
    }
    af = requestAnimationFrame(step);
  }
  upd(820);
  let peak = 820; const hist = [820];
  setInterval(() => {
    tgt = Math.min(1000, Math.max(400, tgt + (Math.random() - 0.38) * 40));
    if (tgt > peak) peak = tgt; animTo(tgt);
    hist.push(Math.round(tgt)); if (hist.length > 60) hist.shift();
    const avg = Math.round(hist.reduce((a, b) => a + b, 0) / hist.length);
    const delta = Math.round(tgt - hist[Math.max(0, hist.length - 6)]);
    document.getElementById('ma').textContent = avg;
    document.getElementById('mp').textContent = Math.round(peak);
    document.getElementById('md').textContent = (delta >= 0 ? '+' : '') + delta;
    const ap = ((avg - 400) / 600 * 100).toFixed(0);
    const pp = ((peak - 400) / 600 * 100).toFixed(0);
    const dp = Math.min(100, Math.abs(delta) / 100 * 100).toFixed(0);
    document.getElementById('ab_').style.width = ap + '%';
    document.getElementById('pb').style.width = pp + '%';
    document.getElementById('db').style.width = dp + '%';
    const ac = tgt < 600 ? '#00e87a' : tgt < 800 ? '#ffd200' : '#ff8c00';
    document.getElementById('ma').style.color = ac;
    document.getElementById('ab_').style.background = ac;
    document.getElementById('md').style.color = delta > 0 ? '#ff2d55' : '#00e87a';
    document.getElementById('db').style.background = delta > 0 ? '#ff2d55' : '#00e87a';
  }, 3000);
})();


// استبدل الجزء الخاص بالـ (function () { ... })(); بالكود التالي:

(function () {
    const canvas = document.getElementById('fp2d');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    let t = 0;

    // تهيئة الرسم
    function draw() {
        ctx.clearRect(0, 0, W, H);
        t += 0.02;

        // خلفية الشبكة (Grid) لتعطي مظهر هندسي
        ctx.strokeStyle = 'rgba(255,255,255,0.02)';
        ctx.lineWidth = 1;
        for(let i=0; i<W; i+=20) { ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i,H); ctx.stroke(); }
        for(let i=0; i<H; i+=20) { ctx.beginPath(); ctx.moveTo(0,i); ctx.lineTo(W,i); ctx.stroke(); }

        const rooms = [
            { id: 'living', x: 20, y: 20, w: 140, h: 160, name: 'Living', color: '#00d97e', icon: '🛋️' },
            { id: 'bedroom', x: 165, y: 20, w: 175, h: 120, name: 'Bedroom', color: '#38a8ff', icon: '🛏️' },
            { id: 'kitchen', x: 20, y: 185, w: 110, h: 100, name: 'Kitchen', color: '#ff7a00', icon: '🍳' },
            { id: 'bath', x: 135, y: 185, w: 90, h: 100, name: 'Bath', color: '#ff2040', icon: '🚿', alert: true },
            { id: 'garage', x: 230, y: 145, w: 110, h: 140, name: 'Garage', color: '#bf5af2', icon: '🚗' }
        ];

        rooms.forEach(room => {
            // رسم حدود الغرفة
            ctx.shadowBlur = 0;
            ctx.strokeStyle = room.alert ? `rgba(255,32,64, ${0.3 + Math.abs(Math.sin(t*3))*0.7})` : 'rgba(255,255,255,0.15)';
            ctx.lineWidth = 2;
            
            // Fill
            ctx.fillStyle = room.alert ? 'rgba(255,32,64,0.05)' : 'rgba(255,255,255,0.02)';
            ctx.beginPath();
            ctx.roundRect(room.x, room.y, room.w, room.h, 12);
            ctx.fill();
            ctx.stroke();

            // Room Name & Icon
            ctx.fillStyle = room.color;
            ctx.font = 'bold 10px Inter';
            ctx.fillText(room.name.toUpperCase(), room.x + 10, room.y + 20);
            
            // Sensor Pulse
            if (room.alert) {
                ctx.beginPath();
                ctx.arc(room.x + room.w/2, room.y + room.h/2, 5 + Math.sin(t*5)*3, 0, Math.PI*2);
                ctx.fillStyle = room.color;
                ctx.fill();
            }

            // رسم أثاث بسيط (Blueprint Style)
            ctx.strokeStyle = 'rgba(255,255,255,0.05)';
            ctx.strokeRect(room.x + 15, room.y + room.h - 25, 20, 10); // Placeholder for furniture
        });

        requestAnimationFrame(draw);
    }
    draw();
})();