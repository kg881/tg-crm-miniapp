// BitOK CRM Mini App
// Все экраны + роутинг + API-вызовы.

const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
  tg.setHeaderColor('secondary_bg_color');
}

const ME = tg?.initDataUnsafe?.user || { first_name: 'Гость', username: 'guest' };

// ===== Helpers =====
const $ = (sel) => document.querySelector(sel);
const initials = (n) => (n || '?').split(/\s+/).slice(0, 2).map(w => w[0] || '').join('').toUpperCase();
const escape = (s) => (s == null ? '' : String(s)).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmtTime = (iso) => {
  const d = new Date(iso); const today = new Date();
  if (d.toDateString() === today.toDateString()) return d.toTimeString().slice(0,5);
  return d.toISOString().slice(5,10).replace('-','.');
};
const haptic = () => tg?.HapticFeedback?.impactOccurred?.('light');
const toast = (msg) => tg?.showAlert?.(msg) || alert(msg);
const confirm_ = (msg) => new Promise(r => tg?.showConfirm?.(msg, r) || r(window.confirm(msg)));

// ===== State =====
let currentScreen = 'dashboard';
let screenState = {};

// ===== Mock-данные для дашборда (пока нет реальной интеграции с Monday) =====
const MOCK = {
  stats: { leads_today: 36, hot: 6, sent_today: 142, reply_rate: 18 },
  hot_leads: [
    { name: 'CryptoGex',     stage: 'Trial Activated',     score: 95, color: 'orange' },
    { name: 'MoneyPort',     stage: 'Objection handling',  score: 80, color: 'green' },
    { name: 'Биржа Масспей', stage: 'Trial Activated',     score: 70, color: 'blue' },
    { name: 'ivendpay.com',  stage: 'Trial Activated',     score: 70, color: 'purple' },
    { name: 'Bitteam',       stage: 'Trial Activated',     score: 75, color: 'orange' },
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

  // ---------- DASHBOARD ----------
  dashboard: () => `
    <div class="screen">
      <div class="head-row"><h2>Привет, ${escape(ME.first_name)}!</h2></div>
      <div class="stats-grid">
        <div class="stat"><div class="stat-label">Лидов на сегодня</div><div class="stat-value">${MOCK.stats.leads_today}</div><div class="stat-trend">+4 за ночь</div></div>
        <div class="stat"><div class="stat-label">Горячих (70+)</div><div class="stat-value">${MOCK.stats.hot}</div><div class="stat-trend">требуют действий</div></div>
        <div class="stat"><div class="stat-label">Отправлено сегодня</div><div class="stat-value">${MOCK.stats.sent_today}</div><div class="stat-trend">из 200</div></div>
        <div class="stat"><div class="stat-label">Reply rate</div><div class="stat-value">${MOCK.stats.reply_rate}%</div><div class="stat-trend">+2.4% за неделю</div></div>
      </div>
      <div class="section-title">Горячие лиды</div>
      ${MOCK.hot_leads.map(l => `
        <div class="lead" data-action="open-lead" data-name="${escape(l.name)}">
          <div class="avatar ${l.color}">${initials(l.name)}</div>
          <div class="lead-body"><div class="lead-name">${escape(l.name)}</div><div class="lead-status">${escape(l.stage)}</div></div>
          <span class="lead-score ${scoreClass(l.score)}">${l.score}</span>
        </div>
      `).join('')}
      <div class="section-title">Быстрые действия</div>
      <button class="btn full" data-action="run-briefing">Утренний брифинг</button>
    </div>
  `,

  // ---------- PIPELINE ----------
  pipeline: (st) => {
    const active = st?.stage || 'all';
    return `
      <div class="screen">
        <div class="head-row"><h2>Сделки</h2><button class="add-btn" data-action="add-lead">+</button></div>
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
      <div class="head-row"><h2>Аутрич</h2><button class="add-btn" data-action="goto-accounts">+</button></div>
      <div class="section-title">Запуск кампании</div>
      <div class="list-item" data-action="goto-accounts">
        <div class="list-ico">⚇</div>
        <div class="list-text"><div class="list-title">TG-аккаунты</div><div class="list-sub" id="accounts-summary">Загружаю...</div></div>
        <div class="list-arrow">›</div>
      </div>
      <div class="list-item" data-action="goto-lists">
        <div class="list-ico">▤</div>
        <div class="list-text"><div class="list-title">Списки лидов</div><div class="list-sub" id="lists-summary">Загружаю...</div></div>
        <div class="list-arrow">›</div>
      </div>
      <div class="list-item" data-action="goto-templates">
        <div class="list-ico">✉</div>
        <div class="list-text"><div class="list-title">Шаблоны и AI</div><div class="list-sub" id="templates-summary">Загружаю...</div></div>
        <div class="list-arrow">›</div>
      </div>
      <div class="list-item" data-action="goto-campaigns">
        <div class="list-ico">▶</div>
        <div class="list-text"><div class="list-title">Кампании</div><div class="list-sub" id="campaigns-summary">Загружаю...</div></div>
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
        <div class="list-text"><div class="list-title">Поиск чатов</div><div class="list-sub">Найти группы по ICP</div></div>
        <div class="list-arrow">›</div>
      </div>
    </div>
  `,

  // ---------- ACCOUNTS ----------
  accounts: (st) => {
    const accs = st?.accounts ?? [];
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
        ` : accs.map(a => `
          <div class="lead" data-action="open-account" data-id="${a.id}">
            <div class="avatar ${a.status === 'active' ? 'green' : 'orange'}">${initials(a.first_name || a.phone)}</div>
            <div class="lead-body">
              <div class="lead-name">${escape(a.first_name || a.phone)}${a.username ? ` <span style="color:var(--text-muted);font-weight:400">@${escape(a.username)}</span>` : ''}</div>
              <div class="lead-status">${escape(a.phone)} · ${a.sent_today}/${a.daily_limit} сегодня${a.proxy ? ' · proxy' : ''}</div>
            </div>
            <span class="lead-score ${a.status === 'active' ? 'cold' : 'warm'}">${a.status}</span>
          </div>
        `).join('')}
        <div style="margin-top:16px;font-size:12px;color:var(--text-muted);text-align:center">
          Подключение проходит через бэкенд BitOK CRM. Сессия хранится локально, не передаётся третьим лицам.
        </div>
      </div>`;
  },

  // ---------- ADD ACCOUNT (multi-step form) ----------
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

  // ---------- INBOX ----------
  inbox: (st) => {
    const convs = st?.conversations ?? null;
    if (convs === null) return `
      <div class="screen"><div class="head-row"><h2>Inbox</h2></div>
      <div class="empty"><div class="empty-ico">…</div><div class="empty-title">Загружаю</div></div></div>`;
    if (convs.length === 0) return `
      <div class="screen"><div class="head-row"><h2>Inbox</h2></div>
      <div class="empty"><div class="empty-ico">✉</div>
        <div class="empty-title">Пока никто не ответил</div>
        <div>Запустите кампанию — ответы со всех ваших аккаунтов будут падать сюда.</div>
      </div></div>`;
    return `
      <div class="screen">
        <div class="head-row"><h2>Inbox · ${convs.length}</h2></div>
        ${convs.map(c => `
          <div class="lead" data-action="open-conv" data-id="${c.id}">
            <div class="avatar ${c.unread ? 'orange' : 'blue'}">${initials(c.lead_name || c.lead_username || '?')}</div>
            <div class="lead-body">
              <div class="lead-name">${escape(c.lead_name || c.lead_username || '?')} ${c.unread ? '<span style="color:#ef4444">●</span>' : ''}</div>
              <div class="lead-status">${escape(c.last_text || '—').slice(0, 80)}</div>
            </div>
            <span class="lead-score cold">${escape(c.account_phone)}</span>
          </div>
        `).join('')}
      </div>`;
  },

  // ---------- CONVERSATION ----------
  conv: (st) => {
    const msgs = st?.messages ?? [];
    return `
      <div class="screen" style="display:flex;flex-direction:column;height:100%">
        <div class="head-row"><h2>${escape(st?.title || 'Чат')}</h2></div>
        <div style="flex:1;overflow-y:auto;padding:8px 0">
          ${msgs.map(m => `
            <div style="display:flex;justify-content:${m.direction === 'out' ? 'flex-end' : 'flex-start'};margin-bottom:8px">
              <div style="max-width:80%;padding:10px 14px;border-radius:14px;background:${m.direction === 'out' ? 'var(--accent)' : 'var(--bg-secondary)'};color:${m.direction === 'out' ? 'var(--accent-text)' : 'var(--text)'};font-size:14px">
                ${escape(m.text)}
                <div style="font-size:10px;opacity:0.6;margin-top:4px">${fmtTime(m.sent_at)}</div>
              </div>
            </div>
          `).join('')}
        </div>
        <div style="display:flex;gap:6px;padding:8px 0">
          <input id="reply-input" type="text" placeholder="Ответить..." style="flex:1;padding:12px 14px;border:1px solid var(--border);border-radius:24px;background:var(--bg);color:var(--text);font-size:15px">
          <button class="btn" data-action="send-reply" data-id="${st.conv_id}">→</button>
        </div>
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
      <div class="section-title">Интеграции</div>
      <div class="list-item" data-action="todo">
        <div class="list-ico">▣</div><div class="list-text"><div class="list-title">Monday CRM</div><div class="list-sub">Подключено · Board 9027825117</div></div><div class="list-arrow">›</div>
      </div>
      <div class="list-item" data-action="todo">
        <div class="list-ico">✦</div><div class="list-text"><div class="list-title">AI-ассистент</div><div class="list-sub">Claude · Auto-replies</div></div><div class="list-arrow">›</div>
      </div>
      <div class="section-title">Система</div>
      <div class="list-item" data-action="api-config">
        <div class="list-ico">⌬</div><div class="list-text"><div class="list-title">Адрес бэкенда</div><div class="list-sub" id="api-url-display">${escape(API.base())}</div></div><div class="list-arrow">›</div>
      </div>
      <div class="list-item" data-action="api-test">
        <div class="list-ico">♥</div><div class="list-text"><div class="list-title">Проверка связи</div><div class="list-sub">Health-check бэкенда</div></div><div class="list-arrow">›</div>
      </div>
      <div class="list-item" data-action="todo">
        <div class="list-ico">?</div><div class="list-text"><div class="list-title">Поддержка</div><div class="list-sub">Связаться с командой</div></div><div class="list-arrow">›</div>
      </div>
    </div>
  `,
};

// ===== Render =====
function render(name, state = {}) {
  currentScreen = name;
  screenState[name] = { ...screenState[name], ...state };
  $('#screen-root').innerHTML = screens[name](screenState[name]);
  // Подсветка таба (только для tabbar-экранов)
  document.querySelectorAll('.tab').forEach(t => {
    t.classList.toggle('active', t.dataset.screen === name);
  });
  // BackButton
  if (tg) {
    const isMain = ['dashboard','pipeline','outreach','inbox','more'].includes(name);
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
    const accounts = await API.accounts.list();
    render('accounts', { accounts });
  } catch (e) {
    toast(`Не удалось загрузить аккаунты: ${e.message}`);
    render('accounts', { accounts: [] });
  }
}

async function loadInbox() {
  render('inbox', { conversations: null });
  try {
    const conversations = await API.inbox.list();
    render('inbox', { conversations });
  } catch (e) {
    render('inbox', { conversations: [] });
    toast(`Не удалось загрузить inbox: ${e.message}`);
  }
}

async function openConv(cid) {
  try {
    const messages = await API.inbox.messages(cid);
    const conv = (screenState.inbox?.conversations || []).find(c => c.id === cid);
    render('conv', {
      conv_id: cid,
      messages,
      title: conv?.lead_name || conv?.lead_username || `Чат #${cid}`,
    });
  } catch (e) { toast(`Ошибка: ${e.message}`); }
}

// ===== Action handler =====
async function handleAction(action, el) {
  haptic();
  switch (action) {
    case 'open-lead':       toast(`Карточка лида: ${el.dataset.name}\n\n(скоро)`); break;
    case 'run-briefing':    toast('Брифинг запущен — придёт сообщением через 30 сек.'); break;
    case 'add-lead':        toast('Добавление лида — TODO'); break;

    // Outreach navigation
    case 'goto-accounts':   loadAccounts(); break;
    case 'goto-lists':      toast('Списки лидов — TODO (загрузить CSV)'); break;
    case 'goto-templates':  toast('Шаблоны — TODO'); break;
    case 'goto-campaigns':  toast('Кампании — TODO'); break;
    case 'parse-group':     toast('Парсер чата — TODO'); break;
    case 'find-groups':     toast('Поиск групп — TODO'); break;

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
      const yes = await confirm_('Удалить этот аккаунт из CRM?');
      if (yes) {
        try { await API.accounts.remove(id); loadAccounts(); }
        catch (e) { toast(`Ошибка: ${e.message}`); }
      }
      break;
    }

    // Inbox
    case 'open-conv':  openConv(parseInt(el.dataset.id, 10)); break;
    case 'send-reply': {
      const text = document.getElementById('reply-input').value.trim();
      const cid = parseInt(el.dataset.id, 10);
      if (!text) return;
      try {
        await API.inbox.reply(cid, text);
        openConv(cid);
      } catch (e) { toast(`Ошибка: ${e.message}`); }
      break;
    }

    // System
    case 'api-config': {
      const cur = API.base();
      const next = prompt('Адрес бэкенда (https://...):', cur);
      if (next) {
        API.setBase(next);
        document.getElementById('api-url-display').textContent = API.base();
        toast('Адрес обновлён');
      }
      break;
    }
    case 'api-test': {
      try {
        const r = await API.health();
        toast(`OK: ${JSON.stringify(r)}`);
      } catch (e) { toast(`Ошибка связи: ${e.message}\n\nАдрес: ${API.base()}`); }
      break;
    }

    case 'todo': toast('TODO'); break;
    default: console.log('action:', action);
  }
}

// ===== Event delegation =====
document.addEventListener('click', (e) => {
  const tab = e.target.closest('.tab');
  if (tab) {
    const name = tab.dataset.screen;
    if (name === 'inbox')   loadInbox();
    else if (name === 'outreach') { render('outreach'); loadOutreachSummaries(); }
    else                    render(name);
    return;
  }
  const stage = e.target.closest('.stage-chip');
  if (stage) { render('pipeline', { stage: stage.dataset.stage }); return; }
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

// Инициализация
render('dashboard');
