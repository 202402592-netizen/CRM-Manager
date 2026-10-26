/**
 * ClientFlow CRM - Tasks & Follow-ups Controller
 * Implements Active Workstream, Overdue Attention, Today's Schedule,
 * quick task creation, and instant checkoff feedback matching Screenshot 1.
 */

let currentTaskFilter = 'all';

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('tasks-view-container')) {
    renderTasksScreen();
    initQuickAddBar();
    initTaskFilters();
  }
  if (document.getElementById('calendar-grid-container')) renderCalendar();
});

function renderCalendar() {
  const container = document.getElementById('calendar-grid-container');
  const tasks = window.CRMStorage.getTasks();
  const grouped = {};
  tasks.forEach(task => { const key = new Date(task.dueDate).toISOString().slice(0, 10); (grouped[key] ||= []).push(task); });
  const dates = Object.keys(grouped).sort();
  container.innerHTML = `<div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem;">${dates.map(date => `<div class="card"><div class="card-header"><div class="card-title">${new Date(date).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}</div><span class="badge badge-info">${grouped[date].length}</span></div><div class="card-body">${grouped[date].map(task => `<div class="checklist-item"><div class="checklist-left"><i class="bi bi-${task.status === 'completed' ? 'check-circle text-emerald' : 'calendar-event'}"></i><div><div class="checklist-title">${escapeHTML(task.title)}</div><div class="checklist-due">${escapeHTML(task.assignee)} · ${escapeHTML(task.priority)}</div></div></div></div>`).join('')}</div></div>`).join('')}</div>`;
}

