/**
 * ClientFlow CRM - Sales Pipeline & Deals Controller
 * Handles visual Kanban board, drag & drop stage migration, deal creation,
 * quick advancement, search filtering, and deal details dossier.
 */

const PIPELINE_STAGES = [
  'New Lead',
  'Contacted',
  'Qualified',
  'Proposal Sent',
  'Won',
  'Lost'
];

let draggedDealId = null;
let currentPipelineSearch = '';

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('kanban-board-container')) {
    renderPipelineMetrics();
    renderKanbanBoard();
    initDealSearch();
    initAddDealModal();
    initStagePills();
  }

  if (document.getElementById('deal-details-view')) {
    renderDealDetailsPage();
    initDealStageProgression();
  }
});

function renderPipelineMetrics() {
  if (!window.CRMStorage) return;
  const deals = window.CRMStorage.getDeals();
  const activeDeals = deals.filter(d => d.stage !== 'Won' && d.stage !== 'Lost');
  const totalVal = deals.reduce((sum, d) => sum + (Number(d.value) || 0), 0);
  const weightedVal = Math.round(deals.reduce((sum, d) => sum + (d.value * (d.probability / 100)), 0));

  const totalEl = document.getElementById('pipeline-header-total');
  if (totalEl) totalEl.textContent = `$${totalVal.toLocaleString()}`;

  const countEl = document.getElementById('pipeline-active-count');
  if (countEl) countEl.textContent = `${activeDeals.length} active deals under management`;

  const weightedEl = document.getElementById('pipeline-weighted-val');
  if (weightedEl) weightedEl.textContent = `$${(weightedVal / 1000).toFixed(1)}k`;
  document.querySelectorAll('.pipeline-stage-pill').forEach(pill => {
    const stage = pill.getAttribute('data-stage');
    if (stage && stage !== 'all') pill.textContent = `${stage} (${deals.filter(d => d.stage === stage).length})`;
    if (stage === 'all') pill.textContent = 'All Stages';
  });
}

function renderKanbanBoard() {
  const board = document.getElementById('kanban-board-container');
  if (!board || !window.CRMStorage) return;

  const deals = window.CRMStorage.getDeals();
  let filteredDeals = deals;

  if (currentPipelineSearch) {
    filteredDeals = deals.filter(d =>
      d.title.toLowerCase().includes(currentPipelineSearch) ||
      d.company.toLowerCase().includes(currentPipelineSearch) ||
      (d.contactName && d.contactName.toLowerCase().includes(currentPipelineSearch)) ||
      (d.rep && d.rep.toLowerCase().includes(currentPipelineSearch))
    );
  }

  let html = '';

  PIPELINE_STAGES.forEach((stage, stageIdx) => {
    const stageDeals = filteredDeals.filter(d => d.stage === stage);
    const stageTotal = stageDeals.reduce((sum, d) => sum + (Number(d.value) || 0), 0);

    html += `
      <div class="kanban-lane" data-stage="${stage}" ondragover="handleDragOver(event)" ondragleave="handleDragLeave(event)" ondrop="handleDrop(event, '${stage}')">
        
        <!-- Lane Header -->
        <div class="lane-header">
          <div class="lane-title-group">
            <span class="lane-title">${stage}</span>
            <span class="lane-count">${stageDeals.length}</span>
          </div>
          <div class="lane-total mono">$${(stageTotal / 1000).toFixed(0)}k</div>
        </div>

        <!-- Cards Container -->
        <div class="kanban-cards-container" id="lane-cards-${stageIdx}">
    `;

    if (stageDeals.length === 0) {
      html += `
        <div style="border: 1.5px dashed var(--color-border); border-radius: var(--radius-md); padding: 1.5rem 0.75rem; text-align: center; color: var(--color-text-tertiary); font-size: 0.8125rem;">
          No deals in ${stage}
        </div>
      `;
    } else {
      stageDeals.forEach(deal => {
        const isWon = stage === 'Won';
        const isLost = stage === 'Lost';
        const probBadgeClass = isWon ? 'badge-emerald' : isLost ? 'badge-danger' : deal.probability >= 70 ? 'badge-emerald' : 'badge-info';

        html += `
          <div class="deal-card" id="card-${deal.id}" draggable="true" ondragstart="handleDragStart(event, '${deal.id}')" ondragend="handleDragEnd(event)">
            
            <div class="deal-card-header">
              <div>
                <a href="deal-details.html?id=${deal.id}" class="deal-title" style="text-decoration: none;">
                  ${escapeHTML(deal.title)}
                </a>
                <div class="deal-company">
                  <i class="bi bi-building text-muted"></i>
                  <span>${escapeHTML(deal.company)}</span>
                  ${deal.contactName ? `<span>• <i class="bi bi-person text-muted"></i> ${escapeHTML(deal.contactName)}</span>` : ''}
                </div>
              </div>
              <span class="badge ${probBadgeClass}" style="font-weight: 600; font-size: 0.72rem;">
                <i class="bi bi-activity"></i> ${deal.probability}%
              </span>
            </div>

            <div class="deal-card-body">
              <div>
                <div class="label-sm text-muted" style="margin-bottom: 2px;">Deal Value</div>
                <div class="deal-val-amount mono">$${deal.value.toLocaleString()}</div>
              </div>
              <div class="deal-close-date">
                <i class="bi bi-calendar3"></i> ${escapeHTML(deal.closeDate)}
              </div>
            </div>

            <div class="deal-card-footer">
              <div class="deal-assignee">
                <div class="avatar avatar-sm" style="width: 24px; height: 24px; font-size: 0.65rem; background: var(--color-charcoal); color: #FFF;">
                  ${escapeHTML(deal.repAvatar || 'SJ')}
                </div>
                <span>${escapeHTML(deal.rep || 'Sarah Jenkins')}</span>
              </div>

              <div class="deal-actions">
                <button class="btn btn-ghost btn-sm btn-icon" title="Notes & Comments" onclick="showToast('Deal Activity', 'Logged notes for ${escapeHTML(deal.title)}', 'info')">
                  <i class="bi bi-chat-left-text"></i>
                </button>
                <button class="btn btn-ghost btn-sm btn-icon" title="Edit Deal" onclick="openEditDealModal('${deal.id}')">
                  <i class="bi bi-pencil"></i>
                </button>
                ${!isWon && !isLost ? `
                  <button class="btn btn-primary btn-sm" style="padding: 2px 8px; font-size: 0.75rem;" onclick="advanceDealStage('${deal.id}')">
                    Advance <i class="bi bi-arrow-right"></i>
                  </button>
                ` : ''}
              </div>
            </div>

          </div>
        `;
      });
    }

    html += `
        </div>
      </div>
    `;
  });

  board.innerHTML = html;
}

