/** Centralized live API repository. Business records never use localStorage. */
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5000/api/v1'
  : 'https://crm-manager-sooty.vercel.app/api/v1';
const LEGACY_BUSINESS_KEYS = ['cf_crm_contacts_v2','cf_crm_deals_v2','cf_crm_tasks_v2','cf_crm_activities_v2','cf_crm_team_v2','cf_crm_notifications_v2','cf_crm_settings_v2','cf_crm_session_v2'];
const STAGE_TO_LABEL = { NEW_LEAD: 'New Lead', CONTACTED: 'Contacted', QUALIFIED: 'Qualified', PROPOSAL_SENT: 'Proposal Sent', WON: 'Won', LOST: 'Lost' };
const LABEL_TO_STAGE = Object.fromEntries(Object.entries(STAGE_TO_LABEL).map(([key, value]) => [value, key]));
const idOf = value => value && (value.id || value._id);
const initials = name => String(name || '').split(/\s+/).map(x => x[0]).join('').slice(0, 2).toUpperCase();
const relativeTime = date => { if (!date) return ''; const ms = Date.now() - new Date(date).getTime(); const mins = Math.max(1, Math.round(ms / 60000)); if (mins < 60) return `${mins}m ago`; const hours = Math.round(mins / 60); if (hours < 24) return `${hours}h ago`; return `${Math.round(hours / 24)}d ago`; };

