/**
 * Nexus Modal & Alert System
 * Handles dynamic content injection for forms, confirmations, and alerts.
 */

const ModalSystem = {
    root: null,

    init() {
        this.root = document.getElementById('modal-root');
        if (!this.root) {
            console.error('Modal root not found!');
            // Create if missing (fallback)
            this.root = document.createElement('div');
            this.root.id = 'modal-root';
            document.body.appendChild(this.root);
        }
    },

    // --- GENERIC MODAL BUILDER ---
    renderModal(title, contentHTML, buttonsHTML = '') {
        this.init();

        const html = `
            <div class="modal-overlay active" id="current-modal-overlay">
                <div class="modal-container">
                    <div class="modal-header">
                        <h3 class="modal-title">${title}</h3>
                        <button class="modal-close" onclick="ModalSystem.close()">
                            <i data-lucide="x"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        ${contentHTML}
                    </div>
                    <div class="modal-footer">
                        <button class="btn-secondary" onclick="ModalSystem.close()">Cancel</button>
                        ${buttonsHTML}
                    </div>
                </div>
            </div>
        `;

        this.root.innerHTML = html;
        lucide.createIcons();

        // Close on overlay click
        setTimeout(() => {
            const overlay = document.getElementById('current-modal-overlay');
            if (overlay) {
                overlay.addEventListener('click', (e) => {
                    if (e.target === overlay) this.close();
                });
            }
        }, 10);
    },

    close() {
        if (this.root) this.root.innerHTML = '';
    },

    // --- SPECIFIC MODALS ---

    // Project Form (Create/Edit)
    showProjectForm(project = null, onSave) {
        const isEdit = !!project;
        const title = isEdit ? 'Edit Project' : 'Create New Project';
        const name = isEdit ? project.name : '';
        const desc = isEdit ? project.description : '';
        const type = isEdit ? (project.type || 'Web App') : 'Web App';

        const formHTML = `
            <div class="form-group">
                <label class="form-label">Project Name</label>
                <input type="text" id="p-name" class="form-input" value="${name}" placeholder="e.g. Apollo Landing Page" autocomplete="off">
            </div>
            
            <div class="form-group">
                <label class="form-label">Project Type</label>
                <div class="select-wrapper" style="position: relative;">
                    <select id="p-type" class="form-input" style="appearance: none; cursor: pointer;">
                        <option value="Web App" ${type === 'Web App' ? 'selected' : ''}>Web Application</option>
                        <option value="Landing Page" ${type === 'Landing Page' ? 'selected' : ''}>Marketing Site / Landing Page</option>
                        <option value="Mobile App" ${type === 'Mobile App' ? 'selected' : ''}>Mobile Application (iOS/Android)</option>
                        <option value="API" ${type === 'API' ? 'selected' : ''}>Backend API Service</option>
                    </select>
                    <div style="position: absolute; right: 1rem; top: 50%; transform: translateY(-50%); pointer-events: none; color: #94a3b8;">
                        <i data-lucide="chevron-down" style="width: 16px;"></i>
                    </div>
                </div>
            </div>

            <div class="form-group">
                <label class="form-label">Description</label>
                <textarea id="p-desc" class="form-textarea" placeholder="Briefly describe what this project does..." style="min-height: 80px;">${desc}</textarea>
            </div>

            ${!isEdit ? `
            <div class="form-group">
                <label class="form-label">Initial Environment</label>
                <div style="display: flex; gap: 1rem;">
                    <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; color: #cbd5e1; font-size: 0.9rem;">
                        <input type="radio" name="p-env" value="Development" checked style="accent-color: var(--primary);"> Development
                    </label>
                    <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; color: #cbd5e1; font-size: 0.9rem;">
                        <input type="radio" name="p-env" value="Staging" style="accent-color: var(--primary);"> Staging
                    </label>
                </div>
            </div>
            ` : ''}
        `;

        const btnHTML = `
            <button class="btn-primary" id="save-project-btn" style="min-width: 120px;">
                ${isEdit ? 'Save Changes' : 'Create Project'}
            </button>
        `;

        this.renderModal(title, formHTML, btnHTML);

        // Bind Save
        setTimeout(() => {
            const btn = document.getElementById('save-project-btn');
            if (btn) btn.onclick = () => {
                const newName = document.getElementById('p-name').value.trim();
                const newDesc = document.getElementById('p-desc').value.trim();
                const newType = document.getElementById('p-type').value;

                if (!newName) {
                    this.alert('Please enter a project name', 'error');
                    document.getElementById('p-name').focus();
                    return;
                }

                if (onSave) onSave({
                    name: newName,
                    description: newDesc,
                    type: newType,
                    // If creating, we might use env, but DataService usually handles defaults. 
                    // We'll pass it just in case we want to use it later.
                });
                this.close();
            };

            // Auto focus name
            const nameInput = document.getElementById('p-name');
            if (nameInput) nameInput.focus();
        }, 50);
    },

    // Confirmation Dialog
    confirm(message, onConfirm) {
        const content = `<p>${message}</p>`;
        const btnHTML = `
            <button class="btn-danger" id="confirm-action-btn">Confirm</button>
        `;

        this.renderModal('Are you sure?', content, btnHTML);

        setTimeout(() => {
            document.getElementById('confirm-action-btn').onclick = () => {
                if (onConfirm) onConfirm();
                this.close();
            };
        }, 50);
    },

    // --- TOAST ALERTS ---
    alert(message, type = 'info') {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        // Icon selection
        let icon = 'info';
        let color = '#3b82f6';
        if (type === 'success') { icon = 'check-circle'; color = '#22c55e'; }
        if (type === 'error') { icon = 'alert-circle'; color = '#ef4444'; }
        if (type === 'warning') { icon = 'alert-triangle'; color = '#f59e0b'; }

        toast.innerHTML = `
            <div style="color: ${color}"><i data-lucide="${icon}"></i></div>
            <div style="color: white; font-weight: 500;">${message}</div>
        `;

        container.appendChild(toast);
        lucide.createIcons();

        // Auto remove
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
};

window.ModalSystem = ModalSystem;
