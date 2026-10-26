/**
 * ClientFlow CRM - Global Application Logic
 * Toasts, Modals, Global Search, Shortcuts, Clipboard, Confirmation Dialogs
 */

document.addEventListener('DOMContentLoaded', () => {
  initAppGlobals();
  initGlobalShortcuts();
  initSearchModal();
});

function initAppGlobals() {
  // Ensure Toast Container exists
  if (!document.getElementById('toast-container')) {
    const toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    document.body.appendChild(toastContainer);
  }

  // Update notification indicator
  updateNotificationDot();
}

/**
 * Toast Notification System
 * @param {string} title
 * @param {string} message
 * @param {'success'|'error'|'warning'|'info'} type
 */
function showToast(title, message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const iconMap = {
    success: 'bi-check-circle-fill',
    error: 'bi-exclamation-octagon-fill',
    warning: 'bi-exclamation-triangle-fill',
    info: 'bi-info-circle-fill'
  };

  toast.innerHTML = `
    <div class="toast-icon">
      <i class="bi ${iconMap[type] || iconMap.info}"></i>
    </div>
    <div class="toast-content">
      <div class="toast-title">${escapeHTML(title)}</div>
      <div class="toast-message">${escapeHTML(message)}</div>
    </div>
    <button type="button" class="toast-close" aria-label="Close">
      <i class="bi bi-x-lg"></i>
    </button>
  `;

  const closeBtn = toast.querySelector('.toast-close');
  closeBtn.addEventListener('click', () => {
    toast.remove();
  });

  container.appendChild(toast);

  // Auto remove after 4.5 seconds
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.25s ease';
    setTimeout(() => toast.remove(), 250);
  }, 4500);
}

/**
 * Modal Manager
 */
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  modal.classList.add('show');
  document.body.style.overflow = 'hidden';

  const firstInput = modal.querySelector('input:not([type="hidden"]), select, textarea');
  if (firstInput) {
    setTimeout(() => firstInput.focus(), 150);
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  modal.classList.remove('show');
  document.body.style.overflow = '';
}

// Click backdrop to close
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-backdrop')) {
    e.target.classList.remove('show');
    document.body.style.overflow = '';
  }
});

/**
 * Global Confirmation Dialog
 */
function showConfirm(title, message, onConfirm, confirmText = 'Confirm', isDestructive = false) {
  let confirmModal = document.getElementById('global-confirm-modal');
  if (!confirmModal) {
    confirmModal = document.createElement('div');
    confirmModal.id = 'global-confirm-modal';
    confirmModal.className = 'modal-backdrop';
    confirmModal.innerHTML = `
      <div class="modal-dialog" style="max-width: 440px;">
        <div class="modal-header">
          <div class="modal-title" id="confirm-modal-title">Confirm Action</div>
          <button class="btn btn-ghost btn-sm btn-icon" onclick="closeModal('global-confirm-modal')">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
        <div class="modal-body" id="confirm-modal-body">
          Are you sure you want to proceed?
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('global-confirm-modal')">Cancel</button>
          <button class="btn btn-primary" id="confirm-modal-action-btn">Confirm</button>
        </div>
      </div>
    `;
    document.body.appendChild(confirmModal);
  }

  document.getElementById('confirm-modal-title').textContent = title;
  document.getElementById('confirm-modal-body').textContent = message;
  const actionBtn = document.getElementById('confirm-modal-action-btn');
  actionBtn.textContent = confirmText;
  actionBtn.className = isDestructive ? 'btn btn-destructive' : 'btn btn-primary';

  // Replace onclick handler cleanly
  const newActionBtn = actionBtn.cloneNode(true);
  actionBtn.parentNode.replaceChild(newActionBtn, actionBtn);
  newActionBtn.addEventListener('click', () => {
    closeModal('global-confirm-modal');
    if (typeof onConfirm === 'function') onConfirm();
  });

  openModal('global-confirm-modal');
}

/**
 * Copy to Clipboard with Feedback
 */
function copyToClipboard(text, successMsg = 'Copied to clipboard!') {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(() => {
      showToast('Copied', successMsg, 'success');
    }).catch(() => {
      fallbackCopy(text, successMsg);
    });
  } else {
    fallbackCopy(text, successMsg);
  }
}

function fallbackCopy(text, successMsg) {
  const tempInput = document.createElement('input');
  tempInput.value = text;
  document.body.appendChild(tempInput);
  tempInput.select();
  document.execCommand('copy');
  document.body.removeChild(tempInput);
  showToast('Copied', successMsg, 'success');
}

/**
 * Global Keyboard Shortcuts
 */
function initGlobalShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Open Global Search with '/' when not typing in an input
    if (e.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) {
      e.preventDefault();
      openGlobalSearch();
    }
    // Close open modal with 'Escape'
    if (e.key === 'Escape') {
      const openModals = document.querySelectorAll('.modal-backdrop.show');
      openModals.forEach(m => m.classList.remove('show'));
      document.body.style.overflow = '';
    }
  });
}

/**
 * Global Quick Search Overlay
 */
function initSearchModal() {
  let searchModal = document.getElementById('global-search-modal');
  if (!searchModal) {
    searchModal = document.createElement('div');
    searchModal.id = 'global-search-modal';
    searchModal.className = 'modal-backdrop';
    searchModal.innerHTML = `
      <div class="modal-dialog modal-lg" style="margin-top: 10vh;">
        <div style="padding: 1rem 1.25rem; border-bottom: 1px solid var(--color-border); display: flex; align-items: center; gap: 0.75rem;">
          <i class="bi bi-search" style="font-size: 1.1rem; color: var(--color-text-secondary);"></i>
          <input type="text" id="global-search-input" class="form-control" placeholder="Search contacts, deals, tasks, team..." style="border: none; box-shadow: none; font-size: 1rem; padding: 0;">
          <span class="search-shortcut-badge">ESC</span>
        </div>
        <div id="global-search-results" style="max-height: 380px; overflow-y: auto; padding: 0.75rem 1rem;">
          <div style="font-size: 0.75rem; color: var(--color-text-secondary); text-transform: uppercase; font-weight: 600; margin-bottom: 0.5rem;">Suggested Quick Jumps</div>
          <div class="search-result-items">
            <a href="dashboard.html" class="sidebar-nav-item" style="color: var(--color-text-primary); margin-bottom: 4px;">
              <span class="nav-item-left"><i class="bi bi-grid nav-item-icon"></i> Dashboard Overview</span>
            </a>
            <a href="contacts.html" class="sidebar-nav-item" style="color: var(--color-text-primary); margin-bottom: 4px;">
              <span class="nav-item-left"><i class="bi bi-people nav-item-icon"></i> Contacts Directory</span>
            </a>
            <a href="deals.html" class="sidebar-nav-item" style="color: var(--color-text-primary); margin-bottom: 4px;">
              <span class="nav-item-left"><i class="bi bi-kanban nav-item-icon"></i> Sales Pipeline Kanban</span>
            </a>
            <a href="tasks.html" class="sidebar-nav-item" style="color: var(--color-text-primary);">
              <span class="nav-item-left"><i class="bi bi-check2-circle nav-item-icon"></i> Tasks & Follow-ups</span>
            </a>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(searchModal);

    const input = document.getElementById('global-search-input');
    input.addEventListener('input', (e) => {
      performGlobalSearch(e.target.value.trim().toLowerCase());
    });
  }
}

function openGlobalSearch() {
  openModal('global-search-modal');
  const input = document.getElementById('global-search-input');
  if (input) {
    input.value = '';
    input.focus();
    performGlobalSearch('');
  }
}

function performGlobalSearch(query) {
  const resultsContainer = document.getElementById('global-search-results');
  if (!resultsContainer || !window.CRMStorage) return;

  if (!query) {
    resultsContainer.innerHTML = `
      <div style="font-size: 0.75rem; color: var(--color-text-secondary); text-transform: uppercase; font-weight: 600; margin-bottom: 0.5rem;">Quick Jumps</div>
      <div class="search-result-items">
        <a href="dashboard.html" class="sidebar-nav-item" style="color: var(--color-text-primary); margin-bottom: 4px;"><span class="nav-item-left"><i class="bi bi-grid nav-item-icon"></i> Dashboard Overview</span></a>
        <a href="contacts.html" class="sidebar-nav-item" style="color: var(--color-text-primary); margin-bottom: 4px;"><span class="nav-item-left"><i class="bi bi-people nav-item-icon"></i> Contacts Directory</span></a>
        <a href="deals.html" class="sidebar-nav-item" style="color: var(--color-text-primary); margin-bottom: 4px;"><span class="nav-item-left"><i class="bi bi-kanban nav-item-icon"></i> Sales Pipeline</span></a>
        <a href="tasks.html" class="sidebar-nav-item" style="color: var(--color-text-primary); margin-bottom: 4px;"><span class="nav-item-left"><i class="bi bi-check2-circle nav-item-icon"></i> Tasks & Action Items</span></a>
        <a href="reports.html" class="sidebar-nav-item" style="color: var(--color-text-primary);"><span class="nav-item-left"><i class="bi bi-graph-up-arrow nav-item-icon"></i> Reports & Analytics</span></a>
      </div>
    `;
    return;
  }

  const contacts = window.CRMStorage.getContacts().filter(c =>
    c.name.toLowerCase().includes(query) ||
    c.company.toLowerCase().includes(query) ||
    c.email.toLowerCase().includes(query)
  );

  const deals = window.CRMStorage.getDeals().filter(d =>
    d.title.toLowerCase().includes(query) ||
    d.company.toLowerCase().includes(query)
  );

  const tasks = window.CRMStorage.getTasks().filter(t =>
    t.title.toLowerCase().includes(query) ||
    (t.relatedTo && t.relatedTo.toLowerCase().includes(query))
  );

  let html = '';

  if (contacts.length > 0) {
    html += `<div style="font-size: 0.75rem; color: var(--color-text-secondary); text-transform: uppercase; font-weight: 600; margin: 0.5rem 0;">Contacts (${contacts.length})</div>`;
    contacts.slice(0, 4).forEach(c => {
      html += `
        <a href="contact-details.html?id=${c.id}" class="checklist-item" style="margin-bottom: 4px; text-decoration: none;">
          <div class="checklist-left">
            <div class="avatar avatar-sm">${c.avatar}</div>
            <div>
              <div class="checklist-title">${escapeHTML(c.name)} <span class="badge badge-emerald" style="font-size: 0.65rem;">${c.statusLabel}</span></div>
              <div class="checklist-due">${escapeHTML(c.company)} • ${escapeHTML(c.email)}</div>
            </div>
          </div>
          <i class="bi bi-chevron-right text-muted"></i>
        </a>
      `;
    });
  }

  if (deals.length > 0) {
    html += `<div style="font-size: 0.75rem; color: var(--color-text-secondary); text-transform: uppercase; font-weight: 600; margin: 0.75rem 0 0.5rem 0;">Deals (${deals.length})</div>`;
    deals.slice(0, 4).forEach(d => {
      html += `
        <a href="deal-details.html?id=${d.id}" class="checklist-item" style="margin-bottom: 4px; text-decoration: none;">
          <div class="checklist-left">
            <div class="avatar avatar-sm" style="background: var(--color-info-soft); color: var(--color-info-text);"><i class="bi bi-briefcase"></i></div>
            <div>
              <div class="checklist-title">${escapeHTML(d.title)}</div>
              <div class="checklist-due">${escapeHTML(d.company)} • $${d.value.toLocaleString()} • ${escapeHTML(d.stage)}</div>
            </div>
          </div>
          <span class="badge badge-info">${d.probability}%</span>
        </a>
      `;
    });
  }

  if (tasks.length > 0) {
    html += `<div style="font-size: 0.75rem; color: var(--color-text-secondary); text-transform: uppercase; font-weight: 600; margin: 0.75rem 0 0.5rem 0;">Tasks (${tasks.length})</div>`;
    tasks.slice(0, 3).forEach(t => {
      html += `
        <a href="tasks.html" class="checklist-item" style="margin-bottom: 4px; text-decoration: none;">
          <div class="checklist-left">
            <i class="bi bi-check2-square text-emerald"></i>
            <div>
              <div class="checklist-title">${escapeHTML(t.title)}</div>
              <div class="checklist-due">${escapeHTML(t.dueTime)} • Assignee: ${escapeHTML(t.assignee)}</div>
            </div>
          </div>
          <span class="badge badge-${t.priority === 'Urgent' ? 'danger' : 'neutral'}">${t.priority}</span>
        </a>
      `;
    });
  }

  if (contacts.length === 0 && deals.length === 0 && tasks.length === 0) {
    html = `
      <div style="text-align: center; padding: 2rem; color: var(--color-text-secondary);">
        <i class="bi bi-search" style="font-size: 2rem; opacity: 0.4;"></i>
        <p style="margin-top: 0.5rem;">No matching records found for "<strong>${escapeHTML(query)}</strong>"</p>
      </div>
    `;
  }

  resultsContainer.innerHTML = html;
}

function updateNotificationDot() {
  if (!window.CRMStorage) return;
  const notifs = window.CRMStorage.getNotifications();
  const unreadCount = notifs.filter(n => n.unread).length;
  const indicator = document.querySelector('.notification-indicator');
  if (indicator) {
    indicator.style.display = unreadCount > 0 ? 'block' : 'none';
  }
}

function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

window.showToast = showToast;
window.openModal = openModal;
window.closeModal = closeModal;
window.showConfirm = showConfirm;
window.copyToClipboard = copyToClipboard;
window.openGlobalSearch = openGlobalSearch;
window.escapeHTML = escapeHTML;
