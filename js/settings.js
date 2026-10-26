/**
 * ClientFlow CRM - Settings & Profile Controller
 * Handles user profile editing, change password form, organization settings,
 * demo data reset, and JSON data export.
 */

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('profile-form')) {
    initProfilePage();
  }

  if (document.getElementById('settings-form')) {
    initSettingsPage();
  }
});

function initProfilePage() {
  const profileForm = document.getElementById('profile-form');
  const passwordForm = document.getElementById('change-password-form');
  const session = window.CRMStorage.getSession();

  // Populate initial values
  if (session) {
    const nameInput = document.getElementById('profile-name');
    const emailInput = document.getElementById('profile-email');
    if (nameInput && session.name) nameInput.value = session.name;
    if (emailInput && session.email) emailInput.value = session.email;
  }

  if (profileForm) {
    profileForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('profile-name').value.trim();
      const email = document.getElementById('profile-email').value.trim();
      const title = document.getElementById('profile-title').value.trim();

      if (!name || !email) {
        showToast('Required Fields', 'Full name and email cannot be empty.', 'error');
        return;
      }

      window.CRMStorage.saveSession({
        ...session,
        name,
        email,
        role: title || session.role,
        avatar: name.split(' ').map(n=>n[0]).join('').substring(0, 2).toUpperCase()
      });

      showToast('Profile Updated', 'Your profile details have been successfully saved.', 'success');
      setTimeout(() => window.location.reload(), 600);
    });
  }

  if (passwordForm) {
    passwordForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const currentPass = document.getElementById('curr-password').value;
      const newPass = document.getElementById('new-password').value;
      const confirmPass = document.getElementById('confirm-password').value;

      if (!currentPass) {
        showToast('Security Error', 'Please enter your current password.', 'error');
        return;
      }
      if (newPass.length < 8) {
        showToast('Security Error', 'New password must be at least 8 characters long.', 'error');
        return;
      }
      if (newPass !== confirmPass) {
        showToast('Mismatch', 'New passwords do not match.', 'error');
        return;
      }

      passwordForm.reset();
      showToast('Password Changed', 'Your account credentials have been updated.', 'success');
    });
  }
}

function initSettingsPage() {
  const settingsForm = document.getElementById('settings-form');
  const resetBtn = document.getElementById('reset-demo-data-btn');
  const exportBtn = document.getElementById('export-data-json-btn');
  const currentSettings = window.CRMStorage.getSettings();

  // Populate existing
  if (currentSettings) {
    const compInput = document.getElementById('settings-company-name');
    if (compInput && currentSettings.companyName) compInput.value = currentSettings.companyName;

    const curSelect = document.getElementById('settings-currency');
    if (curSelect && currentSettings.currency) curSelect.value = currentSettings.currency;

    const tzSelect = document.getElementById('settings-timezone');
    if (tzSelect && currentSettings.timezone) tzSelect.value = currentSettings.timezone;
  }

  if (settingsForm) {
    settingsForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const companyName = document.getElementById('settings-company-name').value.trim();
      const currency = document.getElementById('settings-currency').value;
      const timezone = document.getElementById('settings-timezone').value;

      window.CRMStorage.saveSettings({
        companyName,
        currency,
        timezone
      });

      showToast('Workspace Saved', 'Organization configuration applied.', 'success');
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      showConfirm(
        'Reset Demonstration Data',
        'This will reset contacts, deals, tasks, and activities back to the initial sample data state. Any test records you created will be refreshed.',
        () => {
          window.CRMStorage.resetDemoData();
          showToast('Data Reset', 'Demo sample data reloaded.', 'success');
          setTimeout(() => window.location.href = 'dashboard.html', 800);
        },
        'Reset Demo Data',
        true
      );
    });
  }

  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      const dump = {
        contacts: window.CRMStorage.getContacts(),
        deals: window.CRMStorage.getDeals(),
        tasks: window.CRMStorage.getTasks(),
        team: window.CRMStorage.getTeam(),
        exportedAt: new Date().toISOString()
      };

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dump, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `clientflow_crm_backup_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      showToast('Export Complete', 'ClientFlow CRM JSON database backup downloaded.', 'success');
    });
  }
}
