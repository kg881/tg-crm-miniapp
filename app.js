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

// ===== Mock-данные дашборда =====
const MOCK = {
  stats: { leads_today: 36, hot: 6, sent_today: 142, reply_rate: 18 },
  hot_leads: [
    { name: 'CryptoGex', stage: 'Trial Activated', score: 95, color: 'orange' },
    { name: 'MoneyPort', stage: 'Objection handling', score: 80, color: 'green' },
    { name: 'Биржа Масспей', stage: 'Trial Activated', score: 70, color: 'blue' },
    { name: 'ivendpay.com', stage: 'Trial Activated', score: 70, color: 'purple' },
    { name: 'Bitteam', stage: 'Trial Activated', score: 75, color: 'orange' },
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
          return `
          <div class="card" data-action="open-account" data-id="${a.id}">
            <div class="card-row">
              <div style="display:flex;gap:12px;align-items:center;flex:1;min-width:0">
                <div class="avatar ${a.status === 'active' ? 'green' : 'orange'}">${initials(a.first_name || a.phone)}</div>
                <div class="lead-body">
                  <div class="lead-name">${escape(a.first_name || a.phone)}${a.username ? ` <span style="color:var(--text-muted);font-weight:400">@${escape(a.username)}</span>` : ''}</div>
                  <div class="lead-status">${escape(a.phone)}${a.proxy ? ' · proxy ✓' : ''}</div>
                </div>
              </div>
              <span class="lead-score ${a.status === 'active' ? 'cold' : 'warm'}">${a.status}</span>
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
        ${lists.length ? '<button class="btn full" style="margin-top:12px" data-action="upload-csv">+ Загрузить CSV</button>' : ''}
      </div>`;
  },

  // ---------- LIST DETAIL (с таблицей лидов и фильтром по статусу) ----------
  list_detail: (st) => {
    const leads = st?.leads ?? [];
    const filter = st?.filter || 'all';
    const filtered = filter === 'all' ? leads : leads.filter(l => (l.status || 'New') === filter);
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

  // ---------- CONVERSATION (с прикреплением файла) ----------
  conv: (st) => {
    const msgs = st?.messages ?? [];
    return `
      <div class="screen" style="display:flex;flex-direction:column;height:100%">
        <div class="head-row"><h2 style="font-size:18px">${escape(st?.title || 'Чат')}</h2></div>
        <div id="msg-list" style="flex:1;overflow-y:auto;padding:8px 0">
          ${msgs.map(m => `
            <div style="display:flex;justify-content:${m.direction === 'out' ? 'flex-end' : 'flex-start'};margin-bottom:8px">
              <div style="max-width:80%;padding:10px 14px;border-radius:14px;background:${m.direction === 'out' ? 'var(--accent)' : 'var(--bg-secondary)'};color:${m.direction === 'out' ? 'var(--accent-text)' : 'var(--text)'};font-size:14px;white-space:pre-wrap;word-break:break-word">
                ${escape(m.text)}
                <div style="font-size:10px;opacity:0.6;margin-top:4px">${fmtTime(m.sent_at)}</div>
              </div>
            </div>
          `).join('')}
        </div>
        <div style="display:flex;gap:6px;padding:8px 0;align-items:center">
          <button class="icon-btn" data-action="attach-file" data-id="${st.conv_id}" title="Прикрепить файл" style="font-size:22px">📎</button>
          <input type="file" id="attach-input" style="display:none"
                 accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.zip,.txt">
          <input id="reply-input" type="text" placeholder="Сообщение или подпись"
                 style="flex:1;padding:12px 14px;border:1px solid var(--border);border-radius:24px;background:var(--bg);color:var(--text);font-size:15px">
          <button class="btn" data-action="send-reply" data-id="${st.conv_id}">→</button>
        </div>
      </div>`;
  },

  // ---------- TOOLS PLACEHOLDERS ----------
  tool_parser: () => `
    <div class="screen">
      <div class="head-row"><h2 style="font-size:18px">Парсер чатов</h2></div>
      <div class="card">
        <label style="font-size:12px;color:var(--text-muted)">Ссылка на чат / название</label>
        <input id="parser-input" placeholder="https://t.me/+abcDEF... или название чата"
               style="width:100%;padding:10px 12px;border:1px solid var(--border);border-radius:8px;background:var(--bg);color:var(--text);font-size:14px;margin-top:4px">
        <div style="font-size:11px;color:var(--text-muted);margin-top:8px">
          Подключится к указанному чату от вашего основного аккаунта, соберёт всех участников с биографиями, отфильтрует по ICP BitOK.
        </div>
      </div>
      <button class="btn full" style="margin-top:8px" data-action="run-parser">Собрать (TODO — backend endpoint)</button>
      <div style="margin-top:24px;font-size:12px;color:var(--text-muted);text-align:center">
        Сейчас парсер живёт отдельно в проекте /проекты/v2.0/. Подключение к Mini App — следующая итерация.
      </div>
    </div>`,

  tool_search: () => `
    <div class="screen">
      <div class="head-row"><h2 style="font-size:18px">Поиск чатов</h2></div>
      <div class="card">
        <label style="font-size:12px;color:var(--text-muted)">Ключевые слова (через запятую)</label>
        <input id="search-keywords" placeholder="AML, KYC, обменник, exchange"
               style="width:100%;padding:10px 12px;border:1px solid var(--border);border-radius:8px;background:var(--bg);color:var(--text);font-size:14px;margin-top:4px">
        <label style="font-size:12px;color:var(--text-muted);margin-top:12px;display:block">Чаты для поиска (по одному в строке)</label>
        <textarea id="search-chats" rows="5" placeholder="@chat1&#10;@chat2&#10;https://t.me/+abc..."
                  style="width:100%;padding:10px 12px;border:1px solid var(--border);border-radius:8px;background:var(--bg);color:var(--text);font-size:13px;margin-top:4px;font-family:inherit;resize:vertical"></textarea>
      </div>
      <button class="btn full" style="margin-top:8px" data-action="run-search">Искать (TODO — backend endpoint)</button>
      <div style="margin-top:24px;font-size:12px;color:var(--text-muted);text-align:center">
        Поиск по сообщениям с указанными ключевыми словами в выбранных чатах. Авторы релевантных сообщений попадут в новый список лидов.
      </div>
    </div>`,

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
      <div class="list-item" data-action="goto-templates">
        <div class="list-ico">✦</div><div class="list-text"><div class="list-title">AI-ассистент</div><div class="list-sub">Шаблоны и генератор сообщений</div></div><div class="list-arrow">›</div>
      </div>
      <div class="section-title">Система</div>
      <div class="list-item" data-action="api-config">
        <div class="list-ico">⌬</div><div class="list-text"><div class="list-title">Адрес бэкенда</div><div class="list-sub" id="api-url-display">${escape(API.base())}</div></div><div class="list-arrow">›</div>
      </div>
      <div class="list-item" data-action="api-test">
        <div class="list-ico">♥</div><div class="list-text"><div class="list-title">Проверка связи</div><div class="list-sub">Health-check бэкенда</div></div><div class="list-arrow">›</div>
      </div>
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
    render('conv', { conv_id: cid, messages, title: conv?.lead_name || conv?.lead_username || `Чат #${cid}` });
    setTimeout(() => { const ml = document.getElementById('msg-list'); if (ml) ml.scrollTop = ml.scrollHeight; }, 50);
  } catch (e) { toast(`Ошибка: ${e.message}`); }
}

