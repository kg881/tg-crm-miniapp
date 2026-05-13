// BitOK CRM Mini App
const tg = window.Telegram?.WebApp;
if (tg) { tg.ready(); tg.expand(); tg.setHeaderColor('secondary_bg_color'); }
const ME = tg?.initDataUnsafe?.user || { first_name: 'Гость', username: 'guest' };
const SUPPORT = '@k_gaft';   // Основной аккаунт владельца — поддержка

// ===== Hydrate pix-icons =====
// Заполняем все [data-pix] плейсхолдеры (tabbar / list-ico / btn-ico) SVG из библиотеки.
function _hydratePixIcons(root = document) {
  if (!root || !root.querySelectorAll) return;
  root.querySelectorAll('[data-pix]:empty').forEach(el => {
    const name = el.dataset.pix;
    if (!window.PIX || !window.PIX[name]) return;
    el.innerHTML = `<svg viewBox="0 0 16 16" shape-rendering="crispEdges" fill="currentColor">${window.PIX[name]}</svg>`;
  });
}

// ===== Pixel icon library =====
// 16×16 pixel SVG paths. Все одноцветные, цвет = currentColor → берётся из родителя.
// Используй: pixIcon('home') / pixIcon('mail','red',32). Цветовые схемы: gold/red/mint/plum/sky/ink/paper/ghost.
const PIX = {
  home:        '<path d="M8 1L1 8h2v6h4v-4h2v4h4V8h2z"/>',
  dashboard:   '<rect x="2" y="2" width="5" height="5"/><rect x="9" y="2" width="5" height="5"/><rect x="2" y="9" width="5" height="5"/><rect x="9" y="9" width="5" height="5"/>',
  menu:        '<rect x="2" y="3" width="12" height="2"/><rect x="2" y="7" width="12" height="2"/><rect x="2" y="11" width="12" height="2"/>',
  list:        '<rect x="2" y="3" width="2" height="2"/><rect x="6" y="3" width="8" height="2"/><rect x="2" y="7" width="2" height="2"/><rect x="6" y="7" width="8" height="2"/><rect x="2" y="11" width="2" height="2"/><rect x="6" y="11" width="8" height="2"/>',
  grid:        '<rect x="2" y="2" width="5" height="5"/><rect x="9" y="2" width="5" height="5"/><rect x="2" y="9" width="5" height="5"/><rect x="9" y="9" width="5" height="5"/>',
  back:        '<path d="M2 8L7 3v3h7v4H7v3z"/>',
  forward:     '<path d="M14 8L9 3v3H2v4h7v3z"/>',
  arrow_up:    '<path d="M8 2L3 7h3v7h4V7h3z"/>',
  search:      '<path d="M2 2h7v7H2z M3 3v5h5V3z" fill-rule="evenodd"/><rect x="9" y="9" width="2" height="2"/><rect x="11" y="11" width="2" height="2"/><rect x="13" y="13" width="2" height="2"/>',
  filter:      '<path d="M2 3h12v2l-4 4v5l-4-2v-3L2 5z"/>',
  send:        '<path d="M2 13L14 2l-1 12-5-3z"/>',
  mail:        '<path d="M2 3h12v10H2zm1 2v6h10V5l-5 4z"/>',
  inbox:       '<path d="M2 8h12v6H2z M4 2v6h2v2h4V8h2V2z" fill-rule="evenodd"/>',
  phone:       '<path d="M3 2h3v3l-1 1 2 4 1-1h3v3l-3 2c-3 0-9-6-9-9z"/>',
  user:        '<rect x="6" y="2" width="4" height="4"/><rect x="3" y="8" width="10" height="6"/>',
  user_add:    '<rect x="5" y="2" width="4" height="4"/><rect x="2" y="8" width="10" height="6"/><rect x="12" y="9" width="3" height="1"/><rect x="13" y="7" width="1" height="5"/>',
  users:       '<rect x="2" y="3" width="3" height="3"/><rect x="10" y="3" width="3" height="3"/><rect x="1" y="8" width="5" height="6"/><rect x="9" y="8" width="6" height="6"/>',
  ninja:       '<path d="M4 2h8v2H4zm-1 2h10v2H3zm1 2h8v2H4zm0 2h8v6H4z"/>',
  handshake:   '<path d="M3 7l3-3 3 3 3-3 3 3-3 3-3-3-3 3z"/>',
  vip:         '<path d="M2 4h2v8H2zm4 0h2l1 5 1-5h2v8H10v-5l-1 4H8l-1-4v5H6z"/>',
  contact_book:'<path d="M3 2h10v12H3zm1 1v10h8V3zm2 2h4v2H6zm0 3h4v1H6z"/>',
  play:        '<path d="M3 2l11 6-11 6z"/>',
  pause:       '<rect x="3" y="2" width="3" height="12"/><rect x="10" y="2" width="3" height="12"/>',
  stop:        '<rect x="3" y="3" width="10" height="10"/>',
  refresh:     '<path d="M2 7h6V3l4 4-4 4V8H4M14 9h-6v4l-4-4 4-4v3h6"/>',
  plus:        '<rect x="7" y="3" width="2" height="10"/><rect x="3" y="7" width="10" height="2"/>',
  minus:       '<rect x="3" y="7" width="10" height="2"/>',
  check:       '<path d="M2 8l1-1 3 3 7-7 1 1-8 8z"/>',
  close:       '<path d="M3 4l1-1 4 4 4-4 1 1-4 4 4 4-1 1-4-4-4 4-1-1 4-4z"/>',
  edit:        '<path d="M11 1l3 3-2 2-3-3zM10 4L2 12v2h2l8-8z"/>',
  trash:       '<path d="M5 2h6v2h3v2H2V4h3zm-2 5h10l-1 7H4z"/>',
  settings:    '<path d="M7 1h2v2h2l1 1v2h2v2h-2v2l-1 1h-2v2H7v-2H5l-1-1V8H2V6h2V4l1-1h2zm0 4l-1 1v4l1 1h2l1-1V6l-1-1z"/>',
  fire:        '<path d="M8 2l3 3-1 2 2 2-1 4H5l-1-4 2-2-1-2z"/>',
  lightning:   '<path d="M9 1L3 9h3l-2 6 8-9H9z"/>',
  calendar:    '<path d="M3 3h10v3H3zm-1 3h12v8H2zm2 2v2h2V8zm3 0v2h2V8zm3 0v2h2V8z"/>',
  clock:       '<path d="M8 2c3 0 6 3 6 6s-3 6-6 6-6-3-6-6 3-6 6-6zm0 2c-2 0-4 2-4 4s2 4 4 4 4-2 4-4-2-4-4-4zm0 1v3l2 2"/>',
  ban:         '<path d="M8 2c3 0 6 3 6 6s-3 6-6 6-6-3-6-6 3-6 6-6zm0 2c-1 0-2 0-3 1l6 6c1-1 1-2 1-3 0-2-2-4-4-4zM4 6c-1 1-1 2-1 2 0 2 2 4 4 4 1 0 2 0 3-1z" fill-rule="evenodd"/>',
  attach:      '<path d="M11 2c2 0 3 2 2 3l-7 7c-1 1-3 1-3 0 0-1 0-2 1-3l5-5"/>',
  spark:       '<path d="M7 1h2v6h6v2H9v6H7V9H1V7h6z"/>',
  idea:        '<path d="M5 2h6v6l-2 2v2H7v-2L5 8zm2 11h2v1H7z"/>',
  analytics:   '<rect x="2" y="9" width="3" height="5"/><rect x="6" y="6" width="3" height="8"/><rect x="10" y="3" width="3" height="11"/>',
  brain:       '<path d="M5 3h6v2h1v6h-1v2H5v-2H4V5h1z"/>',
  forward_msg: '<path d="M14 2v6h-2V5L4 13l-2-2 8-8H6V2z"/>',
  qr:          '<rect x="2" y="2" width="5" height="5"/><rect x="9" y="2" width="5" height="5"/><rect x="2" y="9" width="5" height="5"/><rect x="9" y="9" width="2" height="2"/><rect x="13" y="9" width="2" height="2"/><rect x="9" y="13" width="2" height="2"/><rect x="13" y="13" width="2" height="2"/>',
  file:        '<path d="M3 1h7l3 3v11H3z M10 1v3h3" fill-rule="evenodd"/>',
  folder:      '<path d="M2 4h5l1 1h6v9H2z"/>',
  info:        '<path d="M7 2h2v2H7zM6 5h3v6h1v2H5v-2h1V7H6z"/>',
  support:     '<path d="M5 4h2c0-1 1-2 2-2s2 1 2 2-2 2-2 4H7c0-2 2-3 2-3 0-1-1-1-1-1s-1 0-1 1zm2 7h2v2H7z"/>',
  snooze:      '<path d="M3 4h10v2l-7 5h7v3H3v-2l7-5H3z"/>',
  bell:        '<path d="M6 2h4v1l1 1v6l1 2H4l1-2V4l1-1zm1 12h2v1H7z"/>',
  star:        '<path d="M8 2l2 4 4 1-3 3 1 4-4-2-4 2 1-4-3-3 4-1z"/>',
  briefcase:   '<path d="M5 2h6v2h4v3H1V4h4zM1 8h14v6H1z M6 4V3h4v1"/>',
  target:      '<path d="M8 2c3 0 6 3 6 6s-3 6-6 6-6-3-6-6 3-6 6-6zm0 2c-2 0-4 2-4 4s2 4 4 4 4-2 4-4-2-4-4-4zm0 2c-1 0-2 1-2 2s1 2 2 2 2-1 2-2-1-2-2-2z"/>',
  scan:        '<path d="M1 1h4v2H3v2H1zm10 0h4v4h-2V3h-2zM1 11h2v2h2v2H1zm12 0h2v4h-4v-2h2zm-9-3h8v1H4z"/>',
  hashtag:     '<path d="M5 2h2l-1 4h2l1-4h2l-1 4h3v2h-3l-1 2h3v2h-3l-1 4H6l1-4H5l-1 4H2l1-4H0v-2h3l1-2H1V6h3z"/>',
  comment:     '<path d="M2 2h12v9H6l-3 3v-3H2z"/>',
  paper_plane: '<path d="M2 13L14 2l-1 12-5-3z"/>',
  signal:      '<rect x="2" y="11" width="2" height="3"/><rect x="5" y="9" width="2" height="5"/><rect x="8" y="7" width="2" height="7"/><rect x="11" y="4" width="2" height="10"/>',
  broadcast:   '<rect x="2" y="6" width="2" height="4"/><rect x="4" y="4" width="2" height="8"/><rect x="6" y="2" width="2" height="12"/><rect x="9" y="6" width="6" height="2"/><rect x="9" y="9" width="4" height="2"/><rect x="9" y="3" width="4" height="2"/>',
  mobile:      '<path d="M4 1h8v14H4zm1 1v10h6V2zm2 11h2v1H7z"/>',
  dot3:        '<rect x="2" y="7" width="3" height="3"/><rect x="7" y="7" width="3" height="3"/><rect x="12" y="7" width="3" height="3"/>',
  power:       '<path d="M7 2h2v6H7zm-3 1c-2 1-3 3-3 5 0 3 3 6 7 6s7-3 7-6c0-2-1-4-3-5l-1 2c1 1 2 2 2 3 0 2-2 4-5 4s-5-2-5-4c0-1 1-2 2-3z"/>',
  globe:       '<path d="M8 2c3 0 6 3 6 6s-3 6-6 6-6-3-6-6 3-6 6-6zm0 1c-1 1-2 3-2 5s1 4 2 5c1-1 2-3 2-5s-1-4-2-5zm-3 1l1 1c0 1 0 2 1 3H4l1-4zm6 0l1 4h-3c1-1 1-2 1-3z"/>',
};

// Экспонируем PIX в window для _hydratePixIcons
window.PIX = PIX;

// pixIcon(name, color='gold', size=36) → 'gold','red','mint','plum','sky','ink','paper','ghost'
function pixIcon(name, color = 'gold', size = 36) {
  const inner = PIX[name] || PIX.dashboard;
  return `<span class="pix-icon pix-${color}" style="width:${size}px;height:${size}px"><svg viewBox="0 0 16 16" shape-rendering="crispEdges">${inner}</svg></span>`;
}

// ===== Helpers =====
const $ = (sel) => document.querySelector(sel);
const initials = (n) => (n || '?').split(/\s+/).slice(0, 2).map(w => w[0] || '').join('').toUpperCase();
const escape = (s) => (s == null ? '' : String(s)).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmtTime = (iso) => {
  const d = new Date(iso); const today = new Date();
  if (d.toDateString() === today.toDateString()) return d.toTimeString().slice(0,5);
  return d.toISOString().slice(5,10).replace('-','.');
};

// «вчера в 14:30», «5 мин назад», «12 апр»
function prettyTime(iso) {
  if (!iso) return '';
  const d = new Date(iso); const now = new Date();
  const diffMs = now - d; const diffMin = Math.round(diffMs / 60000);
  if (diffMin < 1) return 'только что';
  if (diffMin < 60) return `${diffMin} мин назад`;
  const sameDay = d.toDateString() === now.toDateString();
  const yesterday = new Date(now); yesterday.setDate(now.getDate() - 1);
  const isYesterday = d.toDateString() === yesterday.toDateString();
  const hhmm = d.toTimeString().slice(0,5);
  if (sameDay)     return `сегодня ${hhmm}`;
  if (isYesterday) return `вчера ${hhmm}`;
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}

// Парсит "сегодня"/"завтра"/"+3д"/"YYYY-MM-DD" → ISO date string. null если не понял.
function parseDueDate(s) {
  if (!s) return null;
  s = s.trim().toLowerCase();
  const now = new Date(); now.setHours(18, 0, 0, 0);
  if (s === 'сегодня' || s === 'today') return now.toISOString();
  if (s === 'завтра' || s === 'tomorrow') { now.setDate(now.getDate()+1); return now.toISOString(); }
  const m = s.match(/^[+]?(\d+)\s*[дd]/);
  if (m) { now.setDate(now.getDate() + parseInt(m[1], 10)); return now.toISOString(); }
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return new Date(s + 'T18:00:00').toISOString();
  return null;
}

// Стабильный цвет по hash имени (как в Telegram)
const _palette = ['#e25555','#f5a623','#16a34a','#2563eb','#7c3aed','#06b6d4','#ec4899','#f59e0b'];
function colorFor(name) {
  if (!name) return _palette[0];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0;
  return _palette[Math.abs(h) % _palette.length];
}

// Аватарка: цветной кружок с инициалами + поверх <img> (если загрузился — закроет фон)
function avatar(tgId, name, unread = false, size = 40) {
  // Pixel-style square avatar: цветной фон, чёрный border, опционально красная точка-unread.
  const color = colorFor(name || String(tgId || '?'));
  const ini = initials(name);
  const fontSize = Math.round(size * 0.42);
  const wrap = `width:${size}px;height:${size}px;background:${color};color:#fff;display:flex;align-items:center;justify-content:center;font-family:var(--font-h);font-weight:700;font-size:${fontSize}px;flex:0 0 ${size}px;overflow:hidden;position:relative;border:2px solid var(--ink);box-shadow:2px 2px 0 var(--ink)`;
  const dot = unread ? `<span style="position:absolute;bottom:-3px;right:-3px;width:8px;height:8px;background:var(--red);border:2px solid var(--ink)"></span>` : '';
  if (!tgId) return `<div style="${wrap}"><span>${escape(ini)}</span>${dot}</div>`;
  const url = API.avatarUrl(tgId);
  return `<div style="${wrap}"><span>${escape(ini)}</span><img src="${url}" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;background:${color}" onerror="this.style.display='none'">${dot}</div>`;
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    toast(`Скопировано: ${text}`);
  } catch { prompt_('Скопируйте вручную:', text); }
}

// Search-debounce — переиспользуем для всех экранов
let _searchTimer = null;
function _renderListDetailSearch(value) {
  clearTimeout(_searchTimer);
  _searchTimer = setTimeout(() => {
    render('list_detail', { q: value });
    // Возвращаем фокус на инпут
    const inp = document.getElementById('ld-search');
    if (inp) { inp.focus(); inp.setSelectionRange(value.length, value.length); }
  }, 200);
}
function _renderInboxSearch(value) {
  clearTimeout(_searchTimer);
  _searchTimer = setTimeout(() => {
    render('inbox', { ...screenState.inbox, q: value });
    const inp = document.getElementById('ib-search');
    if (inp) { inp.focus(); inp.setSelectionRange(value.length, value.length); }
  }, 200);
}
window.__ldSearch = _renderListDetailSearch;
window.__ibSearch = _renderInboxSearch;
window.__cwToggleAb = (on) => {
  const w = screenState.campaign_wizard;
  if (!w) return;
  render('campaign_wizard', { ...w, data: { ...w.data, ab_mode: on, ...(on ? {} : { template_id_b: null }) } });
};
const haptic = () => tg?.HapticFeedback?.impactOccurred?.('light');
const toast = (msg) => tg?.showAlert?.(msg) || alert(msg);
const confirm_ = (msg) => new Promise(r => tg?.showConfirm?.(msg, r) || r(window.confirm(msg)));
const prompt_ = (msg, def='') => window.prompt(msg, def);
const openLink = (url) => tg?.openTelegramLink ? tg.openTelegramLink(url.replace('https://t.me/', 'https://t.me/')) : window.open(url, '_blank');
const openTgUser = (uname) => {
  const link = `https://t.me/${uname.replace('@', '')}`;
  if (tg?.openTelegramLink) tg.openTelegramLink(link);
  else window.open(link, '_blank');
};

// ===== State =====
let currentScreen = 'dashboard';
let screenState = {};
let IS_ADMIN = false;
const navStack = [];
const MAIN_TABS = new Set(['dashboard','outreach','inbox','guru','more']);
let _navBack = false;
let _poll = null;
function stopPoll() { if (_poll) { clearInterval(_poll); _poll = null; } }
function startPoll(fn, ms) { stopPoll(); _poll = setInterval(fn, ms); }

// ===== Mock-данные дашборда =====
const MOCK = {
  stats: { leads_today: 36, hot: 6, sent_today: 142, reply_rate: 18 },
  // Hot leads — ТОЛЬКО лиды на trial (по запросу: исключить paid, показывать trial-стейджы).
  hot_leads: [
    { name: 'CryptoGex',     stage: 'Trial Activated', score: 95, color: 'orange' },
    { name: 'Биржа Масспей', stage: 'Trial Activated', score: 70, color: 'blue' },
    { name: 'ivendpay.com',  stage: 'Trial Activated', score: 70, color: 'purple' },
    { name: 'Bitteam',       stage: 'Trial Activated', score: 75, color: 'orange' },
    { name: 'safexchange.pr',stage: 'Trial Activated', score: 70, color: 'green' },
  ],
  pipeline_stages: [
    { id: 'all', label: 'Все', count: 36 },
    { id: 'initial', label: 'Initial', count: 8 },
    { id: 'trial', label: 'Trial', count: 6 },
    { id: 'testnet', label: 'Testnet', count: 7 },
    { id: 'objection', label: 'Objection', count: 11 },
    { id: 'winback', label: 'Winback', count: 4 },
  ],
};
const scoreClass = (n) => n >= 70 ? 'hot' : n >= 40 ? 'warm' : 'cold';

// ===== Schedule editor =====
const DAY_LABELS = ['Понедельник','Вторник','Среда','Четверг','Пятница','Суббота','Воскресенье'];
const DEFAULT_SCHEDULE = { enabled: false, days: [true,true,true,true,true,false,false], time_from: '09:00', time_to: '18:00', timezone: 'UTC' };
const TIMEZONES = ['UTC','Europe/Moscow','Europe/Kyiv','Europe/London','Europe/Berlin','Europe/Lisbon','Asia/Dubai','Asia/Bangkok','Asia/Tokyo','America/New_York','America/Los_Angeles'];
function scheduleEditorHTML(sch) {
  const s = sch || DEFAULT_SCHEDULE;
  const days = (s.days && s.days.length === 7) ? s.days : DEFAULT_SCHEDULE.days;
  const tf = s.time_from || '09:00';
  const tt = s.time_to   || '18:00';
  const tz = s.timezone  || 'UTC';
  const enabled = !!s.enabled;
  return `
    <div class="card">
      <label style="display:flex;align-items:center;gap:12px;cursor:pointer">
        <input id="sch-enabled" type="checkbox" ${enabled?'checked':''} style="width:20px;height:20px">
        <div style="flex:1">
          <div style="font-weight:500">Включить расписание</div>
          <div style="font-size:12px;color:var(--text-muted)">Без расписания акк шлёт круглосуточно. С расписанием — только в выбранные дни и часы.</div>
        </div>
      </label>
      <div id="sch-body" style="${enabled?'':'opacity:.5;pointer-events:none'};margin-top:12px">
        ${DAY_LABELS.map((d, i) => `
          <div style="display:flex;align-items:center;gap:8px;margin-top:6px">
            <input type="checkbox" data-sch-day="${i}" ${days[i]?'checked':''} style="width:18px;height:18px">
            <span style="flex:1;font-size:13px">${d}</span>
            <input type="time" data-sch-tf="${i}" value="${tf}" style="padding:6px 8px;border:1px solid var(--border);border-radius:6px;background:var(--bg);color:var(--text);font-size:13px">
            <span style="color:var(--text-muted)">—</span>
            <input type="time" data-sch-tt="${i}" value="${tt}" style="padding:6px 8px;border:1px solid var(--border);border-radius:6px;background:var(--bg);color:var(--text);font-size:13px">
          </div>
        `).join('')}
        <label style="font-size:12px;color:var(--text-muted);margin-top:14px;display:block">Часовой пояс</label>
        <select id="sch-tz" style="width:100%;padding:10px 12px;border:1px solid var(--border);border-radius:8px;background:var(--bg);color:var(--text);font-size:14px;margin-top:4px">
          ${TIMEZONES.map(z => `<option value="${z}" ${z===tz?'selected':''}>${z}</option>`).join('')}
        </select>
      </div>
    </div>
  `;
}
function collectSchedule() {
  const enabled = document.getElementById('sch-enabled')?.checked;
  if (!document.getElementById('sch-body')) return null;
  const days = [];
  let tf = '09:00', tt = '18:00';
  for (let i = 0; i < 7; i++) {
    days.push(document.querySelector(`[data-sch-day="${i}"]`)?.checked || false);
    if (i === 0) {
      tf = document.querySelector(`[data-sch-tf="${i}"]`)?.value || '09:00';
      tt = document.querySelector(`[data-sch-tt="${i}"]`)?.value || '18:00';
    }
  }
  // Если у первого дня изменили время — применяем ко всем (UI как у конкурента — единое окно, чекбоксы дней)
  // Но если бы были разные tf/tt по дням — мы это поддерживаем (берём с первого включённого)
  const tz = document.getElementById('sch-tz')?.value || 'UTC';
  return { enabled: !!enabled, days, time_from: tf, time_to: tt, timezone: tz };
}

// При клике на чекбокс «Включить расписание» — гасим/подсвечиваем форму
document.addEventListener('change', (e) => {
  if (e.target.id === 'sch-enabled') {
    const body = document.getElementById('sch-body');
    if (body) {
      const on = e.target.checked;
      body.style.opacity = on ? '1' : '.5';
      body.style.pointerEvents = on ? 'auto' : 'none';
    }
  }
});