class CRMStorageEngine {
  constructor() {
    LEGACY_BUSINESS_KEYS.forEach(key => localStorage.removeItem(key));
    this.token = localStorage.getItem('cf_access_token') || '';
    this.session = JSON.parse(localStorage.getItem('cf_user_session') || 'null') || {};
    console.info('[ClientFlow] API repository:', API_BASE_URL);
  }
  _request(path, options = {}) {
    const xhr = new XMLHttpRequest(); xhr.open(options.method || 'GET', API_BASE_URL + path, false); xhr.setRequestHeader('Content-Type', 'application/json'); if (this.token) xhr.setRequestHeader('Authorization', `Bearer ${this.token}`); xhr.send(options.body ? JSON.stringify(options.body) : null);
    if (xhr.status === 401) { this.token = ''; localStorage.removeItem('cf_access_token'); }
    if (xhr.status < 200 || xhr.status >= 300) { console.error('[ClientFlow] API error', xhr.status, path, xhr.responseText); return null; }
    const value = xhr.responseText ? JSON.parse(xhr.responseText) : null; console.info('[ClientFlow]', options.method || 'GET', path, xhr.status, Array.isArray(value) ? `${value.length} records` : 'ok'); return value;
  }
  async request(path, options = {}) { const response = await fetch(API_BASE_URL + path, { ...options, headers: { 'Content-Type': 'application/json', ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}), ...(options.headers || {}) }, body: options.body ? JSON.stringify(options.body) : undefined }); if (response.status === 401) { this.token = ''; localStorage.removeItem('cf_access_token'); } const value = await response.json().catch(() => ({})); if (!response.ok) throw new Error(value.message || `API ${response.status}`); return value; }
  _contact(c) { if (!c) return null; const owner = c.ownerId && typeof c.ownerId === 'object' ? c.ownerId : null; return { ...c, id: idOf(c), avatar: c.avatar || initials(c.name), isVip: c.status === 'VIP' || (c.tags || []).includes('Strategic'), statusLabel: c.status === 'Customer' ? 'Active Customer' : c.status === 'Lead' ? 'Qualified Lead' : c.status, rep: owner?.name || c.rep || 'Unassigned', repAvatar: owner?.avatar || initials(owner?.name), lastActive: relativeTime(c.lastActivityAt || c.updatedAt) }; }
  _deal(d) { if (!d) return null; const owner = d.ownerId && typeof d.ownerId === 'object' ? d.ownerId : null; const contact = d.contactId && typeof d.contactId === 'object' ? d.contactId : null; return { ...d, id: idOf(d), stage: STAGE_TO_LABEL[d.stage] || d.stage, apiStage: d.stage, rep: owner?.name || d.rep || 'Unassigned', repAvatar: owner?.avatar || initials(owner?.name), contactName: contact?.name || d.contactName || '', company: d.company || contact?.company || '' }; }
  _task(t) { if (!t) return null; const assignee = t.assigneeId && typeof t.assigneeId === 'object' ? t.assigneeId : null; const contact = t.contactId && typeof t.contactId === 'object' ? t.contactId : null; const due = new Date(t.dueDate); const overdue = t.status === 'pending' && due < new Date(); return { ...t, id: idOf(t), assignee: assignee?.name || t.assignee || 'Unassigned', assigneeAvatar: assignee?.avatar || initials(assignee?.name), account: contact?.company || t.account || '', stakeholder: contact?.name || t.stakeholder || '', dueTime: due.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }), isOverdue: overdue, completedTime: t.completedAt ? new Date(t.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '' }; }
  _activity(a) { return a ? { ...a, id: idOf(a), title: a.title || a.message, timeAgo: relativeTime(a.createdAt), rep: a.actorId?.name || a.rep || '' } : null; }
  _notification(n) { return n ? { ...n, id: idOf(n), unread: !n.readAt, timeAgo: relativeTime(n.createdAt) } : null; }
  getContactsPage(query = {}) { const params = new URLSearchParams({ page: query.page || 1, limit: query.limit || 100, ...(query.search ? { search: query.search } : {}), ...(query.status ? { status: query.status } : {}) }); const result = this._request(`/contacts?${params}`) || { items: [], total: 0 }; return { ...result, items: (result.items || []).map(x => this._contact(x)) }; }
  getContacts() { return this.getContactsPage().items; } getContactsList() { return this.getContacts(); } getContactById(id) { return this._contact(this._request(`/contacts/${encodeURIComponent(id)}`)); }
  saveContact(c) { const id = c.id || c._id; return this._contact(this._request(id ? `/contacts/${id}` : '/contacts', { method: id ? 'PATCH' : 'POST', body: c })); } deleteContact(id) { return this._request(`/contacts/${id}`, { method: 'DELETE' }); }
  getDeals() { return (this._request('/deals') || []).map(x => this._deal(x)); } getDealById(id) { return this.getDeals().find(x => x.id === id) || null; }
  saveDeal(d) { const id = d.id || d._id; const body = { ...d, stage: LABEL_TO_STAGE[d.stage] || d.stage }; delete body.id; delete body._id; delete body.apiStage; return this._deal(this._request(id ? `/deals/${id}` : '/deals', { method: id ? 'PATCH' : 'POST', body })); }
  updateDealStage(id, stage) { return this._deal(this._request(`/deals/${id}/stage`, { method: 'PATCH', body: { stage: LABEL_TO_STAGE[stage] || stage } })); } deleteDeal(id) { return this._request(`/deals/${id}`, { method: 'DELETE' }); }
  getTasks() { return (this._request('/tasks') || []).map(x => this._task(x)); } saveTask(t) { const id = t.id || t._id; const body = { ...t }; delete body.id; delete body._id; return this._task(this._request(id ? `/tasks/${id}` : '/tasks', { method: id ? 'PATCH' : 'POST', body })); } toggleTask(id) { return this._task(this._request(`/tasks/${id}/toggle`, { method: 'POST' })); }
  getTeam() { return (this._request('/team') || []).map(u => ({ ...u, id: idOf(u), avatar: u.avatar || initials(u.name), role: u.title || u.role, badge: u.role === 'admin' ? 'Admin' : u.role === 'manager' ? 'Manager' : u.role === 'viewer' ? 'Viewer' : 'AE', goalPercent: u.performance?.quotaAttainment || 0, closedVal: `$${(u.performance?.closedRevenue || 0).toLocaleString()}`, targetVal: u.quota ? `$${(u.quota / 1000).toFixed(0)}k` : '', dealsCount: u.performance?.activeDeals || 0 })); }
  saveTeamMember(m) { return this._request('/team/invitations', { method: 'POST', body: { email: m.email, role: m.authorizationRole || 'rep', name: m.name } }); } getPendingInvites() { return this._request('/team/invitations') || []; }
  getActivities() { return (this._request('/activities') || []).map(x => this._activity(x)); } logActivity(a) { const body = { ...a, message: a.message || a.title || a.subtitle || 'Activity logged' }; return this._activity(this._request('/activities', { method: 'POST', body })); }
  getNotifications() { return (this._request('/notifications') || []).map(x => this._notification(x)); } markNotificationRead(id) { return this._request('/notifications/read', { method: 'POST', body: { id } }); } markAllNotificationsRead() { return this._request('/notifications/read', { method: 'POST', body: {} }); }
  getSettings() { return this._request('/settings') || {}; } saveSettings(s) { return this._request('/settings', { method: 'PATCH', body: s }); }
  getSession() { return this.session || {}; } saveSession(s) { this.session = { ...this.session, ...s }; localStorage.setItem('cf_user_session', JSON.stringify(this.session)); return this.session; }
  async login(email, password) { const result = await this.request('/auth/login', { method: 'POST', body: { email, password } }); this.token = result.accessToken; this.session = result.user; localStorage.setItem('cf_access_token', result.accessToken); localStorage.setItem('cf_user_session', JSON.stringify(result.user)); return result; }
  async logout() { if (this.token) await this.request('/auth/logout', { method: 'POST' }).catch(() => {}); this.token = ''; this.session = {}; localStorage.removeItem('cf_access_token'); localStorage.removeItem('cf_user_session'); }
  dashboard() { return this._request('/dashboard') || {}; } reports() { return this._request('/reports') || {}; } getSessions() { return this._request('/sessions') || []; } revokeSession(id) { return this._request(`/sessions/${id}/revoke`, { method: 'POST' }); } getAuditLog() { return this._request('/audit') || []; }
  resetDemoData() { console.warn('Demo reset is disabled in the browser. Use the development seed command.'); }
}
window.CRMStorage = new CRMStorageEngine();