// ===== CSV upload (использует hidden file input) =====
function triggerCsvUpload() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.csv,text/csv';
  input.onchange = async () => {
    const f = input.files[0]; if (!f) return;
    const name = prompt_('Название списка:', f.name.replace('.csv', ''));
    if (!name) return;
    try {
      await API.lists.upload(name, f);
      toast('Список загружен');
      loadLists();
    } catch (e) { toast(`Ошибка: ${e.message}`); }
  };
  input.click();
}

// ===== Action handler =====
async function handleAction(action, el) {
  haptic();
  switch (action) {
    case 'open-lead':       toast(`Карточка лида: ${el.dataset.name}\n\n(скоро)`); break;
    case 'run-briefing':    toast('Брифинг запущен — придёт сообщением через 30 сек.'); break;

    // Outreach navigation
    case 'goto-accounts':   loadAccounts(); break;
    case 'goto-lists':      loadLists(); break;
    case 'goto-templates':  loadTemplates(); break;
    case 'goto-campaigns':  toast('Кампании — следующая итерация'); break;
    case 'parse-group':     render('tool_parser'); break;
    case 'find-groups':     render('tool_search'); break;
    case 'run-parser':      toast('Backend endpoint для парсера ещё не готов — следующая итерация'); break;
    case 'run-search':      toast('Backend endpoint для поиска ещё не готов — следующая итерация'); break;

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
      const yes = await confirm_('Удалить этот аккаунт из CRM? (сессия сохранится в файлах)');
      if (yes) { try { await API.accounts.remove(id); loadAccounts(); } catch (e) { toast(`Ошибка: ${e.message}`); } }
      break;
    }

    // Lists
    case 'upload-csv':       triggerCsvUpload(); break;
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

    // System
    case 'api-config': {
      const cur = API.base();
      const next = prompt_('Адрес бэкенда (https://...):', cur);
      if (next) {
        API.setBase(next);
        const el = document.getElementById('api-url-display');
        if (el) el.textContent = API.base();
        toast('Адрес обновлён');
      }
      break;
    }
    case 'api-test': {
      try { const r = await API.health(); toast(`OK: ${JSON.stringify(r)}`); }
      catch (e) { toast(`Ошибка связи: ${e.message}\n\nАдрес: ${API.base()}`); }
      break;
    }
    case 'contact-support': openTgUser(SUPPORT); break;
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
    if (name === 'inbox')         loadInbox();
    else if (name === 'outreach') { render('outreach'); loadOutreachSummaries(); }
    else                          render(name);
    return;
  }
  const stage = e.target.closest('.stage-chip');
  if (stage) {
    if (stage.dataset.listFilter !== undefined) {
      render('list_detail', { filter: stage.dataset.listFilter });
      return;
    }
    render('pipeline', { stage: stage.dataset.stage });
    return;
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

// Initial render
render('dashboard');
