// Breadcrumb Navigation Component
// Provides consistent navigation path display across all pages

class BreadcrumbManager {
    /**
     * Renders breadcrumb navigation
     * @param {Array} path - Array of breadcrumb items [{name: 'Dashboard', url: 'index.html#dashboard'}, ...]
     * @returns {string} HTML string for breadcrumb
     */
    static render(path) {
        if (!path || path.length === 0) return '';
        
        const items = path.map((item, index) => {
            const isLast = index === path.length - 1;
            
            if (isLast) {
                return `<span class="breadcrumb-current">${item.name}</span>`;
            } else {
                return `
                    <span class="breadcrumb-item">
                        <a href="${item.url}" class="breadcrumb-link">${item.name}</a>
                        <span class="breadcrumb-separator">›</span>
                    </span>
                `;
            }
        }).join('');
        
        return `<nav class="breadcrumb">${items}</nav>`;
    }
    
    /**
     * Injects breadcrumb into page
     * @param {Array} path - Breadcrumb path array
     * @param {string} containerId - ID of container element
     */
    static inject(path, containerId = 'breadcrumb-container') {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = this.render(path);
        }
    }
    
    /**
     * Get standard breadcrumb paths for common pages
     * @param {string} page - Page identifier
     * @returns {Array} Breadcrumb path array
     */
    static getPath(page) {
        const paths = {
            'dashboard': [
                { name: 'Dashboard', url: 'index.html#dashboard' }
            ],
            'signals': [
                { name: 'Dashboard', url: 'index.html#dashboard' },
                { name: 'Signals', url: 'signals.html' }
            ],
            'pipeline': [
                { name: 'Dashboard', url: 'index.html#dashboard' },
                { name: 'Pipeline', url: 'pipeline.html' }
            ],
            'strategies': [
                { name: 'Dashboard', url: 'index.html#dashboard' },
                { name: 'Strategy & Targets', url: '#' },
                { name: 'Strategies', url: 'strategies.html' }
            ],
            'campaigns': [
                { name: 'Dashboard', url: 'index.html#dashboard' },
                { name: 'Campaigns', url: 'index.html#campaigns' }
            ],
            'posts': [
                { name: 'Dashboard', url: 'index.html#dashboard' },
                { name: 'Posts', url: 'index.html#posts' }
            ],
            'people': [
                { name: 'Dashboard', url: 'index.html#dashboard' },
                { name: 'People', url: 'index.html#people' }
            ],
            'companies': [
                { name: 'Dashboard', url: 'index.html#dashboard' },
                { name: 'Companies', url: 'index.html#companies' }
            ],
            'audiences': [
                { name: 'Dashboard', url: 'index.html#dashboard' },
                { name: 'Strategy & Targets', url: '#' },
                { name: 'Audiences', url: 'audiences.html' }
            ],
            'personas': [
                { name: 'Dashboard', url: 'index.html#dashboard' },
                { name: 'Strategy & Targets', url: '#' },
                { name: 'Personas', url: 'personas.html' }
            ],
            'content-calendar': [
                { name: 'Dashboard', url: 'index.html#dashboard' },
                { name: 'Posts', url: 'index.html#posts' },
                { name: 'Content Calendar', url: 'content-calendar.html' }
            ]
        };
        
        return paths[page] || [];
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BreadcrumbManager;
}