/**
 * ClientFlow CRM - Contacts Management Controller
 * Handles contact listing, filtering, search, pagination, bulk selection,
 * dossier details view, add/edit modals, and note persistence.
 */

let currentContactFilter = 'all';
let currentSearchTerm = '';
let currentPage = 1;
const itemsPerPage = 4;

document.addEventListener('DOMContentLoaded', () => {
  // If on contacts directory page
  if (document.getElementById('contacts-list-container')) {
    renderContactsList();
    initContactsFilterChips();
    initContactsSearch();
    initAddContactModal();
  }

  // If on contact details page
  if (document.getElementById('contact-dossier-view')) {
    renderContactDetailsPage();
    initContactNotesForm();
    initContactTabNavigation();
  }
});

/**
 * Render Contacts Directory
 */
function renderContactsList() {
  const container = document.getElementById('contacts-list-container');
  if (!container || !window.CRMStorage) return;

  const status = currentContactFilter === 'customers' ? 'Customer' : currentContactFilter === 'leads' ? 'Lead' : currentContactFilter === 'inactive' ? 'Inactive' : currentContactFilter === 'vip' ? 'VIP' : undefined;
  const response = window.CRMStorage.getContactsPage({ page: currentPage, limit: itemsPerPage, search: currentSearchTerm, status });
  const contacts = response.items || [];
  const totalCount = response.total || 0;
  const totalPages = Math.ceil(totalCount / itemsPerPage) || 1;
  if (currentPage > totalPages) currentPage = totalPages;

  const paginatedContacts = contacts;

  // Update total badge
  const totalBadge = document.getElementById('contacts-total-count-badge');
  if (totalBadge) totalBadge.textContent = `${totalCount} total`;
  const selectLabel = document.querySelector('#contacts-select-all')?.parentElement?.nextElementSibling;
  if (selectLabel) selectLabel.textContent = `Select all (${totalCount})`;

  if (paginatedContacts.length === 0) {
    container.innerHTML = `
      <div class="card" style="text-align: center; padding: 3rem 1.5rem;">
        <i class="bi bi-people" style="font-size: 2.5rem; color: var(--color-text-tertiary);"></i>
        <h3 class="headline-sm" style="margin-top: 0.75rem;">No contacts found</h3>
        <p class="body-sm">Try refining your search term or segment filter.</p>
        <button class="btn btn-primary" style="margin-top: 1rem;" onclick="resetContactsFilters()">
          Clear Filters
        </button>
      </div>
    `;
    renderPagination(totalCount, totalPages);
    return;
  }

  let html = '';
  paginatedContacts.forEach(contact => {
    const isCustomer = contact.status === 'Customer';
    const isLead = contact.status === 'Lead';
    const isInactive = contact.status === 'Inactive';
    const statusBadgeClass = isCustomer ? 'badge-emerald' : isLead ? 'badge-info' : 'badge-neutral';

    html += `
      <div class="card" style="margin-bottom: 0.85rem; border-radius: var(--radius-lg);" id="contact-card-${contact.id}">
        <div class="card-body" style="padding: 1.15rem 1.25rem;">
          
          <div class="flex items-start justify-between flex-wrap gap-sm">
            <div class="flex items-center gap-md">
              <label class="form-check" style="margin-bottom: 0;">
                <input type="checkbox" class="contact-select-checkbox" data-id="${contact.id}">
              </label>
              
              <div class="avatar avatar-md" style="background-color: #059669; color: #FFFFFF; font-weight: 700;">
                ${contact.avatar}
                <span class="avatar-status-dot" style="background-color: ${isInactive ? '#9CA3AF' : '#059669'};"></span>
              </div>

              <div>
                <div class="flex items-center gap-xs flex-wrap">
                  <a href="contact-details.html?id=${contact.id}" style="font-size: 1rem; font-weight: 700; color: var(--color-text-primary);">
                    ${escapeHTML(contact.name)}
                  </a>
                  ${contact.isVip ? '<span class="badge badge-info" style="font-size: 0.65rem;">VIP</span>' : ''}
                  <i class="bi bi-patch-check-fill text-info" style="font-size: 0.85rem;"></i>
                  <span class="badge ${statusBadgeClass}">${escapeHTML(contact.statusLabel || contact.status)}</span>
                </div>
                <div class="body-sm" style="color: var(--color-text-secondary); margin-top: 2px;">
                  ${escapeHTML(contact.title)} • ${escapeHTML(contact.company)}
                </div>
              </div>
            </div>

            <!-- Action buttons -->
            <div class="flex items-center gap-xs">
              <button class="btn btn-ghost btn-sm btn-icon" title="Edit Contact" onclick="openEditContactModal('${contact.id}')">
                <i class="bi bi-pencil"></i>
              </button>
              <button class="btn btn-ghost btn-sm btn-icon text-danger" title="Delete Contact" onclick="confirmDeleteContact('${contact.id}', '${escapeHTML(contact.name)}')">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </div>

          <!-- Contact Details Info Row -->
          <div style="background-color: var(--color-bg-base); border-radius: var(--radius-md); padding: 0.65rem 0.85rem; margin: 0.85rem 0; display: flex; flex-direction: column; gap: 0.35rem;">
            <div class="flex items-center justify-between flex-wrap gap-xs">
              <span class="mono" style="font-size: 0.8125rem; color: var(--color-text-primary); display: flex; align-items: center; gap: 0.4rem;">
                <i class="bi bi-envelope text-muted"></i> ${escapeHTML(contact.email)}
              </span>
              <button class="btn-copy" onclick="copyToClipboard('${contact.email}', 'Email copied!')" title="Copy Email">
                <i class="bi bi-copy"></i>
              </button>
            </div>
            <div class="flex items-center justify-between flex-wrap gap-xs">
              <span class="mono" style="font-size: 0.8125rem; color: var(--color-text-primary); display: flex; align-items: center; gap: 0.4rem;">
                <i class="bi bi-telephone text-muted"></i> ${escapeHTML(contact.phone)}
              </span>
              <span class="label-md" style="color: var(--color-text-secondary); font-size: 0.7rem;">HQ Direct</span>
            </div>
          </div>

          <!-- Card Footer with Rep Info & Quick Buttons -->
          <div class="flex items-center justify-between flex-wrap gap-sm pt-xs">
            <div class="flex items-center gap-xs body-sm" style="font-size: 0.78rem;">
              <span class="avatar avatar-sm" style="width: 22px; height: 22px; font-size: 0.6rem; background: var(--color-charcoal); color: #FFF;">
                ${contact.rep !== 'Unassigned' ? 'SJ' : '—'}
              </span>
              <span>Rep: <strong>${escapeHTML(contact.rep)}</strong></span>
              <span class="text-muted">• ${escapeHTML(contact.lastActive)}</span>
            </div>

            <div class="flex items-center gap-xs">
              <button class="btn btn-secondary btn-sm" onclick="showToast('Initiating Call', 'Connecting VoIP bridge to ${contact.phone}...', 'info')">
                <i class="bi bi-telephone"></i> Call
              </button>
              <button class="btn btn-secondary btn-sm" onclick="showToast('Compose Email', 'Opening message draft for ${contact.email}...', 'info')">
                <i class="bi bi-envelope"></i> Email
              </button>
              <a href="contact-details.html?id=${contact.id}" class="btn btn-primary btn-sm">
                Details <i class="bi bi-arrow-right"></i>
              </a>
            </div>
          </div>

        </div>
      </div>
    `;
  });

  container.innerHTML = html;
  renderPagination(totalCount, totalPages);
}

