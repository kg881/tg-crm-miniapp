// API клиент для бэкенда BitOK CRM.
// Адрес бэка живёт в localStorage('api_base'), default — placeholder.
// Меняется через "Ещё → Настройки бэкенда".

const DEFAULT_API_BASE = 'https://profession-pipe-cigarettes-thick.trycloudflare.com';

const API = {
  base: () => localStorage.getItem('api_base') || DEFAULT_API_BASE,

  setBase(url) {
    localStorage.setItem('api_base', url.replace(/\/$/, ''));
  },

  async req(method, path, body = null) {
    const initData = window.Telegram?.WebApp?.initData || '';
    const headers = { 'X-Init-Data': initData };
    let opts = { method, headers };
    if (body instanceof FormData) {
      opts.body = body;
    } else if (body) {
      headers['Content-Type'] = 'application/json';
      opts.body = JSON.stringify(body);
    }
    const r = await fetch(`${API.base()}${path}`, opts);
    if (!r.ok) {
      let detail = '';
      try { detail = (await r.json()).detail || ''; } catch {}
      throw new Error(`${r.status} ${detail || r.statusText}`);
    }
    if (r.status === 204) return null;
    return r.json();
  },

  // Accounts
  accounts: {
    list:      ()        => API.req('GET',    '/api/accounts'),
    authStart: (data)    => API.req('POST',   '/api/accounts/auth/start', data),
    authVerify:(data)    => API.req('POST',   '/api/accounts/auth/verify', data),
    update:    (id, d)   => API.req('PATCH',  `/api/accounts/${id}`, d),
    remove:    (id)      => API.req('DELETE', `/api/accounts/${id}`),
  },

  // Inbox
  inbox: {
    list:      ()             => API.req('GET',    '/api/inbox/conversations'),
    messages:  (cid)          => API.req('GET',    `/api/inbox/conversations/${cid}/messages`),
    reply:     (cid, text)    => API.req('POST',   `/api/inbox/conversations/${cid}/reply`, { text }),
  },

  // Lead lists
  lists: {
    list:      ()             => API.req('GET',    '/api/lists'),
    upload:    (name, file)   => {
      const fd = new FormData();
      fd.append('name', name);
      fd.append('file', file);
      return API.req('POST', '/api/lists/csv', fd);
    },
    remove:    (id)           => API.req('DELETE', `/api/lists/${id}`),
  },

  // Templates
  templates: {
    list:      ()             => API.req('GET',    '/api/templates'),
    create:    (data)         => API.req('POST',   '/api/templates', data),
    remove:    (id)           => API.req('DELETE', `/api/templates/${id}`),
  },

  // Campaigns
  campaigns: {
    list:      ()             => API.req('GET',    '/api/campaigns'),
    create:    (data)         => API.req('POST',   '/api/campaigns', data),
    control:   (id, action)   => API.req('POST',   `/api/campaigns/${id}/${action}`),
  },

  // AI
  ai: {
    generate:  (data)         => API.req('POST',   '/api/ai/generate', data),
    batch:     (data)         => API.req('POST',   '/api/ai/generate_batch', data),
  },

  // Health
  health:      ()             => API.req('GET',    '/api/health'),
};

window.API = API;
