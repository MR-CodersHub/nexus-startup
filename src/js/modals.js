/**
 * Nexus Modal System
 * Reusable modal components for CRUD operations
 */

const ModalSystem = {
    activeModal: null,

    // Create and show a modal
    show(config) {
        this.close(); // Close any existing modal

        // Ensure modal root exists
        let modalRoot = document.getElementById('modal-root');
        if (!modalRoot) {
            console.warn('[ModalSystem] #modal-root not found, creating one...');
            modalRoot = document.createElement('div');
            modalRoot.id = 'modal-root';
            document.body.appendChild(modalRoot);
        }

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-container">
                <div class="modal-header">
                    <h3>${config.title}</h3>
                    <button class="modal-close" onclick="ModalSystem.close()">
                        <i data-lucide="x" style="width: 20px; height: 20px;"></i>
                    </button>
                </div>
                <div class="modal-body">
                    ${config.content}
                </div>
                <div class="modal-footer">
                    ${config.footer || ''}
                </div>
            </div>
        `;

        modalRoot.appendChild(modal);
        this.activeModal = modal;

        // Initialize Lucide icons
        if (window.lucide) {
            lucide.createIcons();
        }

        // Close on overlay click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.close();
            }
        });

        // Close on Escape key
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                this.close();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);

        return modal;
    },

    close() {
        if (this.activeModal) {
            this.activeModal.remove();
            this.activeModal = null;
        }
    },

    // Show confirmation dialog
    confirm(message, onConfirm) {
        this.show({
            title: 'Confirm Action',
            content: `<p style="margin: 1.5rem 0;">${message}</p>`,
            footer: `
                <button class="btn-outline" onclick="ModalSystem.close()">Cancel</button>
                <button class="btn-primary" id="confirmBtn">Confirm</button>
            `
        });

        document.getElementById('confirmBtn').addEventListener('click', () => {
            onConfirm();
            this.close();
        });
    },

    // Show alert dialog
    alert(message, type = 'info') {
        const icons = {
            success: 'check-circle',
            error: 'alert-circle',
            warning: 'alert-triangle',
            info: 'info'
        };

        const colors = {
            success: 'var(--secondary)',
            error: 'var(--error)',
            warning: 'var(--warning)',
            info: 'var(--primary)'
        };

        this.show({
            title: type.charAt(0).toUpperCase() + type.slice(1),
            content: `
                <div style="text-align: center; padding: 1.5rem 0;">
                    <i data-lucide="${icons[type]}" style="width: 48px; height: 48px; color: ${colors[type]}; margin-bottom: 1rem;"></i>
                    <p>${message}</p>
                </div>
            `,
            footer: `<button class="btn-primary" onclick="ModalSystem.close()">OK</button>`
        });
    },

    // Project form modal
    showProjectForm(project = null, onSave) {
        const isEdit = !!project;
        const formId = 'projectForm';

        this.show({
            title: isEdit ? 'Edit Project' : 'Create New Project',
            content: `
                <form id="${formId}" class="modal-form">
                    <div class="form-group">
                        <label for="projectName">Project Name *</label>
                        <input type="text" id="projectName" value="${project?.name || ''}" required 
                               placeholder="My Awesome Project">
                    </div>
                    <div class="form-group">
                        <label for="projectDescription">Description</label>
                        <textarea id="projectDescription" rows="4" 
                                  placeholder="Describe your project...">${project?.description || ''}</textarea>
                    </div>
                    ${isEdit ? `
                    <div class="form-group">
                        <label for="projectStatus">Status</label>
                        <select id="projectStatus">
                            <option value="Active" ${project?.status === 'Active' ? 'selected' : ''}>Active</option>
                            <option value="Paused" ${project?.status === 'Paused' ? 'selected' : ''}>Paused</option>
                            <option value="Archived" ${project?.status === 'Archived' ? 'selected' : ''}>Archived</option>
                        </select>
                    </div>
                    ` : ''}
                </form>
            `,
            footer: `
                <button class="btn-outline" onclick="ModalSystem.close()">Cancel</button>
                <button class="btn-primary" id="saveProjectBtn">${isEdit ? 'Update' : 'Create'} Project</button>
            `
        });

        document.getElementById('saveProjectBtn').addEventListener('click', () => {
            const form = document.getElementById(formId);
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }

            const data = {
                name: document.getElementById('projectName').value,
                description: document.getElementById('projectDescription').value,
            };

            if (isEdit) {
                data.status = document.getElementById('projectStatus').value;
            }

            onSave(data);
            this.close();
        });
    },

    // User form modal
    showUserForm(user, onSave) {
        const formId = 'userForm';

        this.show({
            title: 'Edit User',
            content: `
                <form id="${formId}" class="modal-form">
                    <div class="form-group">
                        <label for="userName">Name *</label>
                        <input type="text" id="userName" value="${user.name || ''}" required>
                    </div>
                    <div class="form-group">
                        <label for="userEmail">Email *</label>
                        <input type="email" id="userEmail" value="${user.email}" required disabled>
                    </div>
                    <div class="form-group">
                        <label for="userRole">Role</label>
                        <select id="userRole">
                            <option value="user" ${user.role === 'user' ? 'selected' : ''}>User</option>
                            <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="userStatus">Status</label>
                        <select id="userStatus">
                            <option value="Online" ${user.status === 'Online' ? 'selected' : ''}>Online</option>
                            <option value="Offline" ${user.status === 'Offline' ? 'selected' : ''}>Offline</option>
                        </select>
                    </div>
                </form>
            `,
            footer: `
                <button class="btn-outline" onclick="ModalSystem.close()">Cancel</button>
                <button class="btn-primary" id="saveUserBtn">Update User</button>
            `
        });

        document.getElementById('saveUserBtn').addEventListener('click', () => {
            const data = {
                name: document.getElementById('userName').value,
                role: document.getElementById('userRole').value,
                status: document.getElementById('userStatus').value
            };

            onSave(data);
            this.close();
        });
    },

    // Blog post form modal
    showBlogForm(post = null, onSave) {
        const isEdit = !!post;
        const formId = 'blogForm';

        this.show({
            title: isEdit ? 'Edit Blog Post' : 'Create Blog Post',
            content: `
                <form id="${formId}" class="modal-form">
                    <div class="form-group">
                        <label for="blogTitle">Title *</label>
                        <input type="text" id="blogTitle" value="${post?.title || ''}" required>
                    </div>
                    <div class="form-group">
                        <label for="blogExcerpt">Excerpt</label>
                        <textarea id="blogExcerpt" rows="2" 
                                  placeholder="Brief summary...">${post?.excerpt || ''}</textarea>
                    </div>
                    <div class="form-group">
                        <label for="blogContent">Content *</label>
                        <textarea id="blogContent" rows="8" required>${post?.content || ''}</textarea>
                    </div>
                    <div class="form-group">
                        <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                            <input type="checkbox" id="blogPublished" ${post?.published ? 'checked' : ''}>
                            <span>Publish immediately</span>
                        </label>
                    </div>
                </form>
            `,
            footer: `
                <button class="btn-outline" onclick="ModalSystem.close()">Cancel</button>
                <button class="btn-primary" id="saveBlogBtn">${isEdit ? 'Update' : 'Create'} Post</button>
            `
        });

        document.getElementById('saveBlogBtn').addEventListener('click', () => {
            const form = document.getElementById(formId);
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }

            const data = {
                title: document.getElementById('blogTitle').value,
                excerpt: document.getElementById('blogExcerpt').value,
                content: document.getElementById('blogContent').value,
                published: document.getElementById('blogPublished').checked
            };

            onSave(data);
            this.close();
        });
    },

    // Service form modal
    showServiceForm(service = null, onSave) {
        const isEdit = !!service;
        const formId = 'serviceForm';

        this.show({
            title: isEdit ? 'Edit Service' : 'Create Service',
            content: `
                <form id="${formId}" class="modal-form">
                    <div class="form-group">
                        <label for="serviceName">Service Name *</label>
                        <input type="text" id="serviceName" value="${service?.name || ''}" required>
                    </div>
                    <div class="form-group">
                        <label for="serviceDescription">Description *</label>
                        <textarea id="serviceDescription" rows="3" required>${service?.description || ''}</textarea>
                    </div>
                    <div class="form-group">
                        <label for="servicePrice">Price *</label>
                        <input type="text" id="servicePrice" value="${service?.price || ''}" 
                               placeholder="$99/month" required>
                    </div>
                    <div class="form-group">
                        <label for="serviceFeatures">Features (one per line)</label>
                        <textarea id="serviceFeatures" rows="5" 
                                  placeholder="Feature 1\nFeature 2\nFeature 3">${service?.features?.join('\n') || ''}</textarea>
                    </div>
                    <div class="form-group">
                        <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                            <input type="checkbox" id="serviceActive" ${service?.active !== false ? 'checked' : ''}>
                            <span>Active</span>
                        </label>
                    </div>
                </form>
            `,
            footer: `
                <button class="btn-outline" onclick="ModalSystem.close()">Cancel</button>
                <button class="btn-primary" id="saveServiceBtn">${isEdit ? 'Update' : 'Create'} Service</button>
            `
        });

        document.getElementById('saveServiceBtn').addEventListener('click', () => {
            const form = document.getElementById(formId);
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }

            const featuresText = document.getElementById('serviceFeatures').value;
            const features = featuresText.split('\n').filter(f => f.trim()).map(f => f.trim());

            const data = {
                name: document.getElementById('serviceName').value,
                description: document.getElementById('serviceDescription').value,
                price: document.getElementById('servicePrice').value,
                features: features,
                active: document.getElementById('serviceActive').checked
            };

            onSave(data);
            this.close();
        });
    }
};

// Make it globally available
window.ModalSystem = ModalSystem;