function renderPagination(totalCount, totalPages) {
  const wrapper = document.getElementById('contacts-pagination-controls');
  if (!wrapper) return;

  const showingStart = totalCount === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const showingEnd = Math.min(currentPage * itemsPerPage, totalCount);

  let pagesHtml = `
    <button class="page-btn" ${currentPage === 1 ? 'disabled' : ''} onclick="changeContactsPage(${currentPage - 1})">
      <i class="bi bi-chevron-left"></i>
    </button>
  `;

  for (let p = 1; p <= totalPages; p++) {
    pagesHtml += `
      <button class="page-btn ${p === currentPage ? 'active' : ''}" onclick="changeContactsPage(${p})">${p}</button>
    `;
  }

  pagesHtml += `
    <button class="page-btn" ${currentPage === totalPages || totalPages === 0 ? 'disabled' : ''} onclick="changeContactsPage(${currentPage + 1})">
      <i class="bi bi-chevron-right"></i>
    </button>
  `;

  wrapper.innerHTML = `
    <div class="pagination-info">
    Showing <strong>${showingStart}-${showingEnd}</strong> of <strong>${totalCount}</strong>
    </div>
    <div class="pagination-controls">
      ${pagesHtml}
    </div>
  `;
}

function changeContactsPage(newPage) {
  currentPage = newPage;
  renderContactsList();
}