// Drag & Drop Handlers
function handleDragStart(e, dealId) {
  draggedDealId = dealId;
  e.dataTransfer.effectAllowed = 'move';
  const card = document.getElementById(`card-${dealId}`);
  if (card) {
    setTimeout(() => card.classList.add('dragging'), 0);
  }
}

function handleDragEnd(e) {
  const cards = document.querySelectorAll('.deal-card.dragging');
  cards.forEach(c => c.classList.remove('dragging'));
  const lanes = document.querySelectorAll('.kanban-lane');
  lanes.forEach(l => l.classList.remove('drag-over'));
  draggedDealId = null;
}

function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  const lane = e.currentTarget;
  lane.classList.add('drag-over');
}

function handleDragLeave(e) {
  e.currentTarget.classList.remove('drag-over');
}

function handleDrop(e, targetStage) {
  e.preventDefault();
  e.currentTarget.classList.remove('drag-over');
  if (!draggedDealId || !window.CRMStorage) return;

  const deal = window.CRMStorage.getDealById(draggedDealId);
  if (deal && deal.stage !== targetStage) {
    window.CRMStorage.updateDealStage(draggedDealId, targetStage);
    showToast('Stage Updated', `"${deal.title}" moved to ${targetStage}.`, 'success');
    renderKanbanBoard();
    renderPipelineMetrics();
  }
}

function advanceDealStage(dealId) {
  if (!window.CRMStorage) return;
  const deal = window.CRMStorage.getDealById(dealId);
  if (!deal) return;

  const currentIdx = PIPELINE_STAGES.indexOf(deal.stage);
  if (currentIdx !== -1 && currentIdx < PIPELINE_STAGES.length - 2) { // up to Won
    const nextStage = PIPELINE_STAGES[currentIdx + 1];
    window.CRMStorage.updateDealStage(dealId, nextStage);
    showToast('Deal Advanced', `"${deal.title}" progressed to ${nextStage}!`, 'success');
    renderKanbanBoard();
    renderPipelineMetrics();
  }
}

function initDealSearch() {
  const searchInput = document.getElementById('pipeline-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentPipelineSearch = e.target.value.trim().toLowerCase();
      renderKanbanBoard();
    });
  }
}

