// Initialize Lucide Icons
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();

    // Navbar Effect on Scroll
    const header = document.querySelector('.navbar-header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.style.background = 'var(--bg-nav)';
                header.style.backdropFilter = 'blur(var(--glass-blur))';
                header.style.padding = '0.5rem 0';
                header.style.boxShadow = 'var(--shadow-lg)';
            } else {
                header.style.background = 'transparent';
                header.style.backdropFilter = 'none';
                header.style.padding = '1rem 0';
                header.style.boxShadow = 'none';
            }
        });
    }

    // Reveal animations on scroll
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe all sections and elements with the 'reveal' class
    const elementsToReveal = [...document.querySelectorAll('section'), ...document.querySelectorAll('.reveal')];
    elementsToReveal.forEach(el => {
        if (!el.classList.contains('reveal')) el.classList.add('reveal');
        observer.observe(el);
    });
});