function initContactsFilterChips() {
  const chips = document.querySelectorAll('.contact-filter-chip');
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active', 'active-emerald'));
      chip.classList.add('active');
      currentContactFilter = chip.getAttribute('data-filter');
      currentPage = 1;
      renderContactsList();
    });
  });
}

function initContactsSearch() {
  const searchInput = document.getElementById('contacts-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentSearchTerm = e.target.value.trim().toLowerCase();
      currentPage = 1;
      renderContactsList();
    });
  }

  // Select all checkbox
  const selectAll = document.getElementById('contacts-select-all');
  if (selectAll) {
    selectAll.addEventListener('change', (e) => {
      const checkboxes = document.querySelectorAll('.contact-select-checkbox');
      checkboxes.forEach(cb => cb.checked = e.target.checked);
    });
  }
}

function resetContactsFilters() {
  currentContactFilter = 'all';
  currentSearchTerm = '';
  currentPage = 1;
  const searchInput = document.getElementById('contacts-search-input');
  if (searchInput) searchInput.value = '';
  const chips = document.querySelectorAll('.contact-filter-chip');
  chips.forEach((c, idx) => {
    if (idx === 0) c.classList.add('active');
    else c.classList.remove('active');
  });
  renderContactsList();
}

function initAddContactModal() {
  const form = document.getElementById('add-contact-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('add-contact-name').value.trim();
    const title = document.getElementById('add-contact-title').value.trim();
    const company = document.getElementById('add-contact-company').value.trim();
    const email = document.getElementById('add-contact-email').value.trim();
    const phone = document.getElementById('add-contact-phone').value.trim();
    const status = document.getElementById('add-contact-status').value;

    if (!name || !email || !company) {
      showToast('Validation Error', 'Name, email, and company are required.', 'error');
      return;
    }

    window.CRMStorage.saveContact({
      name,
      title: title || 'Executive',
      company,
      email,
      phone: phone || '+1 (555) 000-0000',
      status,
      statusLabel: status === 'Customer' ? 'Active Customer' : status === 'Lead' ? 'Qualified Lead' : 'Inactive',
      isVip: false,
      rep: 'Sarah Jenkins',
      address: 'Headquarters Campus, United States',
      annualRevenue: '$10.0M',
      industry: 'Enterprise Technology'
    });

    closeModal('add-contact-modal');
    form.reset();
    showToast('Contact Added', `${name} has been added to contacts.`, 'success');
    renderContactsList();
  });
}

