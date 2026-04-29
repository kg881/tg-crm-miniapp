// BitOK CRM Mini App
// Telegram WebApp интеграция + роутинг по экранам

const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
  tg.setHeaderColor('secondary_bg_color');
}

// === Mock data (позже заменим на API) ===
const MOCK = {
  user: tg?.initDataUnsafe?.user || { first_name: 'Гость', username: 'guest' },
  stats: {
    leads_today: 36,
    hot: 6,
    sent_today: 142,
    reply_rate: 18,
  },
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
  campaigns: [
    {
      title: 'BitOK · Холодный аутрич Q2',
      status: 'live',
      sent: 450, total: 1200,
      replied: 81, scheduled_today: 95,
    },
    {
      title: 'Winback клиентов на конкурентах',
      status: 'paused',
      sent: 120, total: 200,
      replied: 22, scheduled_today: 0,
    },
    {
      title: 'BestChange exchangers',
      status: 'draft',
      sent: 0, total: 340,
      replied: 0, scheduled_today: 0,
    },
  ],
};

// === Helpers ===
const $ = (sel) => document.querySelector(sel);
const initials = (name) => name.split(/\s+/).slice(0, 2).map(w => w[0] || '').join('').toUpperCase();
const scoreClass = (n) => n >= 70 ? 'hot' : n >= 40 ? 'warm' : 'cold';