// ===== FAB (плавающая «+» с раскрывающимися действиями) =====
function accountsFabHTML() {
  return `
    <div class="fab-wrap" id="acc-fab">
      <div class="fab-action" data-action="fab-forward" title="Форварднуть сообщение из ТГ — автоматически создаст лид с этим контактом">
        <span class="fab-label">Форварднуть сообщение</span>
        <button class="fab-mini" title="Форварднуть сообщение из ТГ — автоматически создаст лид с этим контактом" data-pix="forward_msg"></button>
      </div>
      <div class="fab-action" data-action="fab-sync" title="Синхронизировать папки Telegram — импорт всех чатов из выбранных папок">
        <span class="fab-label accent">Синк ТГ-папок</span>
        <button class="fab-mini" title="Синхронизировать папки Telegram — импорт всех чатов из выбранных папок" data-pix="refresh" style="background:var(--gold)"></button>
      </div>
      <div class="fab-action" data-action="fab-qr" title="Подключить новый TG-аккаунт через QR-код">
        <span class="fab-label">Сканировать QR</span>
        <button class="fab-mini" title="Подключить новый TG-аккаунт через QR-код" data-pix="qr"></button>
      </div>
      <div class="fab-action" data-action="fab-manual" title="Добавить TG-аккаунт по номеру + код подтверждения">
        <span class="fab-label">Добавить вручную</span>
        <button class="fab-mini" title="Добавить TG-аккаунт по номеру + код подтверждения" data-pix="edit"></button>
      </div>
      <button class="fab-main" data-action="fab-toggle" title="Меню добавления (аккаунт / форвард / синк папок)">+</button>
    </div>
    <div class="fab-backdrop" id="acc-fab-backdrop" data-action="fab-toggle"></div>
  `;
}
function toggleFab() {
  const w = document.getElementById('acc-fab');
  const b = document.getElementById('acc-fab-backdrop');
  if (!w) return;
  const open = w.classList.toggle('open');
  if (b) b.classList.toggle('show', open);
}
function closeFab() {
  document.getElementById('acc-fab')?.classList.remove('open');
  document.getElementById('acc-fab-backdrop')?.classList.remove('show');
}

