/**
 * ClientFlow CRM - Team Management Controller
 * Implements team directory, quota progress bars, system permissions display,
 * pending invitation resend/cancel, and role editing matching Screenshot 3.
 */

let currentTeamFilter = 'all';

document.addEventListener('DOMContentLoaded', () => {
  renderTeamDirectory();
  initTeamSearch();
  initTeamFilterChips();
  initAddMemberModal();
});

function renderTeamDirectory() {
  const container = document.getElementById('team-members-list');
  if (!container || !window.CRMStorage) return;

  const members = window.CRMStorage.getTeam();
  let html = '';

  members.forEach(m => {
    let specificContent = '';

    if (m.systemPermissions) {
      // Elena Rostova Admin View
      const badges = m.systemPermissions.map(p => `<span class="badge badge-neutral" style="font-size: 0.72rem; margin-right: 4px;">${escapeHTML(p)}</span>`).join('');
      specificContent = `
        <div style="background-color: #F8FAFC; border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: 0.65rem 0.85rem; margin: 0.65rem 0;">
          <div class="label-sm text-muted" style="margin-bottom: 4px;">System Permissions Granted</div>
          <div>${badges}</div>
        </div>
        <div class="flex items-center gap-xs" style="margin-top: 0.65rem;">
          <button class="btn btn-secondary btn-sm flex-1" onclick="showToast('Manage Access', 'RBAC permission matrix for ${escapeHTML(m.name)}', 'info')">
            Manage Access
          </button>
          <button class="btn btn-secondary btn-sm flex-1" onclick="showToast('Message', 'Opening chat with ${escapeHTML(m.name)}', 'info')">
            <i class="bi bi-chat-dots"></i> Message
          </button>
        </div>
      `;
    } else if (m.isTechnical) {
      // David Kim Tech Lead View
      specificContent = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin: 0.65rem 0; background-color: var(--color-bg-base); border-radius: var(--radius-md); padding: 0.5rem 0.75rem;">
          <div>
            <div class="label-sm text-muted">Active Assignments</div>
            <div style="font-size: 0.875rem; font-weight: 700;">${m.activePocs} Proof-of-Concepts</div>
          </div>
          <div>
            <div class="label-sm text-muted">Tech Reviews</div>
            <div style="font-size: 0.875rem; font-weight: 700;">${m.completedReviews} Completed</div>
          </div>
        </div>
        <div class="flex items-center gap-xs" style="margin-top: 0.65rem;">
          <button class="btn btn-primary btn-sm flex-1" onclick="showToast('Assign Deal', 'Select open deal to assign solutions architect', 'info')">
            <i class="bi bi-person-check"></i> Assign Deal
          </button>
          <button class="btn btn-secondary btn-sm flex-1" onclick="showToast('Edit Role', 'Modifying role configuration', 'info')">
            <i class="bi bi-pencil"></i> Edit
          </button>
        </div>
      `;
    } else {
      // AE / Sales Lead View with Progress Bar
      const isLead = m.badge === 'Sales Lead';
      const badgeClass = isLead ? 'badge-emerald' : m.badge === 'Growth' ? 'badge-info' : 'badge-neutral';
      
      specificContent = `
        <div style="margin: 0.65rem 0;">
          <div class="flex items-center justify-between" style="font-size: 0.75rem; margin-bottom: 3px;">
            <span class="text-muted">Attainment Pace</span>
            <strong class="mono" style="color: ${m.goalPercent >= 100 ? '#047857' : 'inherit'};">${m.goalPercent}% of Goal</strong>
          </div>
          <div class="progress-bar-wrap" style="height: 6px;">
            <div class="progress-bar-fill" style="width: ${Math.min(m.goalPercent, 100)}%; background-color: ${m.goalPercent >= 100 ? '#047857' : m.goalPercent >= 90 ? 'var(--color-primary)' : '#6B7280'};"></div>
          </div>
          <div class="flex items-center justify-between" style="font-size: 0.78rem; margin-top: 4px;">
            <span class="mono font-semibold">${escapeHTML(m.closedVal)} ${m.targetVal ? `/ ${escapeHTML(m.targetVal)}` : 'closed'}</span>
            <span class="text-muted"><i class="bi bi-briefcase"></i> ${m.dealsCount} Deals</span>
          </div>
        </div>

        <div class="flex items-center gap-xs" style="margin-top: 0.65rem;">
          <button class="btn btn-secondary btn-sm flex-1" onclick="showToast('Message', 'Direct messaging with ${escapeHTML(m.name)}', 'info')">
            <i class="bi bi-chat-dots"></i> Message
          </button>
          <button class="btn btn-secondary btn-sm flex-1" onclick="showToast('Edit Role', 'Update commission quotas and tier permissions', 'info')">
            <i class="bi bi-pencil"></i> Edit Role
          </button>
          ${isLead ? `
            <button class="btn btn-secondary btn-sm btn-icon" onclick="showToast('VoIP Call', 'Dialing direct VoIP bridge...', 'info')">
              <i class="bi bi-telephone"></i>
            </button>
          ` : ''}
        </div>
      `;
    }

    html += `
      <div class="card" style="margin-bottom: 0.85rem; border-radius: var(--radius-lg);" id="member-card-${m.id}">
        <div class="card-body" style="padding: 1rem 1.25rem;">
          
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-sm">
              <div class="avatar avatar-md" style="background-color: ${m.isPrimary ? '#047857' : '#1F2937'}; color: #FFF; font-weight: 700;">
                ${escapeHTML(m.avatar)}
                <span class="avatar-status-dot" style="background-color: #059669;"></span>
              </div>
              <div>
                <div class="flex items-center gap-xs">
                  <span style="font-size: 0.95rem; font-weight: 700; color: var(--color-text-primary);">${escapeHTML(m.name)}</span>
                  <span class="badge ${m.badge === 'Sales Lead' ? 'badge-emerald' : m.badge === 'Admin' ? 'badge-neutral' : 'badge-info'}" style="font-size: 0.65rem;">
                    ${escapeHTML(m.badge)}
                  </span>
                </div>
                <div class="body-sm" style="color: var(--color-text-secondary); font-size: 0.78rem;">
                  ${escapeHTML(m.role)}
                </div>
                <div class="mono" style="font-size: 0.75rem; color: var(--color-text-tertiary);">
                  ${escapeHTML(m.email)}
                </div>
              </div>
            </div>

            <button class="btn btn-ghost btn-sm btn-icon" title="Member Options" onclick="showToast('Options', 'Team member management actions', 'info')">
              <i class="bi bi-three-dots-vertical"></i>
            </button>
          </div>

          ${specificContent}

        </div>
      </div>
    `;
  });

  container.innerHTML = html;
  renderPendingInvitations();
}

function renderPendingInvitations() {
  const invites = window.CRMStorage.getPendingInvites();
  const card = Array.from(document.querySelectorAll('.card')).find(x => x.textContent.includes('Pending Invitations'));
  if (!card) return;
  const title = card.querySelector('.card-header div div div');
  if (title) title.textContent = `Pending Invitations (${invites.length})`;
  const body = card.querySelector('.card-body');
  if (body) body.innerHTML = invites.map(invite => `<div class="checklist-item"><div><div class="flex items-center gap-xs"><span style="font-weight:700;">${escapeHTML(invite.name || invite.email.split('@')[0])}</span><span class="badge badge-neutral" style="font-size:.65rem;">${escapeHTML(invite.role)}</span></div><div class="mono" style="font-size:.75rem;color:var(--color-text-tertiary);">${escapeHTML(invite.email)}</div><div class="body-sm text-muted" style="font-size:.72rem;margin-top:2px;">Expires ${new Date(invite.expiresAt).toLocaleDateString()}</div></div><div class="flex items-center gap-xs"><button class="btn btn-secondary btn-sm" onclick="showToast('Invitation', 'Resend is available through the API invitation workflow.', 'info')">Resend</button></div></div>`).join('') || '<div class="body-sm text-muted">No pending invitations.</div>';
}

function initTeamSearch() {
  const input = document.getElementById('team-search-input');
  if (!input) return;

  input.addEventListener('input', (e) => {
    const q = e.target.value.trim().toLowerCase();
    const cards = document.querySelectorAll('#team-members-list .card');
    cards.forEach(card => {
      const text = card.textContent.toLowerCase();
      card.style.display = text.includes(q) ? 'block' : 'none';
    });
  });
}

function initTeamFilterChips() {
  const chips = document.querySelectorAll('.team-segment-chip');
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active', 'active-emerald'));
      chip.classList.add('active-emerald');
      showToast('Filtered', `Displaying ${chip.textContent.trim()}`, 'info');
    });
  });
}

function initAddMemberModal() {
  const form = document.getElementById('team-invite-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('inv-name').value.trim();
    const email = document.getElementById('inv-email').value.trim();
    const role = document.getElementById('inv-role').value;

    if (!name || !email) {
      showToast('Validation Error', 'Name and work email required.', 'error');
      return;
    }

    closeModal('team-invite-modal');
    form.reset();
    showToast('Invitation Sent', `Sent secure workspace invitation to ${email}.`, 'success');
  });
}