function openEditContactModal(contactId) {
  const contact = window.CRMStorage.getContactById(contactId);
  if (!contact) return;

  let editModal = document.getElementById('edit-contact-modal');
  if (!editModal) {
    editModal = document.createElement('div');
    editModal.id = 'edit-contact-modal';
    editModal.className = 'modal-backdrop';
    editModal.innerHTML = `
      <div class="modal-dialog">
        <div class="modal-header">
          <div class="modal-title">Edit Contact Profile</div>
          <button type="button" class="btn btn-ghost btn-sm btn-icon" onclick="closeModal('edit-contact-modal')">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
        <form id="edit-contact-form">
          <input type="hidden" id="edit-contact-id">
          <div class="modal-body">
            <div class="form-group">
              <label class="form-label">Full Name <span class="required">*</span></label>
              <input type="text" id="edit-contact-name" class="form-control" required>
            </div>
            <div class="form-group">
              <label class="form-label">Title / Role</label>
              <input type="text" id="edit-contact-title" class="form-control">
            </div>
            <div class="form-group">
              <label class="form-label">Company <span class="required">*</span></label>
              <input type="text" id="edit-contact-company" class="form-control" required>
            </div>
            <div class="grid" style="grid-template-columns: 1fr 1fr; gap: 1rem;">
              <div class="form-group">
                <label class="form-label">Email <span class="required">*</span></label>
                <input type="email" id="edit-contact-email" class="form-control" required>
              </div>
              <div class="form-group">
                <label class="form-label">Direct Phone</label>
                <input type="text" id="edit-contact-phone" class="form-control">
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Relationship Status</label>
              <select id="edit-contact-status" class="form-control">
                <option value="Customer">Customer</option>
                <option value="Lead">Lead</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" onclick="closeModal('edit-contact-modal')">Cancel</button>
            <button type="submit" class="btn btn-primary">Save Changes</button>
          </div>
        </form>
      </div>
    `;
    document.body.appendChild(editModal);

    const editForm = document.getElementById('edit-contact-form');
    editForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = document.getElementById('edit-contact-id').value;
      const name = document.getElementById('edit-contact-name').value.trim();
      const title = document.getElementById('edit-contact-title').value.trim();
      const company = document.getElementById('edit-contact-company').value.trim();
      const email = document.getElementById('edit-contact-email').value.trim();
      const phone = document.getElementById('edit-contact-phone').value.trim();
      const status = document.getElementById('edit-contact-status').value;

      window.CRMStorage.saveContact({
        id,
        name,
        title,
        company,
        email,
        phone,
        status,
        statusLabel: status === 'Customer' ? 'Active Customer' : status === 'Lead' ? 'Qualified Lead' : 'Inactive'
      });

      closeModal('edit-contact-modal');
      showToast('Updated', `Profile for ${name} updated.`, 'success');
      if (document.getElementById('contacts-list-container')) renderContactsList();
      if (document.getElementById('contact-dossier-view')) renderContactDetailsPage();
    });
  }

  document.getElementById('edit-contact-id').value = contact.id;
  document.getElementById('edit-contact-name').value = contact.name;
  document.getElementById('edit-contact-title').value = contact.title || '';
  document.getElementById('edit-contact-company').value = contact.company;
  document.getElementById('edit-contact-email').value = contact.email;
  document.getElementById('edit-contact-phone').value = contact.phone || '';
  document.getElementById('edit-contact-status').value = contact.status;

  openModal('edit-contact-modal');
}

function confirmDeleteContact(contactId, contactName) {
  showConfirm(
    'Delete Contact',
    `Are you sure you want to delete ${contactName}? This action removes their associated history from frontend sample data.`,
    () => {
      window.CRMStorage.deleteContact(contactId);
      showToast('Contact Deleted', `${contactName} has been removed.`, 'warning');
      renderContactsList();
    },
    'Delete Contact',
    true
  );
}

/**
 * Render Detailed Contact Dossier Page (Matching Screenshot 3)
 */
function renderContactDetailsPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const contactId = urlParams.get('id') || 'cnt-1'; // Default Elena Martinez
  const contact = window.CRMStorage.getContactById(contactId);

  if (!contact) {
    document.getElementById('contact-dossier-view').innerHTML = `
      <div class="card" style="padding: 3rem; text-align: center;">
        <h2 class="headline-md">Contact Record Not Found</h2>
        <p class="body-sm">The requested contact dossier does not exist.</p>
        <a href="contacts.html" class="btn btn-primary" style="margin-top: 1rem;">Back to Contacts</a>
      </div>
    `;
    return;
  }

  // Populate Header Banner
  const avatarEl = document.getElementById('contact-avatar-el');
  if (avatarEl) avatarEl.textContent = contact.avatar;

  const nameEl = document.getElementById('contact-name-el');
  if (nameEl) nameEl.textContent = contact.name;

  const statusBadgeEl = document.getElementById('contact-status-badge-el');
  if (statusBadgeEl) {
    statusBadgeEl.textContent = contact.statusLabel || contact.status;
  }

  const roleCompanyEl = document.getElementById('contact-role-company-el');
  if (roleCompanyEl) {
    roleCompanyEl.textContent = `${contact.title} at ${contact.company}`;
  }

  // Populate Contact Information Card
  const emailEl = document.getElementById('contact-info-email');
  if (emailEl) emailEl.textContent = contact.email;

  const phoneEl = document.getElementById('contact-info-phone');
  if (phoneEl) phoneEl.textContent = contact.phone;

  const addrEl = document.getElementById('contact-info-address');
  if (addrEl) addrEl.textContent = contact.address || '452 Enterprise Blvd, Suite 800, Austin, TX 78701';

  const revEl = document.getElementById('contact-info-rev-industry');
  if (revEl) revEl.textContent = `${contact.annualRevenue || '$14.2M'} • ${contact.industry || 'Enterprise Logistics'}`;

  // Populate Deals linked to this contact
  renderContactDeals(contact);

  // Populate Timeline
  renderContactTimeline(contact);
}