function renderTasksScreen() {
  if (!window.CRMStorage) return;
  const tasks = window.CRMStorage.getTasks();

  // Metrics
  const pendingCount = tasks.filter(t => t.status === 'pending').length;
  const overdueCount = tasks.filter(t => t.isOverdue && t.status === 'pending').length;
  const todayCount = tasks.filter(t => !t.isOverdue && t.status === 'pending').length;

  const pendingEl = document.getElementById('metric-tasks-pending');
  if (pendingEl) pendingEl.textContent = pendingCount;

  const overdueEl = document.getElementById('metric-tasks-overdue');
  if (overdueEl) overdueEl.textContent = overdueCount;

  const todayEl = document.getElementById('metric-tasks-today');
  if (todayEl) todayEl.textContent = todayCount;

  // Render Overdue Section
  const overdueContainer = document.getElementById('overdue-tasks-list');
  if (overdueContainer) {
    const overdueTasks = tasks.filter(t => t.isOverdue);
    let oHtml = '';

    overdueTasks.forEach(task => {
      const isDone = task.status === 'completed';
      oHtml += `
        <div class="card card-urgent-accent" style="margin-bottom: 0.85rem; border-radius: var(--radius-lg); ${isDone ? 'opacity: 0.55;' : ''}" id="task-card-${task.id}">
          <div class="card-body" style="padding: 1rem 1.25rem;">
            <div class="flex items-start gap-md">
              <label class="form-check" style="margin-top: 2px;">
                <input type="checkbox" ${isDone ? 'checked' : ''} onchange="toggleTaskState('${task.id}')">
              </label>
              <div class="flex-1">
                <div class="flex items-center justify-between flex-wrap gap-xs">
                  <div style="font-size: 0.95rem; font-weight: 700; color: var(--color-text-primary); ${isDone ? 'text-decoration: line-through;' : ''}">
                    ${escapeHTML(task.title)}
                  </div>
                  <span class="badge badge-danger">High Priority</span>
                </div>
                
                <div class="body-sm" style="color: var(--color-text-secondary); margin: 3px 0;">
                  <i class="bi bi-building text-muted"></i> <strong>${escapeHTML(task.account || '')}</strong> • ${escapeHTML(task.stakeholder || '')}
                </div>

                <div class="flex items-center justify-between flex-wrap gap-sm" style="margin-top: 0.5rem;">
                  <div class="flex items-center gap-xs body-sm" style="color: var(--color-error); font-weight: 600;">
                    <i class="bi bi-clock"></i> ${escapeHTML(task.dueTime)}
                  </div>
                  <div class="flex items-center gap-xs body-sm">
                    <div class="avatar avatar-sm" style="width: 22px; height: 22px; font-size: 0.65rem; background: var(--color-charcoal); color: #FFF;">SJ</div>
                    <span>${escapeHTML(task.assignee || 'Unassigned')}</span>
                  </div>
                </div>

                <!-- Action Buttons Row matching Screenshot 1 -->
                <div class="flex items-center gap-xs flex-wrap" style="margin-top: 0.75rem; pt: 0.5rem; border-top: 1px solid var(--color-border);">
                  <button class="btn btn-secondary btn-sm" onclick="showToast('Calling Contact', 'VoIP Bridge connected to ${escapeHTML(task.stakeholder)}...', 'info')">
                    <i class="bi bi-telephone"></i> Call
                  </button>
                  <button class="btn btn-secondary btn-sm" onclick="showToast('Reschedule', 'Rescheduling task to tomorrow 10:00 AM', 'info')">
                    <i class="bi bi-arrow-repeat"></i> Reschedule
                  </button>
                  <button class="btn btn-soft-primary btn-sm" onclick="toggleTaskState('${task.id}')">
                    <i class="bi bi-check-lg"></i> ${isDone ? 'Reopen' : 'Complete'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    });

    overdueContainer.innerHTML = oHtml;
  }

  // Render Today's Schedule Section
  const todayContainer = document.getElementById('today-tasks-list');
  if (todayContainer) {
    const todayTasks = tasks.filter(t => !t.isOverdue);
    let tHtml = '';

    todayTasks.forEach(task => {
      const isDone = task.status === 'completed';
      const badgeType = task.priority === 'High' ? 'danger' : task.priority === 'Medium' ? 'info' : 'emerald';

      let tagsHtml = '';
      if (task.tags && task.tags.length > 0) {
        tagsHtml = task.tags.map(t => `<span class="badge badge-neutral" style="font-size: 0.65rem; margin-right: 4px;">${escapeHTML(t)}</span>`).join('');
      }

      tHtml += `
        <div class="card" style="margin-bottom: 0.75rem; border-radius: var(--radius-lg); ${isDone ? 'opacity: 0.6;' : ''}" id="task-card-${task.id}">
          <div class="card-body" style="padding: 1rem 1.25rem;">
            <div class="flex items-start gap-md">
              <label class="form-check" style="margin-top: 2px;">
                <input type="checkbox" ${isDone ? 'checked' : ''} onchange="toggleTaskState('${task.id}')">
              </label>
              
              <div class="flex-1">
                <div class="flex items-center justify-between flex-wrap gap-xs">
                  <div style="font-size: 0.9375rem; font-weight: 600; color: var(--color-text-primary); ${isDone ? 'text-decoration: line-through;' : ''}">
                    ${escapeHTML(task.title)}
                  </div>
                  ${isDone ? `
                    <span class="badge badge-emerald"><i class="bi bi-check2"></i> ${escapeHTML(task.completedTime || '10:15 AM')}</span>
                  ` : `
                    <span class="badge badge-${badgeType}">${escapeHTML(task.priority)}</span>
                  `}
                </div>

                <div class="body-sm" style="color: var(--color-text-secondary); margin: 3px 0;">
                  <i class="bi bi-building text-muted"></i> <strong>${escapeHTML(task.account || '')}</strong> ${task.stakeholder ? `• ${escapeHTML(task.stakeholder)}` : ''}
                </div>

                ${tagsHtml ? `<div style="margin: 4px 0;">${tagsHtml}</div>` : ''}
                ${task.subtitle ? `<div class="body-sm text-emerald" style="font-size: 0.75rem; margin-top: 2px;"><i class="bi bi-arrow-repeat"></i> ${escapeHTML(task.subtitle)}</div>` : ''}

                <div class="flex items-center justify-between flex-wrap gap-sm" style="margin-top: 0.4rem;">
                  <div class="flex items-center gap-xs body-sm" style="color: var(--color-text-secondary); font-size: 0.78rem;">
                    <i class="bi bi-clock"></i> ${escapeHTML(task.dueTime)}
                  </div>
                  <div class="flex items-center gap-xs body-sm" style="font-size: 0.78rem;">
                    <div class="avatar avatar-sm" style="width: 22px; height: 22px; font-size: 0.65rem; background: var(--color-charcoal); color: #FFF;">
                      ${task.assignee ? task.assignee.substring(0, 2) : 'SJ'}
                    </div>
                    <span>${escapeHTML(task.assignee || 'Unassigned')}</span>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      `;
    });

    todayContainer.innerHTML = tHtml;
  }
}

function toggleTaskState(taskId) {
  if (!window.CRMStorage) return;
  const task = window.CRMStorage.toggleTask(taskId);
  if (task) {
    if (task.status === 'completed') {
      showToast('Task Completed', `"${task.title}" has been marked complete.`, 'success');
    } else {
      showToast('Task Reopened', `"${task.title}" marked pending.`, 'info');
    }
    renderTasksScreen();
  }
}

function initQuickAddBar() {
  const input = document.getElementById('quick-add-task-input');
  const btn = document.getElementById('quick-add-task-btn');

  const handleAdd = () => {
    if (!input) return;
    const text = input.value.trim();
    if (!text) {
      showToast('Required', 'Please enter a task title.', 'error');
      return;
    }

    window.CRMStorage.saveTask({
      title: text,
      dueDate: new Date().toISOString(),
      priority: 'Medium',
      status: 'pending',
    });

    input.value = '';
    showToast('Task Added', `"${text}" scheduled for today.`, 'success');
    renderTasksScreen();
  };

  if (btn) btn.addEventListener('click', handleAdd);
  if (input) {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleAdd();
    });
  }
}

function initTaskFilters() {
  const chips = document.querySelectorAll('.task-segment-chip');
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active', 'active-emerald'));
      chip.classList.add('active');
      currentTaskFilter = chip.getAttribute('data-filter');
      showToast('Filtered', `Displaying ${chip.textContent.trim()} tasks`, 'info');
    });
  });
}

window.toggleTaskState = toggleTaskState;
