function renderLiveNotifications() {
  const notifications = window.CRMStorage.getNotifications();
  const cards = document.querySelectorAll('.notif-card');
  const parent = cards[0]?.parentElement;
  if (!parent) return;
  cards.forEach(card => card.remove());
  parent.insertAdjacentHTML('beforeend', notifications.map(n => `<div class="notif-card ${n.unread ? 'border-accent-green' : ''}" data-type="${escapeHTML(n.type || 'system')}" data-unread="${n.unread}"><div class="flex items-start justify-between" style="margin-bottom:.5rem;"><div><strong style="font-size:.875rem;">${escapeHTML(n.title)}</strong><div class="body-sm text-muted" style="margin-top:.25rem;">${escapeHTML(n.message)}</div></div><button type="button" class="btn btn-secondary btn-sm btn-icon" onclick="markNotificationLive('${n.id}', this)"><i class="bi bi-check2"></i></button></div><div class="body-sm text-muted">${escapeHTML(n.timeAgo || '')}</div></div>`).join(''));
  const unread = notifications.filter(n => n.unread).length;
  document.querySelectorAll('.pill-filter').forEach(pill => { if (pill.textContent.trim().startsWith('Unread')) { const badge = pill.querySelector('.badge'); if (badge) badge.textContent = unread; } });
  const subtitle = document.querySelector('h1 + .body-sm'); if (subtitle) subtitle.textContent = `${unread} unread updates`; updateNotificationDot();
}
function markNotificationLive(id, button) { window.CRMStorage.markNotificationRead(id); if (button) button.closest('.notif-card').setAttribute('data-unread', 'false'); renderLiveNotifications(); showToast('Marked Read', 'Notification acknowledged.', 'success'); }
document.addEventListener('DOMContentLoaded', () => { if (document.querySelector('.notif-card')) renderLiveNotifications(); });
