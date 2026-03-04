/**
 * Nexus Dashboard - Core Logic (Rebuild)
 * Stable Architecture: Single Source of Truth
 */

const Dashboard = {
    state: {
        currentUser: null,
        role: null, // 'admin' | 'user'
        currentView: null,
        isSidebarOpen: false
    },

    // ============================================
    // INITIALIZATION
    // ============================================
    init() {
        console.log('[Dashboard] Initializing Stable Architecture...');

        // 1. Auth Check
        if (typeof Auth === 'undefined' || !Auth.state.isLoggedIn) {
            console.warn('[Dashboard] Unauthorized, redirecting...');
            window.location.href = 'auth/login.html';
            return;
        }

        // 2. Load State
        this.state.currentUser = Auth.state.data;
        this.state.role = Auth.state.role || 'user';

        // 2. Load State
        this.state.currentUser = Auth.state.data;
        this.state.role = Auth.state.role || 'user';

        // 3. Render Initial Layout
        this.renderSidebar();
        this.renderTopBar();
        this.setupEventListeners();

        // 4. Load Default View
        const defaultView = this.state.role === 'admin' ? 'adminOverview' : 'userOverview';
        this.renderView(defaultView);

        // 5. Update User Info
        const userLabel = document.getElementById('user-display-name');
        if (userLabel) userLabel.textContent = this.state.currentUser.name || 'User';

        console.log(`[Dashboard] Ready. Role: ${this.state.role}`);
        lucide.createIcons();

        // 6. Init Profile Toggle (if Auth didn't catch it yet)
        if (typeof Auth !== 'undefined' && Auth.setupProfileToggle) {
            Auth.setupProfileToggle();
        }

        // 7. Listen for Auth Updates
        document.addEventListener('auth:updated', (e) => {
            console.log('[Dashboard] Auth state updated, refreshing...');
            this.state.currentUser = e.detail;
            this.refreshUI();
        });
    },

    setupEventListeners() {
        // We use event delegation for better SPA behavior
        document.addEventListener('click', (e) => {
            // Mobile Sidebar Toggle
            if (e.target.closest('#sidebar-toggle')) {
                this.toggleSidebar(!this.state.isSidebarOpen);
            }
            // Mobile Overlay Close
            if (e.target.closest('#sidebar-overlay')) {
                this.toggleSidebar(false);
            }
        });

        // Search Logic
        const searchInput = document.getElementById('dashboard-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        }
    },

    toggleSidebar(open) {
        this.state.isSidebarOpen = open;
        const sidebar = document.getElementById('sidebar-root');
        const overlay = document.getElementById('sidebar-overlay');

        if (sidebar) sidebar.classList.toggle('active', open);
        if (overlay) overlay.style.display = open ? 'block' : 'none';
    },

    handleSearch(query) {
        console.log(`[Dashboard] Searching: ${query}`);
        // For simplicity in this SPA, search is simulation but shows visual feedback
        const searchInput = document.getElementById('dashboard-search');
        if (searchInput && query.length > 0) {
            searchInput.parentElement.style.borderColor = 'var(--primary)';
        } else if (searchInput) {
            searchInput.parentElement.style.borderColor = 'rgba(255,255,255,0.1)';
        }
    },

    refreshUI() {
        // Update username labels, etc.
        const userLabel = document.getElementById('user-display-name');
        if (userLabel) userLabel.textContent = this.state.currentUser.name || 'User';
    },

    // ============================================
    // LAYOUT RENDERING
    // ============================================
    renderSidebar() {
        const sidebarRoot = document.getElementById('sidebar-root');
        if (!sidebarRoot) return;

        // Header
        let html = `
            <div class="sidebar-header">
                <a href="index.html" class="brand-link">
                    <div style="background: rgba(99, 102, 241, 0.2); padding: 6px; border-radius: 8px; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(99, 102, 241, 0.3);">
                        <i data-lucide="layers" style="width: 20px; height: 20px; color: #818cf8;"></i>
                    </div>
                    <span style="font-family: 'Outfit', sans-serif; font-weight: 700; font-size: 1.25rem; letter-spacing: -0.02em;">
                        Nexus<span style="color: #6366f1;">.</span>
                    </span>
                </a>
            </div>
            <nav class="sidebar-nav">
        `;

        // Dynamic Nav Items based on Role
        if (this.state.role === 'admin') {
            html += this.getNavItemHTML('adminOverview', 'layout-dashboard', 'Dashboard');
            html += this.getNavItemHTML('adminUsers', 'users', 'Users');
            html += this.getNavItemHTML('adminMessages', 'mail', 'Messages');
            html += this.getNavItemHTML('adminContent', 'file-text', 'Content');
            html += this.getNavItemHTML('adminActivity', 'activity', 'Activity');
        } else {
            html += this.getNavItemHTML('userOverview', 'layout-dashboard', 'Dashboard');
            html += this.getNavItemHTML('userProjects', 'box', 'Projects');
            html += this.getNavItemHTML('userMessages', 'message-square', 'Messages');
            html += this.getNavItemHTML('userNotifications', 'bell', 'Notifications');
        }

        // Footer
        html += `
            </nav>
            <div class="sidebar-footer">
                <button class="nav-item" onclick="Dashboard.openProfileModal()">
                    <i data-lucide="user"></i>
                    Profile
                </button>
                <button class="nav-item text-error" onclick="Auth.logout()">
                    <i data-lucide="log-out"></i>
                    Logout
                </button>
            </div>
        `;

        sidebarRoot.innerHTML = html;
    },

    renderTopBar() {
        const topBarRoot = document.querySelector('.top-bar');
        if (!topBarRoot) return;

        const breadcrumbs = this.getBreadcrumbsHTML();
        const user = this.state.currentUser;

        topBarRoot.innerHTML = `
            <button id="sidebar-toggle" class="mobile-only action-btn" style="flex-direction: column; align-items: center; justify-content: center; gap: 4px;">
                <span style="display: block; width: 18px; height: 2px; background-color: currentColor; border-radius: 2px;"></span>
                <span style="display: block; width: 18px; height: 2px; background-color: currentColor; border-radius: 2px;"></span>
                <span style="display: block; width: 18px; height: 2px; background-color: currentColor; border-radius: 2px;"></span>
            </button>
            <div class="dashboard-breadcrumb">
                ${breadcrumbs}
            </div>
            <div class="top-bar-right">
                <div class="search-bar desktop-only" style="position: relative; margin-right: 1.5rem;">
                    <i data-lucide="search" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); width: 16px; color: #94a3b8;"></i>
                    <input type="text" id="dashboard-search" placeholder="Search..." style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 0.5rem 1rem 0.5rem 2.5rem; color: #fff; font-size: 0.9rem; width: 240px;">
                </div>
                
                <div class="user-profile-widget" id="profile-toggle" style="cursor: pointer;">
                    <span id="user-display-name" class="user-label">${user.name || user.email}</span>
                    <div class="avatar-circle">
                        <div style="width: 100%; height: 100%; background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 700; color: #fff;">
                            ${user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                    </div>
                </div>
                <div class="dropdown-menu" id="profile-menu"></div>
            </div>
        `;

        // Re-setup profile toggle listener after injection
        if (typeof Auth !== 'undefined' && Auth.setupProfileToggle) {
            Auth.setupProfileToggle();
        }
        lucide.createIcons();
    },

    getBreadcrumbsHTML() {
        const viewParts = this.state.currentView ? this.state.currentView.split('(?=[A-Z])') : ['Dashboard'];
        // Simplify: just map view IDs to labels
        const labels = {
            'userOverview': 'Overview',
            'userProjects': 'Projects',
            'userMessages': 'Messages',
            'adminOverview': 'Admin / Overview',
            'adminUsers': 'Admin / Users',
            'adminMessages': 'Admin / Messages',
            'adminContent': 'Admin / Content',
            'adminActivity': 'Admin / Activity'
        };

        const label = labels[this.state.currentView] || 'Dashboard';
        return `<h1 style="font-size: 1.25rem; background: linear-gradient(to right, #fff, #94a3b8); background-clip: text; -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 700;">${label}</h1>`;
    },

    getNavItemHTML(viewId, icon, label) {
        return `
            <button class="nav-item" data-view="${viewId}" onclick="Dashboard.renderView('${viewId}')">
                <i data-lucide="${icon}"></i>
                ${label}
            </button>
        `;
    },

    // ============================================
    // VIEW ROUTING
    // ============================================
    renderView(viewId) {
        console.log(`[Dashboard] Navigating to: ${viewId}`);
        const contentRoot = document.getElementById('content-area');
        if (!contentRoot) return;

        this.state.currentView = viewId;

        // Update Nav Active State
        document.querySelectorAll('.nav-item').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === viewId);
        });

        // Update Top Bar (Breadcrumbs, etc)
        this.renderTopBar();

        // Close Sidebar on Mobile
        this.toggleSidebar(false);

        // Render Specific Content
        contentRoot.innerHTML = ''; // Clear current

        switch (viewId) {
            // --- USER VIEWS ---
            case 'userOverview': this.renderUserOverview(contentRoot); break;
            case 'userProjects': this.renderUserProjects(contentRoot); break;
            case 'userNotifications': this.renderUserNotifications(contentRoot); break;
            case 'userMessages': this.renderUserMessages(contentRoot); break;

            // --- ADMIN VIEWS ---
            case 'adminOverview': this.renderAdminOverview(contentRoot); break;
            case 'adminUsers': this.renderAdminUsers(contentRoot); break;
            case 'adminMessages': this.renderAdminMessages(contentRoot); break;
            case 'adminContent': this.renderAdminContent(contentRoot); break;
            case 'adminActivity': this.renderAdminActivity(contentRoot); break;

            default: contentRoot.innerHTML = `<h2>Page Not Found</h2>`;
        }

        // Append Dashboard Footer
        contentRoot.insertAdjacentHTML('beforeend', `
            <footer style="margin-top: 4rem; border-top: 1px solid rgba(255,255,255,0.05); padding: 2rem 0 1rem; text-align: center; color: var(--text-muted); font-size: 0.85rem;">
                <p>&copy; 2026 MrCodersHub. All rights reserved.</p>
                <div style="margin-top: 0.5rem; display: flex; gap: 1rem; justify-content: center; opacity: 0.7;">
                    <a href="#" style="color: inherit; text-decoration: none; transition: opacity 0.2s;" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.7">Privacy</a>
                    <span>•</span>
                    <a href="#" style="color: inherit; text-decoration: none; transition: opacity 0.2s;" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.7">Terms</a>
                    <span>•</span>
                    <a href="#" style="color: inherit; text-decoration: none; transition: opacity 0.2s;" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.7">Status</a>
                </div>
            </footer>
        `);

        lucide.createIcons();
    },

    // ============================================
    // SECTION RENDERS (USER)
    // ============================================
    renderUserOverview(container) {
        const stats = DataService.getUserStats(this.state.currentUser.email);
        container.innerHTML = `
            <div class="section-header">
                <div>
                    <h2 class="section-title">Dashboard Overview</h2>
                    <p class="text-muted" style="margin-top: 0.5rem">Welcome back, ${this.state.currentUser.name}</p>
                </div>
                <button class="btn-primary" onclick="Dashboard.createProject()">
                    <i data-lucide="plus"></i> New Project
                </button>
            </div>
            
            <!-- System Status Widget -->
            <div class="glass-card" style="margin-bottom: 2rem; display: flex; align-items: center; justify-content: space-between; border-left: 4px solid #22c55e;">
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <div style="position: relative; width: 40px; height: 40px; background: rgba(34, 197, 94, 0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                        <i data-lucide="activity" style="color: #22c55e;"></i>
                        <span style="position: absolute; top: 0; right: 0; width: 10px; height: 10px; background: #22c55e; border-radius: 50%; border: 2px solid #0f172a; box-shadow: 0 0 10px #22c55e;"></span>
                    </div>
                    <div>
                        <h4 style="margin: 0; font-size: 1rem;">All Systems Operational</h4>
                        <p style="margin: 0; font-size: 0.85rem; color: var(--text-muted);">Platform status is healthy.</p>
                    </div>
                </div>
                <div class="text-sm font-medium" style="color: #22c55e;">Online</div>
            </div>

            <div class="stats-grid">
                ${this.getStatCard('Total Projects', stats.totalProjects, 'box', 'primary')}
                ${this.getStatCard('Active', stats.activeProjects, 'activity', 'success')}
                ${this.getStatCard('Deployments', stats.totalDeployments, 'rocket', 'warning')}
                ${this.getStatCard('Notifications', stats.unreadNotifications, 'bell', 'error')}
            </div>

            <div class="grid-2-col" style="display: grid; grid-template-columns: 2fr 1fr; gap: 2rem;">
                <!-- Recent Projects -->
                <div class="glass-card">
                    <div class="section-header" style="margin-bottom: 1.5rem">
                         <h3>Recent Projects</h3>
                         <a href="#" onclick="Dashboard.renderView('userProjects')" style="color: var(--primary); font-size: 0.9rem;">View All</a>
                    </div>
                    ${this.getUserProjectsTableHTML(3)}
                </div>

                <!-- Recent Activity -->
                <div class="glass-card">
                    <div class="section-header" style="margin-bottom: 1.5rem">
                        <h3>Recent Activity</h3>
                    </div>
                    <div class="activity-feed">
                        ${this.getUserActivityHTML(5)}
                    </div>
                </div>
            </div>
        `;
    },

    renderUserProjects(container) {
        container.innerHTML = `
            <div class="section-header">
                <h2 class="section-title">My Projects</h2>
                <button class="btn-primary" onclick="Dashboard.createProject()">
                    <i data-lucide="plus"></i> New Project
                </button>
            </div>
            <div class="glass-card">
                ${this.getUserProjectsTableHTML()}
            </div>
        `;
    },

    getUserProjectsTableHTML(limit = null) {
        let projects = DataService.getProjects(this.state.currentUser.email);
        if (limit) projects = projects.slice(0, limit);

        if (projects.length === 0) return `
            <div class="empty-state text-center" style="padding: 3rem 1rem;">
                <div style="background: rgba(255,255,255,0.05); width: 64px; height: 64px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem;">
                    <i data-lucide="box" style="width: 32px; height: 32px; color: var(--text-muted);"></i>
                </div>
                <h4 style="margin-bottom: 0.5rem;">No projects yet</h4>
                <p class="text-muted" style="margin-bottom: 1.5rem;">Create your first project to get started.</p>
                <button class="btn-primary" onclick="Dashboard.createProject()">Create Project</button>
            </div>
        `;

        let rows = projects.map(p => `
            <tr>
                <td>
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                        <div style="width: 32px; height: 32px; background: rgba(99,102,241,0.1); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: var(--primary);">
                            <i data-lucide="box" style="width: 16px;"></i>
                        </div>
                        <div>
                            <div style="font-weight: 500;">${p.name}</div>
                            <div class="text-sm text-muted" style="font-size: 0.8rem;">${p.description.substring(0, 30)}${p.description.length > 30 ? '...' : ''}</div>
                        </div>
                    </div>
                </td>
                <td><span class="status-pill status-${p.status.toLowerCase()}">${p.status}</span></td>
                <td style="font-size: 0.9rem; color: var(--text-muted);">${new Date(p.updated).toLocaleDateString()}</td>
                <td>
                    <div class="flex gap-2">
                        <button class="action-btn" title="Edit" onclick="Dashboard.editProject(${p.id})"><i data-lucide="edit-2" width="16"></i></button>
                        <button class="action-btn" title="Delete" onclick="Dashboard.deleteProject(${p.id}, '${p.name}')"><i data-lucide="trash" width="16"></i></button>
                    </div>
                </td>
            </tr>
        `).join('');

        return `
            <div class="table-wrapper">
                <table class="data-table">
                    <thead><tr><th>Project</th><th>Status</th><th>Updated</th><th>Actions</th></tr></thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        `;
    },

    getUserActivityHTML(limit = 5) {
        // Mock activity derivation from notifications/logs since we didn't firmly spec user activity in DataService for everything
        // We'll use notifications as a proxy for "Activity" or filter global logs by user
        let logs = DataService.getActivityLog(20).filter(l => l.userId === this.state.currentUser.email).slice(0, limit);

        if (logs.length === 0) return `
            <div class="text-muted text-center py-4" style="font-size: 0.9rem;">No recent activity</div>
        `;

        return logs.map(l => `
            <div style="display: flex; gap: 1rem; padding: 1rem 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
                <div style="margin-top: 0.25rem; color: var(--primary);">
                    <i data-lucide="activity" style="width: 16px;"></i>
                </div>
                <div>
                    <div style="font-size: 0.9rem;">${l.details}</div>
                    <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.25rem;">${new Date(l.timestamp).toLocaleString()}</div>
                </div>
            </div>
        `).join('');
    },

    renderUserNotifications(container) {
        const notifs = DataService.getNotifications(this.state.currentUser.email);
        container.innerHTML = `
             <div class="section-header">
                <h2 class="section-title">Notifications</h2>
            </div>
            <div class="flex flex-col gap-4">
                ${notifs.length ? notifs.map(n => `
                    <div class="glass-card flex justify-between items-center">
                        <div>
                            <div>${n.message}</div>
                            <div class="text-sm text-muted">${new Date(n.timestamp).toLocaleString()}</div>
                        </div>
                        <button class="action-btn" onclick="Dashboard.deleteNotification(${n.id})"><i data-lucide="x"></i></button>
                    </div>
                `).join('') : '<div class="glass-card">No notifications</div>'}
            </div>
        `;
    },

    renderUserMessages(container) {
        const msgs = DataService.getMessages().filter(m => m.recipient === this.state.currentUser.email);
        container.innerHTML = `
             <div class="section-header"><h2 class="section-title">My Messages</h2></div>
             <div class="flex flex-col gap-4">
                ${msgs.length ? msgs.map(m => `
                    <div class="glass-card">
                        <div class="flex justify-between"><h3>${m.subject}</h3><span class="text-sm text-muted">${new Date(m.timestamp).toLocaleString()}</span></div>
                        <p class="text-sm">From: ${m.sender}</p>
                        <p class="mt-2 text-muted">${m.message}</p>
                        <div class="mt-4 flex gap-2">
                             <button class="btn-primary text-sm" onclick="ModalSystem.alert('Message marked as read!', 'info')">Mark Read</button>
                             <button class="btn-secondary text-sm" onclick="Dashboard.deleteMessage(${m.id})">Delete</button>
                        </div>
                    </div>
                `).join('') : '<div class="glass-card">No messages</div>'}
             </div>
        `;
    },

    // ============================================
    // PROFILE MODAL
    // ============================================
    // ============================================
    // PROFILE MODAL
    // ============================================
    openProfileModal() {
        const user = this.state.currentUser;
        if (!user) return;

        const content = `
             <div style="display: flex; flex-direction: column; align-items: center; margin-bottom: 2.5rem;">
                 <div style="position: relative; margin-bottom: 1.5rem;">
                     <div style="width: 96px; height: 96px; background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2.5rem; color: #fff; font-weight: 700; box-shadow: 0 10px 25px -5px rgba(99, 102, 241, 0.4);">
                        ${user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div style="position: absolute; bottom: 0; right: 0; background: #22c55e; width: 24px; height: 24px; border-radius: 50%; border: 4px solid #0f172a;" title="Online"></div>
                </div>
                
                <h3 style="margin: 0; color: #fff; font-size: 1.5rem; font-weight: 700; letter-spacing: -0.025em;">${user.name}</h3>
                <p style="color: #94a3b8; font-size: 0.95rem; margin-top: 0.25rem;">${user.email}</p>
                
                <div style="margin-top: 1rem; display: flex; gap: 0.75rem;">
                    <span style="background: rgba(99, 102, 241, 0.1); color: #818cf8; padding: 0.35rem 1rem; border-radius: 100px; font-size: 0.8rem; font-weight: 600; border: 1px solid rgba(99, 102, 241, 0.2); letter-spacing: 0.025em;">
                        ${(user.plan || 'Free').toUpperCase()} PLAN
                    </span>
                    <span style="background: rgba(255, 255, 255, 0.05); color: #cbd5e1; padding: 0.35rem 1rem; border-radius: 100px; font-size: 0.8rem; font-weight: 500; border: 1px solid rgba(255, 255, 255, 0.1);">
                        MEMBER
                    </span>
                </div>
            </div>

            <div style="display: grid; gap: 1.5rem;">
                <div class="form-group">
                    <label class="form-label" style="display: block; margin-bottom: 0.5rem; color: #94a3b8; font-size: 0.85rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Display Name</label>
                    <div style="position: relative;">
                        <input type="text" id="modal-profile-name" class="form-input" value="${user.name}" placeholder="e.g. Jane Doe" 
                            style="width: 100%; background: #0f172a; border: 1px solid #334155; padding: 0.875rem 1rem; border-radius: 8px; color: white; transition: all 0.2s; font-size: 0.95rem;">
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label" style="display: block; margin-bottom: 0.5rem; color: #94a3b8; font-size: 0.85rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Professional Bio</label>
                    <textarea id="modal-profile-bio" class="form-textarea" placeholder="Briefly describe your role and expertise..." 
                        style="width: 100%; background: #0f172a; border: 1px solid #334155; padding: 0.875rem 1rem; border-radius: 8px; color: white; transition: all 0.2s; font-size: 0.95rem; line-height: 1.6;" rows="4">${user.bio || ''}</textarea>
                    <p style="color: #64748b; font-size: 0.8rem; margin-top: 0.5rem; text-align: right;">Max 160 characters</p>
                </div>
            </div>
        `;

        const buttons = `
            <button class="btn-primary" onclick="Dashboard.saveProfileModal()" style="width: 100%; justify-content: center; padding: 0.875rem; font-weight: 600; letter-spacing: 0.025em;">
                Update Profile
            </button>
        `;

        if (window.ModalSystem) {
            ModalSystem.renderModal('Account Details', content, buttons);
        }
    },

    saveProfileModal() {
        const name = document.getElementById('modal-profile-name').value;
        const bio = document.getElementById('modal-profile-bio').value;

        if (!name) {
            if (window.ModalSystem) ModalSystem.alert('Name is required', 'error');
            return;
        }

        const updates = { name, bio };
        DataService.updateUser(this.state.currentUser.email, updates);
        Auth.updateUserData(updates);

        if (window.ModalSystem) {
            ModalSystem.alert('Profile updated successfully!', 'success');
            ModalSystem.close();
        }

        // Refresh UI to show new name immediately
        this.refreshUI();
    },

    // ============================================
    // SECTION RENDERS (ADMIN)
    // ============================================
    renderAdminOverview(container) {
        const stats = DataService.getAdminStats();
        container.innerHTML = `
            <div class="section-header"><h2 class="section-title">System Overview</h2></div>
            
            <!-- System Status Widget -->
            <div class="glass-card" style="margin-bottom: 2rem; display: flex; align-items: center; justify-content: space-between; border-left: 4px solid #22c55e;">
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <div style="position: relative; width: 40px; height: 40px; background: rgba(34, 197, 94, 0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                        <i data-lucide="server" style="color: #22c55e;"></i>
                        <span style="position: absolute; top: 0; right: 0; width: 10px; height: 10px; background: #22c55e; border-radius: 50%; border: 2px solid #0f172a; box-shadow: 0 0 10px #22c55e;"></span>
                    </div>
                    <div>
                        <h4 style="margin: 0; font-size: 1rem;">System Operational</h4>
                        <p style="margin: 0; font-size: 0.85rem; color: var(--text-muted);">Uptime: 99.99% | Latency: 24ms</p>
                    </div>
                </div>
                <div class="text-sm font-medium" style="color: #22c55e;">Stable</div>
            </div>

            <div class="stats-grid">
                ${this.getStatCard('Users', stats.totalUsers, 'users', 'primary')}
                ${this.getStatCard('Messages', stats.unreadMessages, 'mail', 'warning')}
                ${this.getStatCard('Projects', stats.totalProjects, 'box', 'success')}
                ${this.getStatCard('Posts', stats.totalBlogPosts, 'file-text', 'info')}
            </div>
            <div class="glass-card">
                <h3>Recent Activity Log</h3>
                <div style="margin-top: 1rem;">
                     ${this.getAdminActivityHTML(10)}
                </div>
            </div>
        `;
    },

    renderAdminUsers(container) {
        const users = DataService.getUsers();
        const rows = users.map(u => `
            <tr>
                <td><strong>${u.name}</strong><br>${u.email}</td>
                <td>${u.role}</td>
                <td>${u.status}</td>
                <td>
                    <button class="action-btn" onclick="Dashboard.deleteUser('${u.email}', '${u.name}')"><i data-lucide="trash" width="16"></i></button>
                </td>
            </tr>
        `).join('');

        container.innerHTML = `
            <div class="section-header"><h2 class="section-title">User Management</h2></div>
            <div class="glass-card table-wrapper">
                <table class="data-table">
                     <thead><tr><th>User</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
                     <tbody>${rows}</tbody>
                </table>
            </div>
        `;
    },

    renderAdminMessages(container) {
        const msgs = DataService.getMessages().filter(m => m.recipient === 'admin@nexus.com');
        container.innerHTML = `
             <div class="section-header"><h2 class="section-title">Admin Inbox</h2></div>
             <div class="flex flex-col gap-4">
                ${msgs.length ? msgs.map(m => `
                    <div class="glass-card" style="border-left: 4px solid ${m.status === 'unread' ? 'var(--primary)' : 'transparent'}">
                        <div class="flex justify-between">
                            <h3 style="color: #fff;">${m.subject}</h3>
                            <span class="text-sm text-muted">${new Date(m.timestamp).toLocaleString()}</span>
                        </div>
                        <p class="text-sm" style="margin-top: 0.5rem;">
                            <span style="color: var(--primary);">From:</span> ${m.senderName || 'Anonymous'} (${m.sender})
                        </p>
                        <p class="mt-2 text-muted" style="line-height: 1.6; background: rgba(0,0,0,0.2); padding: 1rem; border-radius: 8px;">${m.message}</p>
                        <div class="mt-4 flex gap-2">
                             <button class="btn-primary text-sm" style="padding: 0.5rem 1rem;" onclick="Dashboard.resolveMessage(${m.id})">Mark Resolved</button>
                             <button class="btn-secondary text-sm" style="padding: 0.5rem 1rem;" onclick="Dashboard.deleteMessage(${m.id})">Delete</button>
                        </div>
                    </div>
                `).join('') : '<div class="glass-card">No messages in inbox.</div>'}
             </div>
        `;
    },

    renderAdminContent(container) {
        const posts = DataService.getBlogPosts();
        const rows = posts.map(p => `
            <tr>
                <td>${p.title}</td>
                <td>${p.author}</td>
                <td>${p.published ? '<span class="status-pill status-active">Published</span>' : '<span class="status-pill status-pending">Draft</span>'}</td>
                <td>
                    <button class="action-btn" onclick="Dashboard.deleteBlogPost(${p.id})"><i data-lucide="trash" style="width: 14px;"></i></button>
                </td>
            </tr>
        `).join('');

        container.innerHTML = `
            <div class="section-header">
                <h2 class="section-title">Content Management</h2>
                <button class="btn-primary" onclick="ModalSystem.alert('Post creation coming soon!', 'info')">New Post</button>
            </div>
            <div class="glass-card table-wrapper">
                <table class="data-table">
                    <thead><tr><th>Title</th><th>Author</th><th>Status</th><th>Actions</th></tr></thead>
                    <tbody>${rows || '<tr><td colspan="4">No posts found</td></tr>'}</tbody>
                </table>
            </div>
        `;
        lucide.createIcons();
    },

    deleteBlogPost(id) {
        ModalSystem.confirm('Delete this post?', () => {
            DataService.deleteBlogPost(id);
            this.renderView('adminContent');
        });
    },

    renderAdminActivity(container) {
        container.innerHTML = `
            <div class="section-header"><h2 class="section-title">System Activity Log</h2></div>
            <div class="glass-card">${this.getAdminActivityHTML(20)}</div>
        `;
    },

    getAdminActivityHTML(limit) {
        let logs = DataService.getActivityLog(limit);
        if (!logs.length) return 'No activity.';
        return logs.map(l => `
            <div class="py-2 border-b border-white-10">
                <div class="text-sm">${l.details}</div>
                <div class="text-xs text-muted">${new Date(l.timestamp).toLocaleString()} • ${l.userId}</div>
            </div>
        `).join('');
    },

    // ============================================
    // ACTIONS & UTILS
    // ============================================
    toggleSidebar(force) {
        const sidebar = document.getElementById('sidebar-root');
        const overlay = document.getElementById('sidebar-overlay');

        this.state.isSidebarOpen = force !== undefined ? force : !this.state.isSidebarOpen;

        if (this.state.isSidebarOpen) {
            sidebar.classList.add('open');
            overlay.classList.add('active');
        } else {
            sidebar.classList.remove('open');
            overlay.classList.remove('active');
        }
    },

    setupEventListeners() {
        // Mobile Toggle
        const toggleBtn = document.getElementById('sidebar-toggle');
        const overlay = document.getElementById('sidebar-overlay');

        if (toggleBtn) toggleBtn.addEventListener('click', () => this.toggleSidebar());
        if (overlay) overlay.addEventListener('click', () => this.toggleSidebar(false));
    },

    getStatCard(label, value, icon, color) {
        return `
            <div class="stat-card flex items-center justify-between">
                <div class="stat-info">
                    <div class="stat-info">
                        <h3>${label}</h3>
                        <p class="stat-value">${value}</p>
                    </div>
                </div>
                <div class="stat-icon ${color}">
                    <i data-lucide="${icon}"></i>
                </div>
            </div>
        `;
    },

    getSimpleCard(title, body) {
        return `<div class="glass-card"><h3>${title}</h3><p>${body}</p></div>`;
    },

    // Actions Wrapper (Bridge to DataService + Modals)
    createProject() {
        ModalSystem.showProjectForm(null, (data) => {
            data.owner = this.state.currentUser.email;
            DataService.createProject(data);
            this.renderView('userProjects');
            ModalSystem.alert('Project Created!', 'success');
        });
    },

    deleteProject(id, name) {
        ModalSystem.confirm(`Delete ${name}?`, () => {
            DataService.deleteProject(id);
            this.renderView('userProjects');
        });
    },

    editProject(id) {
        const p = DataService.getProjects().find(x => x.id === id);
        ModalSystem.showProjectForm(p, (data) => {
            DataService.updateProject(id, data);
            this.renderView('userProjects');
        });
    },

    deleteUser(email, name) {
        ModalSystem.confirm(`Delete user ${name}?`, () => {
            DataService.deleteUser(email);
            this.renderView('adminUsers');
        });
    },

    resolveMessage(id) {
        DataService.updateMessage(id, { status: 'resolved' });
        this.renderView('adminMessages');
    },

    deleteNotification(id) {
        DataService.deleteNotification(id);
        this.renderView('userNotifications');
    },

    deleteMessage(id) {
        ModalSystem.confirm('Delete this message?', () => {
            DataService.deleteMessage(id);
            this.renderView('userMessages');
        });
    }
};

// Boot
document.addEventListener('DOMContentLoaded', () => Dashboard.init());
