// API клиент для бэкенда BitOK CRM
const DEFAULT_API_BASE = 'https://crm.dfafdaf.site';

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
    folders:   (id)      => API.req('GET',    `/api/accounts/${id}/folders`),
    importFolder: (id, data) => API.req('POST', `/api/accounts/${id}/folders/import`, data),
    qrJoin:    (id, data) => API.req('POST',  `/api/accounts/${id}/qr/join`, data),
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
    remove:    (cid)          => API.req('DELETE', `/api/inbox/conversations/${cid}`),
    bulkDelete:(ids)          => API.req('POST',   '/api/inbox/conversations/bulk_delete', { ids }),
    snooze:    (cid, until)   => API.req('POST',   `/api/inbox/conversations/${cid}/snooze`, { until }),
    unsnooze:  (cid)          => API.req('POST',   `/api/inbox/conversations/${cid}/unsnooze`),
    reclassify:(cid)          => API.req('POST',   `/api/inbox/conversations/${cid}/reclassify`),
    bulkReply: (ids, text)    => API.req('POST',   '/api/inbox/conversations/bulk_reply', { conv_ids: ids, text }),
    setBotMode:(cid, mode)    => API.req('POST',   `/api/inbox/conversations/${cid}/bot_mode`, { mode }),
    listAll:   ()             => API.req('GET',    '/api/inbox/conversations?include_snoozed=true'),
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
    remove:    (id)           => API.req('DELETE', `/api/campaigns/${id}`),
    outbox:    (id, status)   => API.req('GET',    `/api/campaigns/${id}/outbox${status?`?status=${status}`:''}`),
    followups: (id)           => API.req('GET',    `/api/campaigns/${id}/followups`),
    setFollowups: (id, list)  => API.req('PUT',    `/api/campaigns/${id}/followups`, { followups: list }),
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

  profile: {
    get:    ()       => API.req('GET',   '/api/profile'),
    update: (data)   => API.req('PATCH', '/api/profile', data),
  },

  stoplist: {
    list:   ()                                  => API.req('GET',  '/api/stoplist'),
    set:    ({lead_id, tg_id, reason, on=true}) => API.req('POST', '/api/stoplist', { lead_id, tg_id, reason, on }),
  },

  deals: {
    list:   ()         => API.req('GET',    '/api/deals'),
    create: (data)     => API.req('POST',   '/api/deals', data),
    update: (id, data) => API.req('PATCH',  `/api/deals/${id}`, data),
    remove: (id)       => API.req('DELETE', `/api/deals/${id}`),
  },

  tasks: {
    list:   (due='open') => API.req('GET',    `/api/tasks?due=${due}`),
    create: (data)       => API.req('POST',   '/api/tasks', data),
    update: (id, data)   => API.req('PATCH',  `/api/tasks/${id}`, data),
    remove: (id)         => API.req('DELETE', `/api/tasks/${id}`),
  },

  kb: {
    list:   ()           => API.req('GET',    '/api/kb'),
    create: (data)       => API.req('POST',   '/api/kb', data),
    update: (id, data)   => API.req('PATCH',  `/api/kb/${id}`, data),
    remove: (id)         => API.req('DELETE', `/api/kb/${id}`),
  },

  analytics: {
    templates: () => API.req('GET', '/api/analytics/templates'),
    accounts:  () => API.req('GET', '/api/analytics/accounts'),
  },

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

  billing: {
    me: () => API.req('GET', '/api/billing/me'),
  },

  salesClone: {
    list:      ()              => API.req('GET',    '/api/sales_clone'),
    stats:     ()              => API.req('GET',    '/api/sales_clone/stats'),
    add:       (text, tag)     => API.req('POST',   '/api/sales_clone', { text, tag }),
    bulkPaste: (raw, tag)      => API.req('POST',   '/api/sales_clone/bulk_paste', { raw, tag }),
    upload:    (file, tag)     => {
      const fd = new FormData();
      fd.append('file', file);
      if (tag) fd.append('tag', tag);
      return API.req('POST', '/api/sales_clone/upload', fd);
    },
    remove:    (id)            => API.req('DELETE', `/api/sales_clone/${id}`),
    clearAll:  ()              => API.req('DELETE', '/api/sales_clone'),
    importFromTgFolders: (data) => API.req('POST', '/api/sales_clone/import_from_tg_folders', data),
  },

  guru: {
    chat:      (text)              => API.req('POST', '/api/guru/chat', { text }),
    history:   (limit=50)          => API.req('GET',  `/api/guru/history?limit=${limit}`),
    actions:   (status)            => API.req('GET',  `/api/guru/actions${status?`?status=${status}`:''}`),
    approve:   (id)                => API.req('POST', `/api/guru/actions/${id}/approve`),
    reject:    (id)                => API.req('POST', `/api/guru/actions/${id}/reject`),
    edit:      (id, draft_text)    => API.req('POST', `/api/guru/actions/${id}/edit`, { draft_text }),
    setMode:   (conv_id, guru_mode)=> API.req('POST', `/api/guru/conv/${conv_id}/mode`, { guru_mode }),
    settings:  ()                  => API.req('GET',  '/api/guru/settings'),
    putSettings: (data)            => API.req('PUT',  '/api/guru/settings', data),
  },

  assets: {
    list:     ()                            => API.req('GET',    '/api/assets'),
    // XHR с прогрессом — fetch() не даёт upload-events.
    // onProgress(percent, loaded, total) вызывается во время заливки.
    upload:   (file, name, description, tag, onProgress) => new Promise((resolve, reject) => {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('name', name || file.name);
      if (description) fd.append('description', description);
      if (tag) fd.append('tag', tag);
      const initData = window.Telegram?.WebApp?.initData || '';
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${API.base()}/api/assets/upload`);
      xhr.setRequestHeader('X-Init-Data', initData);
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && typeof onProgress === 'function') {
          onProgress(Math.round(e.loaded / e.total * 100), e.loaded, e.total);
        }
      };
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try { resolve(JSON.parse(xhr.responseText)); }
          catch (e) { reject(new Error(`bad JSON from server: ${e.message}`)); }
        } else {
          let detail = xhr.responseText;
          try { const j = JSON.parse(xhr.responseText); detail = j.detail || j.error || JSON.stringify(j); } catch {}
          reject(new Error(`${xhr.status} ${detail || xhr.statusText || 'upload failed'}`));
        }
      };
      xhr.onerror = () => reject(new Error('Сеть оборвалась (проверь интернет / VPN)'));
      xhr.ontimeout = () => reject(new Error('Таймаут (30 мин) — файл слишком большой или сеть медленная'));
      xhr.timeout = 30 * 60 * 1000;   // 30 минут — cloudflared free тормозит multipart
      xhr.send(fd);
    }),
    // Chunked upload — режем файл на куски, шлём по одному с retry.
    // Обходит throughput-лимит cloudflared free (single большой request ему не по силам).
    uploadChunked: async (file, name, description, tag, onProgress) => {
      const init = await API.req('POST', '/api/assets/upload_init', {
        filename: file.name,
        total_size: file.size,
        mime: file.type || null,
        name: name || file.name,
        description: description || null,
        tag: tag || null,
      });
      const uploadId = init.upload_id;
      const chunkSize = init.chunk_size || (2 * 1024 * 1024);
      const initData = window.Telegram?.WebApp?.initData || '';
      const total = file.size;

      const sendChunkOnce = (offset, slice) => new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `${API.base()}/api/assets/upload_chunk/${uploadId}?offset=${offset}`);
        xhr.setRequestHeader('X-Init-Data', initData);
        xhr.setRequestHeader('Content-Type', 'application/octet-stream');
        xhr.timeout = 90 * 1000;
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable && typeof onProgress === 'function') {
            onProgress(Math.round((offset + e.loaded) / total * 100), offset + e.loaded, total);
          }
        };
        xhr.onload = () => xhr.status >= 200 && xhr.status < 300
          ? resolve()
          : reject(new Error(`HTTP ${xhr.status}: ${xhr.responseText.slice(0,200)}`));
        xhr.onerror = () => reject(new Error('network'));
        xhr.ontimeout = () => reject(new Error('timeout'));
        xhr.send(slice);
      });

      let offset = 0;
      while (offset < total) {
        const end = Math.min(offset + chunkSize, total);
        const slice = file.slice(offset, end);
        let lastErr = null;
        for (let attempt = 1; attempt <= 4; attempt++) {
          try {
            await sendChunkOnce(offset, slice);
            lastErr = null;
            break;
          } catch (e) {
            lastErr = e;
            const wait = Math.min(1000 * attempt * attempt, 8000);   // 1s, 4s, 8s, 8s
            console.warn(`[upload] chunk @${offset} попытка ${attempt} упала: ${e.message}, retry через ${wait}ms`);
            await new Promise(r => setTimeout(r, wait));
          }
        }
        if (lastErr) throw new Error(`Chunk @${offset} провалился после 4 попыток: ${lastErr.message}`);
        offset = end;
        if (typeof onProgress === 'function') onProgress(Math.round(offset / total * 100), offset, total);
      }

      return await API.req('POST', `/api/assets/upload_finalize/${uploadId}`);
    },
    update:   (id, meta)                    => API.req('PATCH',  `/api/assets/${id}`, meta),
    remove:   (id)                          => API.req('DELETE', `/api/assets/${id}`),
    fileUrl:  (id)                          => `${API.base()}/api/assets/${id}/file`,
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