function initStagePills() {
  const pills = document.querySelectorAll('.pipeline-stage-pill');
  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => p.classList.remove('active', 'active-emerald'));
      pill.classList.add('active-emerald');
      const stage = pill.getAttribute('data-stage');
      if (stage === 'all') {
        currentPipelineSearch = '';
      } else {
        currentPipelineSearch = stage.toLowerCase();
      }
      renderKanbanBoard();
    });
  });
}

function initAddDealModal() {
  const form = document.getElementById('pipeline-add-deal-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('new-deal-title').value.trim();
    const company = document.getElementById('new-deal-company').value.trim();
    const contactName = document.getElementById('new-deal-contact').value.trim();
    const value = parseFloat(document.getElementById('new-deal-value').value) || 0;
    const stage = document.getElementById('new-deal-stage').value;
    const closeDate = document.getElementById('new-deal-closedate').value || '2024-12-15';
    const rep = document.getElementById('new-deal-rep').value || 'Sarah Jenkins';

    if (!title || !company || value <= 0) {
      showToast('Validation Error', 'Please complete title, company, and valid deal amount.', 'error');
      return;
    }

    const probability = stage === 'Won' ? 100 : stage === 'Proposal Sent' ? 75 : stage === 'Qualified' ? 60 : 35;

    window.CRMStorage.saveDeal({
      title,
      company,
      contactName,
      value,
      stage,
      probability,
      closeDate,
      rep,
      notes: 'New pipeline opportunity'
    });

    closeModal('pipeline-add-deal-modal');
    form.reset();
    showToast('Deal Added', `"${title}" ($${value.toLocaleString()}) created.`, 'success');
    renderKanbanBoard();
    renderPipelineMetrics();
  });
}

function openEditDealModal(dealId) {
  const deal = window.CRMStorage.getDealById(dealId);
  if (!deal) return;

  let editModal = document.getElementById('pipeline-edit-deal-modal');
  if (!editModal) {
    editModal = document.createElement('div');
    editModal.id = 'pipeline-edit-deal-modal';
    editModal.className = 'modal-backdrop';
    editModal.innerHTML = `
      <div class="modal-dialog">
        <div class="modal-header">
          <div class="modal-title">Edit Opportunity Details</div>
          <button type="button" class="btn btn-ghost btn-sm btn-icon" onclick="closeModal('pipeline-edit-deal-modal')"><i class="bi bi-x-lg"></i></button>
        </div>
        <form id="pipeline-edit-deal-form">
          <input type="hidden" id="edit-deal-id">
          <div class="modal-body">
            <div class="form-group">
              <label class="form-label">Deal Title <span class="required">*</span></label>
              <input type="text" id="edit-deal-title" class="form-control" required>
            </div>
            <div class="form-group">
              <label class="form-label">Account / Company <span class="required">*</span></label>
              <input type="text" id="edit-deal-company" class="form-control" required>
            </div>
            <div class="grid" style="grid-template-columns: 1fr 1fr; gap: 1rem;">
              <div class="form-group">
                <label class="form-label">Deal Value ($) <span class="required">*</span></label>
                <input type="number" id="edit-deal-val" class="form-control" required>
              </div>
              <div class="form-group">
                <label class="form-label">Pipeline Stage</label>
                <select id="edit-deal-stage" class="form-control">
                  <option value="New Lead">New Lead</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Qualified">Qualified</option>
                  <option value="Proposal Sent">Proposal Sent</option>
                  <option value="Won">Won</option>
                  <option value="Lost">Lost</option>
                </select>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-destructive btn-sm" onclick="confirmDeleteDeal()" style="margin-right: auto;">Delete</button>
            <button type="button" class="btn btn-secondary" onclick="closeModal('pipeline-edit-deal-modal')">Cancel</button>
            <button type="submit" class="btn btn-primary">Save Changes</button>
          </div>
        </form>
      </div>
    `;
    document.body.appendChild(editModal);

    const editForm = document.getElementById('pipeline-edit-deal-form');
    editForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = document.getElementById('edit-deal-id').value;
      const title = document.getElementById('edit-deal-title').value.trim();
      const company = document.getElementById('edit-deal-company').value.trim();
      const val = parseFloat(document.getElementById('edit-deal-val').value) || 0;
      const stage = document.getElementById('edit-deal-stage').value;

      window.CRMStorage.saveDeal({
        id,
        title,
        company,
        value: val,
        stage
      });

      closeModal('pipeline-edit-deal-modal');
      showToast('Deal Updated', `"${title}" has been updated.`, 'success');
      renderKanbanBoard();
      renderPipelineMetrics();
      if (document.getElementById('deal-details-view')) renderDealDetailsPage();
    });
  }

  document.getElementById('edit-deal-id').value = deal.id;
  document.getElementById('edit-deal-title').value = deal.title;
  document.getElementById('edit-deal-company').value = deal.company;
  document.getElementById('edit-deal-val').value = deal.value;
  document.getElementById('edit-deal-stage').value = deal.stage;

  openModal('pipeline-edit-deal-modal');
}

