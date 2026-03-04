/**
 * Nexus Global Authentication System
 * Handles Login/Signup/Logout, Profile Dropdown, and Session Management.
 * Renders consistent UI across all pages.
 */

const Auth = {
    // Default state
    state: {
        isLoggedIn: false,
        data: null,
        role: 'guest'
    },

    init() {
        console.log('[Auth] Initializing...');
        this.loadState();
        this.protectRoutes();

        // Listen for the custom event dispatched by layout.js
        document.addEventListener('header:loaded', () => {
            console.log('[Auth] Header loaded, attaching listeners...');
            this.setupProfileToggle();
            this.updateMenuContent();
        });

        // Fallback: If header is already in DOM (static or raced)
        if (document.getElementById('profile-toggle')) {
            this.setupProfileToggle();
            this.updateMenuContent();
        }
    },

    // --- STATE MANAGEMENT ---
    loadState() {
        const saved = localStorage.getItem('nexus_auth_state');
        if (saved) {
            try {
                this.state = JSON.parse(saved);
            } catch (e) {
                console.error('[Auth] Failed to parse auth state', e);
                localStorage.removeItem('nexus_auth_state');
            }
        }
    },

    saveState() {
        localStorage.setItem('nexus_auth_state', JSON.stringify(this.state));
        this.updateMenuContent(); // Refresh UI immediately
    },

    updateUserData(updates) {
        if (!this.state.isLoggedIn || !this.state.data) return;
        this.state.data = { ...this.state.data, ...updates };
        this.saveState();

        // Dispatch custom event for other components to listen to
        document.dispatchEvent(new CustomEvent('auth:updated', { detail: this.state.data }));
    },

    // --- ROUTE PROTECTION ---
    protectRoutes() {
        const path = window.location.pathname;
        const isAdminDashboard = path.includes('admin-dashboard.html');
        const isUserDashboard = path.includes('user-dashboard.html') || path.includes('profile.html');
        const isAuthPage = path.includes('login.html') || path.includes('signup.html');
        const prefix = this.getPrefix();

        if (this.state.isLoggedIn) {
            // If logged in as user trying to access admin dashboard
            if (isAdminDashboard && this.state.role !== 'admin') {
                window.location.href = prefix + 'auth/admin/admin-login.html';
            }
            // If logged in as admin trying to access user dashboard
            if (isUserDashboard && this.state.role === 'admin') {
                window.location.href = prefix + 'auth/admin/admin-dashboard.html';
            }
            // If on auth pages, redirect to appropriate dashboard
            if (isAuthPage) {
                window.location.href = this.getDashboardPath();
            }
        } else {
            // If logged out, protect dashboards
            if (isAdminDashboard) {
                window.location.href = prefix + 'auth/admin/admin-login.html';
            }
            if (isUserDashboard) {
                window.location.href = prefix + 'auth/user/user-login.html';
            }
        }
    },

    // --- TOGGLE & INTERACTION ---
    setupProfileToggle() {
        const toggle = document.getElementById('profile-toggle');
        const menu = document.getElementById('profile-menu');

        if (!toggle || !menu) return;

        // ALWAYS toggle the dropdown — never hard-redirect
        toggle.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            const isOpen = menu.classList.contains('active');
            if (isOpen) {
                this.closeMenu();
            } else {
                this.openMenu();
            }
        };

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (menu.classList.contains('active')) {
                if (!menu.contains(e.target) && !toggle.contains(e.target)) {
                    this.closeMenu();
                }
            }
        });

        // Close on Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeMenu();
        });
    },

    openMenu() {
        const menu = document.getElementById('profile-menu');
        if (menu) menu.classList.add('active');
    },

    closeMenu() {
        const menu = document.getElementById('profile-menu');
        if (menu) menu.classList.remove('active');
    },

    // --- DYNAMIC CONTENT ---
    updateMenuContent() {
        const menu = document.getElementById('profile-menu');
        if (!menu) return;

        const prefix = this.getPrefix();
        const { isLoggedIn, data } = this.state;

        if (isLoggedIn && data) {
            menu.innerHTML = `
                <div class="dropdown-header-user" style="padding: 1rem; background: rgba(255,255,255,0.03); border-bottom: 1px solid rgba(255,255,255,0.05); margin-bottom: 0.5rem; display: flex; align-items: center; justify-content: space-between;">
                    <div>
                        <div style="font-weight: 700; color: #fff; font-size: 0.9rem;">${data.name}</div>
                        <div style="font-size: 0.7rem; color: #94a3b8; font-weight: 500;">Authorized User</div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px; background: rgba(16, 185, 129, 0.1); padding: 4px 10px; border-radius: 20px; border: 1px solid rgba(16, 185, 129, 0.2);">
                        <span style="width: 8px; height: 8px; background: #10b981; border-radius: 50%; display: inline-block; box-shadow: 0 0 10px #10b981;"></span>
                        <span style="font-size: 0.7rem; color: #10b981; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">Active</span>
                    </div>
                </div>
                <div style="padding: 0.25rem;">
                    <a href="${this.getDashboardPath()}" class="dropdown-link">
                        <i data-lucide="layout-dashboard" style="width: 16px;"></i> Dashboard
                    </a>
                    <a href="${prefix}auth/user/profile.html" class="dropdown-link">
                        <i data-lucide="user" style="width: 16px;"></i> Profile
                    </a>
                    <div class="dropdown-divider"></div>
                    <a href="#" onclick="Auth.logout(); return false;" class="dropdown-link" style="color: #ef4444;">
                        <i data-lucide="log-out" style="width: 16px;"></i> Sign Out
                    </a>
                </div>
            `;
        } else {
            // ── LOGGED OUT: Show Log In / Sign Up ──
            menu.innerHTML = `
                <div style="padding: 1rem 1rem 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.05);">
                    <div style="font-size: 0.7rem; color: #475569; font-weight: 600; text-transform: uppercase; letter-spacing: 0.07em; margin-bottom: 0;">Your Account</div>
                </div>
                <div style="padding: 0.5rem;">
                    <a href="${prefix}login.html" class="dropdown-link primary" style="display:flex;align-items:center;gap:10px;font-weight:700;justify-content:center;background:linear-gradient(135deg,rgba(99,102,241,0.15),rgba(139,92,246,0.1));border:1px solid rgba(99,102,241,0.25);border-radius:10px;padding:0.75rem 1rem;margin-bottom:0.5rem;color:#a5b4fc;text-decoration:none;transition:all 0.2s;">
                        <i data-lucide="log-in" style="width:16px;"></i> Log In
                    </a>
                    <a href="${prefix}signup.html" class="dropdown-link" style="display:flex;align-items:center;gap:10px;font-weight:600;justify-content:center;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:0.75rem 1rem;color:#94a3b8;text-decoration:none;transition:all 0.2s;">
                        <i data-lucide="user-plus" style="width:16px;"></i> Sign Up Free
                    </a>
                </div>
            `;
        }

        if (window.lucide) lucide.createIcons();
    },

    // --- AUTH ACTIONS ---
    login(email, role = 'user') {
        const user = {
            id: role === 'admin' ? 'admin_1' : 'u_' + Math.floor(Math.random() * 10000),
            email: email,
            name: role === 'admin' ? 'Administrator' : email.split('@')[0],
            avatar: null,
            plan: role === 'admin' ? 'Master' : 'Pro',
            bio: ''
        };
        this.state = { isLoggedIn: true, data: user, role: role };
        this.saveState();

        const prefix = this.getPrefix();
        window.location.href = this.getDashboardPath();
    },

    logout() {
        const wasAdmin = this.state.role === 'admin';
        // Clear state
        this.state = { isLoggedIn: false, data: null, role: 'guest' };
        this.saveState();
        this.closeMenu();

        const prefix = this.getPrefix();
        if (wasAdmin) {
            window.location.href = prefix + 'auth/admin/admin-login.html';
        } else if (window.location.pathname.includes('dashboard') || window.location.pathname.includes('profile')) {
            window.location.href = prefix + 'auth/user/user-login.html';
        } else {
            window.location.href = prefix + 'login.html';
        }
    },

    // --- UTILITIES ---
    getPrefix() {
        const path = window.location.pathname;
        if (path.includes('/public/pages/services/') || path.includes('/public/pages/blog/') || path.includes('/public/pages/case-studies/')) {
            return '../../../';
        }
        if (path.includes('/auth/user/') || path.includes('/auth/admin/')) {
            return '../../';
        }
        if (path.includes('/public/pages/')) {
            return '../../';
        }
        if (path.includes('/marketing/') || path.includes('/blog/') || path.includes('/auth/') || path.includes('/dashboard/')) {
            return '../';
        }
        return '';
    },

    getDashboardPath() {
        const prefix = this.getPrefix();
        // Check role
        if (this.state.role === 'admin') {
            return prefix + 'auth/admin/admin-dashboard.html';
        } else {
            return prefix + 'auth/user/user-dashboard.html';
        }
    }
};

// Initialize immediately
Auth.init();

