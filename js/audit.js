document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('audit-feed-container');
  if (!container || !window.CRMStorage) return;
  const events = window.CRMStorage.getAuditLog();
  container.innerHTML = events.map(event => {
    const actor = event.actorId?.name || 'System';
    const category = event.entityType === 'session' ? 'auth' : event.entityType === 'invitation' ? 'team' : 'data';
    return `<div class="audit-card border-accent-green" data-category="${category}">
      <div class="card-body" style="padding: 1rem 1.15rem;">
        <div class="flex items-start justify-between gap-md"><div><div style="font-weight:700;">${escapeHTML(event.action)} · ${escapeHTML(event.entityType)}</div><div class="body-sm text-muted">${escapeHTML(actor)} · ${escapeHTML(new Date(event.timestamp || event.createdAt).toLocaleString())}</div></div><span class="badge badge-emerald">API</span></div>
        <div class="body-sm" style="margin-top:.65rem;">${escapeHTML(event.metadata?.message || `${event.action} ${event.entityType}`)}</div>
      </div>
    </div>`;
  }).join('') || '<div class="card"><div class="card-body body-sm text-muted">No audit events found.</div></div>';
  console.info('[ClientFlow] audit render count:', events.length);
});