function confirmDeleteDeal() {
  const dealId = document.getElementById('edit-deal-id').value;
  closeModal('pipeline-edit-deal-modal');
  showConfirm(
    'Delete Opportunity',
    'Are you sure you want to remove this deal from the sales pipeline? This action cannot be undone.',
    () => {
      window.CRMStorage.deleteDeal(dealId);
      showToast('Deal Deleted', 'Deal opportunity removed.', 'warning');
      renderKanbanBoard();
      renderPipelineMetrics();
    },
    'Delete Deal',
    true
  );
}

/**
 * Deal Details Dossier Page
 */
function renderDealDetailsPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const dealId = urlParams.get('id') || 'deal-1';
  const deal = window.CRMStorage.getDealById(dealId);

  if (!deal) {
    document.getElementById('deal-details-view').innerHTML = `
      <div class="card" style="padding: 3rem; text-align: center;">
        <h2 class="headline-md">Deal Record Not Found</h2>
        <a href="deals.html" class="btn btn-primary" style="margin-top: 1rem;">Back to Pipeline</a>
      </div>
    `;
    return;
  }

  const titleEl = document.getElementById('deal-details-title');
  if (titleEl) titleEl.textContent = deal.title;

  const compEl = document.getElementById('deal-details-company');
  if (compEl) compEl.textContent = `${deal.company} • ${deal.contactName || 'Executive Lead'}`;

  const valEl = document.getElementById('deal-details-val');
  if (valEl) valEl.textContent = `$${deal.value.toLocaleString()}`;

  const probEl = document.getElementById('deal-details-prob');
  if (probEl) probEl.textContent = `${deal.probability}% Win Probability`;

  const dateEl = document.getElementById('deal-details-closedate');
  if (dateEl) dateEl.textContent = deal.closeDate;

  const repEl = document.getElementById('deal-details-rep');
  if (repEl) repEl.textContent = deal.rep || 'Sarah Jenkins';

  let activityEl = document.getElementById('deal-live-activity');
  if (!activityEl) { activityEl = document.createElement('div'); activityEl.id = 'deal-live-activity'; activityEl.className = 'card'; activityEl.style.marginTop = '1rem'; document.getElementById('deal-details-view').appendChild(activityEl); }
  const activities = window.CRMStorage.getActivities().filter(a => a.dealId === deal.id).slice(0, 8);
  activityEl.innerHTML = `<div class="card-header"><div class="card-title">Live Deal Activity</div><span class="badge badge-emerald">${activities.length} events</span></div><div class="card-body">${activities.map(a => `<div class="timeline-entry"><div class="timeline-entry-dot"></div><div class="timeline-content-card"><div class="timeline-meta"><span class="timeline-title">${escapeHTML(a.title || a.message)}</span><span class="timeline-timestamp">${escapeHTML(a.timeAgo || '')}</span></div><div class="timeline-text">${escapeHTML(a.message || '')}</div></div></div>`).join('') || '<div class="body-sm text-muted">No activity recorded for this deal.</div>'}</div>`;

  // Highlight active stage step in progression bar
  const steps = document.querySelectorAll('.deal-stage-step');
  steps.forEach(step => {
    const stage = step.getAttribute('data-stage');
    if (stage === deal.stage) {
      step.classList.add('active');
    } else {
      step.classList.remove('active');
    }
  });
}

function initDealStageProgression() {
  const steps = document.querySelectorAll('.deal-stage-step');
  steps.forEach(step => {
    step.addEventListener('click', () => {
      const urlParams = new URLSearchParams(window.location.search);
      const dealId = urlParams.get('id') || 'deal-1';
      const targetStage = step.getAttribute('data-stage');
      window.CRMStorage.updateDealStage(dealId, targetStage);
      showToast('Stage Progressed', `Opportunity shifted to "${targetStage}".`, 'success');
      renderDealDetailsPage();
    });
  });
}

window.handleDragStart = handleDragStart;
window.handleDragEnd = handleDragEnd;
window.handleDragOver = handleDragOver;
window.handleDragLeave = handleDragLeave;
window.handleDrop = handleDrop;
window.advanceDealStage = advanceDealStage;
window.openEditDealModal = openEditDealModal;
window.confirmDeleteDeal = confirmDeleteDeal;
