/**
 * ClientFlow CRM - Navigation Controller
 * Handles active route detection, mobile drawer, bottom app bar
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initMobileDrawer();
  renderSessionUser();
  updateLiveNavBadges();
});

function updateLiveNavBadges() {
  if (!window.CRMStorage) return;
  const dashboard = window.CRMStorage.dashboard();
  document.querySelectorAll('a[href="contacts.html"] .nav-item-badge').forEach(el => el.textContent = Number(dashboard.contacts || 0).toLocaleString());
  document.querySelectorAll('a[href="tasks.html"] .nav-item-badge').forEach(el => el.textContent = Number(dashboard.pendingTasks || 0));
}

function initNavigation() {
  const currentPath = window.location.pathname;
  const pageName = currentPath.split('/').pop() || 'index.html';

  // Highlight Sidebar items
  const sidebarLinks = document.querySelectorAll('.sidebar-nav-item');
  sidebarLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href && (href === pageName || (pageName === '' && href === 'dashboard.html'))) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // Highlight Bottom Mobile nav items
  const mobileLinks = document.querySelectorAll('.mobile-nav-item');
  mobileLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href && href === pageName) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

function initMobileDrawer() {
  const toggleBtn = document.querySelector('.mobile-menu-btn');
  const sidebar = document.querySelector('.app-sidebar');

  // Create backdrop if not existing
  let backdrop = document.querySelector('.sidebar-backdrop');
  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.className = 'sidebar-backdrop';
    document.body.appendChild(backdrop);
  }

  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      sidebar.classList.toggle('sidebar-open');
      backdrop.classList.toggle('active');
    });

    backdrop.addEventListener('click', () => {
      sidebar.classList.remove('sidebar-open');
      backdrop.classList.remove('active');
    });
  }
}

function renderSessionUser() {
  if (!window.CRMStorage) return;
  const session = window.CRMStorage.getSession();

  // Update header or sidebar user avatars and names if present
  const userNameElements = document.querySelectorAll('.sidebar-footer-name, .header-user-name');
  userNameElements.forEach(el => {
    if (session.name) el.textContent = session.name;
  });

  const userRoleElements = document.querySelectorAll('.sidebar-footer-role, .header-user-role');
  userRoleElements.forEach(el => {
    if (session.role) el.textContent = session.role;
  });

  const userAvatars = document.querySelectorAll('.user-avatar-initials');
  userAvatars.forEach(el => {
    if (session.avatar) el.textContent = session.avatar;
  });
}
