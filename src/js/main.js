/**
 * Nexus Layout System
 * Injects unified Header and Footer across all pages.
 * Handles active navigation states and relative paths.
 */

const Layout = {
    initAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        document.querySelectorAll('.fade-up, .fade-in, .slide-in').forEach(el => {
            observer.observe(el);
        });

        // Add CSS for animations if not present
        if (!document.getElementById('anim-styles')) {
            const style = document.createElement('style');
            style.id = 'anim-styles';
            style.textContent = `
                .fade-up { opacity: 0; transform: translateY(30px); transition: opacity 0.6s ease-out, transform 0.6s ease-out; }
                .fade-up.visible { opacity: 1; transform: translateY(0); }
            `;
            document.head.appendChild(style);
        }
    },

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
        if (path.includes('/marketing/') || path.includes('/auth/') || path.includes('/dashboard/')) {
            return '../';
        }
        return '';
    },

    renderHeader() {
        const headerEl = document.getElementById('main-header');
        if (!headerEl) return;

        const prefix = this.getPrefix();

        headerEl.innerHTML = `
        <header class="navbar-header">
            <div class="container navbar">
                <div class="nav-brand">
                    <a href="${prefix}index.html" class="brand-text" style="display: flex; align-items: center; gap: 12px; text-decoration: none;">
                        <img src="${prefix}assets/images/logo.png" alt="Nexus Logo" style="height: 40px; width: auto;">
                        <span><span style="color: var(--primary);">NEX</span>US</span>
                    </a>
                </div>

                <nav class="nav-center">
                    <div class="nav-links">
                        <a href="${prefix}index.html" data-link="home">Home</a>
                        <a href="${prefix}public/pages/startup.html" data-link="startup">Home2</a>
                        <a href="${prefix}public/pages/services/index.html" data-link="services">Services</a>
                        <a href="${prefix}public/pages/about.html" data-link="about">About Us</a>
                        <a href="${prefix}public/pages/blog/index.html" data-link="blog">Blog</a>
                        <a href="${prefix}public/pages/contact.html" data-link="contact">Contact</a>
                    </div>
                </nav>

                <div class="nav-right">
                    <div class="profile-dropdown-container">
                        <button id="profile-toggle" class="profile-trigger" aria-label="Account Menu">
                            <i data-lucide="user" style="width: 20px; height: 20px;"></i>
                        </button>

                        <div id="profile-menu" class="auth-dropdown-menu">
                            <!-- Content injected by Auth.js -->
                        </div>
                    </div>
                    <!-- Mobile Toggle -->
                    <button class="nav-menu-toggle" id="mobile-toggle" aria-label="Open Menu">
                        <span class="hamburger-line"></span>
                        <span class="hamburger-line"></span>
                        <span class="hamburger-line"></span>
                    </button>
                </div>
            </div>
        </header>

        <!-- Mobile Menu Overlay -->
        <div class="mobile-menu-overlay" id="mobile-menu">
            <div class="mobile-menu-header">
                <div class="nav-brand">
                    <a href="${prefix}index.html" class="brand-text" style="display: flex; align-items: center; gap: 12px; text-decoration: none;">
                        <img src="${prefix}assets/images/logo.png" alt="Nexus Logo" style="height: 32px; width: auto;">
                        <span><span style="color: var(--primary);">NEX</span>US</span>
                    </a>
                </div>
                <button class="nav-menu-toggle" id="mobile-close" aria-label="Close Menu">
                    <i data-lucide="x"></i>
                </button>
            </div>
            <nav class="mobile-nav-links nav-links">
                <a href="${prefix}index.html" data-link="home">Home</a>
                <a href="${prefix}public/pages/startup.html" data-link="startup">Home2</a>
                <a href="${prefix}public/pages/services/index.html" data-link="services">Services</a>
                <a href="${prefix}public/pages/about.html" data-link="about">About Us</a>
                <a href="${prefix}public/pages/blog/index.html" data-link="blog">Blog</a>
                <a href="${prefix}public/pages/contact.html" data-link="contact">Contact</a>
            </nav>
        </div>
        `;

        // Initialize Mobile Menu Logic
        const mobileToggle = document.getElementById('mobile-toggle');
        const mobileClose = document.getElementById('mobile-close');
        const mobileMenu = document.getElementById('mobile-menu');

        const openMenu = () => {
            if (mobileMenu) {
                mobileMenu.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        };

        const closeMenu = () => {
            if (mobileMenu) {
                mobileMenu.classList.remove('active');
                document.body.style.overflow = '';
            }
        };

        if (mobileToggle) mobileToggle.addEventListener('click', openMenu);
        if (mobileClose) mobileClose.addEventListener('click', closeMenu);

        // Close when a nav link is tapped
        if (mobileMenu) {
            mobileMenu.querySelectorAll('.mobile-nav-links a').forEach(link => {
                link.addEventListener('click', closeMenu);
            });
        }

        // Close on resize back to desktop
        window.addEventListener('resize', () => {
            if (window.innerWidth > 1024) closeMenu();
        });

        // Render lucide icons NOW (after innerHTML is set)
        if (window.lucide) lucide.createIcons();

        document.dispatchEvent(new Event("header:loaded"));
    },

    renderFooter() {
        const footerEl = document.getElementById('main-footer');
        if (!footerEl) return;

        const prefix = this.getPrefix();

        footerEl.innerHTML = `
        <footer class="footer">
            <div class="container">
                <div class="footer-grid">
                    <div class="footer-brand-col">
                        <a href="${prefix}index.html" class="brand-text" style="display: flex; align-items: center; gap: 12px; margin-bottom: 1.5rem; text-decoration: none;">
                            <img src="${prefix}assets/images/logo.png" alt="Nexus Logo" style="height: 32px; width: auto;">
                            <span><span style="color: var(--primary);">NEX</span>US</span>
                        </a>
                        <p style="color: var(--text-muted); max-width: 320px; line-height: 1.6;">
                            Empowering startups with infrastructure to scale. Deploy, manage, and grow your business with our all-in-one platform.
                        </p>
                        <div class="footer-socials" style="margin-top: 2rem;">
                            <a href="#" aria-label="Twitter"><i data-lucide="twitter"></i></a>
                            <a href="#" aria-label="GitHub"><i data-lucide="github"></i></a>
                            <a href="#" aria-label="LinkedIn"><i data-lucide="linkedin"></i></a>
                            <a href="#" aria-label="Discord"><i data-lucide="message-circle"></i></a>
                        </div>
                    </div>
                    <div>
                        <h4>Product</h4>
                        <ul>
                            <li><a href="${prefix}index.html">Features</a></li>
                            <li><a href="${prefix}public/pages/startup.html">Home2</a></li>
                            <li><a href="${prefix}public/pages/services/index.html">Services</a></li>
                            <li><a href="${prefix}public/pages/pricing.html">Pricing</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4>Company</h4>
                        <ul>
                            <li><a href="${prefix}public/pages/about.html">About Us</a></li>
                            <li><a href="${prefix}public/pages/blog/index.html">Blog</a></li>
                            <li><a href="${prefix}public/pages/careers.html">Careers</a></li>
                            <li><a href="${prefix}public/pages/contact.html">Contact</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4>Legal</h4>
                        <ul>
                            <li><a href="${prefix}public/pages/privacy-policy.html">Privacy Policy</a></li>
                            <li><a href="${prefix}public/pages/terms-of-service.html">Terms of Service</a></li>
                            <li><a href="${prefix}public/pages/cookie-policy.html">Cookie Policy</a></li>
                            <li><a href="${prefix}public/pages/security.html">Security</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4>Resources</h4>
                        <ul>
                            <li><a href="${prefix}public/pages/documentation.html">Documentation</a></li>
                            <li><a href="${prefix}coming-soon.html">Help Center</a></li>
                            <li><a href="${prefix}public/pages/status.html">System Status</a></li>
                            <li><a href="${prefix}coming-soon.html">Community</a></li>
                        </ul>
                    </div>
                </div>
                <div class="footer-bottom">
                    <div class="footer-copyright">
                        <p>&copy; 2026 MrCodersHub. All rights reserved.</p>
                    </div>
                    <div class="footer-legal-links" style="display: flex; align-items: center; flex-wrap: wrap; gap: 1rem;">
                        <a href="${prefix}public/pages/privacy-policy.html">Privacy</a>
                        <span class="separator" style="opacity: 0.3;">•</span>
                        <a href="${prefix}public/pages/terms-of-service.html">Terms</a>
                        <span class="separator" style="opacity: 0.3;">•</span>
                        <a href="${prefix}public/pages/cookie-policy.html">Cookies</a>
                        <span class="separator" style="opacity: 0.3;">•</span>
                        <a href="${prefix}public/pages/security.html">Security</a>
                        <span class="separator" style="opacity: 0.3;">•</span>
                        <span style="font-size: 0.75rem; opacity: 0.5;">v1.2.0</span>
                    </div>
                </div>
            </div>
        </footer>
        `;

        if (window.lucide) {
            lucide.createIcons();
        }
    },

    init() {
        console.log('[Layout] Initializing...');
        this.renderHeader();
        this.renderFooter();
        this.highlightActiveNav();
        this.initAnimations();
        this.setFavicon();
    },

    setFavicon() {
        const prefix = this.getPrefix();
        let link = document.querySelector("link[rel~='icon']");
        if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.head.appendChild(link);
        }
        link.href = `${prefix}assets/images/logo.png`;
        link.type = 'image/png';
    },

    highlightActiveNav() {
        const path = window.location.pathname.toLowerCase();
        let activeLink = '';

        // Improved Path Matching
        if (path === '/' || path.endsWith('index.html') || path.endsWith('/nexus/')) {
            // Check if it's the root index or a subfolder index
            if (path.includes('/services/')) activeLink = 'services';
            else if (path.includes('/blog/')) activeLink = 'blog';
            else if (!path.includes('/pages/') && !path.includes('/auth/')) activeLink = 'home';
        }

        if (!activeLink) {
            if (path.includes('startup.html')) activeLink = 'startup';
            else if (path.includes('services/')) activeLink = 'services';
            else if (path.includes('about.html')) activeLink = 'about';
            else if (path.includes('contact.html')) activeLink = 'contact';
            else if (path.includes('blog/')) activeLink = 'blog';
        }

        if (activeLink) {
            console.log('[Layout] Active Link Detected:', activeLink);
            const links = document.querySelectorAll(`.nav-links a[data-link="${activeLink}"]`);
            links.forEach(link => link.classList.add('active'));
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    Layout.init();
});
