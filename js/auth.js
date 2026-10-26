/**
 * ClientFlow CRM - API authentication client
 * Handles client-side login validation, password visibility toggle,
 * demo credentials filler, SSO simulation, and forgot-password flows.
 *
 * Credentials are sent only to the NestJS API; hashing and authority remain server-side.
 */

document.addEventListener('DOMContentLoaded', () => {
  initLoginForm();
  initForgotPasswordForm();
  initPasswordToggles();
});

function initLoginForm() {
  const loginForm = document.getElementById('login-form');
  if (!loginForm) return;

  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const rememberCheckbox = document.getElementById('remember-me');
  const demoFillBtn = document.getElementById('fill-demo-btn');
  const ssoBtn = document.getElementById('sso-login-btn');

  // Load saved email if 'remember me' was used previously
  const savedEmail = localStorage.getItem('cf_crm_remembered_email');
  if (savedEmail && emailInput) {
    emailInput.value = savedEmail;
    if (rememberCheckbox) rememberCheckbox.checked = true;
  }

  // Quick Demo credentials button
  if (demoFillBtn) {
    demoFillBtn.addEventListener('click', () => {
      if (emailInput) emailInput.value = 'sarah.jenkins@acmecorp.com';
      if (passwordInput) passwordInput.value = 'ClientFlow2024!';
      if (typeof showToast === 'function') {
        showToast('Demo Credentials Filled', 'Ready to sign in as Sarah Jenkins (AE).', 'info');
      }
    });
  }

  // SSO demonstration
  if (ssoBtn) {
    ssoBtn.addEventListener('click', () => {
      if (typeof showToast === 'function') {
        showToast('SSO Redirect Simulation', 'SAML 2.0 / Okta authentication handler would initiate in Phase 2.', 'info');
      }
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 1200);
    });
  }

  // Form Submission
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    let isValid = true;
    const emailVal = emailInput.value.trim();
    const passVal = passwordInput.value.trim();

    // Clear previous errors
    clearFormErrors(loginForm);

    if (!emailVal || !emailVal.includes('@') || !emailVal.includes('.')) {
      setFieldError(emailInput, 'Please enter a valid work email address');
      isValid = false;
    }

    if (!passVal) {
      setFieldError(passwordInput, 'Password is required');
      isValid = false;
    } else if (passVal.length < 6) {
      setFieldError(passwordInput, 'Password must be at least 6 characters');
      isValid = false;
    }

    if (!isValid) return;

    // Save remembered email if checked
    if (rememberCheckbox && rememberCheckbox.checked) {
      localStorage.setItem('cf_crm_remembered_email', emailVal);
    } else {
      localStorage.removeItem('cf_crm_remembered_email');
    }

    const submitBtn = loginForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Authenticating...`;

    try {
      await window.CRMStorage.login(emailVal, passVal);
      if (typeof showToast === 'function') showToast('Signed In', 'Welcome back to ClientFlow CRM!', 'success');
      setTimeout(() => { window.location.href = 'dashboard.html'; }, 600);
    } catch (error) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
      setFieldError(passwordInput, error.message || 'Unable to sign in');
    }
  });
}

function initForgotPasswordForm() {
  const forgotForm = document.getElementById('forgot-password-form');
  if (!forgotForm) return;

  const emailInput = document.getElementById('reset-email');
  const alertContainer = document.getElementById('reset-alert');

  forgotForm.addEventListener('submit', (e) => {
    e.preventDefault();
    clearFormErrors(forgotForm);

    const email = emailInput.value.trim();
    if (!email || !email.includes('@')) {
      setFieldError(emailInput, 'Please provide a valid account email.');
      return;
    }

    const submitBtn = forgotForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Sending reset link...';

    setTimeout(() => {
      forgotForm.style.display = 'none';
      if (alertContainer) {
        alertContainer.style.display = 'block';
        alertContainer.innerHTML = `
          <div class="card" style="padding: 1.5rem; text-align: center; border-color: var(--color-primary-soft);">
            <div style="width: 48px; height: 48px; border-radius: 50%; background: var(--color-primary-soft); color: var(--color-primary); display: inline-flex; align-items: center; justify-content: center; margin: 0 auto 1rem auto; font-size: 1.5rem;">
              <i class="bi bi-check-lg"></i>
            </div>
            <h3 class="headline-sm">Reset Link Sent</h3>
            <p class="body-sm" style="margin: 0.5rem 0 1.25rem 0;">
              If an enterprise workspace account exists for <strong>${escapeHTML(email)}</strong>, password reset instructions have been delivered.
            </p>
            <a href="login.html" class="btn btn-primary w-full">Return to Sign In</a>
          </div>
        `;
      }
    }, 800);
  });
}

function initPasswordToggles() {
  const toggleButtons = document.querySelectorAll('.toggle-password-btn');
  toggleButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target') || 'password';
      const input = document.getElementById(targetId);
      if (!input) return;

      const isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';
      btn.innerHTML = isPassword ? '<i class="bi bi-eye-slash"></i>' : '<i class="bi bi-eye"></i>';
    });
  });
}

function setFieldError(inputElement, errorMsg) {
  inputElement.classList.add('is-invalid');
  const parent = inputElement.closest('.form-group') || inputElement.parentElement;
  let feedback = parent.querySelector('.form-feedback.error');
  if (!feedback) {
    feedback = document.createElement('div');
    feedback.className = 'form-feedback error';
    parent.appendChild(feedback);
  }
  feedback.textContent = errorMsg;
}

function clearFormErrors(formElement) {
  const invalids = formElement.querySelectorAll('.is-invalid');
  invalids.forEach(el => el.classList.remove('is-invalid'));
  const feedbacks = formElement.querySelectorAll('.form-feedback.error');
  feedbacks.forEach(el => el.remove());
}
