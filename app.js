// BitOK CRM Mini App
const tg = window.Telegram?.WebApp;
if (tg) { tg.ready(); tg.expand(); tg.setHeaderColor('secondary_bg_color'); }
const ME = tg?.initDataUnsafe?.user || { first_name: 'Гость', username: 'guest' };
const SUPPORT = '@k_gaft';   // Основной аккаунт владельца — поддержка

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

// Стабильный цвет по hash имени (как в Telegram)
const _palette = ['#e25555','#f5a623','#16a34a','#2563eb','#7c3aed','#06b6d4','#ec4899','#f59e0b'];
function colorFor(name) {
  if (!name) return _palette[0];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0;
  return _palette[Math.abs(h) % _palette.length];
}

// Аватарка: <img> с fallback на цветные инициалы
function avatar(tgId, name, size = 40) {
  const color = colorFor(name || String(tgId || '?'));
  const ini = initials(name);
  const fontSize = Math.round(size * 0.4);
  const fallback = `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};color:#fff;display:flex;align-items:center;justify-content:center;font-weight:600;font-size:${fontSize}px;flex:0 0 ${size}px">${escape(ini)}</div>`;
  if (!tgId) return fallback;
  const url = API.avatarUrl(tgId);
  return `<img src="${url}" alt="${escape(ini)}" style="width:${size}px;height:${size}px;border-radius:50%;object-fit:cover;flex:0 0 ${size}px;background:${color}" onerror="this.outerHTML='${fallback.replace(/'/g, "\\'")}'">`;
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

// ===== Screens =====
const screens = {

  // ---------- DASHBOARD (live) ----------
  dashboard: (st) => {
    const d = st?.data;
    if (!d) return `
      <div class="screen">
        <div class="head-row"><h2>Привет, ${escape(ME.first_name)}!</h2></div>
        <div class="empty"><div class="empty-ico">…</div><div class="empty-title">Загружаю данные</div></div>
      </div>`;
    const trendSent = d.sent_yesterday ? (d.sent_today >= d.sent_yesterday ? '↑' : '↓') + ` vs вчера ${d.sent_yesterday}` : 'первый день';
    const queueLine = d.queue
      ? `${d.queue} в очереди${d.eta_days ? ` · ETA ~${d.eta_days} дн` : ''}`
      : 'очередь пуста';
    return `
      <div class="screen">
        <div class="head-row"><h2>Привет, ${escape(ME.first_name)}!</h2></div>
        <div class="stats-grid">
          <div class="stat">
            <div class="stat-label">Отправлено сегодня</div>
            <div class="stat-value">${d.sent_today}</div>
            <div class="stat-trend">${escape(trendSent)}</div>
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

        <div class="section-title">🔥 Горячие лиды (Trial Activated)</div>
        ${d.hot_leads.length === 0 ? `
          <div class="empty" style="padding:24px"><div style="font-size:13px">Нет лидов в Trial. Импортируйте список или поменяйте статусы вручную.</div></div>
        ` : d.hot_leads.map(l => `
          <div class="lead" data-action="open-lead-tg" data-username="${escape(l.username || '')}">
            ${avatar(l.tg_id, l.name)}
            <div class="lead-body"><div class="lead-name">${escape(l.name)}</div><div class="lead-status">${l.username?'@'+escape(l.username):''} · ${escape(l.stage)}</div></div>
            <span class="lead-score hot">trial</span>
          </div>
        `).join('')}

        <div class="section-title">Быстрые действия</div>
        <button class="btn full" data-action="run-briefing">☀️ Прислать брифинг в чат с ботом</button>
      </div>
    `;
  },

  // ---------- PIPELINE ----------
  pipeline: (st) => {
    const active = st?.stage || 'all';
    return `
      <div class="screen">
        <div class="head-row"><h2>Сделки</h2><button class="add-btn" data-action="goto-lists">+</button></div>
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
        <div class="list-ico">⚇</div>
        <div class="list-text"><div class="list-title">TG-аккаунты</div><div class="list-sub" id="accounts-summary">Загружаю…</div></div>
        <div class="list-arrow">›</div>
      </div>
      <div class="list-item" data-action="goto-lists">
        <div class="list-ico">▤</div>
        <div class="list-text"><div class="list-title">Списки лидов</div><div class="list-sub" id="lists-summary">Загружаю…</div></div>
        <div class="list-arrow">›</div>
      </div>
      <div class="list-item" data-action="goto-templates">
        <div class="list-ico">✉</div>
        <div class="list-text"><div class="list-title">Шаблоны и AI</div><div class="list-sub" id="templates-summary">Загружаю…</div></div>
        <div class="list-arrow">›</div>
      </div>
      <div class="list-item" data-action="goto-campaigns">
        <div class="list-ico">▶</div>
        <div class="list-text"><div class="list-title">Кампании</div><div class="list-sub" id="campaigns-summary">Загружаю…</div></div>
        <div class="list-arrow">›</div>
      </div>
      <div class="section-title">Инструменты</div>
      <div class="list-item" data-action="parse-group">
        <div class="list-ico">⚡</div>
        <div class="list-text"><div class="list-title">Парсер чатов</div><div class="list-sub">Собрать участников Telegram-чата</div></div>
        <div class="list-arrow">›</div>
      </div>
      <div class="list-item" data-action="find-groups">
        <div class="list-ico">⌕</div>
        <div class="list-text"><div class="list-title">Поиск чатов</div><div class="list-sub">По ключевым словам в сообщениях</div></div>
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
        <div class="head-row"><h2>TG-аккаунты</h2><button class="add-btn" data-action="add-account">+</button></div>
        ${accs.length === 0 ? `
          <div class="empty">
            <div class="empty-ico">⚇</div>
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
          <div style="font-size:11px;color:var(--text-muted);margin-top:6px">⚠️ Нужен ANTHROPIC_API_KEY в .env</div>
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
        <div class="head-row"><h2>Списки лидов</h2><button class="add-btn" data-action="upload-csv">+</button></div>
        ${lists.length === 0 ? `
          <div class="empty">
            <div class="empty-ico">▤</div>
            <div class="empty-title">Нет списков</div>
            <div>Загрузите CSV: tg_username, company, first_message, status</div>
            <button class="btn" style="margin-top:16px" data-action="upload-csv">Загрузить CSV</button>
            <div style="margin-top:24px;font-size:12px;color:var(--text-muted);text-align:left">
              <b>Пример CSV:</b><br>
              <code style="display:block;background:var(--bg-secondary);padding:10px;border-radius:8px;margin-top:6px;text-align:left;font-size:11px">tg_username,company,first_message,status<br>@username1,Компания A,Привет, видел вашу...,Initial Contact<br>@username2,Компания B,Здравствуйте,New</code>
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
        ${lists.length ? `<button class="btn full" style="margin-top:12px" data-action="upload-csv">+ Загрузить CSV</button>` : ''}
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
        <div class="head-row"><h2>Кампании</h2><button class="add-btn" data-action="campaign-new" ${canCreate?'':'disabled style="opacity:.4"'}>+</button></div>
        ${!canCreate ? `
          <div class="card" style="background:#fef3c7;color:#92400e;font-size:13px">
            Чтобы создать кампанию, нужно: ${!lists.length?'список лидов, ':''}${!tmpls.length?'шаблон, ':''}${!accs.length?'аккаунт':''}
          </div>
        ` : ''}
        ${camps.length === 0 ? `
          <div class="empty"><div class="empty-ico">▶</div>
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
              <div class="card-title">${escape(c.name)}</div>
              <span class="campaign-status ${c.status}">${c.status}</span>
            </div>
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
              <button class="btn secondary" style="flex:1;padding:8px;color:#ef4444" data-action="campaign-control" data-id="${c.id}" data-act="stop">⏹</button>
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
    const stepDots = [1,2,3,4].map(n =>
      `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${n<=step?'var(--accent)':'var(--border)'};margin-right:6px"></span>`
    ).join('');
    if (step === 1) return `
      <div class="screen">
        <div class="head-row"><h2 style="font-size:18px">Новая кампания · 1/4</h2></div>
        <div style="margin-bottom:14px">${stepDots}</div>
        <div class="section-title">Название</div>
        <input id="cw-name" value="${escape(data.name || 'Кампания ' + new Date().toISOString().slice(0,10))}"
               style="width:100%;padding:12px 14px;border:1px solid var(--border);border-radius:10px;background:var(--bg);color:var(--text);font-size:15px">
        <div class="section-title">Список лидов</div>
        ${lists.map(l => `
          <div class="lead" data-action="cw-pick-list" data-id="${l.id}" style="${data.list_id===l.id?'border:2px solid var(--accent)':''}">
            <div class="avatar blue">▤</div>
            <div class="lead-body"><div class="lead-name">${escape(l.name)}</div><div class="lead-status">${l.count} лидов · ${escape(l.source)}</div></div>
            ${data.list_id===l.id ? '<span style="color:var(--accent);font-size:18px">✓</span>' : ''}
          </div>
        `).join('')}
        <button class="btn full" style="margin-top:8px" data-action="cw-next" data-from="1">Далее</button>
      </div>`;
    if (step === 2) return `
      <div class="screen">
        <div class="head-row"><h2 style="font-size:18px">Шаблон · 2/4</h2></div>
        <div style="margin-bottom:14px">${stepDots}</div>
        ${tmpls.map(t => `
          <div class="card" data-action="cw-pick-template" data-id="${t.id}" style="${data.template_id===t.id?'border:2px solid var(--accent)':''}">
            <div class="card-row">
              <div class="card-title">${escape(t.name)}</div>
              ${data.template_id===t.id ? '<span style="color:var(--accent);font-size:18px">✓</span>' : ''}
            </div>
            <div style="font-size:13px;color:var(--text-muted);margin-top:6px">${escape((t.body || '').slice(0,140))}…</div>
          </div>
        `).join('')}
        <div style="display:flex;gap:6px;margin-top:8px">
          <button class="btn secondary" style="flex:1" data-action="cw-back" data-from="2">Назад</button>
          <button class="btn" style="flex:1" data-action="cw-next" data-from="2">Далее</button>
        </div>
      </div>`;
    if (step === 3) {
      const picked = data.account_ids || [];
      return `
      <div class="screen">
        <div class="head-row"><h2 style="font-size:18px">Аккаунты · 3/4</h2></div>
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
          <button class="btn secondary" style="flex:1" data-action="cw-back" data-from="3">Назад</button>
          <button class="btn" style="flex:1" data-action="cw-next" data-from="3">Далее</button>
        </div>
      </div>`;
    }
    if (step === 4) {
      const ll = lists.find(l=>l.id===data.list_id);
      const tt = tmpls.find(t=>t.id===data.template_id);
      const aa = accs.filter(a=>(data.account_ids||[]).includes(a.id));
      const totalCap = aa.reduce((s,a)=>s+a.daily_limit,0);
      const days = totalCap ? Math.ceil((ll?.count||0) / totalCap) : '∞';
      return `
      <div class="screen">
        <div class="head-row"><h2 style="font-size:18px">Подтверждение · 4/4</h2></div>
        <div style="margin-bottom:14px">${stepDots}</div>
        <div class="card">
          <div class="card-row"><div class="card-title">${escape(data.name)}</div></div>
          <div style="font-size:13px;color:var(--text-muted);margin-top:10px;line-height:1.7">
            <div>📋 Список: <b style="color:var(--text)">${escape(ll?.name||'?')}</b> (${ll?.count||0} лидов)</div>
            <div>✉ Шаблон: <b style="color:var(--text)">${escape(tt?.name||'?')}</b></div>
            <div>⚇ Аккаунтов: <b style="color:var(--text)">${aa.length}</b> · общий капасити <b style="color:var(--text)">${totalCap}/день</b></div>
            <div>⏱ Расчётно займёт: <b style="color:var(--text)">~${days} ${typeof days==='number' && days===1?'день':'дней'}</b></div>
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
          <button class="add-btn" data-action="add-lead-to-list">+</button>
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
        <div class="head-row"><h2>Шаблоны и AI</h2><button class="add-btn" data-action="new-template">+</button></div>
        <div class="section-title">AI-генератор</div>
        <button class="btn full" data-action="open-ai-composer">✦ Сгенерировать сообщения</button>
        <div class="section-title">Сохранённые шаблоны</div>
        ${tmpls.length === 0 ? `
          <div class="empty"><div class="empty-ico">✉</div>
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
      <div class="empty"><div class="empty-ico">…</div><div class="empty-title">Загружаю</div></div></div>`;
    if (convs.length === 0) return `
      <div class="screen"><div class="head-row"><h2>Inbox</h2></div>
      <div class="empty"><div class="empty-ico">✉</div>
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
    return `
      <div class="screen">
        <div class="head-row"><h2>Inbox · ${convs.length}</h2></div>
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
        ${display.length === 0 ? '<div class="empty"><div class="empty-title">Ничего не найдено</div></div>' :
          display.map(c => `
            <div class="lead" data-action="open-conv" data-id="${c.id}">
              ${avatar(c.lead_tg_id, c.lead_name || c.lead_username)}
              <div class="lead-body">
                <div class="lead-name">${escape(c.lead_name || c.lead_username || '?')} ${c.unread ? '<span style="color:#ef4444">●</span>' : ''}</div>
                <div class="lead-status">${escape(c.last_text || '—').slice(0, 80)} · ${prettyTime(c.last_message_at)}</div>
              </div>
              <span class="lead-score ${c.lead_status==='Trial Activated'?'hot':c.lead_status==='Testnet'?'warm':'cold'}">${escape(c.lead_status || c.account_phone)}</span>
            </div>
          `).join('')
        }
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
            <div style="font-size:12px;color:var(--text-muted)">${escape(subtitle || 'через CRM')}</div>
          </div>
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
        <div class="conv-input">
          <button class="icon-btn" data-action="attach-file" data-id="${st.conv_id}" title="Файл" style="font-size:22px">📎</button>
          <button class="icon-btn" data-action="ai-suggest" data-id="${st.conv_id}" title="AI-подсказка" style="font-size:18px;color:var(--accent)">✨</button>
          <input type="file" id="attach-input" style="display:none"
                 accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.zip,.txt">
          <input id="reply-input" type="text" placeholder="Сообщение"
                 style="flex:1;padding:11px 14px;border:1px solid var(--border);border-radius:20px;background:var(--bg);color:var(--text);font-size:15px">
          <button class="btn" data-action="send-reply" data-id="${st.conv_id}" style="padding:10px 16px">→</button>
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
        <div class="head-row"><h2 style="font-size:18px">Мои идеи</h2><button class="add-btn" data-action="goto-idea-submit">+</button></div>
        ${ideas.length === 0 ? `
          <div class="empty">
            <div class="empty-ico">💡</div>
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

  // ---------- MORE ----------
  more: () => `
    <div class="screen">
      <div class="head-row"><h2>Ещё</h2></div>
      <div class="section-title">Аккаунт</div>
      <div class="list-item">
        <div class="list-ico">⚇</div>
        <div class="list-text"><div class="list-title">@${escape(ME.username || 'без юзернейма')}</div><div class="list-sub">Workspace: BitOK · Plan: Pro</div></div>
      </div>
      <div class="section-title">AI</div>
      <div class="list-item" data-action="goto-templates">
        <div class="list-ico">✦</div><div class="list-text"><div class="list-title">AI-ассистент</div><div class="list-sub">Шаблоны и генератор сообщений</div></div><div class="list-arrow">›</div>
      </div>
      <div class="section-title">Сообщество</div>
      <div class="list-item" data-action="goto-idea-submit">
        <div class="list-ico">💡</div><div class="list-text"><div class="list-title">Оставить идею</div><div class="list-sub">Что улучшить в приложении</div></div><div class="list-arrow">›</div>
      </div>
      <div class="list-item" data-action="goto-my-ideas">
        <div class="list-ico">⊟</div><div class="list-text"><div class="list-title">Мои идеи</div><div class="list-sub">Статусы предложенных идей</div></div><div class="list-arrow">›</div>
      </div>
      ${IS_ADMIN ? `
      <div class="list-item" data-action="goto-admin-ideas" style="background:linear-gradient(135deg,#fef3c7,#fde68a)">
        <div class="list-ico">🛠</div><div class="list-text"><div class="list-title">Админка · идеи</div><div class="list-sub">Управление предложениями пользователей</div></div><div class="list-arrow">›</div>
      </div>
      ` : ''}
      <div class="list-item" data-action="contact-support">
        <div class="list-ico">?</div><div class="list-text"><div class="list-title">Поддержка</div><div class="list-sub">${escape(SUPPORT)}</div></div><div class="list-arrow">›</div>
      </div>
    </div>
  `,
};

// ===== Render =====
function render(name, state = {}) {
  currentScreen = name;
  screenState[name] = { ...screenState[name], ...state };
  $('#screen-root').innerHTML = screens[name](screenState[name]);
  document.querySelectorAll('.tab').forEach(t => {
    t.classList.toggle('active', t.dataset.screen === name);
  });
  if (tg) {
    const isMain = ['dashboard','outreach','inbox','more'].includes(name);
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

async function loadDashboard() {
  try {
    const data = await API.dashboard.get();
    render('dashboard', { data });
  } catch (e) {
    render('dashboard', { data: null });
    toast(`Не удалось загрузить дашборд: ${e.message}`);
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

async function loadInbox(silent=false) {
  if (!silent) render('inbox', { conversations: null });
  try {
    const conversations = await API.inbox.list();
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
      title: conv?.lead_name || conv?.lead_username || `Чат #${cid}`,
      subtitle: conv?.account_phone ? `через ${conv.account_phone}` : '',
    });
    requestAnimationFrame(() => {
      const ml = document.getElementById('msg-list');
      if (ml) ml.scrollTop = ml.scrollHeight;
    });
  } catch (e) { toast(`Ошибка: ${e.message}`); }
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
    case 'csv-upload-go': {
      const name = document.getElementById('cu-name').value.trim();
      const file = document.getElementById('cu-file').files[0];
      const out = document.getElementById('cu-result');
      if (!file) { out.innerHTML = '<div class="card" style="color:#ef4444">Выберите CSV-файл</div>'; return; }
      if (!name) { out.innerHTML = '<div class="card" style="color:#ef4444">Укажите название</div>'; return; }
      out.innerHTML = '<div class="card">⏳ Загружаю...</div>';
      try {
        const r = await API.lists.upload(name, file);
        out.innerHTML = `<div class="card">✅ Импортировано: ${r.count} лидов в список «${escape(r.name)}»</div>`;
        setTimeout(() => loadLists(), 1500);
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
    case 'cw-pick-template': {
      const id = parseInt(el.dataset.id, 10);
      const w = screenState.campaign_wizard;
      render('campaign_wizard', { ...w, data: { ...w.data, template_id: id } });
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
      // Сохраняем имя из формы при переходе с шага 1
      let data = w.data;
      if (from === 1) {
        const nm = document.getElementById('cw-name')?.value.trim();
        data = { ...data, name: nm || data.name };
        if (!data.list_id) { toast('Выберите список лидов'); return; }
      }
      if (from === 2 && !data.template_id) { toast('Выберите шаблон'); return; }
      if (from === 3 && !(data.account_ids || []).length) { toast('Выберите хотя бы один аккаунт'); return; }
      render('campaign_wizard', { ...w, step: from + 1, data });
      break;
    }
    case 'cw-back': {
      const from = parseInt(el.dataset.from, 10);
      render('campaign_wizard', { ...screenState.campaign_wizard, step: from - 1 });
      break;
    }
    case 'cw-create-and-start':
    case 'cw-create-only': {
      const w = screenState.campaign_wizard;
      const start = action === 'cw-create-and-start';
      try {
        const c = await API.campaigns.create({
          name: w.data.name, list_id: w.data.list_id,
          template_id: w.data.template_id, account_ids: w.data.account_ids,
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
    case 'cw-test-send': {
      const w = screenState.campaign_wizard;
      if (!ME.username) { toast('У вас нет username — некуда слать тест. Поставьте username в TG.'); return; }
      const accs = w.accounts.filter(a => (w.data.account_ids || []).includes(a.id));
      if (!accs.length) { toast('Сначала выберите акк на шаге 3'); return; }
      try {
        const r = await API.campaigns.testSend({
          template_id: w.data.template_id,
          account_id:  accs[0].id,
          target:      '@' + ME.username,
        });
        toast(`✅ Тест отправлен вам в личку:\n\n${r.rendered}`);
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

    case 'todo': toast('TODO'); break;
    default: console.log('action:', action);
  }
}

// ===== Event delegation =====
document.addEventListener('click', (e) => {
  // Settings gear button (top-right)
  if (e.target.id === 'settings-btn' || e.target.closest('#settings-btn')) {
    handleAction('api-config'); return;
  }
  const tab = e.target.closest('.tab');
  if (tab) {
    const name = tab.dataset.screen;
    stopPoll();
    if (name === 'inbox') {
      loadInbox();
      startPoll(() => { loadInbox(true); refreshBadges(); }, 15000);
    } else if (name === 'outreach') { render('outreach'); loadOutreachSummaries(); }
    else if (name === 'dashboard') { loadDashboard(); startPoll(() => { loadDashboard(); refreshBadges(); }, 30000); }
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

if (tg) tg.BackButton.onClick(() => render('dashboard'));
$('#user-handle').textContent = ME.username ? '@' + ME.username : 'BitOK Workspace';

// Узнаём, админ ли (для показа пункта «Админка · идеи» в Ещё)
API.me().then(r => {
  IS_ADMIN = !!r.is_admin;
  // Если уже на экране More — перерендерим, чтобы появилась плашка админки
  if (currentScreen === 'more') render('more');
}).catch(() => {});

// Initial render
loadDashboard();
refreshBadges();
setInterval(refreshBadges, 30000);   // обновляем бейджи раз в 30 сек глобально