// ===== Screens =====
const screens = {

  // ---------- DASHBOARD (live) ----------
  dashboard: (st) => {
    const d = st?.data;
    if (!d) return `
      <div class="screen">
        <div class="head-row"><h2>Оя ё, ${escape(ME.first_name)}</h2></div>
        <div class="empty"><div class="empty-ico" data-pix="clock"></div><div class="empty-title">Загружаю данные</div></div>
      </div>`;
    const trendSent = d.sent_yesterday ? (d.sent_today >= d.sent_yesterday ? '↑' : '↓') + ` vs вчера ${d.sent_yesterday}` : 'первый день';
    const trendDirSent = d.sent_yesterday ? (d.sent_today >= d.sent_yesterday ? '' : ' down') : '';
    const queueLine = d.queue
      ? `${d.queue} в очереди${d.eta_days ? ` · ETA ~${d.eta_days} дн` : ''}`
      : 'очередь пуста';
    return `
      <div class="screen">
        <div class="card" style="background:var(--ink);color:var(--card);border-color:var(--ink);display:flex;align-items:center;gap:14px">
          <div class="sensei-avatar" style="flex:0 0 auto;width:48px;height:48px"></div>
          <div style="flex:1">
            <div style="font-family:var(--font-h);font-weight:700;font-size:16px">Привет, ${escape(ME.first_name||'Сэмпай')}</div>
            <div style="font-size:13px;color:var(--gold);margin-top:4px;font-weight:500">${d.live_campaigns||0} кампании в работе · ${d.replies_today||0} ответов сегодня</div>
          </div>
        </div>
        <div class="stats-grid">
          <div class="stat">
            <div class="stat-label">Отправлено</div>
            <div class="stat-value">${d.sent_today}</div>
            <div class="stat-trend${trendDirSent}">${escape(trendSent)}</div>
          </div>
          <div class="stat">
            <div class="stat-label">Ответов сегодня</div>
            <div class="stat-value">${d.replies_today}</div>
            <div class="stat-trend">${d.unread} непрочитано</div>
          </div>
          <div class="stat">
            <div class="stat-label">Reply rate (7д)</div>
            <div class="stat-value">${d.reply_rate}%</div>
            <div class="stat-trend">${d.live_campaigns} live кампаний</div>
          </div>
          <div class="stat">
            <div class="stat-label">Аккаунты</div>
            <div class="stat-value">${d.accounts_active}/${d.accounts_total}</div>
            <div class="stat-trend">${d.remaining_today}/${d.daily_capacity} осталось</div>
          </div>
        </div>

        <div class="card" style="margin-top:8px;${d.queue?'background:linear-gradient(135deg,#dbeafe,#e0e7ff)':''}">
          <div style="font-size:13px;color:${d.queue?'#1e3a8a':'var(--text-muted)'}">
            ⚡ <b>Sender:</b> ${escape(queueLine)}
          </div>
        </div>

        ${st.tasks && st.tasks.length ? `
          <div class="section-title">Сегодня надо (${st.tasks.length})</div>
          ${st.tasks.slice(0, 5).map(t => {
            const overdue = new Date(t.due_date) < new Date(new Date().toDateString());
            return `
            <div class="card" style="${overdue?'background:#fee2e2':''}">
              <div class="card-row">
                <div style="flex:1;min-width:0">
                  <div style="font-weight:500;font-size:14px">${escape(t.text)}</div>
                  <div style="font-size:12px;color:${overdue?'#b91c1c':'var(--text-muted)'};margin-top:2px">
                    ${overdue?'⚠ просрочена':'до'} ${prettyTime(t.due_date)}${t.lead_name?' · '+escape(t.lead_name):''}
                  </div>
                </div>
                <button class="btn secondary" style="padding:4px 10px;font-size:12px" data-action="task-done" data-id="${t.id}" title="Отметить задачу выполненной">✓</button>
              </div>
            </div>
          `;}).join('')}
          ${st.tasks.length > 5 ? `<button class="btn secondary full" style="margin-top:6px" data-action="goto-tasks">Все задачи (${st.tasks.length})</button>` : ''}
        ` : ''}
        ${accountsFabHTML()}
      </div>
    `;
  },

  // ---------- PIPELINE ----------
  pipeline: (st) => {
    const active = st?.stage || 'all';
    return `
      <div class="screen">
        <div class="head-row"><h2>Сделки</h2><button class="add-btn" data-action="goto-lists" title="Перейти к спискам лидов — оттуда выбираешь лида в новую сделку">+</button></div>
        <div class="stage-strip">
          ${MOCK.pipeline_stages.map(s => `
            <div class="stage-chip ${s.id === active ? 'active' : ''}" data-stage="${s.id}">${s.label} · ${s.count}</div>
          `).join('')}
        </div>
        ${MOCK.hot_leads.map(l => `
          <div class="lead" data-action="open-lead" data-name="${escape(l.name)}">
            <div class="avatar ${l.color}">${initials(l.name)}</div>
            <div class="lead-body"><div class="lead-name">${escape(l.name)}</div><div class="lead-status">${escape(l.stage)} · Next touch завтра</div></div>
            <span class="lead-score ${scoreClass(l.score)}">${l.score}</span>
          </div>
        `).join('')}
      </div>`;
  },

  // ---------- OUTREACH ----------
  outreach: () => `
    <div class="screen">
      <div class="head-row"><h2>Аутрич</h2></div>
      <div class="section-title">Запуск кампании</div>
      <div class="list-item" data-action="goto-accounts">
        <div class="list-ico" data-pix="phone"></div>
        <div class="list-text"><div class="list-title">TG-аккаунты</div><div class="list-sub" id="accounts-summary">Загружаю…</div></div>
        <div class="list-arrow">›</div>
      </div>
      <div class="list-item" data-action="goto-lists">
        <div class="list-ico" data-pix="users"></div>
        <div class="list-text"><div class="list-title">Списки лидов</div><div class="list-sub" id="lists-summary">Загружаю…</div></div>
        <div class="list-arrow">›</div>
      </div>
      <div class="list-item" data-action="goto-templates">
        <div class="list-ico" data-pix="mail"></div>
        <div class="list-text"><div class="list-title">Шаблоны и AI</div><div class="list-sub" id="templates-summary">Загружаю…</div></div>
        <div class="list-arrow">›</div>
      </div>
      <div class="list-item" data-action="goto-campaigns">
        <div class="list-ico" data-pix="broadcast"></div>
        <div class="list-text"><div class="list-title">Кампании</div><div class="list-sub" id="campaigns-summary">Загружаю…</div></div>
        <div class="list-arrow">›</div>
      </div>
      <div class="section-title">Инструменты</div>
      <div class="list-item" data-action="parse-group">
        <div class="list-ico" data-pix="lightning"></div>
        <div class="list-text"><div class="list-title">Парсер чатов</div><div class="list-sub">Собрать участников Telegram-чата</div></div>
        <div class="list-arrow">›</div>
      </div>
      <div class="list-item" data-action="find-groups">
        <div class="list-ico" data-pix="search"></div>
        <div class="list-text"><div class="list-title">Поиск чатов</div><div class="list-sub">По ключевым словам в сообщениях</div></div>
        <div class="list-arrow">›</div>
      </div>
      <div class="section-title">CRM</div>
      <div class="list-item" data-action="goto-deals">
        <div class="list-ico" data-pix="briefcase"></div>
        <div class="list-text"><div class="list-title">Сделки</div><div class="list-sub">Pipeline по лидам с values и close-date</div></div>
        <div class="list-arrow">›</div>
      </div>
      <div class="list-item" data-action="goto-kb">
        <div class="list-ico" data-pix="brain"></div>
        <div class="list-text"><div class="list-title">База знаний</div><div class="list-sub">Canned-ответы для AI: цена, безопасность, конкуренты</div></div>
        <div class="list-arrow">›</div>
      </div>
      <div class="list-item" data-action="goto-analytics">
        <div class="list-ico" data-pix="analytics"></div>
        <div class="list-text"><div class="list-title">Аналитика</div><div class="list-sub">Reply rate по шаблонам и аккаунтам</div></div>
        <div class="list-arrow">›</div>
      </div>
      <div class="list-item" data-action="goto-stoplist">
        <div class="list-ico" data-pix="ban"></div>
        <div class="list-text"><div class="list-title">Стоп-лист</div><div class="list-sub">Лиды, которым НЕ слать (opt-out)</div></div>
        <div class="list-arrow">›</div>
      </div>
    </div>
  `,

  // ---------- ACCOUNTS ----------
  accounts: (st) => {
    const accs = st?.accounts ?? [];
    const stats = st?.stats || {};
    return `
      <div class="screen">
        <div class="head-row"><h2>TG-аккаунты</h2></div>
        ${accs.length === 0 ? `
          <div class="empty">
            <div class="empty-ico" data-pix="phone"></div>
            <div class="empty-title">Подключите первый аккаунт</div>
            <div>Нужен номер с активным Telegram. Можно добавить прокси.</div>
            <button class="btn" style="margin-top:16px" data-action="add-account">Подключить аккаунт</button>
          </div>
        ` : accs.map(a => {
          const st = stats[a.id] || {};
          const isReauth = a.status === 'needs_reauth';
          const dotColor = a.status === 'active' ? 'green' : isReauth ? 'orange' : 'orange';
          const badgeClass = a.status === 'active' ? 'cold' : isReauth ? 'hot' : 'warm';
          const badgeText  = isReauth ? '⚠ переавтор' : a.status;
          return `
          <div class="card" data-action="open-account" data-id="${a.id}" ${isReauth?'style="border-left:3px solid #ef4444"':''}>
            <div class="card-row">
              <div style="display:flex;gap:12px;align-items:center;flex:1;min-width:0">
                <div class="avatar ${dotColor}">${initials(a.first_name || a.phone)}</div>
                <div class="lead-body">
                  <div class="lead-name">${escape(a.first_name || a.phone)}${a.username ? ` <span style="color:var(--text-muted);font-weight:400">@${escape(a.username)}</span>` : ''}</div>
                  <div class="lead-status">${escape(a.phone)}${a.proxy ? ' · proxy ✓' : ''}</div>
                </div>
              </div>
              <span class="lead-score ${badgeClass}">${badgeText}</span>
            </div>
            <div style="display:flex;gap:14px;font-size:12px;color:var(--text-muted);margin-top:10px;padding-top:10px;border-top:1px solid var(--border)">
              <span>Сегодня: <b style="color:var(--text)">${a.sent_today}/${a.daily_limit}</b></span>
              <span>Всего: <b style="color:var(--text)">${st.sent_total ?? '—'}</b></span>
              <span>Ответов: <b style="color:var(--text)">${st.replied ?? '—'}</b></span>
              <span>Диалогов: <b style="color:var(--text)">${st.conversations ?? '—'}</b></span>
            </div>
          </div>
        `;}).join('')}
        ${accountsFabHTML()}
      </div>`;
  },

  // ---------- ACCOUNT DETAIL ----------
  account_detail: (st) => {
    const a = st.account || {};
    const stat = st.stat || {};
    return `
      <div class="screen">
        <div class="head-row"><h2 style="font-size:18px">${escape(a.first_name || a.phone)}</h2></div>
        <div class="card">
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
            <div class="avatar ${a.status === 'active' ? 'green' : 'orange'}" style="width:56px;height:56px;font-size:22px">${initials(a.first_name || a.phone)}</div>
            <div>
              <div style="font-weight:600;font-size:18px">${escape(a.first_name || '')} ${a.username ? `<span style="color:var(--text-muted);font-weight:400">@${escape(a.username)}</span>` : ''}</div>
              <div style="font-size:13px;color:var(--text-muted)">${escape(a.phone)}</div>
            </div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px">
            <div><div style="font-size:11px;color:var(--text-muted)">Сегодня</div><div style="font-weight:600">${a.sent_today}/${a.daily_limit}</div></div>
            <div><div style="font-size:11px;color:var(--text-muted)">Всего отправлено</div><div style="font-weight:600">${stat.sent_total ?? '—'}</div></div>
            <div><div style="font-size:11px;color:var(--text-muted)">Ответов</div><div style="font-weight:600">${stat.replied ?? '—'}</div></div>
            <div><div style="font-size:11px;color:var(--text-muted)">Диалогов</div><div style="font-weight:600">${stat.conversations ?? '—'}</div></div>
          </div>
        </div>

        <div class="section-title">Настройки</div>
        <div class="card">
          <label style="font-size:12px;color:var(--text-muted)">Дневной лимит сообщений</label>
          <input id="ad-limit" type="number" min="1" max="200" value="${a.daily_limit}"
                 style="width:100%;padding:10px 12px;border:1px solid var(--border);border-radius:8px;background:var(--bg);color:var(--text);font-size:14px;margin-top:4px">
          <label style="font-size:12px;color:var(--text-muted);margin-top:12px;display:block">Прокси</label>
          <input id="ad-proxy" placeholder="socks5://..." value="${escape(a.proxy || '')}"
                 style="width:100%;padding:10px 12px;border:1px solid var(--border);border-radius:8px;background:var(--bg);color:var(--text);font-size:13px;margin-top:4px">
        </div>

        <div class="section-title">⏰ Расписание отправки</div>
        ${scheduleEditorHTML(a.schedule)}

        <div class="section-title">🔥 Warmup (анти-спам)</div>
        <div class="card">
          <label style="display:flex;align-items:center;gap:12px;cursor:pointer">
            <input id="ad-warmup" type="checkbox" ${a.warmup_enabled?'checked':''} style="width:20px;height:20px">
            <div style="flex:1">
              <div style="font-weight:500">Включить warmup</div>
              <div style="font-size:12px;color:var(--text-muted)">Каждые 30 мин этот акк будет обмениваться короткими сообщениями с другими вашими warmup-аккаунтами. Telegram воспринимает это как живой юзер — снижает риск попасть в спам.</div>
            </div>
          </label>
          <div style="font-size:11px;color:var(--text-muted);margin-top:10px;padding-top:10px;border-top:1px solid var(--border)">
            ⚠️ Нужно минимум 2 акка с включённым warmup — иначе общаться не с кем.
          </div>
        </div>

        <div class="section-title">✨ Auto-reply (AI отвечает за вас)</div>
        <div class="card">
          <label style="display:flex;align-items:center;gap:12px;cursor:pointer">
            <input id="ad-autoreply" type="checkbox" ${a.auto_reply_enabled?'checked':''} style="width:20px;height:20px">
            <div style="flex:1">
              <div style="font-weight:500">Включить авто-ответы</div>
              <div style="font-size:12px;color:var(--text-muted)">Когда лид пишет в этот акк, Claude через 8-25 секунд (как живой человек) сгенерит и отправит ответ.</div>
            </div>
          </label>
          <label style="font-size:12px;color:var(--text-muted);margin-top:12px;display:block">Промпт для AI (правила ответа)</label>
          <textarea id="ad-autoprompt" rows="6" placeholder="Ты sales BitOK..."
                    style="width:100%;padding:10px 12px;border:1px solid var(--border);border-radius:8px;background:var(--bg);color:var(--text);font-size:13px;margin-top:4px;font-family:inherit;resize:vertical">${escape(a.auto_reply_prompt || 'Ты sales BitOK (AML/KYT для крипто-бизнесов). Отвечай коротко, на ты, по делу. Если спрашивают про цену — предложи созвон 15 мин. Если возражения — отрабатывай мягко. Без эмодзи и воды.')}</textarea>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px">
            <div>
              <label style="font-size:11px;color:var(--text-muted)">Макс ответов в одном треде</label>
              <input id="ad-bot-max" type="number" min="1" max="50" value="${a.bot_max_per_thread || 5}"
                     style="width:100%;padding:8px 10px;border:1px solid var(--border);border-radius:6px;background:var(--bg);color:var(--text);font-size:13px;margin-top:2px">
            </div>
            <div>
              <label style="font-size:11px;color:var(--text-muted)">Лимит ответов в час (с этого акка)</label>
              <input id="ad-bot-rate" type="number" min="1" max="200" value="${a.bot_rate_limit_hour || 10}"
                     style="width:100%;padding:8px 10px;border:1px solid var(--border);border-radius:6px;background:var(--bg);color:var(--text);font-size:13px;margin-top:2px">
            </div>
          </div>
          <div style="font-size:11px;color:var(--text-muted);margin-top:8px">⚙️ После лимита в треде — бот молчит, эскалация в @crm_outreach_bot. Stop-words (договор/контракт/legal) → пауза мгновенно. Negative/objection → пауза. Booking-фразы (давай созвон/демо) → шлёт твою Calendly без LLM.</div>
        </div>
        ${a.status === 'needs_reauth' ? `
          <div class="card" style="background:#fee2e2;color:#991b1b;font-size:13px;margin-bottom:8px">
            ⚠️ Сессия инвалидирована Telegram. ${a.last_error ? escape(a.last_error) : ''}
          </div>
          <button class="btn full" style="margin-top:0;background:#ef4444" data-action="account-reauth" data-id="${a.id}" data-phone="${escape(a.phone)}" data-proxy="${escape(a.proxy || '')}">🔄 Реавторизовать</button>
        ` : ''}
        <button class="btn full" style="margin-top:8px" data-action="account-save" data-id="${a.id}">Сохранить</button>
        ${a.status === 'active'
          ? `<button class="btn full secondary" style="margin-top:8px" data-action="account-toggle" data-id="${a.id}" data-to="paused">⏸ Поставить на паузу</button>`
          : a.status !== 'needs_reauth' ? `<button class="btn full secondary" style="margin-top:8px" data-action="account-toggle" data-id="${a.id}" data-to="active">▶ Активировать</button>` : ''
        }
        <button class="btn full secondary" style="margin-top:8px;color:#ef4444" data-action="account-delete" data-id="${a.id}">Удалить из CRM</button>
      </div>`;
  },

  // ---------- CAMPAIGN DETAIL ----------
  campaign_detail: (st) => {
    const c = st.campaign || {};
    const items = st.items || [];
    const filter = st.filter || 'all';
    const counts = { sent: 0, queued: 0, sending: 0, failed: 0, skipped: 0 };
    items.forEach(i => { counts[i.status] = (counts[i.status] || 0) + 1; });
    const filtered = filter === 'all' ? items : items.filter(i => i.status === filter);
    return `
      <div class="screen">
        <div class="head-row"><h2 style="font-size:18px">${escape(c.name)}</h2></div>
        <div class="card">
          <div class="card-row">
            <div style="font-size:13px;color:var(--text-muted)">Статус</div>
            <span class="campaign-status ${c.status}">${c.status}</span>
          </div>
          <div style="display:flex;gap:6px;margin-top:10px">
            ${c.status === 'live' ?
              `<button class="btn secondary" style="flex:1;padding:8px" data-action="campaign-control" data-id="${c.id}" data-act="pause">⏸ Пауза</button>` :
              `<button class="btn" style="flex:1;padding:8px" data-action="campaign-control" data-id="${c.id}" data-act="start">▶ Старт</button>`
            }
            <button class="btn secondary" style="flex:1;padding:8px;color:#ef4444" data-action="campaign-control" data-id="${c.id}" data-act="stop">⏹ Стоп</button>
          </div>
          <button class="btn secondary full" style="margin-top:8px;background:#fee2e2;color:#991b1b;border-color:#fecaca" data-action="campaign-delete" data-id="${c.id}" data-name="${escape(c.name)}">🗑 Удалить кампанию</button>
        </div>

        <div class="stage-strip">
          <div class="stage-chip ${filter==='all'?'active':''}" data-cd-filter="all">Все · ${items.length}</div>
          <div class="stage-chip ${filter==='queued'?'active':''}" data-cd-filter="queued">В очереди · ${counts.queued||0}</div>
          <div class="stage-chip ${filter==='sent'?'active':''}" data-cd-filter="sent">Отправлено · ${counts.sent||0}</div>
          <div class="stage-chip ${filter==='failed'?'active':''}" data-cd-filter="failed">Сбои · ${counts.failed||0}</div>
          <div class="stage-chip ${filter==='skipped'?'active':''}" data-cd-filter="skipped">Пропущено · ${counts.skipped||0}</div>
        </div>

        ${filtered.length === 0 ? '<div class="empty"><div class="empty-title">Нет записей</div></div>' :
          filtered.slice(0, 100).map(i => `
            <div class="card" style="padding:10px 12px">
              <div class="card-row">
                <div style="flex:1;min-width:0">
                  <div style="font-weight:600;font-size:14px">${escape(i.full_name || i.company || i.username || '?')}</div>
                  <div style="font-size:12px;color:var(--text-muted)">${i.username?'@'+escape(i.username):''}${i.company?' · '+escape(i.company):''}</div>
                  ${i.rendered ? `<div style="font-size:11px;color:var(--text-muted);margin-top:4px;font-style:italic">"${escape(i.rendered).slice(0,80)}…"</div>` : ''}
                  ${i.error ? `<div style="font-size:11px;color:#ef4444;margin-top:4px">${escape(i.error)}</div>` : ''}
                </div>
                <span class="lead-score ${i.status==='sent'?'cold':i.status==='failed'?'hot':'warm'}">${escape(i.status)}</span>
              </div>
            </div>
          `).join('')
        }
      </div>`;
  },

  // ---------- ADD ACCOUNT ----------
  add_account: (st) => {
    const step = st?.step || 'phone';
    if (step === 'phone') return `
      <div class="screen">
        <div class="head-row"><h2>Подключить аккаунт</h2></div>
        <div class="card">
          <label style="font-size:13px;color:var(--text-muted)">Номер телефона</label>
          <input id="f-phone" type="tel" placeholder="+33 7 73 19 47 71" value="${escape(st?.phone || '')}"
                 style="width:100%;padding:12px 14px;border:1px solid var(--border);border-radius:10px;background:var(--bg);color:var(--text);font-size:16px;margin-top:6px">
          <label style="font-size:13px;color:var(--text-muted);margin-top:14px;display:block">Прокси (необязательно)</label>
          <input id="f-proxy" type="text" placeholder="socks5://user:pass@host:port" value="${escape(st?.proxy || '')}"
                 style="width:100%;padding:12px 14px;border:1px solid var(--border);border-radius:10px;background:var(--bg);color:var(--text);font-size:14px;margin-top:6px">
        </div>
        <button class="btn full" data-action="account-send-code" style="margin-top:8px">Отправить код</button>
        <button class="btn full secondary" data-action="back-to-accounts" style="margin-top:8px">Отмена</button>
      </div>`;
    if (step === 'code') return `
      <div class="screen">
        <div class="head-row"><h2>Код из Telegram</h2></div>
        <div class="card">
          <div style="font-size:13px;color:var(--text-muted);margin-bottom:10px">Код отправлен на ${escape(st.phone)}</div>
          <input id="f-code" type="text" inputmode="numeric" placeholder="12345" maxlength="6" autofocus
                 style="width:100%;padding:14px;border:1px solid var(--border);border-radius:10px;background:var(--bg);color:var(--text);font-size:22px;text-align:center;letter-spacing:8px">
        </div>
        <button class="btn full" data-action="account-verify" style="margin-top:8px">Подтвердить</button>
        <button class="btn full secondary" data-action="back-to-accounts" style="margin-top:8px">Отмена</button>
      </div>`;
    if (step === 'password') return `
      <div class="screen">
        <div class="head-row"><h2>Пароль 2FA</h2></div>
        <div class="card">
          <div style="font-size:13px;color:var(--text-muted);margin-bottom:10px">У этого аккаунта включена двухфакторная защита</div>
          <input id="f-password" type="password" placeholder="облачный пароль" autofocus
                 style="width:100%;padding:14px;border:1px solid var(--border);border-radius:10px;background:var(--bg);color:var(--text);font-size:16px">
        </div>
        <button class="btn full" data-action="account-verify-2fa" style="margin-top:8px">Войти</button>
        <button class="btn full secondary" data-action="back-to-accounts" style="margin-top:8px">Отмена</button>
      </div>`;
  },

  // ---------- LISTS ----------
  lists: (st) => {
    const lists = st?.lists ?? [];
    return `
      <div class="screen">
        <div class="head-row"><h2>Списки лидов</h2><button class="add-btn" data-action="upload-csv" title="Загрузить CSV с лидами (имя, username, телефон, заметки)">+</button></div>
        ${lists.length === 0 ? `
          <div class="empty">
            <div class="empty-ico" data-pix="users"></div>
            <div class="empty-title">Нет списков</div>
            <div>Загрузите CSV или создайте пустой и добавляйте лидов руками</div>
            <div style="display:flex;gap:6px;margin-top:16px;justify-content:center">
              <button class="btn" data-action="upload-csv">📂 Загрузить CSV</button>
              <button class="btn secondary" data-action="create-empty-list">＋ Пустой список</button>
            </div>
            <div style="margin-top:24px;font-size:12px;color:var(--text-muted);text-align:left">
              <b>Формат CSV:</b><br>
              <code style="display:block;background:var(--bg-secondary);padding:10px;border-radius:8px;margin-top:6px;text-align:left;font-size:11px">tg_username,company,first_message,status</code>
            </div>
          </div>
        ` : lists.map(l => `
          <div class="lead" data-action="open-list" data-id="${l.id}">
            <div class="avatar blue">▤</div>
            <div class="lead-body">
              <div class="lead-name">${escape(l.name)}</div>
              <div class="lead-status">${l.count} лидов · источник: ${escape(l.source)}</div>
            </div>
            <span class="lead-score cold">${l.count}</span>
          </div>
        `).join('')}
        <div style="display:flex;gap:6px;margin-top:12px">
          <button class="btn" style="flex:1" data-action="upload-csv">📂 CSV</button>
          <button class="btn secondary" style="flex:1" data-action="create-empty-list">＋ Пустой список</button>
        </div>
        <div class="card" style="margin-top:16px;background:linear-gradient(135deg,#dbeafe,#e0e7ff)">
          <div style="font-size:13px;color:#1e3a8a">
            💡 <b>Лайфхак:</b> перешлите любое сообщение боту <b>@crm_outreach_bot</b> — он добавит автора в выбранный список.
          </div>
        </div>
      </div>`;
  },

  // ---------- MONDAY IMPORT ----------
  monday_import: (st) => {
    const stages = ['Initial Contact','Trial Activated','Testnet','Objection handling','Winback','Paid','Active Partner'];
    const selected = st?.selected_stages || ['Trial Activated','Objection handling','Initial Contact'];
    const status = st?.status || null;
    return `
      <div class="screen">
        <div class="head-row"><h2 style="font-size:18px">Импорт из Monday</h2></div>
        <div class="card">
          <label style="font-size:12px;color:var(--text-muted)">ID борда</label>
          <input id="md-board" value="${escape(st?.board_id || '9027825117')}"
                 style="width:100%;padding:10px 12px;border:1px solid var(--border);border-radius:8px;background:var(--bg);color:var(--text);font-size:14px;margin-top:4px">
          <label style="font-size:12px;color:var(--text-muted);margin-top:12px;display:block">Название нового списка</label>
          <input id="md-name" value="${escape(st?.list_name || 'Из Monday — ' + new Date().toISOString().slice(0,10))}"
                 style="width:100%;padding:10px 12px;border:1px solid var(--border);border-radius:8px;background:var(--bg);color:var(--text);font-size:14px;margin-top:4px">
          <label style="font-size:12px;color:var(--text-muted);margin-top:12px;display:block">Какие стейджи импортировать</label>
          <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:6px" id="md-stages">
            ${stages.map(s => `
              <div class="stage-chip ${selected.includes(s)?'active':''}" data-md-stage="${escape(s)}">${escape(s)}</div>
            `).join('')}
          </div>
        </div>
        <button class="btn full" style="margin-top:8px" data-action="monday-import-go">Импортировать</button>
        ${status ? `<div class="card" style="margin-top:8px;${status.error?'color:#ef4444':''}">${escape(status.message)}</div>` : ''}
        <div style="margin-top:16px;font-size:11px;color:var(--text-muted);text-align:center">
          Импортируются только лиды с TG-username в поле Contact Person.<br>
          Если ничего не импортируется — проверьте MONDAY_TOKEN в .env бэкенда.
        </div>
      </div>`;
  },

  // ---------- CAMPAIGNS LIST ----------
  campaigns: (st) => {
    const camps = st?.campaigns ?? [];
    const lists = st?.lists ?? [];
    const tmpls = st?.templates ?? [];
    const accs  = st?.accounts ?? [];
    const canCreate = lists.length && tmpls.length && accs.length;
    return `
      <div class="screen">
        <div class="head-row"><h2>Кампании</h2><button class="add-btn" data-action="campaign-new" ${canCreate?'':'disabled style="opacity:.4"'} title="Создать кампанию рассылки: список + шаблон + аккаунты + расписание">+</button></div>
        ${!canCreate ? `
          <div class="card" style="background:#fef3c7;color:#92400e;font-size:13px">
            Чтобы создать кампанию, нужно: ${!lists.length?'список лидов, ':''}${!tmpls.length?'шаблон, ':''}${!accs.length?'аккаунт':''}
          </div>
        ` : ''}
        ${camps.length === 0 ? `
          <div class="empty"><div class="empty-ico" data-pix="mail"></div>
            <div class="empty-title">Нет кампаний</div>
            <div>Запустите первую — выберите список, шаблон и аккаунты</div>
            ${canCreate?'<button class="btn" style="margin-top:16px" data-action="campaign-new">Создать кампанию</button>':''}
          </div>
        ` : camps.map(c => {
          const ll = lists.find(x=>x.id===c.list_id);
          const total = ll?.count || 0;
          const pct = total ? Math.round(c.sent / total * 100) : 0;
          return `
          <div class="card">
            <div class="card-row" data-action="open-campaign" data-id="${c.id}" style="cursor:pointer">
              <div class="card-title">${escape(c.name)}${c.type==='dynamic'?' <span style="font-size:11px;color:var(--accent);font-weight:500">↻ dyn</span>':''}${c.template_id_b?' <span style="font-size:11px;color:#f59e0b;font-weight:500">A/B</span>':''}</div>
              <span class="campaign-status ${c.status}">${c.auto_paused?'🔥 auto-pause':c.status}</span>
            </div>
            ${c.auto_paused ? '<div style="font-size:11px;color:#b91c1c;margin-top:4px">⚠ Sender приостановил — reply rate ниже порога. Проверь шаблон.</div>' : ''}
            <div class="progress" style="margin-top:10px"><div class="progress-bar" style="width:${pct}%"></div></div>
            <div class="campaign-meta">
              <span>Отправлено: <b>${c.sent}/${total}</b></span>
              <span>Ответили: <b>${c.replied}</b></span>
              <span>Сбоев: <b>${c.failed}</b></span>
            </div>
            <div style="display:flex;gap:6px;margin-top:10px">
              ${c.status === 'live' ?
                `<button class="btn secondary" style="flex:1;padding:8px" data-action="campaign-control" data-id="${c.id}" data-act="pause">⏸ Пауза</button>` :
                `<button class="btn" style="flex:1;padding:8px" data-action="campaign-control" data-id="${c.id}" data-act="start">▶ Старт</button>`
              }
              <button class="btn secondary" style="flex:1;padding:8px" data-action="open-campaign" data-id="${c.id}">📊</button>
              <button class="btn secondary" style="flex:1;padding:8px" data-action="campaign-clone" data-id="${c.id}" title="Клонировать">🔁</button>
              <button class="btn secondary" style="flex:1;padding:8px;color:#ef4444" data-action="campaign-control" data-id="${c.id}" data-act="stop" title="Стоп">⏹</button>
              <button class="btn secondary" style="flex:1;padding:8px;color:#ef4444" data-action="campaign-delete" data-id="${c.id}" data-name="${escape(c.name)}" title="Удалить">🗑</button>
            </div>
          </div>`;
        }).join('')}
      </div>`;
  },

  // ---------- CAMPAIGN WIZARD ----------
  campaign_wizard: (st) => {
    const step = st?.step || 1;
    const lists = st?.lists ?? [];
    const tmpls = st?.templates ?? [];
    const accs  = st?.accounts ?? [];
    const data  = st?.data || {};
    const stepDots = [1,2,3,4,5].map(n =>
      `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${n<=step?'var(--accent)':'var(--border)'};margin-right:6px"></span>`
    ).join('');
    if (step === 1) {
      const typ = data.type || 'one_shot';
      const allStatuses = window.LEAD_STATUSES || [];
      const pickedStatuses = new Set((data.filter_config?.statuses) || []);
      return `
      <div class="screen">
        <div class="head-row"><h2 style="font-size:18px">Новая кампания · 1/5</h2></div>
        <div style="margin-bottom:14px">${stepDots}</div>

        <div class="section-title">Тип</div>
        <div class="card" data-action="cw-pick-type" data-type="one_shot" style="cursor:pointer;${typ==='one_shot'?'border:2px solid var(--accent)':''}">
          <div class="card-row">
            <div>
              <div style="font-weight:600">${typ==='one_shot'?'◉':'○'} Одноразовая</div>
              <div style="font-size:12px;color:var(--text-muted);margin-top:4px">Снимок списка на момент запуска. Новые лиды добавлять руками.</div>
            </div>
          </div>
        </div>
        <div class="card" data-action="cw-pick-type" data-type="dynamic" style="cursor:pointer;${typ==='dynamic'?'border:2px solid var(--accent)':''}">
          <div class="card-row">
            <div>
              <div style="font-weight:600">${typ==='dynamic'?'◉':'○'} Динамическая</div>
              <div style="font-size:12px;color:var(--text-muted);margin-top:4px">Все лиды из списка, удовлетворяющие фильтру, авто-добавляются в кампанию.</div>
            </div>
          </div>
        </div>

        <div class="section-title">Название</div>
        <input id="cw-name" value="${escape(data.name || 'Кампания ' + new Date().toISOString().slice(0,10))}"
               style="width:100%;padding:12px 14px;border:1px solid var(--border);border-radius:10px;background:var(--bg);color:var(--text);font-size:15px">

        <div class="section-title">Источник лидов</div>
        <div style="display:flex;gap:6px;margin-bottom:10px">
          <button class="btn secondary" style="flex:1;padding:10px;font-size:13px" data-action="cw-source-csv">📂 CSV</button>
          <button class="btn secondary" style="flex:1;padding:10px;font-size:13px" data-action="cw-source-folder">📁 ТГ-папка</button>
          <button class="btn secondary" style="flex:1;padding:10px;font-size:13px" data-action="cw-source-leads">📋 Из CRM</button>
        </div>

        <div class="section-title">Список лидов ${data.list_id?'✓':''}</div>
        ${lists.length === 0 ? '<div class="card" style="font-size:13px;color:var(--text-muted)">Пока нет списков. Загрузите CSV или импортируйте папку выше.</div>' : lists.map(l => `
          <div class="lead" data-action="cw-pick-list" data-id="${l.id}" style="${data.list_id===l.id?'border:2px solid var(--accent)':''}">
            <div class="avatar blue">▤</div>
            <div class="lead-body"><div class="lead-name">${escape(l.name)}</div><div class="lead-status">${l.count} лидов · ${escape(l.source)}</div></div>
            ${data.list_id===l.id ? '<span style="color:var(--accent);font-size:18px">✓</span>' : ''}
          </div>
        `).join('')}

        ${typ === 'dynamic' ? `
          <div class="section-title">Фильтр по статусу (опционально)</div>
          <div style="font-size:12px;color:var(--text-muted);margin-bottom:8px">Только лиды с выбранными статусами попадут в кампанию. Если ничего не выбрать — все.</div>
          <div class="stage-strip">
            ${allStatuses.map(s => `
              <div class="stage-chip ${pickedStatuses.has(s)?'active':''}" data-action="cw-toggle-status" data-status="${escape(s)}">${escape(s)}</div>
            `).join('')}
          </div>
        ` : ''}

        <button class="btn full" style="margin-top:8px" data-action="cw-next" data-from="1">Далее</button>
      </div>`;
    }
    if (step === 2) {
      const abMode = !!data.ab_mode;
      return `
      <div class="screen">
        <div class="head-row"><h2 style="font-size:18px">Шаблон · 2/5</h2></div>
        <div style="margin-bottom:14px">${stepDots}</div>
        <label style="display:flex;align-items:center;gap:8px;margin-bottom:10px;cursor:pointer">
          <input type="checkbox" id="cw-ab" ${abMode?'checked':''} onchange="window.__cwToggleAb(this.checked)" style="width:18px;height:18px">
          <div>
            <div style="font-weight:500;font-size:14px">A/B-тест: 2 варианта 50/50</div>
            <div style="font-size:11px;color:var(--text-muted)">Sender раскидает оба текста поровну. Аналитика покажет какой работает лучше.</div>
          </div>
        </label>
        ${abMode ? `<div style="font-size:12px;color:var(--accent);font-weight:600;margin-bottom:6px">A — основной</div>` : ''}
        ${tmpls.map(t => `
          <div class="card" data-action="cw-pick-template" data-id="${t.id}" style="${data.template_id===t.id?'border:2px solid var(--accent)':''}">
            <div class="card-row">
              <div class="card-title">${escape(t.name)} ${data.template_id===t.id?'<span style="color:var(--accent);font-size:11px">A</span>':''}${data.template_id_b===t.id?'<span style="color:#f59e0b;font-size:11px">B</span>':''}</div>
              ${(data.template_id===t.id||data.template_id_b===t.id) ? '<span style="color:var(--accent);font-size:18px">✓</span>' : ''}
            </div>
            <div style="font-size:13px;color:var(--text-muted);margin-top:6px">${escape((t.body || '').slice(0,140))}…</div>
          </div>
        `).join('')}
        ${abMode ? `
          <div style="font-size:12px;color:#f59e0b;font-weight:600;margin:12px 0 6px">B — вариант (выбери второй шаблон)</div>
          ${tmpls.filter(t => t.id !== data.template_id).map(t => `
            <div class="card" data-action="cw-pick-template-b" data-id="${t.id}" style="${data.template_id_b===t.id?'border:2px solid #f59e0b':''}">
              <div class="card-row">
                <div class="card-title">${escape(t.name)}</div>
                ${data.template_id_b===t.id ? '<span style="color:#f59e0b;font-size:18px">✓</span>' : ''}
              </div>
              <div style="font-size:13px;color:var(--text-muted);margin-top:6px">${escape((t.body || '').slice(0,140))}…</div>
            </div>
          `).join('')}
        ` : ''}
        <div style="display:flex;gap:6px;margin-top:8px">
          <button class="btn secondary" style="flex:1" data-action="cw-back" data-from="2">Назад</button>
          <button class="btn" style="flex:1" data-action="cw-next" data-from="2">Далее</button>
        </div>
      </div>`;
    }
    if (step === 3) {
      // Цепочка касаний — 5 follow-up'ов с фиксированными задержками
      const labels = ['Через 1 день', 'Через 2 дня', 'Через 3 дня', 'Через неделю', 'Через 2 недели'];
      const fus = data.followups || [];
      const get = (i) => (fus.find(f => f.step_idx === i+1)?.body) || '';
      return `
      <div class="screen">
        <div class="head-row"><h2 style="font-size:18px">Цепочка касаний · 3/5</h2></div>
        <div style="margin-bottom:14px">${stepDots}</div>
        <div class="card" style="background:#dbeafe;color:#1e3a8a;font-size:12px;padding:10px 12px">
          💡 Если лид не ответил на первое сообщение, эти follow-up'ы уйдут автоматически. Ответил на любом — цепочка останавливается. Пустое поле = шаг пропускается.
        </div>
        ${labels.map((lbl, i) => `
          <div style="margin-top:12px">
            <label style="font-size:12px;color:var(--text-muted);font-weight:600">${escape(lbl)}</label>
            <textarea data-fu-step="${i+1}" rows="3" placeholder="Текст follow-up #${i+1} (необязательно)"
              style="width:100%;padding:10px 12px;border:1px solid var(--border);border-radius:8px;background:var(--bg);color:var(--text);font-size:13px;margin-top:4px;font-family:inherit;resize:vertical">${escape(get(i))}</textarea>
          </div>
        `).join('')}
        <div style="font-size:11px;color:var(--text-muted);margin-top:8px">Переменные {{first_name}}, {{full_name}}, {{username}}, {{company}} и spintax {{a|b|c}} работают так же как в шаблонах.</div>
        <div style="display:flex;gap:6px;margin-top:8px">
          <button class="btn secondary" style="flex:1" data-action="cw-back" data-from="3">Назад</button>
          <button class="btn" style="flex:1" data-action="cw-next" data-from="3">Далее</button>
        </div>
      </div>`;
    }
    if (step === 4) {
      const picked = data.account_ids || [];
      return `
      <div class="screen">
        <div class="head-row"><h2 style="font-size:18px">Аккаунты · 4/5</h2></div>
        <div style="margin-bottom:14px">${stepDots}</div>
        <div style="font-size:13px;color:var(--text-muted);margin-bottom:8px">Выберите аккаунты для рассылки. Сообщения распределятся round-robin.</div>
        ${accs.map(a => {
          const on = picked.includes(a.id);
          return `
          <div class="lead" data-action="cw-toggle-acc" data-id="${a.id}" style="${on?'border:2px solid var(--accent)':''}">
            <div class="avatar ${a.status==='active'?'green':'orange'}">${initials(a.first_name||a.phone)}</div>
            <div class="lead-body">
              <div class="lead-name">${escape(a.first_name||a.phone)}</div>
              <div class="lead-status">${escape(a.phone)} · ${a.daily_limit}/день</div>
            </div>
            <span style="font-size:18px;color:${on?'var(--accent)':'var(--text-muted)'}">${on?'☑':'☐'}</span>
          </div>`;
        }).join('')}
        <div style="display:flex;gap:6px;margin-top:8px">
          <button class="btn secondary" style="flex:1" data-action="cw-back" data-from="4">Назад</button>
          <button class="btn" style="flex:1" data-action="cw-next" data-from="4">Далее</button>
        </div>
      </div>`;
    }
    if (step === 5) {
      const ll = lists.find(l=>l.id===data.list_id);
      const tt = tmpls.find(t=>t.id===data.template_id);
      const aa = accs.filter(a=>(data.account_ids||[]).includes(a.id));
      const totalCap = aa.reduce((s,a)=>s+a.daily_limit,0);
      const days = totalCap ? Math.ceil((ll?.count||0) / totalCap) : '∞';
      const fuCount = (data.followups || []).filter(f => (f.body || '').trim()).length;
      return `
      <div class="screen">
        <div class="head-row"><h2 style="font-size:18px">Подтверждение · 5/5</h2></div>
        <div style="margin-bottom:14px">${stepDots}</div>
        <div class="card">
          <div class="card-row"><div class="card-title">${escape(data.name)}</div>
            <span class="lead-score ${data.type==='dynamic'?'warm':'cold'}">${data.type==='dynamic'?'динамическая':'одноразовая'}</span>
          </div>
          <div style="font-size:13px;color:var(--text-muted);margin-top:10px;line-height:1.7">
            <div>📋 Список: <b style="color:var(--text)">${escape(ll?.name||'?')}</b> (${ll?.count||0} лидов)</div>
            ${data.type==='dynamic' && (data.filter_config?.statuses||[]).length ? `<div>🔎 Фильтр: <b style="color:var(--text)">${(data.filter_config.statuses).map(escape).join(', ')}</b></div>` : ''}
            <div>✉ Шаблон: <b style="color:var(--text)">${escape(tt?.name||'?')}</b></div>
            <div>⚇ Аккаунтов: <b style="color:var(--text)">${aa.length}</b> · общий капасити <b style="color:var(--text)">${totalCap}/день</b></div>
            <div>⏱ Расчётно займёт: <b style="color:var(--text)">~${days} ${typeof days==='number' && days===1?'день':'дней'}</b></div>
            <div>↪ Цепочка касаний: <b style="color:var(--text)">${fuCount} follow-up${fuCount===1?'':'ов'}</b>${fuCount?' (1, 2, 3, 7, 14 дней)':' — без follow-up'}</div>
            ${data.type==='dynamic' ? `<div style="margin-top:6px;color:var(--accent)">↻ Новые лиды из списка будут добавляться в кампанию автоматически</div>` : ''}
          </div>
        </div>
        <button class="btn full secondary" style="margin-top:8px" data-action="cw-test-send">🧪 Сначала тест себе</button>
        <button class="btn full" style="margin-top:8px" data-action="cw-create-and-start">Создать и запустить</button>
        <button class="btn full secondary" style="margin-top:8px" data-action="cw-create-only">Создать как draft</button>
        <button class="btn full secondary" style="margin-top:8px" data-action="cw-back" data-from="4">Назад</button>
      </div>`;
    }
  },

  // ---------- LIST DETAIL (с таблицей лидов и фильтром по статусу + поиском) ----------
  list_detail: (st) => {
    const leads = st?.leads ?? [];
    const filter = st?.filter || 'all';
    const q = (st?.q || '').toLowerCase().trim();
    let filtered = filter === 'all' ? leads : leads.filter(l => (l.status || 'New') === filter);
    if (q) filtered = filtered.filter(l => {
      return (l.username || '').toLowerCase().includes(q)
          || (l.full_name || '').toLowerCase().includes(q)
          || (l.company || '').toLowerCase().includes(q)
          || (l.first_message || '').toLowerCase().includes(q);
    });
    const statusCounts = {};
    leads.forEach(l => { const s = l.status || 'New'; statusCounts[s] = (statusCounts[s] || 0) + 1; });
    return `
      <div class="screen">
        <div class="head-row">
          <h2 style="font-size:18px">${escape(st.list_name || 'Список')}</h2>
          <button class="add-btn" data-action="add-lead-to-list" title="Добавить лида в этот список вручную">+</button>
        </div>

        <div class="stats-grid" style="grid-template-columns:repeat(3,1fr);margin-bottom:12px">
          <div class="stat"><div class="stat-label">Всего</div><div class="stat-value" style="font-size:18px">${leads.length}</div></div>
          <div class="stat"><div class="stat-label">Отправлено</div><div class="stat-value" style="font-size:18px">${leads.reduce((s,l)=>s+(l.sent||0),0)}</div></div>
          <div class="stat"><div class="stat-label">Ответов</div><div class="stat-value" style="font-size:18px">${leads.reduce((s,l)=>s+(l.replied||0),0)}</div></div>
        </div>

        <div class="search-bar">
          <input id="ld-search" type="search" placeholder="Поиск по имени, username, компании..." value="${escape(q)}" oninput="window.__ldSearch(this.value)">
        </div>
        <div class="stage-strip">
          <div class="stage-chip ${filter==='all'?'active':''}" data-list-filter="all">Все · ${leads.length}</div>
          ${LEAD_STATUSES.map(s => statusCounts[s] ? `
            <div class="stage-chip ${filter===s?'active':''}" data-list-filter="${escape(s)}">${escape(s)} · ${statusCounts[s]}</div>
          ` : '').join('')}
        </div>

        ${filtered.length === 0 ? '<div class="empty"><div class="empty-title">Нет лидов в этой категории</div></div>' :
          filtered.map(l => `
            <div class="card" data-action="edit-lead" data-id="${l.id}">
              <div class="card-row">
                <div style="flex:1;min-width:0">
                  <div class="lead-name">${escape(l.full_name || l.company || l.username || '?')}</div>
                  <div class="lead-status" style="margin-top:2px">
                    ${l.username ? `<span style="color:var(--accent)">@${escape(l.username)}</span>` : ''}
                    ${l.company ? ` · ${escape(l.company)}` : ''}
                  </div>
                  ${l.first_message ? `<div style="font-size:12px;color:var(--text-muted);margin-top:6px;font-style:italic">"${escape(l.first_message).slice(0,100)}${l.first_message.length>100?'…':''}"</div>` : ''}
                </div>
                <span class="lead-score ${l.status==='Paid'||l.status==='Active Partner'?'hot':l.status==='Trial Activated'?'warm':'cold'}">${escape(l.status||'New')}</span>
              </div>
              ${(l.sent || l.replied) ? `
                <div style="display:flex;gap:12px;font-size:11px;color:var(--text-muted);margin-top:8px">
                  <span>Отправлено: <b style="color:var(--text)">${l.sent||0}</b></span>
                  <span>Ответов: <b style="color:var(--text)">${l.replied||0}</b></span>
                </div>` : ''}
            </div>
          `).join('')
        }

        <button class="btn full secondary" style="margin-top:12px" data-action="delete-list" data-id="${st.list_id}">Удалить список</button>
      </div>`;
  },

  // ---------- LEAD EDIT ----------
  lead_edit: (st) => {
    const l = st.lead || {};
    return `
      <div class="screen">
        <div class="head-row"><h2 style="font-size:18px">Редактировать лида</h2></div>
        <div class="card">
          <label style="font-size:12px;color:var(--text-muted)">Username</label>
          <input id="le-username" value="${escape(l.username || '')}" placeholder="@username"
                 style="width:100%;padding:10px 12px;border:1px solid var(--border);border-radius:8px;background:var(--bg);color:var(--text);font-size:14px;margin-top:4px">
          <label style="font-size:12px;color:var(--text-muted);margin-top:12px;display:block">Имя / название</label>
          <input id="le-name" value="${escape(l.full_name || '')}" placeholder="Иван Иванов"
                 style="width:100%;padding:10px 12px;border:1px solid var(--border);border-radius:8px;background:var(--bg);color:var(--text);font-size:14px;margin-top:4px">
          <label style="font-size:12px;color:var(--text-muted);margin-top:12px;display:block">Компания</label>
          <input id="le-company" value="${escape(l.company || '')}" placeholder="BitOK"
                 style="width:100%;padding:10px 12px;border:1px solid var(--border);border-radius:8px;background:var(--bg);color:var(--text);font-size:14px;margin-top:4px">
          <label style="font-size:12px;color:var(--text-muted);margin-top:12px;display:block">Статус</label>
          <select id="le-status" style="width:100%;padding:10px 12px;border:1px solid var(--border);border-radius:8px;background:var(--bg);color:var(--text);font-size:14px;margin-top:4px">
            ${LEAD_STATUSES.map(s => `<option value="${escape(s)}" ${(l.status||'New')===s?'selected':''}>${escape(s)}</option>`).join('')}
          </select>
          <label style="font-size:12px;color:var(--text-muted);margin-top:12px;display:block">Первое сообщение</label>
          <textarea id="le-msg" placeholder="Привет! Видел..." rows="6"
                    style="width:100%;padding:10px 12px;border:1px solid var(--border);border-radius:8px;background:var(--bg);color:var(--text);font-size:14px;margin-top:4px;font-family:inherit;resize:vertical">${escape(l.first_message || '')}</textarea>
        </div>
        <button class="btn full" style="margin-top:8px" data-action="save-lead" data-id="${l.id}">Сохранить</button>
        ${l.username ? `<button class="btn full secondary" style="margin-top:8px" data-action="open-lead-tg" data-username="${escape(l.username)}">Открыть в Telegram</button>` : ''}
        <button class="btn full secondary" style="margin-top:8px;color:#ef4444" data-action="delete-lead" data-id="${l.id}">Удалить лида</button>
      </div>`;
  },

  // ---------- TEMPLATES ----------
  templates: (st) => {
    const tmpls = st?.templates ?? [];
    return `
      <div class="screen">
        <div class="head-row"><h2>Шаблоны и AI</h2><button class="add-btn" data-action="new-template" title="Создать новый шаблон сообщения для рассылки">+</button></div>
        <div class="section-title">AI-генератор</div>
        <button class="btn full" data-action="open-ai-composer">✦ Сгенерировать сообщения</button>
        <div class="section-title">Сохранённые шаблоны</div>
        ${tmpls.length === 0 ? `
          <div class="empty"><div class="empty-ico" data-pix="broadcast"></div>
            <div class="empty-title">Нет шаблонов</div>
            <div>Сохраняйте проверенные сообщения и ответы — будут под рукой во всех кампаниях.</div>
            <button class="btn" style="margin-top:16px" data-action="new-template">Создать шаблон</button>
          </div>
        ` : tmpls.map(t => `
          <div class="card" data-action="edit-template" data-id="${t.id}">
            <div class="card-row"><div class="card-title">${escape(t.name)}</div></div>
            <div style="font-size:13px;color:var(--text-muted);margin-top:6px">${escape((t.body || '').slice(0,140))}${(t.body||'').length>140?'…':''}</div>
            ${t.ai_prompt ? '<div style="font-size:11px;color:var(--accent);margin-top:6px">✦ AI prompt</div>' : ''}
          </div>
        `).join('')}
      </div>`;
  },

  // ---------- TEMPLATE EDIT ----------
  template_edit: (st) => {
    const t = st.template || {};
    return `
      <div class="screen">
        <div class="head-row"><h2 style="font-size:18px">${t.id ? 'Редактировать' : 'Новый'} шаблон</h2></div>
        <div class="card">
          <label style="font-size:12px;color:var(--text-muted)">Название</label>
          <input id="te-name" value="${escape(t.name || '')}" placeholder="Холодный, Q2"
                 style="width:100%;padding:10px 12px;border:1px solid var(--border);border-radius:8px;background:var(--bg);color:var(--text);font-size:14px;margin-top:4px">
          <label style="font-size:12px;color:var(--text-muted);margin-top:12px;display:block">Текст сообщения</label>
          <textarea id="te-body" rows="8" placeholder="Привет {{first_name}}! Видел что вы из {{company}}..."
                    style="width:100%;padding:10px 12px;border:1px solid var(--border);border-radius:8px;background:var(--bg);color:var(--text);font-size:14px;margin-top:4px;font-family:inherit;resize:vertical">${escape(t.body || '')}</textarea>
          <div style="font-size:11px;color:var(--text-muted);margin-top:6px">Переменные: {{first_name}}, {{full_name}}, {{username}}, {{company}}</div>
          <label style="font-size:12px;color:var(--text-muted);margin-top:12px;display:block">AI prompt (опционально, для генерации)</label>
          <textarea id="te-ai" rows="4" placeholder="Сгенерируй короткое холодное сообщение для CEO криптобиржи..."
                    style="width:100%;padding:10px 12px;border:1px solid var(--border);border-radius:8px;background:var(--bg);color:var(--text);font-size:13px;margin-top:4px;font-family:inherit;resize:vertical">${escape(t.ai_prompt || '')}</textarea>
        </div>
        <button class="btn full" style="margin-top:8px" data-action="save-template" data-id="${t.id || 0}">Сохранить</button>
        ${t.id ? `<button class="btn full secondary" style="margin-top:8px;color:#ef4444" data-action="delete-template" data-id="${t.id}">Удалить</button>` : ''}
      </div>`;
  },

  // ---------- AI COMPOSER ----------
  ai_composer: () => `
    <div class="screen">
      <div class="head-row"><h2 style="font-size:18px">AI-генератор</h2></div>
      <div class="card">
        <label style="font-size:12px;color:var(--text-muted)">Контекст продукта (system prompt)</label>
        <textarea id="ai-sys" rows="6" placeholder="Мы BitOK — AML/KYT для крипто-бизнесов..."
                  style="width:100%;padding:10px 12px;border:1px solid var(--border);border-radius:8px;background:var(--bg);color:var(--text);font-size:13px;margin-top:4px;font-family:inherit;resize:vertical">${escape(localStorage.getItem('ai_sys') || 'Мы BitOK — AML/KYT-сервис для крипто-бизнесов (биржи, обменники, процессинг). Помогаем проходить compliance, чекать кошельки, мониторить транзакции. Пишем на ты, дружелюбно, без воды.')}</textarea>
        <label style="font-size:12px;color:var(--text-muted);margin-top:12px;display:block">Тон</label>
        <input id="ai-tone" value="дружелюбный, на ты, без воды" style="width:100%;padding:10px 12px;border:1px solid var(--border);border-radius:8px;background:var(--bg);color:var(--text);font-size:14px;margin-top:4px">
        <label style="font-size:12px;color:var(--text-muted);margin-top:12px;display:block">CTA</label>
        <input id="ai-cta" value="предложить созвон 15 минут" style="width:100%;padding:10px 12px;border:1px solid var(--border);border-radius:8px;background:var(--bg);color:var(--text);font-size:14px;margin-top:4px">
        <label style="font-size:12px;color:var(--text-muted);margin-top:12px;display:block">Имя лида (для теста)</label>
        <input id="ai-name" placeholder="Андрей" style="width:100%;padding:10px 12px;border:1px solid var(--border);border-radius:8px;background:var(--bg);color:var(--text);font-size:14px;margin-top:4px">
        <label style="font-size:12px;color:var(--text-muted);margin-top:8px;display:block">Bio лида</label>
        <textarea id="ai-bio" rows="3" placeholder="CEO @cryptoexchange, Dubai" style="width:100%;padding:10px 12px;border:1px solid var(--border);border-radius:8px;background:var(--bg);color:var(--text);font-size:13px;margin-top:4px;font-family:inherit"></textarea>
      </div>
      <button class="btn full" style="margin-top:8px" data-action="ai-generate">Сгенерировать</button>
      <div id="ai-result" style="margin-top:12px"></div>
    </div>
  `,

  // ---------- INBOX ----------
  inbox: (st) => {
    const convs = st?.conversations ?? null;
    const filter = st?.filter || 'all';
    if (convs === null) return `
      <div class="screen"><div class="head-row"><h2>Inbox</h2></div>
      <div class="empty"><div class="empty-ico" data-pix="clock"></div><div class="empty-title">Загружаю</div></div></div>`;
    if (convs.length === 0) return `
      <div class="screen"><div class="head-row"><h2>Inbox</h2></div>
      <div class="empty"><div class="empty-ico" data-pix="broadcast"></div>
        <div class="empty-title">Пока никто не ответил</div>
        <div>Запустите кампанию — ответы со всех ваших аккаунтов будут падать сюда.</div>
      </div></div>`;

    // Считаем по статусам
    const counts = { unread: 0 };
    convs.forEach(c => {
      if (c.unread) counts.unread++;
      const s = c.lead_status || 'Без статуса';
      counts[s] = (counts[s] || 0) + 1;
    });

    const filtered = convs.filter(c => {
      if (filter === 'all') return true;
      if (filter === 'unread') return c.unread;
      return (c.lead_status || 'Без статуса') === filter;
    });

    const statusOrder = ['Trial Activated','Testnet','Objection handling','Initial Contact','Winback','New','Без статуса'];
    const presentStatuses = statusOrder.filter(s => counts[s]);

    const q = (st?.q || '').toLowerCase().trim();
    let display = filtered;
    if (q) display = display.filter(c => {
      return (c.lead_name || '').toLowerCase().includes(q)
          || (c.lead_username || '').toLowerCase().includes(q)
          || (c.last_text || '').toLowerCase().includes(q);
    });
    const selectMode = !!st?.select_mode;
    const selected = new Set(st?.selected || []);
    const allOnPage = display.map(c => c.id);
    const allChecked = allOnPage.length && allOnPage.every(id => selected.has(id));
    return `
      <div class="screen" style="${selectMode?'padding-bottom:80px':''}">
        <div class="head-row">
          <h2>Inbox · ${convs.length}${selectMode?` <span style="font-size:14px;color:var(--accent)">(выбрано ${selected.size})</span>`:''}</h2>
          ${selectMode
            ? `<div style="display:flex;gap:6px">
                 <button class="btn secondary" style="padding:6px 12px;font-size:13px" data-action="ib-select-all">${allChecked?'Снять':'Все'}</button>
                 <button class="btn secondary" style="padding:6px 12px;font-size:13px" data-action="ib-select-cancel">Отмена</button>
               </div>`
            : `<button class="btn secondary" style="padding:6px 12px;font-size:13px" data-action="ib-select-on">Выбрать</button>`}
        </div>
        ${selectMode ? '' : `
        <div class="search-bar">
          <input id="ib-search" type="search" placeholder="Поиск по имени, username, тексту..." value="${escape(q)}" oninput="window.__ibSearch(this.value)">
        </div>
        <div class="stage-strip">
          <div class="stage-chip ${filter==='all'?'active':''}" data-inbox-filter="all">Все · ${convs.length}</div>
          ${counts.unread ? `<div class="stage-chip ${filter==='unread'?'active':''}" data-inbox-filter="unread">● Непрочитанные · ${counts.unread}</div>` : ''}
          ${presentStatuses.map(s => `
            <div class="stage-chip ${filter===s?'active':''}" data-inbox-filter="${escape(s)}">${escape(s)} · ${counts[s]}</div>
          `).join('')}
        </div>
        `}
        ${display.length === 0 ? '<div class="empty"><div class="empty-ico" data-pix="search"></div><div class="empty-title">Ничего не найдено</div></div>' :
          display.map(c => {
            const checked = selected.has(c.id);
            const tagsHtml = (c.tags || []).slice(0, 3).map(t => `<span class="pill" style="font-size:9px;padding:2px 6px">${escape(t)}</span>`).join(' ');
            const snoozed = c.snoozed_until && new Date(c.snoozed_until) > new Date();
            const statusPill = c.lead_status === 'Trial Activated' ? 'pill warm' :
                               c.lead_status === 'Paid' || c.lead_status === 'Active Partner' ? 'pill win' : 'pill cold';
            return `
            <div class="conv-row" data-action="${selectMode?'ib-toggle':'open-conv'}" data-id="${c.id}" data-conv-row="${c.id}" style="${checked?'background:var(--gold);':''}${snoozed?'opacity:.55;':''}">
              ${selectMode ? `<div style="width:36px;height:36px;display:flex;align-items:center;justify-content:center;flex:0 0 36px"><input type="checkbox" ${checked?'checked':''} style="width:20px;height:20px;pointer-events:none"></div>` : avatar(c.lead_tg_id, c.lead_name || c.lead_username, c.unread)}
              <div class="lead-body" style="flex:1;min-width:0">
                <div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px">
                  <div class="lead-name" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${escape(c.lead_name || c.lead_username || '?')}${snoozed?' 💤':''}</div>
                  <div class="conv-time">${prettyTime(c.last_message_at)}</div>
                </div>
                <div class="conv-text" title="${escape(c.last_text||'')}">${escape(c.last_text || '—').slice(0, 70)}</div>
                ${tagsHtml || c.lead_status ? `<div style="margin-top:6px;display:flex;flex-wrap:wrap;gap:4px">${c.lead_status?`<span class="${statusPill}">${escape(c.lead_status)}</span>`:''}${tagsHtml}</div>` : ''}
              </div>
            </div>
          `;}).join('')
        }
        ${selectMode && selected.size > 0 ? `
          <div style="position:fixed;left:0;right:0;bottom:calc(60px + env(safe-area-inset-bottom));z-index:30;padding:10px 16px;background:var(--card);border-top:3px solid var(--ink);max-width:540px;margin:0 auto;display:flex;gap:8px">
            <button class="btn primary" style="flex:1" data-action="ib-bulk-reply">↩ Ответить ${selected.size}</button>
            <button class="btn" style="flex:1" data-action="ib-bulk-delete">🗑 ${selected.size}</button>
          </div>
        ` : ''}
      </div>`;
  },

  // ---------- CONVERSATION (TG-style) ----------
  conv: (st) => {
    const msgs = st?.messages ?? [];
    const title = st?.title || 'Чат';
    const subtitle = st?.subtitle || '';
    // Группировка по датам для разделителей
    let lastDate = '';
    const dateLabel = (iso) => {
      const d = new Date(iso); const t = new Date();
      const y = new Date(t); y.setDate(t.getDate() - 1);
      if (d.toDateString() === t.toDateString()) return 'Сегодня';
      if (d.toDateString() === y.toDateString()) return 'Вчера';
      return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
    };
    const isMedia = (txt) => /^(🖼 Фото|🎥 Видео|🎤 Голосовое|📎 Документ|📍 Гео|📨 Медиа|\[(image|video|audio|application)\/)/i.test(txt);

    return `
      <div class="conv-screen">
        <div class="conv-header">
          <button class="icon-btn" data-action="conv-back" title="Назад" style="font-size:20px">‹</button>
          <div class="avatar blue" style="width:36px;height:36px;font-size:14px">${initials(title)}</div>
          <div style="flex:1;min-width:0">
            <div style="font-weight:600;font-size:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${escape(title)}</div>
            <div style="font-size:12px;color:var(--text-muted)">${escape(subtitle || 'через CRM')} · <span data-action="conv-bot-mode" data-id="${st.conv_id}" data-current="${st.bot_mode||'auto'}" title="Бот-автоответчик: 🤖 auto = бот сам отвечает на FAQ, 👤 human = только человек, ⏸ pause = бот молчит. Клик переключает." style="cursor:pointer;color:${(st.bot_mode==='paused')?'#ef4444':(st.bot_mode==='human_only'?'#f59e0b':'#16a34a')};font-weight:500">${st.bot_mode==='paused'?'⏸ pause':st.bot_mode==='human_only'?'👤 human':'🤖 auto'}</span> · <span data-action="conv-guru-mode" data-id="${st.conv_id}" data-current="${st.guru_mode||'admin_approved'}" title="Guru-агент: ★ approve = Guru генерит черновик ответа, ты апруваешь · ★ auto = Guru сам отправляет (full-access) · ★ off = Guru молчит. Клик переключает." style="cursor:pointer;color:${(st.guru_mode==='off')?'#94a3b8':(st.guru_mode==='full_access'?'#dc2626':'#7c3aed')};font-weight:500">★ ${st.guru_mode==='off'?'off':st.guru_mode==='full_access'?'auto':'approve'}</span></div>
          </div>
          <button class="icon-btn" data-action="conv-calendly" data-id="${st.conv_id}" title="Прислать Calendly-ссылку" data-pix="calendar"></button>
          <button class="icon-btn" data-action="conv-snooze" data-id="${st.conv_id}" title="Snooze (отложить)" data-pix="snooze"></button>
          <button class="icon-btn" data-action="conv-stoplist" data-tg="${st.lead_tg_id || ''}" title="В стоп-лист" data-pix="ban"></button>
          <button class="icon-btn" data-action="conv-delete" data-id="${st.conv_id}" title="Удалить переписку" data-pix="trash" style="color:var(--red)"></button>
        </div>
        <div id="msg-list" class="conv-body">
          ${msgs.map(m => {
            const day = dateLabel(m.sent_at);
            const showDate = day !== lastDate;
            lastDate = day;
            const out = m.direction === 'out';
            const media = isMedia(m.text);
            return (showDate ? `<div class="conv-date">${day}</div>` : '') + `
              <div class="conv-row ${out ? 'out' : 'in'}">
                <div class="conv-bubble ${out ? 'out' : 'in'} ${media ? 'media' : ''}">
                  ${media ? `<div class="conv-media-ico">${escape(m.text)}</div>` : `<div class="conv-text">${escape(m.text)}</div>`}
                  <div class="conv-time">${fmtTime(m.sent_at)}${out ? ' ✓' : ''}</div>
                </div>
              </div>`;
          }).join('')}
        </div>
        ${(window.QUICK_REPLIES || []).length ? `
        <div style="display:flex;gap:6px;overflow-x:auto;padding:6px 8px 0;background:var(--bg);border-top:1px solid var(--border)">
          ${window.QUICK_REPLIES.map((q, i) => `
            <button class="stage-chip" data-action="qr-pick" data-idx="${i}" style="font-size:12px;flex:0 0 auto">${escape(q.slice(0, 30))}${q.length>30?'…':''}</button>
          `).join('')}
        </div>
        ` : ''}
        <div class="conv-input">
          <button class="icon-btn" data-action="attach-file" data-id="${st.conv_id}" title="Файл" data-pix="attach"></button>
          <button class="icon-btn" data-action="ai-suggest" data-id="${st.conv_id}" title="AI-подсказка" data-pix="spark" style="color:var(--plum)"></button>
          <input type="file" id="attach-input" style="display:none"
                 accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.zip,.txt">
          <input id="reply-input" type="text" placeholder="Сообщение"
                 style="flex:1;padding:11px 14px;border:1px solid var(--border);border-radius:20px;background:var(--bg);color:var(--text);font-size:15px">
          <button class="btn" data-action="send-reply" data-id="${st.conv_id}" title="Отправить сообщение" style="padding:10px 16px">→</button>
        </div>
      </div>`;
  },

  // ---------- IDEA SUBMIT ----------
  idea_submit: () => `
    <div class="screen">
      <div class="head-row"><h2 style="font-size:18px">Оставить идею</h2></div>
      <div class="card">
        <div style="font-size:13px;color:var(--text-muted);margin-bottom:10px">
          Что улучшить, добавить или починить? Идеи попадают в админку — каждая будет рассмотрена.
        </div>
        <textarea id="idea-text" rows="8" placeholder="Например: добавить экспорт диалогов в CSV..."
                  style="width:100%;padding:12px 14px;border:1px solid var(--border);border-radius:10px;background:var(--bg);color:var(--text);font-size:14px;font-family:inherit;resize:vertical"></textarea>
      </div>
      <button class="btn full" style="margin-top:8px" data-action="idea-send">Отправить идею</button>
      <button class="btn full secondary" style="margin-top:8px" data-action="goto-my-ideas">Мои идеи</button>
    </div>`,

  // ---------- MY IDEAS ----------
  my_ideas: (st) => {
    const ideas = st?.ideas ?? [];
    const statusLabel = { new: 'Новая', in_progress: 'В работе', done: 'Сделано', rejected: 'Отклонена' };
    const statusColor = { new: 'cold', in_progress: 'warm', done: 'cold', rejected: 'hot' };
    return `
      <div class="screen">
        <div class="head-row"><h2 style="font-size:18px">Мои идеи</h2><button class="add-btn" data-action="goto-idea-submit" title="Предложить идею улучшения приложения">+</button></div>
        ${ideas.length === 0 ? `
          <div class="empty">
            <div class="empty-ico" data-pix="idea"></div>
            <div class="empty-title">Идей пока нет</div>
            <button class="btn" style="margin-top:16px" data-action="goto-idea-submit">Оставить первую</button>
          </div>
        ` : ideas.map(i => `
          <div class="card">
            <div class="card-row">
              <div style="font-size:12px;color:var(--text-muted)">${new Date(i.created_at).toISOString().slice(0,10)}</div>
              <span class="lead-score ${statusColor[i.status]||'cold'}">${statusLabel[i.status] || i.status}</span>
            </div>
            <div style="font-size:14px;margin-top:8px;white-space:pre-wrap;word-break:break-word">${escape(i.text)}</div>
            ${i.admin_note ? `<div style="font-size:12px;color:var(--text-muted);margin-top:8px;padding-top:8px;border-top:1px solid var(--border)">💬 ${escape(i.admin_note)}</div>` : ''}
          </div>
        `).join('')}
      </div>`;
  },

  // ---------- ADMIN: IDEAS ----------
  admin_ideas: (st) => {
    const ideas = st?.ideas ?? [];
    const filter = st?.filter || 'all';
    const counts = {};
    ideas.forEach(i => counts[i.status] = (counts[i.status] || 0) + 1);
    const filtered = filter === 'all' ? ideas : ideas.filter(i => i.status === filter);
    const statusLabel = { new: 'Новые', in_progress: 'В работе', done: 'Сделано', rejected: 'Отклонены' };
    return `
      <div class="screen">
        <div class="head-row"><h2 style="font-size:18px">🛠 Идеи пользователей</h2></div>
        <div class="stage-strip">
          <div class="stage-chip ${filter==='all'?'active':''}" data-ai-filter="all">Все · ${ideas.length}</div>
          ${['new','in_progress','done','rejected'].map(s => counts[s] ? `
            <div class="stage-chip ${filter===s?'active':''}" data-ai-filter="${s}">${statusLabel[s]} · ${counts[s]}</div>
          ` : '').join('')}
        </div>
        ${filtered.length === 0 ? '<div class="empty"><div class="empty-title">Нет идей в этой категории</div></div>' :
          filtered.map(i => `
            <div class="card">
              <div class="card-row">
                <div style="font-size:13px"><b>${escape(i.author_name || '?')}</b> ${i.author_username ? `<span style="color:var(--accent)">@${escape(i.author_username)}</span>` : ''}</div>
                <div style="font-size:11px;color:var(--text-muted)">${new Date(i.created_at).toISOString().slice(0,10)}</div>
              </div>
              <div style="font-size:14px;margin-top:8px;white-space:pre-wrap;word-break:break-word">${escape(i.text)}</div>
              ${i.admin_note ? `<div style="font-size:12px;color:var(--text-muted);margin-top:8px;font-style:italic">📝 ${escape(i.admin_note)}</div>` : ''}
              <div style="display:flex;gap:4px;margin-top:10px;flex-wrap:wrap">
                ${['new','in_progress','done','rejected'].map(s => `
                  <button class="stage-chip ${i.status===s?'active':''}" data-action="idea-set-status" data-id="${i.id}" data-status="${s}" style="font-size:11px;padding:6px 10px">
                    ${statusLabel[s]}
                  </button>
                `).join('')}
                <button class="stage-chip" data-action="idea-add-note" data-id="${i.id}" style="font-size:11px;padding:6px 10px;margin-left:auto">📝</button>
                <button class="stage-chip" data-action="idea-delete" data-id="${i.id}" style="font-size:11px;padding:6px 10px;color:#ef4444">🗑</button>
              </div>
            </div>
          `).join('')
        }
      </div>`;
  },

  // ---------- CREATE EMPTY LIST (вместо prompt — экран, prompt не работает в TG iOS) ----------
  list_create: (st) => `
    <div class="screen">
      <div class="head-row"><h2 style="font-size:18px">Новый пустой список</h2></div>
      <div class="card">
        <label style="font-size:12px;color:var(--text-muted)">Название списка</label>
        <input id="lc-name" value="${escape(st?.name || 'Список ' + new Date().toISOString().slice(0,10))}"
               style="width:100%;padding:12px 14px;border:1px solid var(--border);border-radius:10px;background:var(--bg);color:var(--text);font-size:15px;margin-top:4px" autofocus>
        <div style="font-size:11px;color:var(--text-muted);margin-top:8px">
          После создания попадёшь на экран списка, где сможешь добавлять лидов вручную (TG-username, имя, компания, статус) или загрузить CSV.
        </div>
      </div>
      <button class="btn full" style="margin-top:8px" data-action="lc-create">Создать и открыть</button>
      <button class="btn full secondary" style="margin-top:8px" data-action="goto-lists">Отмена</button>
    </div>
  `,

  // ---------- TG FOLDERS (синк ТГ-папок) ----------
  tg_folders: (st) => {
    const accs = (st?.accounts || []).filter(a => a.status === 'active');
    const sel  = st?.account_id || (accs[0]?.id);
    const folders = st?.folders;
    const loading = st?.loading;
    const err = st?.error;
    return `
      <div class="screen">
        <div class="head-row"><h2 style="font-size:18px">Синк ТГ-папок</h2></div>
        ${accs.length === 0 ? `
          <div class="card" style="background:#fef3c7;color:#92400e;font-size:13px">
            Нет активных аккаунтов. Подключите хотя бы один — папки лежат внутри ТГ-аккаунта.
          </div>
        ` : `
          <div class="card">
            <label style="font-size:12px;color:var(--text-muted)">Аккаунт</label>
            <select id="tf-acc" style="width:100%;padding:10px 12px;border:1px solid var(--border);border-radius:8px;background:var(--bg);color:var(--text);font-size:14px;margin-top:4px">
              ${accs.map(a => `<option value="${a.id}" ${a.id===sel?'selected':''}>${escape(a.first_name||a.phone)} (${escape(a.phone)})</option>`).join('')}
            </select>
            <button class="btn full" style="margin-top:10px" data-action="tf-load">📁 Показать папки</button>
          </div>
          ${loading ? '<div class="card">⏳ Загружаю папки…</div>' : ''}
          ${err ? `<div class="card" style="color:#ef4444">${escape(err)}</div>` : ''}
          ${folders ? (folders.length === 0
            ? '<div class="card">У этого аккаунта нет папок (только «Все чаты»). Создайте папку в Telegram и попробуйте снова.</div>'
            : `<div class="section-title">Папки</div>` + folders.map(f => `
              <div class="card-row card" style="cursor:pointer" data-action="tf-import" data-fid="${f.id}" data-fname="${escape(f.title)}">
                <div>
                  <div style="font-weight:600">${escape(f.title)}</div>
                  <div style="font-size:12px;color:var(--text-muted)">${f.count} чатов в папке</div>
                </div>
                <span class="lead-score cold">импорт</span>
              </div>
            `).join('')) : ''}
        `}
      </div>`;
  },

  // ---------- CSV UPLOAD (экран вместо prompt) ----------
  csv_upload: (st) => `
    <div class="screen">
      <div class="head-row"><h2 style="font-size:18px">Загрузить CSV</h2></div>
      <div class="card">
        <label style="font-size:12px;color:var(--text-muted)">Название списка</label>
        <input id="cu-name" value="${escape(st?.name || 'Список ' + new Date().toISOString().slice(0,10))}"
               style="width:100%;padding:12px 14px;border:1px solid var(--border);border-radius:10px;background:var(--bg);color:var(--text);font-size:15px;margin-top:4px">
        <label style="font-size:12px;color:var(--text-muted);margin-top:14px;display:block">CSV-файл</label>
        <input id="cu-file" type="file" accept=".csv,text/csv,text/plain"
               style="width:100%;padding:10px;border:1px solid var(--border);border-radius:10px;background:var(--bg);color:var(--text);font-size:14px;margin-top:4px">
        <div style="font-size:11px;color:var(--text-muted);margin-top:10px">
          Формат: <code>tg_username, company, first_message, status</code><br>
          Разделитель: запятая, точка с запятой или таб (определится автоматически).
        </div>
      </div>
      <button class="btn full" style="margin-top:8px" data-action="csv-upload-go">Загрузить</button>
      <div id="cu-result" style="margin-top:8px"></div>
    </div>
  `,

  // ---------- TOOLS PLACEHOLDERS ----------
  tool_parser: (st) => {
    const accs = st?.accounts ?? [];
    const sel = st?.account_id || (accs[0]?.id);
    return `
    <div class="screen">
      <div class="head-row"><h2 style="font-size:18px">Парсер чатов</h2></div>
      <div class="card">
        <label style="font-size:12px;color:var(--text-muted)">Аккаунт для парсинга</label>
        <select id="parser-acc" style="width:100%;padding:10px 12px;border:1px solid var(--border);border-radius:8px;background:var(--bg);color:var(--text);font-size:14px;margin-top:4px">
          ${accs.map(a => `<option value="${a.id}" ${a.id===sel?'selected':''}>${escape(a.first_name||a.phone)} (${escape(a.phone)})</option>`).join('')}
        </select>
        <label style="font-size:12px;color:var(--text-muted);margin-top:12px;display:block">Чат: invite-ссылка / @username / название</label>
        <input id="parser-target" placeholder="https://t.me/+abcDEF..."
               style="width:100%;padding:10px 12px;border:1px solid var(--border);border-radius:8px;background:var(--bg);color:var(--text);font-size:14px;margin-top:4px">
        <label style="font-size:12px;color:var(--text-muted);margin-top:12px;display:block">Название нового списка</label>
        <input id="parser-listname" value="Парсер ${new Date().toISOString().slice(0,10)}"
               style="width:100%;padding:10px 12px;border:1px solid var(--border);border-radius:8px;background:var(--bg);color:var(--text);font-size:14px;margin-top:4px">
        <label style="font-size:12px;color:var(--text-muted);margin-top:12px;display:block">Сколько последних сообщений сканировать</label>
        <input id="parser-limit" type="number" value="5000" min="100" max="20000"
               style="width:100%;padding:10px 12px;border:1px solid var(--border);border-radius:8px;background:var(--bg);color:var(--text);font-size:14px;margin-top:4px">
      </div>
      <button class="btn full" style="margin-top:8px" data-action="run-parser-real">Собрать участников</button>
      <div id="parser-result" style="margin-top:8px"></div>
      <div style="margin-top:16px;font-size:11px;color:var(--text-muted);text-align:center">
        Парсинг ~5к сообщений занимает 30-60 секунд. По окончании появится новый список.
      </div>
    </div>`;
  },

  tool_search: (st) => {
    const accs = st?.accounts ?? [];
    const sel = st?.account_id || (accs[0]?.id);
    return `
    <div class="screen">
      <div class="head-row"><h2 style="font-size:18px">Поиск чатов</h2></div>
      <div class="card">
        <label style="font-size:12px;color:var(--text-muted)">Аккаунт</label>
        <select id="search-acc" style="width:100%;padding:10px 12px;border:1px solid var(--border);border-radius:8px;background:var(--bg);color:var(--text);font-size:14px;margin-top:4px">
          ${accs.map(a => `<option value="${a.id}" ${a.id===sel?'selected':''}>${escape(a.first_name||a.phone)} (${escape(a.phone)})</option>`).join('')}
        </select>
        <label style="font-size:12px;color:var(--text-muted);margin-top:12px;display:block">Ключевые слова (через запятую)</label>
        <input id="search-keywords" placeholder="AML, KYC, обменник, exchange"
               style="width:100%;padding:10px 12px;border:1px solid var(--border);border-radius:8px;background:var(--bg);color:var(--text);font-size:14px;margin-top:4px">
        <label style="font-size:12px;color:var(--text-muted);margin-top:12px;display:block">Чаты для поиска (по одному в строке)</label>
        <textarea id="search-chats" rows="5" placeholder="@chat1&#10;@chat2&#10;https://t.me/+abc..."
                  style="width:100%;padding:10px 12px;border:1px solid var(--border);border-radius:8px;background:var(--bg);color:var(--text);font-size:13px;margin-top:4px;font-family:inherit;resize:vertical"></textarea>
        <label style="font-size:12px;color:var(--text-muted);margin-top:12px;display:block">Название нового списка</label>
        <input id="search-listname" value="Поиск ${new Date().toISOString().slice(0,10)}"
               style="width:100%;padding:10px 12px;border:1px solid var(--border);border-radius:8px;background:var(--bg);color:var(--text);font-size:14px;margin-top:4px">
      </div>
      <button class="btn full" style="margin-top:8px" data-action="run-search-real">Искать</button>
      <div id="search-result" style="margin-top:8px"></div>
    </div>`;
  },

  // ---------- DEALS ----------
  deals: (st) => {
    const deals = st?.deals ?? [];
    const STAGES = ['Discovery','Demo','Trial','Proposal','Negotiation','Won','Lost'];
    const counts = {}; deals.forEach(d => counts[d.stage] = (counts[d.stage]||0)+1);
    const totalValue = deals.filter(d => !['Won','Lost'].includes(d.stage)).reduce((s,d)=>s+(d.value||0),0);
    return `
      <div class="screen">
        <div class="head-row"><h2>Сделки</h2><button class="add-btn" data-action="new-deal" title="Создать новую сделку — стадия, сумма, ожидаемая дата закрытия">+</button></div>
        ${deals.length === 0 ? `
          <div class="empty"><div class="empty-ico" data-pix="briefcase"></div>
            <div class="empty-title">Нет сделок</div>
            <div>Сделка = лид + value + стейдж + close-date. Сюда складывай тех, с кем уже идёт реальный разговор о покупке.</div>
            <button class="btn" style="margin-top:16px" data-action="new-deal">Создать сделку</button>
          </div>
        ` : `
          <div class="card" style="background:linear-gradient(135deg,#dbeafe,#e0e7ff)">
            <div style="font-size:13px;color:#1e3a8a">💰 Pipeline (без Won/Lost): <b>$${totalValue.toLocaleString('en-US')}</b></div>
          </div>
          <div class="stage-strip">
            ${STAGES.filter(s => counts[s]).map(s => `<div class="stage-chip">${escape(s)} · ${counts[s]}</div>`).join('')}
          </div>
          ${deals.map(d => `
            <div class="card" data-action="edit-deal" data-id="${d.id}">
              <div class="card-row">
                <div style="flex:1;min-width:0">
                  <div style="font-weight:600;font-size:14px">${escape(d.name)}</div>
                  <div style="font-size:12px;color:var(--text-muted);margin-top:2px">
                    ${escape(d.lead_name || d.lead_username || `lead #${d.lead_id}`)}${d.close_date?' · close '+new Date(d.close_date).toISOString().slice(0,10):''}
                  </div>
                </div>
                <div style="text-align:right">
                  <div style="font-weight:600;color:var(--accent)">$${(d.value||0).toLocaleString('en-US')}</div>
                  <span class="lead-score ${d.stage==='Won'?'cold':d.stage==='Lost'?'hot':'warm'}" style="font-size:11px;margin-top:4px;display:inline-block">${escape(d.stage)}</span>
                </div>
              </div>
            </div>
          `).join('')}
        `}
      </div>`;
  },

  deal_edit: (st) => {
    const d = st?.deal || {};
    const leadOptions = st?.leads || [];   // если новая сделка — выбор из списка лидов
    const STAGES = ['Discovery','Demo','Trial','Proposal','Negotiation','Won','Lost'];
    return `
      <div class="screen">
        <div class="head-row"><h2 style="font-size:18px">${d.id?'Редактировать сделку':'Новая сделка'}</h2></div>
        <div class="card">
          ${!d.id ? `
            <label style="font-size:12px;color:var(--text-muted)">Лид</label>
            <select id="d-lead" style="width:100%;padding:10px 12px;border:1px solid var(--border);border-radius:8px;background:var(--bg);color:var(--text);font-size:14px;margin-top:4px">
              ${leadOptions.map(l => `<option value="${l.id}">${escape((l.full_name||l.username||'?'))} ${l.username?'@'+escape(l.username):''}</option>`).join('')}
            </select>
          ` : `<div style="font-size:13px;color:var(--text-muted)">Лид: <b style="color:var(--text)">${escape(d.lead_name || d.lead_username || '')}</b></div>`}
          <label style="font-size:12px;color:var(--text-muted);margin-top:12px;display:block">Название</label>
          <input id="d-name" value="${escape(d.name||'')}" placeholder="Напр.: BitOK API → CryptoExchange-X"
                 style="width:100%;padding:10px 12px;border:1px solid var(--border);border-radius:8px;background:var(--bg);color:var(--text);font-size:14px;margin-top:4px">
          <label style="font-size:12px;color:var(--text-muted);margin-top:12px;display:block">Стейдж</label>
          <select id="d-stage" style="width:100%;padding:10px 12px;border:1px solid var(--border);border-radius:8px;background:var(--bg);color:var(--text);font-size:14px;margin-top:4px">
            ${STAGES.map(s => `<option ${d.stage===s?'selected':''}>${s}</option>`).join('')}
          </select>
          <label style="font-size:12px;color:var(--text-muted);margin-top:12px;display:block">Value (USD)</label>
          <input id="d-value" type="number" min="0" value="${d.value||0}"
                 style="width:100%;padding:10px 12px;border:1px solid var(--border);border-radius:8px;background:var(--bg);color:var(--text);font-size:14px;margin-top:4px">
          <label style="font-size:12px;color:var(--text-muted);margin-top:12px;display:block">Close date</label>
          <input id="d-close" type="date" value="${d.close_date?new Date(d.close_date).toISOString().slice(0,10):''}"
                 style="width:100%;padding:10px 12px;border:1px solid var(--border);border-radius:8px;background:var(--bg);color:var(--text);font-size:14px;margin-top:4px">
          <label style="font-size:12px;color:var(--text-muted);margin-top:12px;display:block">Заметка</label>
          <textarea id="d-note" rows="4" placeholder="Контактное лицо, decision criteria, конкуренты..."
                    style="width:100%;padding:10px 12px;border:1px solid var(--border);border-radius:8px;background:var(--bg);color:var(--text);font-size:13px;margin-top:4px;font-family:inherit;resize:vertical">${escape(d.note||'')}</textarea>
        </div>
        <button class="btn full" style="margin-top:8px" data-action="save-deal" data-id="${d.id||0}">Сохранить</button>
        ${d.id?`<button class="btn full secondary" style="margin-top:8px;color:#ef4444" data-action="delete-deal" data-id="${d.id}">Удалить</button>`:''}
      </div>`;
  },

  // ---------- TASKS ----------
  tasks: (st) => {
    const tasks = st?.tasks ?? [];
    const overdue = tasks.filter(t => !t.done && new Date(t.due_date) < new Date());
    return `
      <div class="screen">
        <div class="head-row"><h2>Задачи</h2><button class="add-btn" data-action="new-task" title="Добавить задачу с дедлайном">+</button></div>
        ${overdue.length ? `<div class="card" style="background:#fee2e2;color:#b91c1c;font-size:13px">⚠ Просрочено: ${overdue.length}</div>` : ''}
        ${tasks.length === 0 ? `
          <div class="empty"><div class="empty-ico" data-pix="list"></div>
            <div class="empty-title">Нет открытых задач</div>
            <button class="btn" style="margin-top:16px" data-action="new-task">Добавить задачу</button>
          </div>
        ` : tasks.map(t => {
          const od = !t.done && new Date(t.due_date) < new Date(new Date().toDateString());
          return `
          <div class="card" style="${od?'background:#fee2e2':''}">
            <div class="card-row">
              <div style="flex:1;min-width:0">
                <div style="font-weight:500;font-size:14px;${t.done?'text-decoration:line-through;color:var(--text-muted)':''}">${escape(t.text)}</div>
                <div style="font-size:12px;color:${od?'#b91c1c':'var(--text-muted)'};margin-top:2px">
                  ${od?'⚠ просрочено':'до'} ${prettyTime(t.due_date)}${t.lead_name?' · '+escape(t.lead_name):''}
                </div>
              </div>
              <div style="display:flex;gap:4px">
                <button class="btn secondary" style="padding:4px 10px;font-size:12px" data-action="task-toggle" data-id="${t.id}" data-done="${t.done?1:0}">${t.done?'↺':'✓'}</button>
                <button class="btn secondary" style="padding:4px 8px;font-size:12px;color:#ef4444" data-action="task-delete" data-id="${t.id}">🗑</button>
              </div>
            </div>
          </div>
        `;}).join('')}
      </div>`;
  },

  // ---------- KNOWLEDGE BASE ----------
  kb: (st) => {
    const items = st?.items ?? [];
    const INTENTS = ['price','security','integration','competitor','timing','demo','compliance','other'];
    const INTENT_LBL = { price:'💰 Цена', security:'🔒 Безопасность', integration:'🔌 Интеграция', competitor:'⚔ Конкуренты', timing:'⏱ Сроки', demo:'🎬 Демо', compliance:'⚖ Compliance', other:'📌 Другое'};
    return `
      <div class="screen">
        <div class="head-row"><h2>База знаний</h2><button class="add-btn" data-action="new-kb" title="Добавить запись в базу знаний (FAQ для бота-автоответчика)">+</button></div>
        <div class="card" style="background:#dbeafe;color:#1e3a8a;font-size:12px">
          💡 Когда лид что-то спрашивает (цена, безопасность, конкуренты), AI auto-reply подсмотрит сюда и не будет выдумывать.
        </div>
        ${items.length === 0 ? `
          <div class="empty"><div class="empty-ico" data-pix="brain"></div>
            <div class="empty-title">База пуста</div>
            <div>Добавь типовые вопросы и canned-ответы. AI будет использовать их вместо того чтобы выдумывать.</div>
            <button class="btn" style="margin-top:16px" data-action="new-kb">Добавить запись</button>
          </div>
        ` : items.map(k => `
          <div class="card" data-action="edit-kb" data-id="${k.id}">
            <div class="card-row">
              <div style="font-weight:600;font-size:13px">${INTENT_LBL[k.intent]||k.intent}</div>
            </div>
            <div style="font-size:13px;color:var(--text-muted);margin-top:6px"><b>Q:</b> ${escape(k.question.slice(0,120))}${k.question.length>120?'…':''}</div>
            <div style="font-size:13px;color:var(--text-muted);margin-top:4px"><b>A:</b> ${escape(k.answer.slice(0,160))}${k.answer.length>160?'…':''}</div>
          </div>
        `).join('')}
      </div>`;
  },

  kb_edit: (st) => {
    const k = st?.kb || {};
    const INTENTS = ['price','security','integration','competitor','timing','demo','compliance','other'];
    return `
      <div class="screen">
        <div class="head-row"><h2 style="font-size:18px">${k.id?'Редактировать запись':'Новая запись KB'}</h2></div>
        <div class="card">
          <label style="font-size:12px;color:var(--text-muted)">Тип возражения / темы</label>
          <select id="kb-intent" style="width:100%;padding:10px 12px;border:1px solid var(--border);border-radius:8px;background:var(--bg);color:var(--text);font-size:14px;margin-top:4px">
            ${INTENTS.map(i => `<option ${k.intent===i?'selected':''}>${i}</option>`).join('')}
          </select>
          <label style="font-size:12px;color:var(--text-muted);margin-top:12px;display:block">Типичный вопрос лида</label>
          <textarea id="kb-q" rows="3" placeholder="Напр.: Сколько стоит ваш сервис?"
                    style="width:100%;padding:10px 12px;border:1px solid var(--border);border-radius:8px;background:var(--bg);color:var(--text);font-size:13px;margin-top:4px;font-family:inherit;resize:vertical">${escape(k.question||'')}</textarea>
          <label style="font-size:12px;color:var(--text-muted);margin-top:12px;display:block">Готовый ответ</label>
          <textarea id="kb-a" rows="6" placeholder="У нас 3 тарифа: Starter $99/мес, Pro $499/мес и Enterprise..."
                    style="width:100%;padding:10px 12px;border:1px solid var(--border);border-radius:8px;background:var(--bg);color:var(--text);font-size:13px;margin-top:4px;font-family:inherit;resize:vertical">${escape(k.answer||'')}</textarea>
        </div>
        <button class="btn full" style="margin-top:8px" data-action="save-kb" data-id="${k.id||0}">Сохранить</button>
        ${k.id?`<button class="btn full secondary" style="margin-top:8px;color:#ef4444" data-action="delete-kb" data-id="${k.id}">Удалить</button>`:''}
      </div>`;
  },

  // ---------- ANALYTICS ----------
  analytics: (st) => {
    const tmpls = st?.templates ?? [];
    const accs = st?.accounts ?? [];
    const totalSent = tmpls.reduce((s,t)=>s+t.sent,0);
    const totalReplied = tmpls.reduce((s,t)=>s+t.replied,0);
    const overall = totalSent ? (totalReplied/totalSent*100).toFixed(1) : '0';
    return `
      <div class="screen">
        <div class="head-row"><h2>Аналитика</h2></div>
        <div class="stats-grid">
          <div class="stat"><div class="stat-label">Всего отправлено</div><div class="stat-value">${totalSent}</div></div>
          <div class="stat"><div class="stat-label">Ответили</div><div class="stat-value">${totalReplied}</div></div>
          <div class="stat" style="grid-column:span 2"><div class="stat-label">Общий reply rate</div><div class="stat-value">${overall}%</div></div>
        </div>
        <div class="section-title">По шаблонам</div>
        ${tmpls.length === 0 ? '<div class="empty"><div>Нет данных</div></div>' : tmpls.map(t => `
          <div class="card">
            <div class="card-row">
              <div style="flex:1;min-width:0">
                <div style="font-weight:600;font-size:14px">${escape(t.name)}</div>
                <div style="font-size:12px;color:var(--text-muted);margin-top:2px">${t.campaigns} кампаний · ${t.sent} отправлено</div>
              </div>
              <span class="lead-score ${t.reply_rate>=10?'hot':t.reply_rate>=3?'warm':'cold'}">${t.reply_rate}%</span>
            </div>
          </div>
        `).join('')}
        <div class="section-title">По аккаунтам</div>
        ${accs.length === 0 ? '<div class="empty"><div>Нет данных</div></div>' : accs.map(a => `
          <div class="card">
            <div class="card-row">
              <div style="flex:1;min-width:0">
                <div style="font-weight:600;font-size:14px">${escape(a.first_name||a.phone)}${a.username?' @'+escape(a.username):''}</div>
                <div style="font-size:12px;color:var(--text-muted);margin-top:2px">${escape(a.phone)} · ${a.sent} отправлено · ${a.replied} ответов</div>
              </div>
              <span class="lead-score ${a.reply_rate>=10?'hot':a.reply_rate>=3?'warm':'cold'}">${a.reply_rate}%</span>
            </div>
          </div>
        `).join('')}
      </div>`;
  },

  // ---------- STOP-LIST ----------
  stoplist: (st) => {
    const items = st?.items ?? [];
    return `
      <div class="screen">
        <div class="head-row"><h2>Стоп-лист</h2></div>
        <div class="card" style="background:#dbeafe;color:#1e3a8a;font-size:12px">
          💡 Этим лидам кампании НЕ шлют сообщения. Авто-добавление при детекции «отпиши/не пиши/спам/нахуй» в incoming. Можно добавить вручную из Inbox-чата (🚫).
        </div>
        ${items.length === 0 ? `
          <div class="empty"><div class="empty-ico" data-pix="ban"></div>
            <div class="empty-title">Стоп-лист пуст</div>
          </div>
        ` : items.map(l => `
          <div class="card">
            <div class="card-row">
              <div style="flex:1;min-width:0">
                <div style="font-weight:600;font-size:14px">${escape(l.full_name || l.username || `lead #${l.id}`)}</div>
                <div style="font-size:12px;color:var(--text-muted);margin-top:2px">${l.username?'@'+escape(l.username):''} · причина: <b>${escape(l.reason||'manual')}</b></div>
              </div>
              <button class="btn secondary" style="padding:4px 10px;font-size:12px" data-action="dnc-remove" data-id="${l.id}">↺ Снять</button>
            </div>
          </div>
        `).join('')}
      </div>`;
  },

  // ---------- PROFILE ----------
  profile: (st) => {
    const p = st?.profile || {};
    const tier = p.tier || 'BETA';
    const handle = p.username || ME.username || 'guest';
    const name = p.first_name || ME.first_name || '—';
    return `
      <div class="screen">
        <div class="head-row">
          <div>
            <h2>Профиль</h2>
            <div class="muted small" style="margin-top:2px">Аккаунт и достижения</div>
          </div>
        </div>

        <div class="card" style="background:var(--ink);color:var(--card);border-color:var(--ink)">
          <div style="display:flex;align-items:center;gap:14px">
            <div class="sensei-avatar" style="flex:0 0 auto"></div>
            <div style="flex:1;min-width:0">
              <div style="font-family:var(--font-h);font-weight:700;font-size:17px">${escape(name)}</div>
              <div style="font-size:13px;color:var(--gold);margin-top:4px;font-weight:500">@${escape(handle)} · DAN III</div>
              <div style="font-size:12px;color:var(--ink-3);margin-top:2px">с мая 2026</div>
            </div>
            <div class="pill" style="background:var(--gold);color:var(--ink);border-color:var(--card);font-size:12px;padding:6px 12px">${escape(tier)}</div>
          </div>
        </div>

        <div class="section-title">Использование</div>
        <div class="card">
          <div class="usage-row">
            <div class="usage-label">Сообщений в месяц</div>
            <div class="usage-num"><span class="num">${p.usage_msgs ?? 0}</span><span class="muted small"> / ${p.limit_msgs ?? '∞'}</span></div>
          </div>
          <div class="progress" style="margin:6px 0 14px"><div style="width:${Math.min(100, ((p.usage_msgs||0)/(p.limit_msgs||1))*100)}%"></div></div>
          <div class="usage-row">
            <div class="usage-label">AI-генераций</div>
            <div class="usage-num"><span class="num">${p.usage_ai ?? 0}</span><span class="muted small"> / ${p.limit_ai ?? '∞'}</span></div>
          </div>
          <div class="progress" style="margin:6px 0 14px"><div class="" style="width:${Math.min(100, ((p.usage_ai||0)/(p.limit_ai||1))*100)}%;background:var(--plum);background-image:repeating-linear-gradient(to right,transparent 0 6px,rgba(0,0,0,.18) 6px 8px)"></div></div>
          <div class="usage-row">
            <div class="usage-label">Активных кампаний</div>
            <div class="usage-num"><span class="num">${p.usage_camps ?? 0}</span><span class="muted small"> / ${p.limit_camps ?? '∞'}</span></div>
          </div>
          <div class="progress mint" style="margin:6px 0 0"><div style="width:${Math.min(100, ((p.usage_camps||0)/(p.limit_camps||1))*100)}%"></div></div>
        </div>

        <div class="section-title">Достижения</div>
        <div class="achievements">
          <div class="ach"><div class="ach-ico pix-ink" data-pix="ninja"></div><div class="ach-lbl">Ниндзя</div></div>
          <div class="ach"><div class="ach-ico pix-gold" data-pix="paper_plane"></div><div class="ach-lbl">100 отв</div></div>
          <div class="ach"><div class="ach-ico pix-red" data-pix="target"></div><div class="ach-lbl">20% RR</div></div>
          <div class="ach locked"><div class="ach-ico pix-plum" data-pix="fire"></div><div class="ach-lbl">Дракон</div></div>
        </div>

        <div class="section-title">Настройки outreach</div>
        <div class="card">
          <label class="usage-label">Calendly URL</label>
          <input id="prof-calendly" value="${escape(p.calendly_url||'')}" placeholder="https://calendly.com/yourname/30min" class="pixel-input">
          <div class="muted small" style="margin-top:6px">Появится кнопкой 📅 в шапке переписки — отправит ссылку лиду.</div>
        </div>
        <div class="card">
          <label class="usage-label">Cooldown между сообщениями (дни)</label>
          <input id="prof-cooldown" type="number" min="0" max="365" value="${p.cooldown_days ?? 14}" class="pixel-input">
          <div class="muted small" style="margin-top:6px">Защита от дубликатов: если этому tg_id уже улетело сообщение за N дней — skip. <b>0 = выкл.</b></div>
        </div>
        <div class="card">
          <label class="usage-label">Quick replies (по одному в строке)</label>
          <textarea id="prof-quick" rows="5" placeholder="ок, перезвоню в чт&#10;спасибо, изучу&#10;давай созвонимся завтра в 16:00" class="pixel-input">${escape((p.quick_replies||[]).join('\n'))}</textarea>
          <div class="muted small" style="margin-top:6px">Появятся чипсами над input в каждой переписке.</div>
        </div>
        <button class="btn primary full" data-action="save-profile">Сохранить</button>
      </div>`;
  },

  // ---------- GURU ----------
  guru: (st) => {
    const msgs = st?.messages;
    const actions = st?.actions || [];
    if (msgs === null) {
      return `<div class="screen"><div class="empty"><div class="empty-ico" data-pix="clock"></div><div class="empty-title">Загружаю Guru</div></div></div>`;
    }
    const pending = actions.filter(a => a.status === 'pending');
    const draftHTML = (a) => `
      <div class="guru-card guru-card-${escape(a.status)}" data-act-id="${a.id}">
        <div class="guru-card-head">
          <div class="guru-card-title">${a.trigger === 'incoming_reply' ? '✉ Лиду:' : '✎ Черновик для:'} <b>${escape(a.target_label || a.target_username || a.target_phone || '?')}</b></div>
          <div class="guru-card-meta">${escape(a.status)}${a.trigger === 'incoming_reply' ? ' · авто' : ''}</div>
        </div>
        ${a.intent ? `<div class="guru-card-intent">«${escape(a.intent)}»</div>` : ''}
        <textarea class="guru-draft" id="guru-draft-${a.id}" rows="3" ${a.status !== 'pending' ? 'disabled' : ''}>${escape(a.draft_text || '')}</textarea>
        ${a.status === 'pending' ? `
          <div class="guru-actions">
            <button class="btn primary" onclick="guruApprove(${a.id})" title="Отправить черновик от твоего имени лиду">✓ Approve & Send</button>
            <button class="btn" onclick="guruEdit(${a.id})" title="Сохранить правки текста (без отправки)">Сохранить правки</button>
            <button class="btn ghost" onclick="guruReject(${a.id})" title="Отклонить черновик — не отправлять">Отклонить</button>
          </div>` : ''}
        ${a.error ? `<div class="guru-card-error">⚠️ ${escape(a.error)}</div>` : ''}
      </div>`;
    const msgHTML = (m) => {
      if (m.tool_calls && m.tool_calls.length) {
        const aid = m.tool_calls[0]?.action_id;
        const a = aid && actions.find(x => x.id === aid);
        if (a) return `<div class="guru-msg guru-msg-${escape(m.role)}"><div class="guru-bubble">${escape(m.content)}</div>${draftHTML(a)}</div>`;
      }
      return `<div class="guru-msg guru-msg-${escape(m.role)}"><div class="guru-bubble">${escape(m.content).replace(/\n/g,'<br>')}</div></div>`;
    };
    const standalonePending = pending.filter(a => !msgs.some(m => (m.tool_calls||[]).some(tc => tc.action_id === a.id)));
    return `
    <div class="screen guru-screen">
      <div class="head-row"><h2>★ Guru</h2><div class="muted small">${pending.length} pending</div></div>
      <div class="guru-log" id="guru-log">
        ${msgs.length === 0 && actions.length === 0 ? `
          <div class="empty"><div class="empty-ico" data-pix="ninja"></div>
            <div class="empty-title">Привет, ${escape(ME.first_name)}!</div>
            <div class="empty-sub">Пиши: «ответь @user привет», «спроси Х про цены», «напиши +7… демо завтра».<br>
            Я сгенерю черновик — ты апрувнешь — улетит лиду.</div>
          </div>` : ''}
        ${standalonePending.map(draftHTML).join('')}
        ${msgs.map(msgHTML).join('')}
      </div>
      <div class="guru-input-bar">
        <textarea id="guru-input" rows="2" placeholder="Задача для Guru…"></textarea>
        <button class="btn primary" onclick="guruSend()" title="Отправить задачу Guru — он сгенерит черновик">→</button>
      </div>
    </div>`;
  },

  // ---------- MORE ----------
  more: () => `
    <div class="screen">
      <div class="head-row"><h2>Ещё</h2></div>
      <div class="section-title">Аккаунт</div>
      <div class="list-item" data-action="goto-profile">
        <div class="list-ico" data-pix="user"></div>
        <div class="list-text"><div class="list-title">@${escape(ME.username || 'без юзернейма')}</div><div class="list-sub">Профиль · Calendly-ссылка</div></div>
        <div class="list-arrow">›</div>
      </div>
      <div class="section-title">AI</div>
      <div class="list-item" data-action="goto-templates">
        <div class="list-ico pix-plum" data-pix="spark"></div><div class="list-text"><div class="list-title">AI-ассистент</div><div class="list-sub">Шаблоны и генератор сообщений</div></div><div class="list-arrow">›</div>
      </div>
      <div class="section-title">Сообщество</div>
      <div class="list-item" data-action="goto-idea-submit">
        <div class="list-ico" data-pix="idea"></div><div class="list-text"><div class="list-title">Оставить идею</div><div class="list-sub">Что улучшить в приложении</div></div><div class="list-arrow">›</div>
      </div>
      <div class="list-item" data-action="goto-my-ideas">
        <div class="list-ico" data-pix="list"></div><div class="list-text"><div class="list-title">Мои идеи</div><div class="list-sub">Статусы предложенных идей</div></div><div class="list-arrow">›</div>
      </div>
      ${IS_ADMIN ? `
      <div class="list-item" data-action="goto-admin-ideas">
        <div class="list-ico pix-red" data-pix="settings"></div><div class="list-text"><div class="list-title">Админка · идеи</div><div class="list-sub">Управление предложениями пользователей</div></div><div class="list-arrow">›</div>
      </div>
      ` : ''}
      <div class="list-item" data-action="contact-support">
        <div class="list-ico pix-sky" data-pix="info"></div><div class="list-text"><div class="list-title">Поддержка</div><div class="list-sub">${escape(SUPPORT)}</div></div><div class="list-arrow">›</div>
      </div>
    </div>
  `,
};

// ===== Render =====
function render(name, state = {}) {
  const prev = currentScreen;
  if (!_navBack && prev && prev !== name) {
    if (MAIN_TABS.has(name)) {
      navStack.length = 0;
    } else {
      navStack.push({ name: prev, state: { ...(screenState[prev] || {}) } });
      if (navStack.length > 50) navStack.shift();
    }
  }
  _navBack = false;
  currentScreen = name;
  screenState[name] = { ...screenState[name], ...state };
  $('#screen-root').innerHTML = screens[name](screenState[name]);
  _hydratePixIcons($('#screen-root'));
  document.querySelectorAll('.tab').forEach(t => {
    t.classList.toggle('active', t.dataset.screen === name);
  });
  if (tg) {
    const isMain = MAIN_TABS.has(name);
    if (isMain) tg.BackButton.hide(); else tg.BackButton.show();
  }
}

// ===== Loaders =====
async function loadOutreachSummaries() {
  try {
    const [accs, lists, tmpls, camps] = await Promise.all([
      API.accounts.list().catch(() => []),
      API.lists.list().catch(() => []),
      API.templates.list().catch(() => []),
      API.campaigns.list().catch(() => []),
    ]);
    const $$ = (id, txt) => { const el = document.getElementById(id); if (el) el.textContent = txt; };
    $$('accounts-summary',  accs.length ? `${accs.length} подключено · ${accs.filter(a=>a.status==='active').length} активны` : 'Нет аккаунтов · подключите');
    $$('lists-summary',     lists.length ? `${lists.length} списков · ${lists.reduce((s,l)=>s+l.count,0)} лидов` : 'Нет списков · импортируйте');
    $$('templates-summary', tmpls.length ? `${tmpls.length} шаблонов` : 'Нет шаблонов · создайте');
    $$('campaigns-summary', camps.length ? `${camps.length} всего · ${camps.filter(c=>c.status==='live').length} live` : 'Нет кампаний');
  } catch (e) { console.warn('outreach summaries:', e); }
}

async function loadAccounts() {
  try {
    const [accounts, statsArr] = await Promise.all([
      API.accounts.list(),
      API.accounts.stats().catch(() => []),
    ]);
    const stats = {};
    statsArr.forEach(s => { stats[s.account_id] = s; });
    render('accounts', { accounts, stats });
  } catch (e) {
    toast(`Не удалось загрузить аккаунты: ${e.message}`);
    render('accounts', { accounts: [], stats: {} });
  }
}

async function loadLists() {
  try {
    const lists = await API.lists.list();
    render('lists', { lists });
  } catch (e) {
    toast(`Не удалось загрузить списки: ${e.message}`);
    render('lists', { lists: [] });
  }
}

async function openList(id, name) {
  try {
    const leads = await API.lists.leads(id);
    render('list_detail', { list_id: id, list_name: name, leads, filter: 'all' });
  } catch (e) { toast(`Ошибка: ${e.message}`); }
}

async function loadTemplates() {
  try { render('templates', { templates: await API.templates.list() }); }
  catch (e) { render('templates', { templates: [] }); toast(`Ошибка: ${e.message}`); }
}

async function loadCampaigns() {
  try {
    const [campaigns, lists, templates, accounts] = await Promise.all([
      API.campaigns.list().catch(() => []),
      API.lists.list().catch(() => []),
      API.templates.list().catch(() => []),
      API.accounts.list().catch(() => []),
    ]);
    render('campaigns', { campaigns, lists, templates, accounts });
  } catch (e) { toast(`Ошибка: ${e.message}`); }
}

async function openCampaign(id) {
  try {
    const [items, list] = await Promise.all([
      API.campaigns.outbox(id).catch(() => []),
      API.campaigns.list(),
    ]);
    const campaign = list.find(c => c.id === id);
    render('campaign_detail', { campaign, items, filter: 'all' });
  } catch (e) { toast(`Ошибка: ${e.message}`); }
}

async function loadParserTool() {
  try { const accounts = await API.accounts.list(); render('tool_parser', { accounts }); }
  catch { render('tool_parser', { accounts: [] }); }
}

async function loadSearchTool() {
  try { const accounts = await API.accounts.list(); render('tool_search', { accounts }); }
  catch { render('tool_search', { accounts: [] }); }
}

let _dashHash = '';
async function loadDashboard(silent=false) {
  if (silent && currentScreen !== 'dashboard') return;
  try {
    const [data, tasks] = await Promise.all([
      API.dashboard.get(),
      API.tasks.list('today').catch(() => []),
    ]);
    const h = JSON.stringify([data, tasks?.map(t=>t.id+':'+t.text)]);
    if (silent && h === _dashHash) return;
    _dashHash = h;
    render('dashboard', { data, tasks });
  } catch (e) {
    if (!silent) {
      render('dashboard', { data: null, tasks: [] });
      toast(`Не удалось загрузить дашборд: ${e.message}`);
    }
  }
}

async function refreshBadges() {
  try {
    const b = await API.dashboard.badges();
    document.querySelectorAll('.tab').forEach(t => {
      const screen = t.dataset.screen;
      let count = 0;
      if (screen === 'inbox')    count = b.inbox_unread;
      if (screen === 'outreach') count = b.outreach_live;
      let badge = t.querySelector('.tab-badge');
      if (count > 0) {
        if (!badge) {
          badge = document.createElement('span'); badge.className = 'tab-badge';
          t.appendChild(badge);
        }
        badge.textContent = count > 99 ? '99+' : count;
      } else if (badge) {
        badge.remove();
      }
    });
  } catch {}
}

let _guruHash = '';
function _hashGuru(h) {
  // Хешируем минимально-достаточный набор полей: id и status у actions, id у messages.
  const m = (h.messages || []).map(x => x.id).join(',');
  const a = (h.actions || []).map(x => `${x.id}:${x.status}:${(x.draft_text||'').length}`).join(',');
  return `${m}|${a}`;
}

async function loadGuru(silent=false) {
  if (silent && currentScreen !== 'guru') return;
  if (!silent) {
    if (currentScreen !== 'guru') render('guru', { messages: null, actions: [] });
  }
  try {
    const h = await API.guru.history(60);
    const newHash = _hashGuru(h);
    if (silent && newHash === _guruHash) return;   // ничего не изменилось — не дёргаем DOM
    _guruHash = newHash;
    const draft = document.getElementById('guru-input')?.value || '';
    const focused = document.activeElement?.id;
    const caret = focused === 'guru-input' ? document.activeElement.selectionStart : null;
    render('guru', { messages: h.messages, actions: h.actions, _draft: draft });
    requestAnimationFrame(() => {
      const log = document.getElementById('guru-log');
      if (log) log.scrollTop = log.scrollHeight;
      const inp = document.getElementById('guru-input');
      if (inp && draft) {
        inp.value = draft;
        if (focused === 'guru-input') {
          inp.focus();
          if (caret != null) inp.setSelectionRange(caret, caret);
        }
      }
    });
  } catch (e) {
    if (!silent) {
      render('guru', { messages: [], actions: [] });
      toast(`Guru недоступен: ${e.message}`);
    }
  }
}

async function guruSend() {
  const inp = document.getElementById('guru-input');
  const text = (inp?.value || '').trim();
  if (!text) return;
  inp.value = '';
  // оптимистично рендерим юзерское сообщение
  const cur = screenState.guru || { messages: [], actions: [] };
  cur.messages = [...(cur.messages||[]), { role: 'user', content: text, _temp: true }];
  render('guru', cur);
  try {
    await API.guru.chat(text);
  } catch (e) { toast(`Ошибка: ${e.message}`); }
  loadGuru(true);
}

async function guruApprove(id) {
  try { await API.guru.approve(id); loadGuru(true); }
  catch (e) { toast(`Ошибка: ${e.message}`); }
}
async function guruReject(id) {
  try { await API.guru.reject(id); loadGuru(true); }
  catch (e) { toast(`Ошибка: ${e.message}`); }
}
async function guruEdit(id) {
  const el = document.getElementById(`guru-draft-${id}`);
  const txt = (el?.value || '').trim();
  if (!txt) return;
  try {
    await API.guru.edit(id, txt);
    toast('✓ Сохранено');
    loadGuru(true);
  }
  catch (e) { toast(`Ошибка: ${e.message}`); }
}

let _inboxHash = '';
function _hashInbox(convs) {
  return convs.map(c => `${c.id}:${c.unread?1:0}:${c.last_message_at}:${(c.last_text||'').length}`).join(',');
}

async function loadInbox(silent=false) {
  if (silent && currentScreen !== 'inbox') return;
  if (!silent) render('inbox', { conversations: null });
  try {
    const conversations = await API.inbox.list();
    const newHash = _hashInbox(conversations);
    if (silent && newHash === _inboxHash) return;
    _inboxHash = newHash;
    const filter = screenState.inbox?.filter || 'all';
    render('inbox', { conversations, filter });
  } catch (e) {
    if (!silent) {
      render('inbox', { conversations: [] });
      toast(`Не удалось загрузить inbox: ${e.message}`);
    }
  }
}

async function openConv(cid) {
  try {
    const messages = await API.inbox.messages(cid);
    const conv = (screenState.inbox?.conversations || []).find(c => c.id === cid);
    render('conv', {
      conv_id: cid, messages,
      lead_tg_id: conv?.lead_tg_id || null,
      title: conv?.lead_name || conv?.lead_username || `Чат #${cid}`,
      subtitle: conv?.account_phone ? `через ${conv.account_phone}` : '',
      bot_mode: conv?.bot_mode || 'auto',
      guru_mode: conv?.guru_mode || 'admin_approved',
    });
    requestAnimationFrame(() => {
      const ml = document.getElementById('msg-list');
      if (ml) ml.scrollTop = ml.scrollHeight;
    });
  } catch (e) { toast(`Ошибка: ${e.message}`); }
}

// ===== Loaders: deals/tasks/kb/analytics/stoplist/profile =====
async function loadDeals() {
  try { render('deals', { deals: await API.deals.list() }); }
  catch (e) { render('deals', { deals: [] }); toast(`Ошибка: ${e.message}`); }
}
async function loadTasks() {
  try { render('tasks', { tasks: await API.tasks.list('open') }); }
  catch (e) { render('tasks', { tasks: [] }); toast(`Ошибка: ${e.message}`); }
}
async function loadKb() {
  try { render('kb', { items: await API.kb.list() }); }
  catch (e) { render('kb', { items: [] }); toast(`Ошибка: ${e.message}`); }
}
async function loadAnalytics() {
  try {
    const [templates, accounts] = await Promise.all([API.analytics.templates(), API.analytics.accounts()]);
    render('analytics', { templates, accounts });
  } catch (e) { render('analytics', { templates: [], accounts: [] }); toast(`Ошибка: ${e.message}`); }
}
async function loadStoplist() {
  try { render('stoplist', { items: await API.stoplist.list() }); }
  catch (e) { render('stoplist', { items: [] }); toast(`Ошибка: ${e.message}`); }
}
async function loadProfile() {
  try { render('profile', { profile: await API.profile.get() }); }
  catch (e) { render('profile', { profile: {} }); toast(`Ошибка: ${e.message}`); }
}

// ===== Loaders for new screens =====
async function loadMyIdeas() {
  try { render('my_ideas', { ideas: await API.ideas.mine() }); }
  catch (e) { render('my_ideas', { ideas: [] }); toast(`Ошибка: ${e.message}`); }
}

async function loadAdminIdeas(filter='all') {
  try { render('admin_ideas', { ideas: await API.ideas.adminList(), filter }); }
  catch (e) { render('admin_ideas', { ideas: [], filter }); toast(`Ошибка: ${e.message}`); }
}

// ===== Action handler =====
async function handleAction(action, el) {
  haptic();
  switch (action) {
    case 'open-lead':       toast(`Карточка лида: ${el.dataset.name}\n\n(скоро)`); break;
    case 'run-briefing':    {
      try { await API.briefing.run(); toast('☀️ Брифинг отправлен в чат с ботом'); }
      catch (e) { toast(`Ошибка: ${e.message}`); }
      break;
    }

    // Outreach navigation
    case 'goto-accounts':   loadAccounts(); break;
    case 'goto-lists':      loadLists(); break;
    case 'goto-templates':  loadTemplates(); break;
    case 'goto-campaigns':  loadCampaigns(); break;
    case 'parse-group':     loadParserTool(); break;
    case 'find-groups':     loadSearchTool(); break;

    // FAB on accounts
    case 'fab-toggle':      toggleFab(); break;
    case 'fab-manual':      closeFab(); render('add_account', { step: 'phone', phone: '', proxy: '' }); break;
    case 'fab-forward': {
      closeFab();
      // Открываем чат с CRM-ботом — туда форвардим сообщение, бот добавит автора в список
      openTgUser('crm_outreach_bot');
      setTimeout(() => toast('Форварданите любое сообщение боту — он добавит автора в выбранный список'), 600);
      break;
    }
    case 'fab-sync': {
      closeFab();
      try {
        const accounts = await API.accounts.list();
        render('tg_folders', { accounts, folders: null, account_id: null });
      } catch (e) { toast(`Ошибка: ${e.message}`); }
      break;
    }
    case 'fab-qr': {
      closeFab();
      const accs = (screenState.accounts?.accounts || []).filter(a => a.status === 'active');
      if (!accs.length) { toast('Нужен хотя бы один активный акк'); return; }
      // 1) Пробуем нативный сканер TG
      const handleQr = async (text) => {
        if (!text) return;
        try { tg?.closeScanQrPopup?.(); } catch {}
        const acc = accs[0];   // используем первый активный
        const list_name = `QR · ${new Date().toISOString().slice(0,10)}`;
        try {
          toast('⏳ Вступаю и собираю участников...');
          const r = await API.accounts.qrJoin(acc.id, { invite: text, list_name });
          toast(`✅ ${r.chat_title || 'Чат'} — собрано ${r.count} лидов`);
          loadAccounts();
        } catch (e) { toast(`Ошибка: ${e.message}`); }
      };
      if (tg?.showScanQrPopup) {
        try {
          tg.showScanQrPopup({ text: 'Наведите на QR-код Telegram-чата' }, (text) => { handleQr(text); return true; });
        } catch (e) {
          // fallback на ручной ввод
          const manual = prompt_('Не получилось открыть сканер. Вставьте инвайт-ссылку:', '');
          if (manual) handleQr(manual);
        }
      } else {
        const manual = prompt_('Сканер недоступен в этой версии TG. Вставьте инвайт-ссылку:', '');
        if (manual) handleQr(manual);
      }
      break;
    }

    // TG folders sync
    case 'tf-load': {
      const id = parseInt(document.getElementById('tf-acc').value, 10);
      const st = screenState.tg_folders;
      render('tg_folders', { ...st, account_id: id, folders: null, loading: true, error: null });
      try {
        const folders = await API.accounts.folders(id);
        render('tg_folders', { ...st, account_id: id, folders, loading: false, error: null });
      } catch (e) {
        render('tg_folders', { ...st, account_id: id, folders: null, loading: false, error: e.message });
      }
      break;
    }
    case 'tf-import': {
      const fid   = parseInt(el.dataset.fid, 10);
      const fname = el.dataset.fname;
      const st    = screenState.tg_folders;
      const accId = st.account_id;
      const list_name = `📁 ${fname} — ${new Date().toISOString().slice(0,10)}`;
      try {
        toast('⏳ Импортирую участников папки...');
        const r = await API.accounts.importFolder(accId, { folder_id: fid, list_name });
        toast(`✅ Создан список «${r.name||list_name}» — ${r.count} лидов`);
        if (st.return_to_wizard) {
          const lists = await API.lists.list().catch(() => []);
          const w = screenState.campaign_wizard || {};
          render('campaign_wizard', { ...w, lists, data: { ...(w.data||{}), list_id: r.list_id } });
        } else {
          loadLists();
        }
      } catch (e) { toast(`Ошибка: ${e.message}`); }
      break;
    }

    // Accounts
    case 'add-account':     render('add_account', { step: 'phone', phone: '', proxy: '' }); break;
    case 'back-to-accounts': loadAccounts(); break;
    case 'account-send-code': {
      const phone = document.getElementById('f-phone').value.trim();
      const proxy = document.getElementById('f-proxy').value.trim() || null;
      if (!phone) { toast('Введите номер'); return; }
      try {
        const r = await API.accounts.authStart({ phone, proxy });
        render('add_account', { step: 'code', phone, proxy, auth_session_id: r.auth_session_id });
      } catch (e) { toast(`Ошибка: ${e.message}`); }
      break;
    }
    case 'account-verify': {
      const code = document.getElementById('f-code').value.trim();
      const st = screenState.add_account;
      if (!code) { toast('Введите код'); return; }
      try {
        const r = await API.accounts.authVerify({ auth_session_id: st.auth_session_id, code });
        if (r.needs_password) { render('add_account', { step: 'password', code }); break; }
        toast(`Аккаунт подключён: ${r.first_name || r.username || r.tg_id}`);
        loadAccounts();
      } catch (e) { toast(`Ошибка: ${e.message}`); }
      break;
    }
    case 'account-verify-2fa': {
      const password = document.getElementById('f-password').value;
      const st = screenState.add_account;
      try {
        const r = await API.accounts.authVerify({ auth_session_id: st.auth_session_id, code: st.code, password });
        toast(`Аккаунт подключён: ${r.first_name || r.username || r.tg_id}`);
        loadAccounts();
      } catch (e) { toast(`Ошибка: ${e.message}`); }
      break;
    }
    case 'open-account': {
      const id = parseInt(el.dataset.id, 10);
      const account = (screenState.accounts?.accounts || []).find(a => a.id === id);
      const stat = (screenState.accounts?.stats || {})[id] || {};
      if (account) render('account_detail', { account, stat });
      break;
    }
    case 'account-save': {
      const id = parseInt(el.dataset.id, 10);
      const data = {
        daily_limit:        parseInt(document.getElementById('ad-limit').value, 10),
        proxy:              document.getElementById('ad-proxy').value.trim() || '',
        warmup_enabled:     document.getElementById('ad-warmup')?.checked || false,
        auto_reply_enabled: document.getElementById('ad-autoreply')?.checked || false,
        auto_reply_prompt:  document.getElementById('ad-autoprompt')?.value || '',
        schedule:           collectSchedule(),
        bot_max_per_thread: parseInt(document.getElementById('ad-bot-max')?.value || '5', 10),
        bot_rate_limit_hour: parseInt(document.getElementById('ad-bot-rate')?.value || '10', 10),
      };
      try { await API.accounts.update(id, data); toast('✅ Сохранено'); loadAccounts(); }
      catch (e) { toast(`Ошибка: ${e.message}`); }
      break;
    }
    case 'account-toggle': {
      const id = parseInt(el.dataset.id, 10);
      const to = el.dataset.to;
      try { await API.accounts.update(id, { status: to }); toast(to==='paused'?'Поставлен на паузу':'Активирован'); loadAccounts(); }
      catch (e) { toast(`Ошибка: ${e.message}`); }
      break;
    }
    case 'account-delete': {
      const id = parseInt(el.dataset.id, 10);
      const yes = await confirm_('Удалить аккаунт из CRM? (файл сессии сохранится)');
      if (yes) { try { await API.accounts.remove(id); loadAccounts(); } catch (e) { toast(`Ошибка: ${e.message}`); } }
      break;
    }
    case 'account-reauth': {
      // Открываем стандартный flow добавления с префиллом — backend сам грохнет старую запись
      render('add_account', {
        step: 'phone',
        phone: el.dataset.phone || '',
        proxy: el.dataset.proxy || '',
      });
      break;
    }

    // Lists
    case 'upload-csv':       render('csv_upload', {}); break;
    case 'create-empty-list': render('list_create', {}); break;
    case 'lc-create': {
      const name = (document.getElementById('lc-name').value || '').trim();
      if (!name) { toast('Введи название'); return; }
      try {
        const ll = await API.lists.create(name);
        toast(`✅ Список «${ll.name}» создан`);
        openList(ll.id, ll.name);
      } catch (e) { toast(`Ошибка: ${e.message}`); }
      break;
    }
    case 'csv-upload-go': {
      const name = document.getElementById('cu-name').value.trim();
      const file = document.getElementById('cu-file').files[0];
      const out = document.getElementById('cu-result');
      const returnToWizard = !!screenState.csv_upload?.return_to_wizard;
      if (!file) { out.innerHTML = '<div class="card" style="color:#ef4444">Выберите CSV-файл</div>'; return; }
      if (!name) { out.innerHTML = '<div class="card" style="color:#ef4444">Укажите название</div>'; return; }
      out.innerHTML = '<div class="card">⏳ Загружаю...</div>';
      try {
        const r = await API.lists.upload(name, file);
        out.innerHTML = `<div class="card">✅ Импортировано: ${r.count} лидов в список «${escape(r.name)}»</div>`;
        if (returnToWizard) {
          // обновляем lists в визарде и возвращаемся
          const lists = await API.lists.list().catch(() => []);
          const w = screenState.campaign_wizard || {};
          render('campaign_wizard', { ...w, lists, data: { ...(w.data||{}), list_id: r.id } });
        } else {
          setTimeout(() => loadLists(), 1500);
        }
      } catch (e) {
        out.innerHTML = `<div class="card" style="color:#ef4444">Ошибка: ${escape(e.message)}</div>`;
      }
      break;
    }
    case 'open-list':        openList(parseInt(el.dataset.id, 10), el.querySelector('.lead-name')?.textContent); break;
    case 'add-lead-to-list': {
      const st = screenState.list_detail;
      render('lead_edit', { lead: { id: 0, list_id: st.list_id, status: 'New' }, return_list_id: st.list_id, return_list_name: st.list_name });
      break;
    }
    case 'edit-lead': {
      const id = parseInt(el.dataset.id, 10);
      const lead = (screenState.list_detail?.leads || []).find(l => l.id === id);
      if (lead) render('lead_edit', { lead, return_list_id: screenState.list_detail.list_id, return_list_name: screenState.list_detail.list_name });
      break;
    }
    case 'save-lead': {
      const id = parseInt(el.dataset.id, 10);
      const data = {
        username: document.getElementById('le-username').value.trim() || null,
        full_name: document.getElementById('le-name').value.trim() || null,
        company: document.getElementById('le-company').value.trim() || null,
        first_message: document.getElementById('le-msg').value.trim() || null,
        status: document.getElementById('le-status').value,
      };
      try {
        if (id) await API.lists.updateLead(id, data);
        else    await API.lists.addLead(screenState.lead_edit.return_list_id, data);
        toast('Сохранено');
        const st = screenState.lead_edit;
        openList(st.return_list_id, st.return_list_name);
      } catch (e) { toast(`Ошибка: ${e.message}`); }
      break;
    }
    case 'delete-lead': {
      const id = parseInt(el.dataset.id, 10);
      const yes = await confirm_('Удалить лида?');
      if (yes) {
        try { await API.lists.deleteLead(id); const st = screenState.lead_edit; openList(st.return_list_id, st.return_list_name); }
        catch (e) { toast(`Ошибка: ${e.message}`); }
      }
      break;
    }
    case 'open-lead-tg': openTgUser(el.dataset.username); break;
    case 'delete-list': {
      const id = parseInt(el.dataset.id, 10);
      const yes = await confirm_('Удалить весь список со всеми лидами?');
      if (yes) { try { await API.lists.remove(id); loadLists(); } catch (e) { toast(`Ошибка: ${e.message}`); } }
      break;
    }

    // Templates
    case 'new-template':  render('template_edit', { template: {} }); break;
    case 'edit-template': {
      const id = parseInt(el.dataset.id, 10);
      const t = (screenState.templates?.templates || []).find(x => x.id === id);
      if (t) render('template_edit', { template: t });
      break;
    }
    case 'save-template': {
      const id = parseInt(el.dataset.id, 10);
      const data = {
        name: document.getElementById('te-name').value.trim(),
        body: document.getElementById('te-body').value.trim(),
        ai_prompt: document.getElementById('te-ai').value.trim() || null,
      };
      if (!data.name || !data.body) { toast('Название и текст обязательны'); return; }
      try {
        if (id) { await API.templates.remove(id); await API.templates.create(data); }
        else    { await API.templates.create(data); }
        toast('Сохранено');
        loadTemplates();
      } catch (e) { toast(`Ошибка: ${e.message}`); }
      break;
    }
    case 'delete-template': {
      const id = parseInt(el.dataset.id, 10);
      const yes = await confirm_('Удалить шаблон?');
      if (yes) { try { await API.templates.remove(id); loadTemplates(); } catch (e) { toast(`Ошибка: ${e.message}`); } }
      break;
    }

    // AI composer
    case 'open-ai-composer': render('ai_composer'); break;
    case 'ai-generate': {
      const sys = document.getElementById('ai-sys').value;
      localStorage.setItem('ai_sys', sys);
      const data = {
        system_prompt: sys,
        lead: {
          first_name: document.getElementById('ai-name').value || 'друг',
          bio: document.getElementById('ai-bio').value || '',
        },
        tone: document.getElementById('ai-tone').value,
        cta: document.getElementById('ai-cta').value,
      };
      const out = document.getElementById('ai-result');
      out.innerHTML = '<div class="card">Генерирую…</div>';
      try {
        const r = await API.ai.generate(data);
        out.innerHTML = `
          <div class="card">
            <div style="font-size:11px;color:var(--text-muted);margin-bottom:8px">СГЕНЕРИРОВАНО:</div>
            <div style="white-space:pre-wrap;font-size:14px">${escape(r.text)}</div>
          </div>
          <button class="btn full" style="margin-top:8px" onclick="navigator.clipboard.writeText(${JSON.stringify(r.text)});window.Telegram?.WebApp?.showAlert?.('Скопировано')">Копировать</button>
        `;
      } catch (e) {
        out.innerHTML = `<div class="card" style="color:#ef4444">Ошибка: ${escape(e.message)}<br><br>Проверьте что в .env задан ANTHROPIC_API_KEY</div>`;
      }
      break;
    }

    // Inbox: select mode + bulk delete
    case 'ib-select-on': {
      render('inbox', { ...screenState.inbox, select_mode: true, selected: [] });
      break;
    }
    case 'ib-select-cancel': {
      render('inbox', { ...screenState.inbox, select_mode: false, selected: [] });
      break;
    }
    case 'ib-toggle': {
      const id = parseInt(el.dataset.id, 10);
      const st = screenState.inbox;
      const sel = new Set(st.selected || []);
      sel.has(id) ? sel.delete(id) : sel.add(id);
      render('inbox', { ...st, selected: Array.from(sel) });
      break;
    }
    case 'ib-select-all': {
      const st = screenState.inbox;
      const filter = st.filter || 'all';
      const q = (st.q || '').toLowerCase().trim();
      let display = (st.conversations || []);
      if (filter !== 'all') display = display.filter(c => filter === 'unread' ? c.unread : (c.lead_status || 'Без статуса') === filter);
      if (q) display = display.filter(c =>
        (c.lead_name||'').toLowerCase().includes(q)
        || (c.lead_username||'').toLowerCase().includes(q)
        || (c.last_text||'').toLowerCase().includes(q));
      const ids = display.map(c => c.id);
      const sel = new Set(st.selected || []);
      const allIn = ids.every(id => sel.has(id));
      if (allIn) ids.forEach(id => sel.delete(id));
      else ids.forEach(id => sel.add(id));
      render('inbox', { ...st, selected: Array.from(sel) });
      break;
    }
    case 'ib-bulk-delete': {
      const st = screenState.inbox;
      const ids = st.selected || [];
      if (!ids.length) return;
      const yes = await confirm_(`Удалить ${ids.length} переписок? (на стороне Telegram чаты сохранятся)`);
      if (!yes) return;
      try {
        const r = await API.inbox.bulkDelete(ids);
        toast(`🗑 Удалено: ${r.deleted}`);
        // Перезагружаем inbox со снятием режима выбора
        screenState.inbox = { ...st, select_mode: false, selected: [] };
        loadInbox();
      } catch (e) { toast(`Ошибка: ${e.message}`); }
      break;
    }
    case 'conv-delete': {
      const cid = parseInt(el.dataset.id, 10);
      const yes = await confirm_('Удалить эту переписку из CRM-инбокса?');
      if (!yes) return;
      try { await API.inbox.remove(cid); toast('Удалено'); loadInbox(); }
      catch (e) { toast(`Ошибка: ${e.message}`); }
      break;
    }

    // Inbox
    case 'open-conv': openConv(parseInt(el.dataset.id, 10)); break;
    case 'conv-back': loadInbox(); break;
    case 'send-reply': {
      const text = document.getElementById('reply-input').value.trim();
      const cid = parseInt(el.dataset.id, 10);
      if (!text) return;
      try { await API.inbox.reply(cid, text); openConv(cid); }
      catch (e) { toast(`Ошибка: ${e.message}`); }
      break;
    }
    case 'attach-file': {
      const cid = parseInt(el.dataset.id, 10);
      const input = document.getElementById('attach-input');
      input.onchange = async () => {
        const f = input.files[0]; if (!f) return;
        const caption = document.getElementById('reply-input').value.trim();
        try {
          await API.inbox.replyMedia(cid, f, caption);
          openConv(cid);
        } catch (e) { toast(`Ошибка: ${e.message}`); }
      };
      input.click();
      break;
    }

    case 'contact-support': openTgUser(SUPPORT); break;

    // Ideas (любой пользователь)
    case 'goto-idea-submit': render('idea_submit'); break;
    case 'goto-my-ideas':    loadMyIdeas(); break;
    case 'idea-send': {
      const text = document.getElementById('idea-text').value.trim();
      if (text.length < 5) { toast('Идея слишком короткая'); return; }
      try {
        await API.ideas.submit(text);
        toast('💡 Спасибо! Идея отправлена');
        loadMyIdeas();
      } catch (e) { toast(`Ошибка: ${e.message}`); }
      break;
    }

    // Admin: ideas
    case 'goto-admin-ideas': loadAdminIdeas('all'); break;
    case 'idea-set-status': {
      const id = parseInt(el.dataset.id, 10);
      const status = el.dataset.status;
      try {
        await API.ideas.adminUpdate(id, { status });
        loadAdminIdeas(screenState.admin_ideas?.filter || 'all');
      } catch (e) { toast(`Ошибка: ${e.message}`); }
      break;
    }
    case 'idea-add-note': {
      const id = parseInt(el.dataset.id, 10);
      const note = prompt_('Заметка к идее:', '');
      if (note === null) return;
      try {
        await API.ideas.adminUpdate(id, { admin_note: note });
        loadAdminIdeas(screenState.admin_ideas?.filter || 'all');
      } catch (e) { toast(`Ошибка: ${e.message}`); }
      break;
    }
    case 'idea-delete': {
      const id = parseInt(el.dataset.id, 10);
      const yes = await confirm_('Удалить идею навсегда?');
      if (!yes) return;
      try {
        await API.ideas.adminDelete(id);
        loadAdminIdeas(screenState.admin_ideas?.filter || 'all');
      } catch (e) { toast(`Ошибка: ${e.message}`); }
      break;
    }

    // Monday import
    case 'monday-import': render('monday_import', { selected_stages: ['Trial Activated','Objection handling','Initial Contact'] }); break;
    case 'monday-import-go': {
      const board_id = parseInt(document.getElementById('md-board').value, 10);
      const list_name = document.getElementById('md-name').value.trim() || 'Из Monday';
      const stages = screenState.monday_import?.selected_stages || [];
      const root = document.querySelector('#md-stages');
      // Берём активные чипы
      const active_stages = Array.from(root.querySelectorAll('.stage-chip.active')).map(c => c.dataset.mdStage);
      try {
        render('monday_import', { ...screenState.monday_import, status: { message: 'Импортирую…' } });
        const r = await API.monday.importBoard({ board_id, list_name, stages: active_stages });
        render('monday_import', {
          ...screenState.monday_import,
          status: { message: `✅ Импортировано: ${r.imported}, пропущено без TG-username: ${r.skipped_no_username}` },
        });
        setTimeout(() => loadLists(), 1500);
      } catch (e) {
        render('monday_import', { ...screenState.monday_import, status: { message: `Ошибка: ${e.message}`, error: true } });
      }
      break;
    }

    // Campaign wizard
    case 'campaign-new': {
      const st = screenState.campaigns || {};
      render('campaign_wizard', { step: 1, lists: st.lists, templates: st.templates, accounts: st.accounts, data: { name: 'Кампания ' + new Date().toISOString().slice(0,10), account_ids: [] } });
      break;
    }
    case 'cw-pick-list': {
      const id = parseInt(el.dataset.id, 10);
      const w = screenState.campaign_wizard;
      render('campaign_wizard', { ...w, data: { ...w.data, list_id: id } });
      break;
    }
    case 'cw-pick-type': {
      const w = screenState.campaign_wizard;
      const t = el.dataset.type;
      // при смене на one_shot — выкидываем filter_config
      const fc = t === 'dynamic' ? (w.data.filter_config || {}) : null;
      render('campaign_wizard', { ...w, data: { ...w.data, type: t, filter_config: fc } });
      break;
    }
    case 'cw-toggle-status': {
      const w = screenState.campaign_wizard;
      const s = el.dataset.status;
      const fc = { ...(w.data.filter_config || {}) };
      const arr = new Set(fc.statuses || []);
      arr.has(s) ? arr.delete(s) : arr.add(s);
      fc.statuses = Array.from(arr);
      render('campaign_wizard', { ...w, data: { ...w.data, filter_config: fc } });
      break;
    }
    case 'cw-source-csv': {
      const w = screenState.campaign_wizard;
      // Открываем загрузку CSV с возвратом в wizard
      render('csv_upload', { return_to_wizard: true });
      break;
    }
    case 'cw-source-leads': {
      // ничего не делаем — список лидов уже отрендерен ниже на этом шаге
      toast('Выберите список из списка ниже ⬇');
      break;
    }
    case 'cw-source-folder': {
      // Открываем экран синка ТГ-папок с флагом возврата
      try {
        const accounts = await API.accounts.list();
        const active = accounts.filter(a => a.status === 'active');
        if (!active.length) { toast('Нужен активный TG-аккаунт'); return; }
        render('tg_folders', { accounts, folders: null, return_to_wizard: true });
      } catch (e) { toast(`Ошибка: ${e.message}`); }
      break;
    }
    case 'cw-pick-template': {
      const id = parseInt(el.dataset.id, 10);
      const w = screenState.campaign_wizard;
      // Если это был template_id_b — сбрасываем
      const fix = (w.data.template_id_b === id) ? { template_id_b: null } : {};
      render('campaign_wizard', { ...w, data: { ...w.data, template_id: id, ...fix } });
      break;
    }
    case 'cw-pick-template-b': {
      const id = parseInt(el.dataset.id, 10);
      const w = screenState.campaign_wizard;
      render('campaign_wizard', { ...w, data: { ...w.data, template_id_b: id } });
      break;
    }
    case 'cw-toggle-acc': {
      const id = parseInt(el.dataset.id, 10);
      const w = screenState.campaign_wizard;
      const ids = new Set(w.data.account_ids || []);
      ids.has(id) ? ids.delete(id) : ids.add(id);
      render('campaign_wizard', { ...w, data: { ...w.data, account_ids: Array.from(ids) } });
      break;
    }
    case 'cw-next': {
      const from = parseInt(el.dataset.from, 10);
      const w = screenState.campaign_wizard;
      let data = w.data;
      if (from === 1) {
        const nm = document.getElementById('cw-name')?.value.trim();
        data = { ...data, name: nm || data.name };
        if (!data.list_id) { toast('Выберите список лидов'); return; }
      }
      if (from === 2 && !data.template_id) { toast('Выберите шаблон'); return; }
      if (from === 3) {
        // Собираем тексты follow-up'ов
        const fus = [];
        for (let i = 1; i <= 5; i++) {
          const v = document.querySelector(`[data-fu-step="${i}"]`)?.value?.trim() || '';
          if (v) fus.push({ step_idx: i, body: v });
        }
        data = { ...data, followups: fus };
      }
      if (from === 4 && !(data.account_ids || []).length) { toast('Выберите хотя бы один аккаунт'); return; }
      render('campaign_wizard', { ...w, step: from + 1, data });
      break;
    }
    case 'cw-back': {
      const from = parseInt(el.dataset.from, 10);
      // Сохраняем follow-up'ы если уходим с шага 3 назад тоже
      let data = screenState.campaign_wizard.data;
      if (from === 3) {
        const fus = [];
        for (let i = 1; i <= 5; i++) {
          const v = document.querySelector(`[data-fu-step="${i}"]`)?.value?.trim() || '';
          if (v) fus.push({ step_idx: i, body: v });
        }
        data = { ...data, followups: fus };
      }
      render('campaign_wizard', { ...screenState.campaign_wizard, step: from - 1, data });
      break;
    }
    case 'cw-create-and-start':
    case 'cw-create-only': {
      const w = screenState.campaign_wizard;
      const start = action === 'cw-create-and-start';
      try {
        const c = await API.campaigns.create({
          name: w.data.name, list_id: w.data.list_id,
          template_id: w.data.template_id,
          template_id_b: (w.data.ab_mode && w.data.template_id_b) ? w.data.template_id_b : null,
          account_ids: w.data.account_ids,
          type: w.data.type || 'one_shot',
          filter_config: w.data.filter_config || null,
          followups: w.data.followups || [],
        });
        if (start) await API.campaigns.control(c.id, 'start');
        toast(start ? '🚀 Кампания запущена' : '💾 Сохранена как draft');
        loadCampaigns();
      } catch (e) { toast(`Ошибка: ${e.message}`); }
      break;
    }
    case 'campaign-control': {
      const id = parseInt(el.dataset.id, 10);
      const act = el.dataset.act;
      try {
        await API.campaigns.control(id, act);
        if (currentScreen === 'campaign_detail') openCampaign(id);
        else loadCampaigns();
      } catch (e) { toast(`Ошибка: ${e.message}`); }
      break;
    }
    case 'campaign-clone': {
      const id = parseInt(el.dataset.id, 10);
      try { await API.campaigns.clone(id); toast('🔁 Клонировано как draft'); loadCampaigns(); }
      catch (e) { toast(`Ошибка: ${e.message}`); }
      break;
    }
    case 'campaign-delete': {
      const id = parseInt(el.dataset.id, 10);
      const name = el.dataset.name || 'кампанию';
      if (!confirm(`Удалить «${name}»? Это снесёт outbox и follow-ups этой кампании.`)) return;
      try {
        await API.campaigns.remove(id);
        toast('🗑 Удалено');
        loadCampaigns();
      } catch (e) { toast(`Ошибка: ${e.message}`); }
      break;
    }
    case 'cw-test-send': {
      const w = screenState.campaign_wizard;
      const target = ME.username ? ('@' + ME.username) : (ME.id ? String(ME.id) : '');
      if (!target) { toast('Не нашёл, кому слать тест: нет ни username ни tg_id у тебя.'); return; }
      const accs = w.accounts.filter(a => (w.data.account_ids || []).includes(a.id));
      if (!accs.length) { toast('Сначала выберите акк на шаге 4'); return; }
      const activeAcc = accs.find(a => a.status === 'active') || accs[0];
      if (activeAcc.status !== 'active') { toast(`Акк ${activeAcc.phone} не active (${activeAcc.status}). Тест отправить нельзя.`); return; }
      try {
        const r = await API.campaigns.testSend({
          template_id: w.data.template_id,
          account_id:  activeAcc.id,
          target,
        });
        toast(`✅ Тест отправлен (${target}):\n\n${r.rendered.slice(0,400)}`);
      } catch (e) { toast(`Ошибка: ${e.message}`); }
      break;
    }
    case 'open-campaign': openCampaign(parseInt(el.dataset.id, 10)); break;
    case 'ai-suggest': {
      const cid = parseInt(el.dataset.id, 10);
      const inp = document.getElementById('reply-input');
      inp.value = 'Думаю…';
      inp.disabled = true;
      try {
        const r = await API.inbox.suggest(cid);
        inp.value = r.suggestion || '';
      } catch (e) { inp.value = ''; toast(`AI ошибка: ${e.message}\nПроверьте ANTHROPIC_API_KEY в .env`); }
      finally { inp.disabled = false; inp.focus(); }
      break;
    }

    // Parser / Search (real backend)
    case 'run-parser-real': {
      const data = {
        account_id:     parseInt(document.getElementById('parser-acc').value, 10),
        target:         document.getElementById('parser-target').value.trim(),
        list_name:      document.getElementById('parser-listname').value.trim() || 'Парсер',
        messages_limit: parseInt(document.getElementById('parser-limit').value, 10) || 5000,
      };
      if (!data.target) { toast('Укажите чат'); return; }
      const out = document.getElementById('parser-result');
      out.innerHTML = '<div class="card">⏳ Парсю чат… (30-60 сек)</div>';
      try {
        const r = await API.tools.parse(data);
        out.innerHTML = `<div class="card">✅ Найдено пользователей: ${r.found_users}<br>Список #${r.list_id} создан.</div>`;
        setTimeout(() => loadLists(), 1000);
      } catch (e) { out.innerHTML = `<div class="card" style="color:#ef4444">Ошибка: ${escape(e.message)}</div>`; }
      break;
    }
    case 'run-search-real': {
      const data = {
        account_id: parseInt(document.getElementById('search-acc').value, 10),
        keywords:   document.getElementById('search-keywords').value.split(',').map(s=>s.trim()).filter(Boolean),
        chats:      document.getElementById('search-chats').value.split('\n').map(s=>s.trim()).filter(Boolean),
        list_name:  document.getElementById('search-listname').value.trim() || 'Поиск',
      };
      if (!data.keywords.length) { toast('Укажите ключевые слова'); return; }
      if (!data.chats.length)    { toast('Укажите хотя бы один чат'); return; }
      const out = document.getElementById('search-result');
      out.innerHTML = '<div class="card">⏳ Ищу по чатам… (зависит от объёма)</div>';
      try {
        const r = await API.tools.search(data);
        out.innerHTML = `<div class="card">✅ Совпадений: ${r.matched_messages}, уникальных авторов: ${r.matched_users}<br>Список #${r.list_id} создан.</div>`;
        setTimeout(() => loadLists(), 1000);
      } catch (e) { out.innerHTML = `<div class="card" style="color:#ef4444">Ошибка: ${escape(e.message)}</div>`; }
      break;
    }

    // ===== CRM new actions =====
    case 'goto-deals':     loadDeals(); break;
    case 'goto-tasks':     loadTasks(); break;
    case 'goto-kb':        loadKb(); break;
    case 'goto-analytics': loadAnalytics(); break;
    case 'goto-stoplist':  loadStoplist(); break;
    case 'goto-profile':   loadProfile(); break;

    // Profile
    case 'save-profile': {
      const url = document.getElementById('prof-calendly').value.trim();
      const cooldown = parseInt(document.getElementById('prof-cooldown')?.value || '14', 10);
      const qrText = document.getElementById('prof-quick')?.value || '';
      const quick_replies = qrText.split('\n').map(s => s.trim()).filter(Boolean);
      try {
        await API.profile.update({ calendly_url: url || null, cooldown_days: cooldown, quick_replies });
        window.QUICK_REPLIES = quick_replies;
        toast('✅ Сохранено'); loadProfile();
      } catch (e) { toast(`Ошибка: ${e.message}`); }
      break;
    }
    case 'qr-pick': {
      const idx = parseInt(el.dataset.idx, 10);
      const text = (window.QUICK_REPLIES || [])[idx] || '';
      const inp = document.getElementById('reply-input');
      if (inp) { inp.value = text; inp.focus(); }
      break;
    }
    case 'conv-bot-mode': {
      const cid = parseInt(el.dataset.id, 10);
      const cur = el.dataset.current || 'auto';
      const next = ({auto: 'human_only', human_only: 'paused', paused: 'auto'})[cur] || 'auto';
      try {
        await API.inbox.setBotMode(cid, next);
        toast(`Режим: ${next==='auto'?'🤖 авто':next==='human_only'?'👤 только человек':'⏸ пауза'}`);
        const st = screenState.conv;
        render('conv', { ...st, bot_mode: next });
      } catch (e) { toast(`Ошибка: ${e.message}`); }
      break;
    }
    case 'conv-guru-mode': {
      const cid = parseInt(el.dataset.id, 10);
      const cur = el.dataset.current || 'admin_approved';
      const next = ({admin_approved: 'full_access', full_access: 'off', off: 'admin_approved'})[cur] || 'admin_approved';
      try {
        await API.guru.setMode(cid, next);
        toast(`Guru: ${next==='admin_approved'?'★ approve (черновик)':next==='full_access'?'★ auto (без апрува)':'★ off'}`);
        const st = screenState.conv;
        render('conv', { ...st, guru_mode: next });
      } catch (e) { toast(`Ошибка: ${e.message}`); }
      break;
    }
    case 'conv-snooze': {
      const cid = parseInt(el.dataset.id, 10);
      const opts = ['до завтра', 'на 3 дня', 'на неделю', 'на 2 недели'];
      const choice = prompt_(`Snooze на:\n1) ${opts[0]}\n2) ${opts[1]}\n3) ${opts[2]}\n4) ${opts[3]}\n\nВведи номер 1-4:`, '2');
      if (!choice) return;
      const days = ({1:1, 2:3, 3:7, 4:14})[parseInt(choice,10)] || 3;
      const until = new Date(Date.now() + days*24*3600*1000).toISOString();
      try { await API.inbox.snooze(cid, until); toast(`💤 На ${days} дн.`); loadInbox(); }
      catch (e) { toast(`Ошибка: ${e.message}`); }
      break;
    }
    case 'ib-bulk-reply': {
      const ids = screenState.inbox?.selected || [];
      if (!ids.length) return;
      const text = prompt_(`Один и тот же текст в ${ids.length} переписок:`, '');
      if (!text) return;
      const yes = await confirm_(`Точно отправить «${text.slice(0,60)}…» в ${ids.length} чатов?`);
      if (!yes) return;
      try {
        const r = await API.inbox.bulkReply(ids, text);
        toast(`✅ Отправлено: ${r.sent}, ошибок: ${r.failed}`);
        screenState.inbox = { ...screenState.inbox, select_mode: false, selected: [] };
        loadInbox();
      } catch (e) { toast(`Ошибка: ${e.message}`); }
      break;
    }

    // Tasks
    case 'new-task': {
      const text = prompt_('Что сделать?', '');
      if (!text) return;
      const when = prompt_('Когда (дата YYYY-MM-DD или сегодня/завтра/+3д):', 'завтра');
      const due = parseDueDate(when);
      if (!due) { toast('Не понял дату'); return; }
      try { await API.tasks.create({ text, due_date: due }); toast('✅ Задача создана'); loadTasks(); }
      catch (e) { toast(`Ошибка: ${e.message}`); }
      break;
    }
    case 'task-toggle': {
      const id = parseInt(el.dataset.id, 10);
      const done = el.dataset.done !== '1';
      try { await API.tasks.update(id, { done }); loadTasks(); }
      catch (e) { toast(`Ошибка: ${e.message}`); }
      break;
    }
    case 'task-done': {
      const id = parseInt(el.dataset.id, 10);
      try { await API.tasks.update(id, { done: true }); loadDashboard(); }
      catch (e) { toast(`Ошибка: ${e.message}`); }
      break;
    }
    case 'task-delete': {
      const id = parseInt(el.dataset.id, 10);
      const yes = await confirm_('Удалить задачу?');
      if (!yes) return;
      try { await API.tasks.remove(id); loadTasks(); } catch (e) { toast(`Ошибка: ${e.message}`); }
      break;
    }

    // Deals
    case 'new-deal': {
      // Загрузим списки лидов чтобы показать селектор
      try {
        const lists = await API.lists.list();
        if (!lists.length) { toast('Сначала создай хотя бы один список лидов'); return; }
        // Берём всех лидов из всех списков
        const allLeads = [];
        for (const l of lists) {
          const ls = await API.lists.leads(l.id).catch(() => []);
          ls.forEach(x => allLeads.push(x));
        }
        if (!allLeads.length) { toast('Нет лидов чтобы привязать'); return; }
        render('deal_edit', { deal: {}, leads: allLeads });
      } catch (e) { toast(`Ошибка: ${e.message}`); }
      break;
    }
    case 'edit-deal': {
      const id = parseInt(el.dataset.id, 10);
      const deal = (screenState.deals?.deals || []).find(d => d.id === id);
      if (deal) render('deal_edit', { deal });
      break;
    }
    case 'save-deal': {
      const id = parseInt(el.dataset.id, 10);
      const data = {
        name: document.getElementById('d-name').value.trim(),
        stage: document.getElementById('d-stage').value,
        value: parseInt(document.getElementById('d-value').value || '0', 10),
        close_date: document.getElementById('d-close').value ? new Date(document.getElementById('d-close').value).toISOString() : null,
        note: document.getElementById('d-note').value.trim() || null,
      };
      if (!data.name) { toast('Название обязательно'); return; }
      try {
        if (id) {
          await API.deals.update(id, data);
        } else {
          data.lead_id = parseInt(document.getElementById('d-lead').value, 10);
          await API.deals.create(data);
        }
        toast('✅ Сохранено'); loadDeals();
      } catch (e) { toast(`Ошибка: ${e.message}`); }
      break;
    }
    case 'delete-deal': {
      const id = parseInt(el.dataset.id, 10);
      const yes = await confirm_('Удалить сделку?');
      if (!yes) return;
      try { await API.deals.remove(id); loadDeals(); } catch (e) { toast(`Ошибка: ${e.message}`); }
      break;
    }

    // KB
    case 'new-kb':  render('kb_edit', { kb: {} }); break;
    case 'edit-kb': {
      const id = parseInt(el.dataset.id, 10);
      const kb = (screenState.kb?.items || []).find(k => k.id === id);
      if (kb) render('kb_edit', { kb });
      break;
    }
    case 'save-kb': {
      const id = parseInt(el.dataset.id, 10);
      const data = {
        intent: document.getElementById('kb-intent').value,
        question: document.getElementById('kb-q').value.trim(),
        answer: document.getElementById('kb-a').value.trim(),
      };
      if (!data.question || !data.answer) { toast('Вопрос и ответ обязательны'); return; }
      try {
        if (id) await API.kb.update(id, data);
        else    await API.kb.create(data);
        toast('✅ Сохранено'); loadKb();
      } catch (e) { toast(`Ошибка: ${e.message}`); }
      break;
    }
    case 'delete-kb': {
      const id = parseInt(el.dataset.id, 10);
      const yes = await confirm_('Удалить запись?');
      if (!yes) return;
      try { await API.kb.remove(id); loadKb(); } catch (e) { toast(`Ошибка: ${e.message}`); }
      break;
    }

    // Stop-list
    case 'conv-stoplist': {
      const tg_id = parseInt(el.dataset.tg, 10);
      if (!tg_id) { toast('Не нашёл TG ID лида'); return; }
      const yes = await confirm_('Добавить лида в стоп-лист? Кампании больше НЕ будут ему слать.');
      if (!yes) return;
      try { await API.stoplist.set({ tg_id, reason: 'manual', on: true }); toast('🚫 В стоп-листе'); }
      catch (e) { toast(`Ошибка: ${e.message}`); }
      break;
    }
    case 'dnc-remove': {
      const id = parseInt(el.dataset.id, 10);
      try { await API.stoplist.set({ lead_id: id, on: false }); loadStoplist(); }
      catch (e) { toast(`Ошибка: ${e.message}`); }
      break;
    }

    // Calendly quick-send
    case 'conv-calendly': {
      const cid = parseInt(el.dataset.id, 10);
      try {
        const p = await API.profile.get();
        if (!p.calendly_url) {
          toast('Сначала задай Calendly-ссылку в Ещё → Профиль');
          return;
        }
        const text = `Давай созвонимся 15 минут. Выбери удобный слот: ${p.calendly_url}`;
        await API.inbox.reply(cid, text);
        toast('📅 Calendly-ссылка отправлена'); openConv(cid);
      } catch (e) { toast(`Ошибка: ${e.message}`); }
      break;
    }

    case 'todo': toast('TODO'); break;
    default: console.log('action:', action);
  }
}

// ===== Event delegation =====
document.addEventListener('click', (e) => {
  // Settings gear button (top-right) → ведёт во вкладку «Ещё»
  if (e.target.id === 'settings-btn' || e.target.closest('#settings-btn')) {
    stopPoll();
    render('more');
    return;
  }
  const tab = e.target.closest('.tab');
  if (tab) {
    const name = tab.dataset.screen;
    stopPoll();
    if (name === 'inbox') {
      loadInbox();
      startPoll(() => { loadInbox(true); refreshBadges(); }, 15000);
    } else if (name === 'outreach') { render('outreach'); loadOutreachSummaries(); }
    else if (name === 'dashboard') { loadDashboard(); startPoll(() => { loadDashboard(true); refreshBadges(); }, 30000); }
    else if (name === 'guru') { loadGuru(); startPoll(() => loadGuru(true), 8000); }
    else                            render(name);
    return;
  }
  const stage = e.target.closest('.stage-chip');
  if (stage) {
    if (stage.dataset.listFilter !== undefined) {
      render('list_detail', { filter: stage.dataset.listFilter });
      return;
    }
    if (stage.dataset.mdStage !== undefined) {
      stage.classList.toggle('active');
      return;
    }
    if (stage.dataset.cdFilter !== undefined) {
      render('campaign_detail', { ...screenState.campaign_detail, filter: stage.dataset.cdFilter });
      return;
    }
    if (stage.dataset.aiFilter !== undefined) {
      loadAdminIdeas(stage.dataset.aiFilter);
      return;
    }
    if (stage.dataset.inboxFilter !== undefined) {
      render('inbox', { ...screenState.inbox, filter: stage.dataset.inboxFilter });
      return;
    }
    if (stage.dataset.stage !== undefined) {
      render('pipeline', { stage: stage.dataset.stage });
      return;
    }
  }
  const act = e.target.closest('[data-action]')?.dataset.action;
  if (act) handleAction(act, e.target.closest('[data-action]'));
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && document.getElementById('reply-input') === document.activeElement) {
    handleAction('send-reply', document.querySelector('[data-action="send-reply"]'));
  }
});

function goBack() {
  if (navStack.length) {
    const prev = navStack.pop();
    _navBack = true;
    render(prev.name, prev.state);
  } else {
    render('dashboard');
  }
}
if (tg) {
  // BackButton.onClick — no-op в version < 6.1 (баг старых клиентов TG).
  // onEvent регистрирует callback всегда, независимо от версии.
  tg.onEvent('backButtonClicked', goBack);
  tg.BackButton.onClick(goBack);   // дублируем — на всякий случай для новых версий
}
// Изначальный hydrate (tabbar + всё что в HTML)
_hydratePixIcons();

// Topbar collapse — состояние в localStorage
const _topbar = document.getElementById('topbar');
const _toggleBtn = document.getElementById('topbar-toggle');
function _setTopbarCollapsed(c) {
  _topbar?.classList.toggle('collapsed', c);
  if (_toggleBtn) _toggleBtn.textContent = c ? '▾' : '▴';
  try { localStorage.setItem('topbar_collapsed', c ? '1' : '0'); } catch {}
}
_setTopbarCollapsed(localStorage.getItem('topbar_collapsed') === '1');
_toggleBtn?.addEventListener('click', () => {
  _setTopbarCollapsed(!_topbar.classList.contains('collapsed'));
});

// Узнаём, админ ли (для показа пункта «Админка · идеи» в Ещё)
API.me().then(r => {
  IS_ADMIN = !!r.is_admin;
  if (currentScreen === 'more') render('more');
}).catch(() => {});

// Подгружаем quick replies в глобал — в conv-input они идут чипсами
API.profile.get().then(p => { window.QUICK_REPLIES = p.quick_replies || []; }).catch(() => {});

// Initial render
loadDashboard();
refreshBadges();
setInterval(refreshBadges, 30000);   // обновляем бейджи раз в 30 сек глобально
