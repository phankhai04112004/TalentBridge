/**
 * Component Loader - Load header and footer dynamically
 */

// Load header component
async function loadHeader() {
    try {
        const response = await fetch('components/header.html');
        if (!response.ok) {
            throw new Error('Failed to load header');
        }
        const html = await response.text();
        const headerPlaceholder = document.getElementById('header-placeholder');
        if (headerPlaceholder) {
            headerPlaceholder.innerHTML = html;
        }
    } catch (error) {
        console.error('Error loading header:', error);
    }
}

// Load footer component
async function loadFooter() {
    try {
        const response = await fetch('components/footer.html');
        if (!response.ok) {
            throw new Error('Failed to load footer');
        }
        const html = await response.text();
        const footerPlaceholder = document.getElementById('footer-placeholder');
        if (footerPlaceholder) {
            footerPlaceholder.innerHTML = html;
        }
    } catch (error) {
        console.error('Error loading footer:', error);
    }
}

// Load all components
async function loadComponents() {
    await Promise.all([
        loadHeader(),
        loadFooter()
    ]);
}

// Auto-load components when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadComponents);
} else {
    loadComponents();
}

