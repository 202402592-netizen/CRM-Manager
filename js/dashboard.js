/**
 * ClientFlow CRM - Dashboard Controller
 * Handles metrics calculation, interactive revenue charts, task checkoffs,
 * deal creation, activity logging, and period filtering.
 */

document.addEventListener('DOMContentLoaded', () => {
  renderDashboardMetrics();
  initRevenueChart();
  renderActivities();
  renderDashboardTasks();
  initQuickModals();
  initPeriodFilters();
});

function renderDashboardMetrics() {
  if (!window.CRMStorage) return;
  const metrics = window.CRMStorage.dashboard();

  const contactsEl = document.getElementById('metric-contacts-val');
  if (contactsEl) contactsEl.textContent = Number(metrics.contacts || 0).toLocaleString();

  const activeDealsEl = document.getElementById('metric-active-deals-val');
  if (activeDealsEl) activeDealsEl.textContent = metrics.activeDeals || 0;

  const dealsValueEl = document.getElementById('metric-deals-value-sub');
  if (dealsValueEl) {
    const valInK = (Number(metrics.pipelineValue || 0) / 1000).toFixed(1);
    dealsValueEl.textContent = `$${valInK}k`;
  }

  const revenueValEl = document.getElementById('metric-revenue-val');
  if (revenueValEl) {
    const revTotal = Number(metrics.wonRevenue || 0) / 1000;
    revenueValEl.textContent = `$${revTotal.toFixed(1)}k`;
  }

  const pendingTasksEl = document.getElementById('metric-pending-tasks-val');
  if (pendingTasksEl) pendingTasksEl.textContent = metrics.pendingTasks || 0;

  const urgentTasksEl = document.getElementById('metric-urgent-tasks-badge');
  if (urgentTasksEl) urgentTasksEl.textContent = `${metrics.overdueTasks || 0} Overdue`;
}

function initRevenueChart() {
  const canvas = document.getElementById('revenueChartCanvas');
  if (!canvas) return;

  const deals = window.CRMStorage.getDeals();
  const monthly = {};
  deals.filter(d => d.stage === 'Won').forEach(d => { const key = new Date(d.closeDate || d.updatedAt || Date.now()).toLocaleString([], { month: 'short' }); monthly[key] = (monthly[key] || 0) + Number(d.value || 0) / 1000; });
  const labels = Object.keys(monthly);
  const values = Object.values(monthly);
  if (!labels.length) return;

  // Check if Chart.js is loaded from CDN
  if (typeof Chart !== 'undefined') {
    const ctx = canvas.getContext('2d');

    const gradient = ctx.createLinearGradient(0, 0, 0, 220);
    gradient.addColorStop(0, 'rgba(5, 150, 105, 0.28)');
    gradient.addColorStop(1, 'rgba(5, 150, 105, 0.01)');

    new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Closed Deal Volume',
          data: values,
          borderColor: '#059669',
          borderWidth: 3,
          backgroundColor: gradient,
          fill: true,
          tension: 0.35,
          pointBackgroundColor: '#FFFFFF',
          pointBorderColor: '#059669',
          pointBorderWidth: 2.5,
          pointRadius: 5,
          pointHoverRadius: 7
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1F2937',
            titleColor: '#FFFFFF',
            bodyColor: '#D1FAE5',
            padding: 10,
            displayColors: false,
            callbacks: {
              label: (context) => `Closed: $${context.raw}k`
            }
          }
        },
        scales: {
          y: {
            display: false,
            min: 80,
            max: 200
          },
          x: {
            grid: { display: false },
            ticks: {
              color: '#6B7280',
              font: { family: 'Inter', size: 12 }
            }
          }
        }
      }
    });
  } else {
    canvas.parentElement.innerHTML = '<div class="body-sm text-muted" style="padding: 2rem; text-align: center;">Chart.js is unavailable. Live dashboard metrics are still loaded from the API.</div>';
  }
}

