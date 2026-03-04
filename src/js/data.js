/**
 * Nexus Data Management Service
 * Handles all CRUD operations and data persistence
 */

const DataService = {
    // ==================== PROJECTS ====================

    getProjects(userId = null) {
        const projects = JSON.parse(localStorage.getItem('nexus_projects') || '[]');
        return userId ? projects.filter(p => p.owner === userId) : projects;
    },

    createProject(projectData) {
        const projects = this.getProjects();
        const newProject = {
            id: Date.now(),
            name: projectData.name,
            description: projectData.description || '',
            owner: projectData.owner,
            status: 'Active',
            created: new Date().toISOString(),
            updated: new Date().toISOString(),
            deployments: 0,
            requests: 0
        };
        projects.push(newProject);
        localStorage.setItem('nexus_projects', JSON.stringify(projects));
        this.logActivity(projectData.owner, 'create_project', `Created project: ${newProject.name}`);
        return newProject;
    },

    updateProject(id, updates) {
        const projects = this.getProjects();
        const index = projects.findIndex(p => p.id === id);
        if (index === -1) return null;

        projects[index] = {
            ...projects[index],
            ...updates,
            updated: new Date().toISOString()
        };
        localStorage.setItem('nexus_projects', JSON.stringify(projects));
        this.logActivity(projects[index].owner, 'update_project', `Updated project: ${projects[index].name}`);
        return projects[index];
    },

    deleteProject(id) {
        const projects = this.getProjects();
        const index = projects.findIndex(p => p.id === id);
        if (index === -1) return false;

        const project = projects[index];
        projects.splice(index, 1);
        localStorage.setItem('nexus_projects', JSON.stringify(projects));
        this.logActivity(project.owner, 'delete_project', `Deleted project: ${project.name}`);
        return true;
    },

    // ==================== USERS ====================

    getUsers() {
        return JSON.parse(localStorage.getItem('nexus_users') || '[]');
    },

    updateUser(email, updates) {
        const users = this.getUsers();
        const index = users.findIndex(u => u.email === email);
        if (index === -1) return null;

        users[index] = { ...users[index], ...updates };
        localStorage.setItem('nexus_users', JSON.stringify(users));
        this.logActivity('admin', 'update_user', `Updated user: ${email}`);
        return users[index];
    },

    deleteUser(email) {
        const users = this.getUsers();
        const index = users.findIndex(u => u.email === email);
        if (index === -1) return false;

        users.splice(index, 1);
        localStorage.setItem('nexus_users', JSON.stringify(users));
        this.logActivity('admin', 'delete_user', `Deleted user: ${email}`);
        return true;
    },

    // ==================== MESSAGES ====================

    getMessages(status = null) {
        const messages = JSON.parse(localStorage.getItem('nexus_messages') || '[]');
        return status ? messages.filter(m => m.status === status) : messages;
    },

    updateMessage(id, updates) {
        const messages = this.getMessages();
        const index = messages.findIndex(m => m.id === id);
        if (index === -1) return null;

        messages[index] = { ...messages[index], ...updates };
        localStorage.setItem('nexus_messages', JSON.stringify(messages));
        return messages[index];
    },

    deleteMessage(id) {
        const messages = this.getMessages();
        const index = messages.findIndex(m => m.id === id);
        if (index === -1) return false;

        messages.splice(index, 1);
        localStorage.setItem('nexus_messages', JSON.stringify(messages));
        this.logActivity('admin', 'delete_message', `Deleted message #${id}`);
        return true;
    },

    createMessage(messageData) {
        const messages = this.getMessages();
        const newMessage = {
            id: Date.now(),
            sender: messageData.email || 'Guest',
            senderName: messageData.name || 'Anonymous',
            recipient: messageData.recipient || 'admin@nexus.com',
            subject: messageData.subject || 'New Contact Message',
            message: messageData.message,
            status: 'unread',
            timestamp: new Date().toISOString()
        };
        messages.push(newMessage);
        localStorage.setItem('nexus_messages', JSON.stringify(messages));

        // Log activity for admins
        this.logActivity('admin', 'new_message', `New message from ${newMessage.sender}: ${newMessage.subject}`);

        return newMessage;
    },

    // ==================== NOTIFICATIONS ====================

    getNotifications(userId) {
        const notifications = JSON.parse(localStorage.getItem('nexus_notifications') || '[]');
        return notifications.filter(n => n.userId === userId);
    },

    createNotification(userId, message, type = 'info') {
        const notifications = JSON.parse(localStorage.getItem('nexus_notifications') || '[]');
        const newNotification = {
            id: Date.now(),
            userId: userId,
            message: message,
            type: type, // 'info', 'success', 'warning', 'error'
            read: false,
            timestamp: new Date().toISOString()
        };
        notifications.push(newNotification);
        localStorage.setItem('nexus_notifications', JSON.stringify(notifications));
        return newNotification;
    },

    markNotificationRead(id) {
        const notifications = JSON.parse(localStorage.getItem('nexus_notifications') || '[]');
        const index = notifications.findIndex(n => n.id === id);
        if (index === -1) return false;

        notifications[index].read = true;
        localStorage.setItem('nexus_notifications', JSON.stringify(notifications));
        return true;
    },

    deleteNotification(id) {
        const notifications = JSON.parse(localStorage.getItem('nexus_notifications') || '[]');
        const filtered = notifications.filter(n => n.id !== id);
        localStorage.setItem('nexus_notifications', JSON.stringify(filtered));
        return true;
    },

    // ==================== BLOG POSTS ====================

    getBlogPosts() {
        return JSON.parse(localStorage.getItem('nexus_blog_posts') || '[]');
    },

    createBlogPost(postData) {
        const posts = this.getBlogPosts();
        const newPost = {
            id: Date.now(),
            title: postData.title,
            content: postData.content,
            excerpt: postData.excerpt || postData.content.substring(0, 150),
            author: postData.author,
            published: postData.published || false,
            created: new Date().toISOString(),
            updated: new Date().toISOString()
        };
        posts.push(newPost);
        localStorage.setItem('nexus_blog_posts', JSON.stringify(posts));
        this.logActivity(postData.author, 'create_blog', `Created blog post: ${newPost.title}`);
        return newPost;
    },

    updateBlogPost(id, updates) {
        const posts = this.getBlogPosts();
        const index = posts.findIndex(p => p.id === id);
        if (index === -1) return null;

        posts[index] = {
            ...posts[index],
            ...updates,
            updated: new Date().toISOString()
        };
        localStorage.setItem('nexus_blog_posts', JSON.stringify(posts));
        this.logActivity('admin', 'update_blog', `Updated blog post: ${posts[index].title}`);
        return posts[index];
    },

    deleteBlogPost(id) {
        const posts = this.getBlogPosts();
        const index = posts.findIndex(p => p.id === id);
        if (index === -1) return false;

        const post = posts[index];
        posts.splice(index, 1);
        localStorage.setItem('nexus_blog_posts', JSON.stringify(posts));
        this.logActivity('admin', 'delete_blog', `Deleted blog post: ${post.title}`);
        return true;
    },

    // ==================== SERVICES ====================

    getServices() {
        return JSON.parse(localStorage.getItem('nexus_services') || '[]');
    },

    createService(serviceData) {
        const services = this.getServices();
        const newService = {
            id: Date.now(),
            name: serviceData.name,
            description: serviceData.description,
            price: serviceData.price,
            features: serviceData.features || [],
            active: serviceData.active !== false,
            created: new Date().toISOString()
        };
        services.push(newService);
        localStorage.setItem('nexus_services', JSON.stringify(services));
        this.logActivity('admin', 'create_service', `Created service: ${newService.name}`);
        return newService;
    },

    updateService(id, updates) {
        const services = this.getServices();
        const index = services.findIndex(s => s.id === id);
        if (index === -1) return null;

        services[index] = { ...services[index], ...updates };
        localStorage.setItem('nexus_services', JSON.stringify(services));
        this.logActivity('admin', 'update_service', `Updated service: ${services[index].name}`);
        return services[index];
    },

    deleteService(id) {
        const services = this.getServices();
        const index = services.findIndex(s => s.id === id);
        if (index === -1) return false;

        const service = services[index];
        services.splice(index, 1);
        localStorage.setItem('nexus_services', JSON.stringify(services));
        this.logActivity('admin', 'delete_service', `Deleted service: ${service.name}`);
        return true;
    },

    // ==================== ACTIVITY LOG ====================

    logActivity(userId, action, details) {
        const log = JSON.parse(localStorage.getItem('nexus_activity_log') || '[]');
        const entry = {
            id: Date.now(),
            userId: userId,
            action: action,
            details: details,
            timestamp: new Date().toISOString()
        };
        log.unshift(entry); // Add to beginning

        // Keep only last 100 entries
        if (log.length > 100) {
            log.splice(100);
        }

        localStorage.setItem('nexus_activity_log', JSON.stringify(log));
    },

    getActivityLog(limit = 50) {
        const log = JSON.parse(localStorage.getItem('nexus_activity_log') || '[]');
        return log.slice(0, limit);
    },

    // ==================== STATISTICS ====================

    getUserStats(userId) {
        const projects = this.getProjects(userId);
        const notifications = this.getNotifications(userId);

        return {
            totalProjects: projects.length,
            activeProjects: projects.filter(p => p.status === 'Active').length,
            totalDeployments: projects.reduce((sum, p) => sum + (p.deployments || 0), 0),
            unreadNotifications: notifications.filter(n => !n.read).length
        };
    },

    getAdminStats() {
        const users = this.getUsers();
        const messages = this.getMessages();
        const projects = this.getProjects();
        const posts = this.getBlogPosts();

        return {
            totalUsers: users.length,
            onlineUsers: users.filter(u => u.status === 'Online').length,
            totalMessages: messages.length,
            unreadMessages: messages.filter(m => m.status !== 'resolved').length,
            totalProjects: projects.length,
            totalBlogPosts: posts.length,
            publishedPosts: posts.filter(p => p.published).length
        };
    },

    // ==================== SEED DATA ====================
    seedData() {
        if (localStorage.getItem('nexus_projects')) return; // Already seeded

        console.log('[DataService] Seeding initial data...');

        // Seed Projects
        const projects = [
            { id: 101, name: 'Apollo Landing Page', description: 'High convertion landing page for Apollo client.', owner: 'demo@nexus.com', status: 'Active', updated: new Date().toISOString(), deployments: 12 },
            { id: 102, name: 'E-Commerce Dashboard', description: 'Admin panel for shopify integration.', owner: 'demo@nexus.com', status: 'Active', updated: new Date(Date.now() - 86400000).toISOString(), deployments: 5 },
            { id: 103, name: 'Portfolio V2', description: 'Personal portfolio website.', owner: 'demo@nexus.com', status: 'Pending', updated: new Date(Date.now() - 172800000).toISOString(), deployments: 0 }
        ];
        localStorage.setItem('nexus_projects', JSON.stringify(projects));

        // Seed Notifications
        const notifs = [
            { id: 1, userId: 'demo@nexus.com', message: 'Deployment successful: Apollo Landing Page', type: 'success', read: false, timestamp: new Date().toISOString() },
            { id: 2, userId: 'demo@nexus.com', message: 'System maintenance scheduled for Tonight', type: 'warning', read: false, timestamp: new Date(Date.now() - 3600000).toISOString() }
        ];
        localStorage.setItem('nexus_notifications', JSON.stringify(notifs));

        // Seed Messages
        const msgs = [
            { id: 1, sender: 'Admin', recipient: 'demo@nexus.com', subject: 'Welcome to Nexus', message: 'We are excited to have you on board! Check out our documentation to get started.', status: 'unread', timestamp: new Date(Date.now() - 86400000).toISOString() },
            { id: 2, sender: 'System', recipient: 'demo@nexus.com', subject: 'API Key Generated', message: 'Your production API key has been successfully generated and is ready for use.', status: 'unread', timestamp: new Date().toISOString() }
        ];
        localStorage.setItem('nexus_messages', JSON.stringify(msgs));

        // Seed Users (for Admin)
        const users = [
            { email: 'demo@nexus.com', name: 'Demo User', role: 'user', status: 'Online', plan: 'Pro', bio: 'Product Designer at Nexus.' },
            { email: 'admin@nexus.com', name: 'Admin User', role: 'admin', status: 'Online', plan: 'Enterprise', bio: 'Platform Administrator.' }
        ];
        localStorage.setItem('nexus_users', JSON.stringify(users));
    }
};

// Auto-seed on load
DataService.seedData();

// Make it globally available
window.DataService = DataService;