// === Screens ===
const screens = {
  dashboard: () => `
    <div class="screen">
      <div class="head-row">
        <h2>Привет, ${MOCK.user.first_name}!</h2>
      </div>
      <div class="stats-grid">
        <div class="stat">
          <div class="stat-label">Лидов на сегодня</div>
          <div class="stat-value">${MOCK.stats.leads_today}</div>
          <div class="stat-trend">+4 за ночь</div>
        </div>
        <div class="stat">
          <div class="stat-label">Горячих (70+)</div>
          <div class="stat-value">${MOCK.stats.hot}</div>
          <div class="stat-trend">требуют действий</div>
        </div>
        <div class="stat">
          <div class="stat-label">Отправлено сегодня</div>
          <div class="stat-value">${MOCK.stats.sent_today}</div>
          <div class="stat-trend">из 200</div>
        </div>
        <div class="stat">
          <div class="stat-label">Reply rate</div>
          <div class="stat-value">${MOCK.stats.reply_rate}%</div>
          <div class="stat-trend">+2.4% за неделю</div>
        </div>
      </div>

      <div class="section-title">Горячие лиды</div>
      ${MOCK.hot_leads.map(l => `
        <div class="lead" data-action="open-lead" data-name="${l.name}">
          <div class="avatar ${l.color === 'orange' ? '' : l.color}">${initials(l.name)}</div>
          <div class="lead-body">
            <div class="lead-name">${l.name}</div>
            <div class="lead-status">${l.stage}</div>
          </div>
          <span class="lead-score ${scoreClass(l.score)}">${l.score}</span>
        </div>
      `).join('')}

      <div class="section-title">Быстрые действия</div>
      <button class="btn full" data-action="run-briefing">Утренний брифинг</button>
    </div>
  `,

  pipeline: (state) => {
    const activeStage = state?.stage || 'all';
    return `
      <div class="screen">
        <div class="head-row">
          <h2>Сделки</h2>
          <button class="add-btn" data-action="add-lead">+</button>
        </div>
        <div class="stage-strip">
          ${MOCK.pipeline_stages.map(s => `
            <div class="stage-chip ${s.id === activeStage ? 'active' : ''}" data-stage="${s.id}">
              ${s.label} · ${s.count}
            </div>
          `).join('')}
        </div>
        ${MOCK.hot_leads.map(l => `
          <div class="lead" data-action="open-lead" data-name="${l.name}">
            <div class="avatar ${l.color === 'orange' ? '' : l.color}">${initials(l.name)}</div>
            <div class="lead-body">
              <div class="lead-name">${l.name}</div>
              <div class="lead-status">${l.stage} · Next touch завтра</div>
            </div>
            <span class="lead-score ${scoreClass(l.score)}">${l.score}</span>
          </div>
        `).join('')}
      </div>
    `;
  },

  outreach: () => `
    <div class="screen">
      <div class="head-row">
        <h2>Аутрич</h2>
        <button class="add-btn" data-action="new-campaign">+</button>
      </div>
      <div class="section-title">Активные кампании</div>
      ${MOCK.campaigns.map(c => `
        <div class="campaign" data-action="open-campaign" data-title="${c.title}">
          <div class="campaign-head">
            <div class="campaign-title">${c.title}</div>
            <span class="campaign-status ${c.status}">${c.status}</span>
          </div>
          <div class="progress">
            <div class="progress-bar" style="width: ${c.total ? Math.round(c.sent / c.total * 100) : 0}%"></div>
          </div>
          <div class="campaign-meta">
            <span>Отправлено: <b>${c.sent}/${c.total}</b></span>
            <span>Ответили: <b>${c.replied}</b></span>
            <span>Сегодня: <b>${c.scheduled_today}</b></span>
          </div>
        </div>
      `).join('')}
      <div class="section-title">Инструменты</div>
      <div class="list-item" data-action="parse-group">
        <div class="list-ico">⚡</div>
        <div class="list-text">
          <div class="list-title">Парсер чатов</div>
          <div class="list-sub">Собрать участников Telegram-чата</div>
        </div>
        <div class="list-arrow">›</div>
      </div>
      <div class="list-item" data-action="find-groups">
        <div class="list-ico">⌕</div>
        <div class="list-text">
          <div class="list-title">Поиск чатов</div>
          <div class="list-sub">Найти группы по ICP</div>
        </div>
        <div class="list-arrow">›</div>
      </div>
      <div class="list-item" data-action="templates">
        <div class="list-ico">✉</div>
        <div class="list-text">
          <div class="list-title">Шаблоны сообщений</div>
          <div class="list-sub">12 черновиков · 4 в работе</div>
        </div>
        <div class="list-arrow">›</div>
      </div>
      <div class="list-item" data-action="accounts">
        <div class="list-ico">⚇</div>
        <div class="list-text">
          <div class="list-title">TG-аккаунты</div>
          <div class="list-sub">3 активных · warmup идёт</div>
        </div>
        <div class="list-arrow">›</div>
      </div>
    </div>
  `,

  contacts: () => `
    <div class="screen">
      <div class="head-row">
        <h2>Контакты</h2>
        <button class="add-btn" data-action="add-contact">+</button>
      </div>
      <div class="empty">
        <div class="empty-ico">☺</div>
        <div class="empty-title">Здесь появятся ваши контакты</div>
        <div>Импортируйте из Monday или соберите парсером</div>
      </div>
      <button class="btn full" style="margin-top: 16px" data-action="import-monday">Импорт из Monday</button>
    </div>
  `,

  more: () => `
    <div class="screen">
      <div class="head-row"><h2>Ещё</h2></div>
      <div class="section-title">Аккаунт</div>
      <div class="list-item">
        <div class="list-ico">⚇</div>
        <div class="list-text">
          <div class="list-title">@${MOCK.user.username || 'без юзернейма'}</div>
          <div class="list-sub">Workspace: BitOK · Plan: Pro</div>
        </div>
      </div>
      <div class="section-title">Интеграции</div>
      <div class="list-item" data-action="monday">
        <div class="list-ico">▣</div>
        <div class="list-text">
          <div class="list-title">Monday CRM</div>
          <div class="list-sub">Подключено · Board 9027825117</div>
        </div>
        <div class="list-arrow">›</div>
      </div>
      <div class="list-item" data-action="ai">
        <div class="list-ico">✦</div>
        <div class="list-text">
          <div class="list-title">AI-ассистент</div>
          <div class="list-sub">Авто-ответы · Брифинг лидов</div>
        </div>
        <div class="list-arrow">›</div>
      </div>
      <div class="section-title">Настройки</div>
      <div class="list-item" data-action="lang">
        <div class="list-ico">⌘</div>
        <div class="list-text"><div class="list-title">Язык</div><div class="list-sub">Русский</div></div>
        <div class="list-arrow">›</div>
      </div>
      <div class="list-item" data-action="notifications">
        <div class="list-ico">♪</div>
        <div class="list-text"><div class="list-title">Уведомления</div><div class="list-sub">Утром в 09:00</div></div>
        <div class="list-arrow">›</div>
      </div>
      <div class="list-item" data-action="help">
        <div class="list-ico">?</div>
        <div class="list-text"><div class="list-title">Поддержка</div><div class="list-sub">Связаться с командой</div></div>
        <div class="list-arrow">›</div>
      </div>
    </div>
  `,
};