function renderSvgChartFallback(canvas) {
  const parent = canvas.parentElement;
  parent.innerHTML = `
    <svg viewBox="0 0 500 180" style="width: 100%; height: 180px;">
      <defs>
        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#059669" stop-opacity="0.25"/>
          <stop offset="100%" stop-color="#059669" stop-opacity="0.0"/>
        </linearGradient>
      </defs>
      <path d="M 30,140 Q 150,115 220,95 T 380,55 T 470,30 L 470,170 L 30,170 Z" fill="url(#chartGrad)" />
      <path d="M 30,140 Q 150,115 220,95 T 380,55 T 470,30" fill="none" stroke="#059669" stroke-width="3" stroke-linecap="round"/>
      <circle cx="30" cy="140" r="4" fill="#FFFFFF" stroke="#059669" stroke-width="2"/>
      <circle cx="170" cy="108" r="4" fill="#FFFFFF" stroke="#059669" stroke-width="2"/>
      <circle cx="320" cy="72" r="4" fill="#FFFFFF" stroke="#059669" stroke-width="2"/>
      <circle cx="470" cy="30" r="5" fill="#FFFFFF" stroke="#059669" stroke-width="3"/>
      <text x="30" y="175" fill="#6B7280" font-size="11" text-anchor="middle">Jul ($110k)</text>
      <text x="170" y="175" fill="#6B7280" font-size="11" text-anchor="middle">Aug ($128k)</text>
      <text x="320" y="175" fill="#6B7280" font-size="11" text-anchor="middle">Sep ($155k)</text>
      <text x="460" y="175" fill="#059669" font-weight="600" font-size="11" text-anchor="middle">Oct ($184k)</text>
    </svg>
  `;
}

