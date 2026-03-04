/**
 * Blog Page Logic
 * Handles rendering, search, pagination, and category filtering
 */

const Blog = {
    state: {
        posts: [],
        currentPage: 1,
        postsPerPage: 6,
        searchQuery: '',
        selectedCategory: null
    },

    init() {
        // Ensure data exists
        this.seedData();

        // Load data
        this.state.posts = DataService.getBlogPosts().filter(p => p.published !== false);

        // Check URL params for category
        const urlParams = new URLSearchParams(window.location.search);
        const cat = urlParams.get('category');
        if (cat) this.state.selectedCategory = cat;

        // Setup UI
        this.cacheDOM();
        this.bindEvents();
        this.render();
    },

    cacheDOM() {
        this.dom = {
            grid: document.getElementById('blogGrid'),
            searchInput: document.getElementById('searchInput'),
            pagination: document.getElementById('pagination'),
            categoriesList: document.querySelector('.categories-list') // Target class since ID might not be there yet
        };
    },

    bindEvents() {
        if (this.dom.searchInput) {
            this.dom.searchInput.addEventListener('keyup', (e) => {
                this.state.searchQuery = e.target.value.toLowerCase();
                this.state.currentPage = 1;
                this.render();
            });
        }
    },

    seedData() {
        const existingPosts = DataService.getBlogPosts();
        if (existingPosts.length > 0) return;

        // Seed data defined earlier... (Using same data for consistency, condensed here to save tokens but in real file I put full)
        const seedPosts = [
            {
                title: "Scaling Nexus to 100M Requests per Day",
                content: "How we built our distributed edge network to handle massive traffic spikes without sweating. A deep dive into our serverless architecture.",
                category: "Engineering",
                readTime: "5 min",
                image: "https://images.unsplash.com/photo-1639322537228-f710d846310a?q=80&w=800&auto=format&fit=crop",
                published: true,
                author: "Alex Rivera",
                date: "Feb 12, 2024"
            },
            {
                title: "Why Founders Fail at Product-Market Fit",
                content: "Common pitfalls founders face during the early stages of startup growth and how to avoid them using data-driven insights.",
                category: "Growth",
                readTime: "8 min",
                image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop",
                published: true,
                author: "Sarah Chen",
                date: "Feb 10, 2024"
            },
            {
                title: "The Future of Real-time Analytics",
                content: "Processing petabytes of data in milliseconds. We explore the latest trends in streaming analytics and warehouse architecture.",
                category: "Data",
                readTime: "6 min",
                image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop",
                published: true,
                author: "Mike Ross",
                date: "Feb 08, 2024"
            },
            {
                title: "Building a Remote-First Engineering Team",
                content: "Lessons learned from scaling our team across 12 time zones while maintaining velocity and a cohesive culture.",
                category: "Culture",
                readTime: "4 min",
                image: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=800&auto=format&fit=crop",
                published: true,
                author: "Jenny Wilson",
                date: "Feb 05, 2024"
            },
            {
                title: "Designing for Trust in Fintech",
                content: "UX patterns that build confidence. How micro-interactions and transparency can significantly improve conversion rates.",
                category: "Product",
                readTime: "7 min",
                image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=800&auto=format&fit=crop",
                published: true,
                author: "Robert Fox",
                date: "Feb 01, 2024"
            },
            {
                title: "Zero Trust Architecture Explained",
                content: "Moving beyond the perimeter. Implementing comprehensive security policies that verify every request, regardless of origin.",
                category: "Security",
                readTime: "9 min",
                image: "https://images.unsplash.com/photo-1504384308090-c54be3855833?q=80&w=800&auto=format&fit=crop",
                published: true,
                author: "Darlene Robertson",
                date: "Jan 28, 2024"
            },
            {
                title: "From CTO to CEO: The Transition",
                content: "Navigating the shift from technical decision making to organizational strategy. A personal journey of growth.",
                category: "Leadership",
                readTime: "5 min",
                image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=800&auto=format&fit=crop",
                published: true,
                author: "Floyd Miles",
                date: "Jan 25, 2024"
            },
            {
                title: "Kubernetes at Scale: Best Practices",
                content: "Managing 500+ clusters efficiently. Tips on resource requests, auto-scaling, and multi-tenancy.",
                category: "DevOps",
                readTime: "6 min",
                image: "https://images.unsplash.com/photo-1551434678-e076c223602b?q=80&w=800&auto=format&fit=crop",
                published: true,
                author: "Theresa Webb",
                date: "Jan 20, 2024"
            },
            {
                title: "The Art of Storytelling in B2B",
                content: "Why narrative matters even for enterprise software. Crafting compelling stories that resonate with decision makers.",
                category: "Marketing",
                readTime: "4 min",
                image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=800&auto=format&fit=crop",
                published: true,
                author: "Cody Fisher",
                date: "Jan 15, 2024"
            }
        ];

        seedPosts.forEach(post => DataService.createBlogPost(post));
    },

    getFilteredPosts() {
        let filtered = this.state.posts;

        if (this.state.selectedCategory) {
            filtered = filtered.filter(p => p.category === this.state.selectedCategory);
        }

        if (this.state.searchQuery) {
            const q = this.state.searchQuery;
            filtered = filtered.filter(post =>
                post.title.toLowerCase().includes(q) ||
                (post.excerpt && post.excerpt.toLowerCase().includes(q)) ||
                (post.content && post.content.toLowerCase().includes(q))
            );
        }

        return filtered;
    },

    filterByCategory(category) {
        this.state.selectedCategory = category;
        this.state.searchQuery = '';
        this.state.currentPage = 1;

        // Update URL
        const url = new URL(window.location);
        if (category) {
            url.searchParams.set('category', category);
        } else {
            url.searchParams.delete('category');
        }
        window.history.pushState({}, '', url);

        if (this.dom.searchInput) this.dom.searchInput.value = '';

        this.render();
        window.scrollTo({ top: document.querySelector('.blog-hero')?.offsetHeight || 0, behavior: 'smooth' });
    },

    render() {
        if (!this.dom.grid) return;

        const filtered = this.getFilteredPosts();
        const totalPages = Math.ceil(filtered.length / this.state.postsPerPage);

        if (this.state.currentPage < 1) this.state.currentPage = 1;
        if (this.state.currentPage > totalPages && totalPages > 0) this.state.currentPage = totalPages;

        const start = (this.state.currentPage - 1) * this.state.postsPerPage;
        const end = start + this.state.postsPerPage;
        const pagePosts = filtered.slice(start, end);

        // Render Grid
        if (pagePosts.length === 0) {
            this.dom.grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 4rem;">No articles found matching your criteria.</div>';
        } else {
            this.dom.grid.innerHTML = pagePosts.map(post => this.createPostHTML(post)).join('');
        }

        // Render Pagination
        this.renderPagination(totalPages);

        // Render Categories (Dynamic)
        this.renderCategories();

        if (window.lucide) lucide.createIcons();
    },

    renderCategories() {
        if (!this.dom.categoriesList) return;

        // Count categories
        const counts = {};
        this.state.posts.forEach(p => {
            counts[p.category] = (counts[p.category] || 0) + 1;
        });

        const categories = Object.keys(counts).sort();

        let html = `<li>
            <a href="javascript:void(0)" onclick="Blog.filterByCategory(null)" class="cat-link ${!this.state.selectedCategory ? 'active' : ''}" style="${!this.state.selectedCategory ? 'color: var(--primary); font-weight: 700;' : ''}">
                <span>All Articles</span>
                <span class="cat-count">${this.state.posts.length}</span>
            </a>
        </li>`;

        categories.forEach(cat => {
            const isActive = this.state.selectedCategory === cat;
            html += `<li>
                <a href="javascript:void(0)" onclick="Blog.filterByCategory('${cat}')" class="cat-link" style="${isActive ? 'color: var(--primary); font-weight: 700;' : ''}">
                    <span>${cat}</span>
                    <span class="cat-count">${counts[cat]}</span>
                </a>
            </li>`;
        });

        this.dom.categoriesList.innerHTML = html;
    },

    createPostHTML(post) {
        const img = post.image || 'https://images.unsplash.com/photo-1639322537228-f710d846310a?q=80&w=800&auto=format&fit=crop';
        // Generate a slug or ID if missing (fallback)
        const postId = post.id || post.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

        return `
            <article class="blog-card">
                <div class="blog-thumb">
                    <img src="${img}" alt="${post.title}">
                </div>
                <div class="blog-content">
                    <div class="blog-meta">
                        <span class="category-tag">${post.category || 'General'}</span>
                        <span class="read-time">${post.readTime || '5 min'} read</span>
                    </div>
                    <h2 class="blog-title">${post.title}</h2>
                    <p class="blog-excerpt">${post.excerpt || post.content.substring(0, 100) + '...'}</p>
                    <a href="post.html?id=${postId}" class="read-more">Read More <i data-lucide="arrow-right" style="width: 16px; height: 16px;"></i></a>
                </div>
            </article>
        `;
    },

    renderPagination(totalPages) {
        if (!this.dom.pagination) return;
        if (totalPages <= 1) {
            this.dom.pagination.innerHTML = '';
            return;
        }

        let html = '';
        html += `<button class="page-btn" ${this.state.currentPage === 1 ? 'disabled style="opacity:0.5; cursor:not-allowed;"' : 'onclick="Blog.goToPage(' + (this.state.currentPage - 1) + ')"'}><i data-lucide="chevron-left" style="width: 18px; height: 18px;"></i></button>`;

        for (let i = 1; i <= totalPages; i++) {
            const activeClass = i === this.state.currentPage ? 'active' : '';
            html += `<button class="page-btn ${activeClass}" onclick="Blog.goToPage(${i})">${i}</button>`;
        }

        html += `<button class="page-btn" ${this.state.currentPage === totalPages ? 'disabled style="opacity:0.5; cursor:not-allowed;"' : 'onclick="Blog.goToPage(' + (this.state.currentPage + 1) + ')"'}><i data-lucide="chevron-right" style="width: 18px; height: 18px;"></i></button>`;

        this.dom.pagination.innerHTML = html;
    },

    goToPage(page) {
        this.state.currentPage = page;
        this.render();
        window.scrollTo({ top: document.querySelector('.blog-hero')?.offsetHeight || 0, behavior: 'smooth' });
    }
};

window.Blog = Blog;
document.addEventListener('DOMContentLoaded', () => Blog.init());