// === Router ===
let currentScreen = 'dashboard';
let screenState = {};

function render(name, state = {}) {
  currentScreen = name;
  screenState[name] = { ...screenState[name], ...state };
  $('#screen-root').innerHTML = screens[name](screenState[name]);
  document.querySelectorAll('.tab').forEach(t => {
    t.classList.toggle('active', t.dataset.screen === name);
  });
  if (tg) {
    tg.BackButton.hide();
    if (name !== 'dashboard') tg.BackButton.show();
  }
}

// === Event delegation ===
document.addEventListener('click', (e) => {
  const tab = e.target.closest('.tab');
  if (tab) { render(tab.dataset.screen); return; }

  const stageChip = e.target.closest('.stage-chip');
  if (stageChip) { render('pipeline', { stage: stageChip.dataset.stage }); return; }

  const action = e.target.closest('[data-action]')?.dataset.action;
  if (action) handleAction(action, e.target.closest('[data-action]'));
});

function handleAction(action, el) {
  const haptic = () => tg?.HapticFeedback?.impactOccurred?.('light');
  haptic();
  switch (action) {
    case 'open-lead':
      tg?.showAlert?.(`Открыть карточку: ${el.dataset.name}\n\n(будет полный экран лида)`);
      break;
    case 'run-briefing':
      tg?.showAlert?.('Запускаю утренний брифинг...\n\nГотовый отчёт придёт сообщением через 30 секунд.');
      break;
    case 'add-lead':
      tg?.showAlert?.('Добавление лида — TODO');
      break;
    case 'new-campaign':
      tg?.showAlert?.('Новая кампания аутрича — TODO');
      break;
    case 'open-campaign':
      tg?.showAlert?.(`Кампания: ${el.dataset.title}`);
      break;
    case 'parse-group':
      tg?.showAlert?.('Парсер чата — TODO');
      break;
    case 'find-groups':
      tg?.showAlert?.('Поиск групп — TODO');
      break;
    case 'templates':
      tg?.showAlert?.('Шаблоны — TODO');
      break;
    case 'accounts':
      tg?.showAlert?.('TG аккаунты — TODO');
      break;
    case 'import-monday':
      tg?.showAlert?.('Импорт из Monday — подключено, но импорт ещё не реализован.');
      break;
    case 'monday':
      tg?.showAlert?.('Настройки Monday интеграции — TODO');
      break;
    case 'ai':
      tg?.showAlert?.('AI настройки — TODO');
      break;
    case 'lang':
    case 'notifications':
    case 'help':
      tg?.showAlert?.(`${action} — TODO`);
      break;
    default:
      console.log('action:', action);
  }
}

if (tg) {
  tg.BackButton.onClick(() => render('dashboard'));
}
$('#user-handle').textContent = MOCK.user.username ? '@' + MOCK.user.username : 'BitOK Workspace';

// Initial render
render('dashboard');