function renderActivities() {
  const container = document.getElementById('recent-activity-container');
  if (!container || !window.CRMStorage) return;

  const activities = window.CRMStorage.getActivities().slice(0, 4);
  let html = '';

  activities.forEach(act => {
    let iconClass = 'badge-emerald';
    let icon = 'bi-activity';
    let rightBadge = '';

    if (act.type === 'contract') {
      iconClass = 'badge-emerald';
      icon = 'bi-send';
      rightBadge = `<span style="font-size: 0.8125rem; font-weight: 700; color: var(--color-primary);">${act.amount || '$45,000'}</span>`;
    } else if (act.type === 'call') {
      iconClass = 'badge-info';
      icon = 'bi-telephone';
      rightBadge = `<span class="badge badge-info">${act.company || 'Meridian'}</span>`;
    } else if (act.type === 'deal_won') {
      iconClass = 'badge-emerald';
      icon = 'bi-trophy';
      rightBadge = `<span class="badge badge-emerald" style="font-weight: 700;">WON</span>`;
    } else if (act.type === 'email') {
      iconClass = 'badge-info';
      icon = 'bi-envelope';
    }

    html += `
      <div class="activity-item">
        <div class="activity-icon-bubble ${iconClass}">
          <i class="bi ${icon}"></i>
        </div>
        <div class="activity-body">
          <div class="activity-title">
            <span>${escapeHTML(act.title)}</span>
            ${rightBadge}
          </div>
          <div class="activity-subtitle">
            ${act.rep ? `by ${escapeHTML(act.rep)} • ` : ''}${escapeHTML(act.subtitle || '')} <span class="text-muted" style="margin-left: 4px;">• ${escapeHTML(act.timeAgo)}</span>
          </div>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

function renderDashboardTasks() {
  const container = document.getElementById('dashboard-tasks-container');
  if (!container || !window.CRMStorage) return;

  const tasks = window.CRMStorage.getTasks().slice(0, 4);
  let html = '';

  tasks.forEach(task => {
    const isChecked = task.status === 'completed';
    const badgeType = task.priority === 'Urgent' ? 'danger' : task.priority === 'Internal' ? 'info' : 'emerald';

    html += `
      <div class="checklist-item ${isChecked ? 'completed' : ''}" id="task-row-${task.id}">
        <div class="checklist-left">
          <label class="form-check" style="margin-bottom: 0;">
            <input type="checkbox" ${isChecked ? 'checked' : ''} onchange="toggleDashboardTask('${task.id}')">
          </label>
          <div>
            <div class="checklist-title">${escapeHTML(task.title)}</div>
            <div class="checklist-due">${escapeHTML(task.dueTime)}</div>
          </div>
        </div>
        <span class="badge badge-${badgeType}">${escapeHTML(task.priority)}</span>
      </div>
    `;
  });

  container.innerHTML = html;
}

function toggleDashboardTask(taskId) {
  if (!window.CRMStorage) return;
  const updated = window.CRMStorage.toggleTask(taskId);
  if (updated) {
    const row = document.getElementById(`task-row-${taskId}`);
    if (row) {
      if (updated.status === 'completed') {
        row.classList.add('completed');
        showToast('Task Completed', `"${updated.title}" marked completed.`, 'success');
      } else {
        row.classList.remove('completed');
        showToast('Task Reopened', `"${updated.title}" pending follow-up.`, 'info');
      }
    }
    renderDashboardMetrics();
  }
}

function initQuickModals() {
  // Quick Add Deal form
  const addDealForm = document.getElementById('quick-add-deal-form');
  if (addDealForm) {
    addDealForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('deal-title-input').value.trim();
      const company = document.getElementById('deal-company-input').value.trim();
      const val = parseFloat(document.getElementById('deal-value-input').value) || 0;
      const stage = document.getElementById('deal-stage-select').value;

      if (!title || !company || val <= 0) {
        showToast('Validation Error', 'Please fill in all required deal fields.', 'error');
        return;
      }

      window.CRMStorage.saveDeal({
        title,
        company,
        value: val,
        stage,
        probability: stage === 'Proposal Sent' ? 75 : stage === 'Won' ? 100 : 50,
        closeDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        rep: 'Sarah Jenkins',
        notes: 'Created via Quick Add modal'
      });

      window.CRMStorage.logActivity({
        title: `New Deal Added: ${title}`,
        amount: `$${val.toLocaleString()}`,
        rep: 'Sarah Jenkins',
        type: 'deal_add'
      });

      closeModal('quick-add-deal-modal');
      addDealForm.reset();
      showToast('Deal Created', `"${title}" successfully added to pipeline.`, 'success');
      renderDashboardMetrics();
      renderActivities();
    });
  }

  // Quick Log Activity form
  const logActivityForm = document.getElementById('quick-log-activity-form');
  if (logActivityForm) {
    logActivityForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('act-title-input').value.trim();
      const type = document.getElementById('act-type-select').value;
      const notes = document.getElementById('act-notes-input').value.trim();

      if (!title) {
        showToast('Required Field', 'Please provide an activity description.', 'error');
        return;
      }

      window.CRMStorage.logActivity({
        title,
        subtitle: notes || 'Logged by Sarah Jenkins',
        rep: 'Sarah J.',
        type
      });

      closeModal('quick-log-activity-modal');
      logActivityForm.reset();
      showToast('Activity Logged', 'Activity added to recent interactions timeline.', 'success');
      renderActivities();
    });
  }
}

function initPeriodFilters() {
  const pills = document.querySelectorAll('.period-filter-pill');
  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => p.classList.remove('active', 'active-emerald'));
      pill.classList.add('active-emerald');
      showToast('Date Range Updated', `Dashboard filtered for ${pill.textContent.trim()}.`, 'info');
    });
  });

  const refreshBtn = document.getElementById('dashboard-refresh-btn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      refreshBtn.querySelector('i').style.transform = 'rotate(360deg)';
      refreshBtn.querySelector('i').style.transition = 'transform 0.5s ease';
      setTimeout(() => {
        refreshBtn.querySelector('i').style.transform = 'none';
        refreshBtn.querySelector('i').style.transition = 'none';
        renderDashboardMetrics();
        renderActivities();
        renderDashboardTasks();
        showToast('Dashboard Refreshed', 'Real-time pipeline metrics updated.', 'success');
      }, 500);
    });
  }
}

window.toggleDashboardTask = toggleDashboardTask;
