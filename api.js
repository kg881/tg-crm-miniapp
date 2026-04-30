// API клиент для бэкенда BitOK CRM
const DEFAULT_API_BASE = 'https://tahoe-campaigns-carlo-amend.trycloudflare.com';

// Чистим старый сохранённый URL — теперь всегда берём актуальный из этого файла
try { localStorage.removeItem('api_base'); } catch {}

const API = {
  base: () => DEFAULT_API_BASE,
  setBase(url) { /* deprecated — URL приходит только из api.js */ },

  async req(method, path, body = null) {
    const initData = window.Telegram?.WebApp?.initData || '';
    const headers = { 'X-Init-Data': initData };
    let opts = { method, headers };
    if (body instanceof FormData) opts.body = body;
    else if (body) { headers['Content-Type'] = 'application/json'; opts.body = JSON.stringify(body); }
    const r = await fetch(`${API.base()}${path}`, opts);
    if (!r.ok) {
      let detail = '';
      try { detail = (await r.json()).detail || ''; } catch {}
      throw new Error(`${r.status} ${detail || r.statusText}`);
    }
    if (r.status === 204) return null;
    return r.json();
  },

  accounts: {
    list:      ()        => API.req('GET',    '/api/accounts'),
    stats:     ()        => API.req('GET',    '/api/accounts/stats'),
    authStart: (data)    => API.req('POST',   '/api/accounts/auth/start', data),
    authVerify:(data)    => API.req('POST',   '/api/accounts/auth/verify', data),
    update:    (id, d)   => API.req('PATCH',  `/api/accounts/${id}`, d),
    remove:    (id)      => API.req('DELETE', `/api/accounts/${id}`),
  },

  inbox: {
    list:      ()             => API.req('GET',    '/api/inbox/conversations'),
    messages:  (cid)          => API.req('GET',    `/api/inbox/conversations/${cid}/messages`),
    reply:     (cid, text)    => API.req('POST',   `/api/inbox/conversations/${cid}/reply`, { text }),
    replyMedia:(cid, file, caption='') => {
      const fd = new FormData();
      fd.append('file', file);
      if (caption) fd.append('caption', caption);
      return API.req('POST', `/api/inbox/conversations/${cid}/reply_media`, fd);
    },
    suggest:   (cid)          => API.req('POST',   `/api/inbox/conversations/${cid}/suggest_reply`),
  },

  lists: {
    list:      ()             => API.req('GET',    '/api/lists'),
    create:    (name)         => API.req('POST',   '/api/lists', { name }),
    upload:    (name, file)   => {
      const fd = new FormData();
      fd.append('name', name); fd.append('file', file);
      return API.req('POST', '/api/lists/csv', fd);
    },
    remove:    (id)           => API.req('DELETE', `/api/lists/${id}`),
    leads:     (id)           => API.req('GET',    `/api/lists/${id}/leads`),
    addLead:   (id, lead)     => API.req('POST',   `/api/lists/${id}/leads`, lead),
    updateLead:(lid, data)    => API.req('PATCH',  `/api/lists/leads/${lid}`, data),
    deleteLead:(lid)          => API.req('DELETE', `/api/lists/leads/${lid}`),
  },

  templates: {
    list:      ()             => API.req('GET',    '/api/templates'),
    create:    (data)         => API.req('POST',   '/api/templates', data),
    remove:    (id)           => API.req('DELETE', `/api/templates/${id}`),
  },

  campaigns: {
    list:      ()             => API.req('GET',    '/api/campaigns'),
    create:    (data)         => API.req('POST',   '/api/campaigns', data),
    control:   (id, action)   => API.req('POST',   `/api/campaigns/${id}/${action}`),
    outbox:    (id, status)   => API.req('GET',    `/api/campaigns/${id}/outbox${status?`?status=${status}`:''}`),
  },

  ai: {
    generate:  (data)         => API.req('POST',   '/api/ai/generate', data),
    batch:     (data)         => API.req('POST',   '/api/ai/generate_batch', data),
  },

  monday: {
    health:    ()             => API.req('GET',    '/api/monday/health'),
    importBoard: (data)       => API.req('POST',   '/api/monday/import_board', data),
  },

  tools: {
    parse:     (data)         => API.req('POST',   '/api/tools/parse', data),
    search:    (data)         => API.req('POST',   '/api/tools/search', data),
  },

  health: () => API.req('GET', '/api/health'),

  me: () => API.req('GET', '/api/me'),

  ideas: {
    submit:    (text)         => API.req('POST',   '/api/ideas', { text }),
    mine:      ()             => API.req('GET',    '/api/ideas/mine'),
    adminList: (status)       => API.req('GET',    `/api/admin/ideas${status?`?status=${status}`:''}`),
    adminUpdate: (id, data)   => API.req('PATCH',  `/api/admin/ideas/${id}`, data),
    adminDelete: (id)         => API.req('DELETE', `/api/admin/ideas/${id}`),
  },

  briefing: {
    run: () => API.req('POST', '/api/briefing/run'),
  },

  dashboard: {
    get:    () => API.req('GET', '/api/dashboard'),
    badges: () => API.req('GET', '/api/dashboard/badges'),
  },

  // URL аватарки (для <img src="...">)
  avatarUrl: (tgId) => `${API.base()}/api/avatars/${tgId}`,
};

API.campaigns.clone    = (id) => API.req('POST', `/api/campaigns/${id}/clone`);
API.campaigns.testSend = (data) => API.req('POST', '/api/campaigns/test_send', data);

window.API = API;

// Доступные статусы лидов (взято из Monday-конвенции)
window.LEAD_STATUSES = [
  'New', 'Initial Contact', 'Trial Activated', 'Testnet',
  'Objection handling', 'Winback', 'Paid', 'Active Partner',
  'Ghosted', 'No relevant',
];