function renderContactDeals(contact) {
  const container = document.getElementById('contact-active-deals-container');
  if (!container || !window.CRMStorage) return;

  const allDeals = window.CRMStorage.getDeals();
  const linkedDeals = allDeals.filter(d => d.contactId === contact.id || d.company.includes(contact.company.split(' ')[0]));

  const dealsTotalEl = document.getElementById('contact-deals-total-val');
  const totalVal = linkedDeals.reduce((sum, d) => sum + (Number(d.value) || 0), 0);
  if (dealsTotalEl) dealsTotalEl.textContent = `$${totalVal.toLocaleString()}`;

  if (linkedDeals.length === 0) {
    container.innerHTML = `<p class="body-sm text-muted" style="padding: 0.5rem 0;">No active deals currently open with this account.</p>`;
    return;
  }

  let html = '';
  linkedDeals.forEach(deal => {
    const isWon = deal.stage === 'Won';
    html += `
      <div style="background-color: var(--color-bg-base); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: 0.85rem 1rem; margin-bottom: 0.75rem;">
        <div class="flex items-center justify-between">
          <a href="deal-details.html?id=${deal.id}" style="font-weight: 600; color: var(--color-text-primary); font-size: 0.9375rem;">
            ${escapeHTML(deal.title)}
          </a>
          <span class="mono" style="font-weight: 700; color: ${isWon ? 'var(--color-primary)' : 'var(--color-text-primary)'};">
            $${deal.value.toLocaleString()}
          </span>
        </div>
        <div class="flex items-center justify-between" style="margin-top: 0.35rem; font-size: 0.78rem; color: var(--color-text-secondary);">
          <span><i class="bi ${isWon ? 'bi-check-circle-fill text-emerald' : 'bi-calendar'}"></i> ${isWon ? 'Delivered & Provisioned' : `Est. Close: ${deal.closeDate}`}</span>
          <span class="badge ${isWon ? 'badge-emerald' : 'badge-info'}">${escapeHTML(deal.stage)}</span>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

function renderContactTimeline(contact) {
  const container = document.getElementById('contact-timeline-container');
  if (!container || !window.CRMStorage) return;

  const activities = window.CRMStorage.getActivities();
  let html = '';

  activities.slice(0, 4).forEach(act => {
    html += `
      <div class="timeline-entry">
        <div class="timeline-entry-dot">
          <i class="bi ${act.type === 'meeting' ? 'bi-camera-video' : act.type === 'email' ? 'bi-envelope' : 'bi-check-circle'}"></i>
        </div>
        <div class="timeline-content-card">
          <div class="timeline-meta">
            <span class="timeline-title">${escapeHTML(act.title)}</span>
            <span class="timeline-timestamp">${escapeHTML(act.timeAgo)}</span>
          </div>
          <div class="timeline-text">${escapeHTML(act.subtitle || 'Interaction completed and recorded into CRM history.')}</div>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

function initContactNotesForm() {
  const form = document.getElementById('contact-quick-note-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const noteInput = document.getElementById('contact-note-textarea');
    const noteVal = noteInput.value.trim();

    if (!noteVal) {
      showToast('Empty Note', 'Please enter note content before saving.', 'error');
      return;
    }

    window.CRMStorage.logActivity({
      title: 'Internal Note Added',
      subtitle: `"${noteVal}"`,
      rep: 'Sarah J.',
      type: 'meeting'
    });

    noteInput.value = '';
    showToast('Note Saved', 'Your internal note was logged to the activity timeline.', 'success');
    renderContactTimeline();
  });
}

function initContactTabNavigation() {
  const tabs = document.querySelectorAll('.contact-pill-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      showToast('View Filtered', `Displaying ${tab.textContent.trim()} section.`, 'info');
    });
  });
}

window.renderContactsList = renderContactsList;
window.changeContactsPage = changeContactsPage;
window.resetContactsFilters = resetContactsFilters;
window.openEditContactModal = openEditContactModal;
window.confirmDeleteContact = confirmDeleteContact;
