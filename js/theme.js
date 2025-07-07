// Theme management for ExamSage
// Handles light/dark mode switching with localStorage persistence

class ThemeManager {
    constructor() {
        this.theme = this.getStoredTheme() || this.getPreferredTheme();
        this.init();
    }

    init() {
        // Apply initial theme
        this.applyTheme(this.theme);
        
        // Set up theme toggle listeners
        this.setupThemeToggles();
        
        // Listen for system theme changes
        this.setupSystemThemeListener();
        
        // Update theme toggle buttons
        this.updateThemeToggles();
    }

    getStoredTheme() {
        try {
            return localStorage.getItem('theme');
        } catch (e) {
            console.warn('Could not access localStorage for theme');
            return null;
        }
    }

    getPreferredTheme() {
        // Check system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    }

    setStoredTheme(theme) {
        try {
            localStorage.setItem('theme', theme);
        } catch (e) {
            console.warn('Could not save theme to localStorage');
        }
    }

    applyTheme(theme) {
        const root = document.documentElement;
        
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        
        this.theme = theme;
        this.setStoredTheme(theme);
        
        // Dispatch theme change event
        window.dispatchEvent(new CustomEvent('themechange', { 
            detail: { theme: theme } 
        }));
    }

    toggleTheme() {
        const newTheme = this.theme === 'dark' ? 'light' : 'dark';
        this.applyTheme(newTheme);
        this.updateThemeToggles();
        
        // Track theme toggle
        if (typeof trackEvent === 'function') {
            trackEvent('theme_toggle', { newTheme: newTheme });
        }
    }

    setupThemeToggles() {
        // Desktop theme toggle
        const desktopToggle = document.getElementById('theme-toggle');
        if (desktopToggle) {
            desktopToggle.addEventListener('click', () => {
                this.toggleTheme();
                this.animateToggle(desktopToggle);
            });
        }

        // Mobile theme toggle
        const mobileToggle = document.getElementById('theme-toggle-mobile');
        if (mobileToggle) {
            mobileToggle.addEventListener('click', () => {
                this.toggleTheme();
                this.animateToggle(mobileToggle);
            });
        }
    }

    updateThemeToggles() {
        const toggles = [
            document.getElementById('theme-toggle'),
            document.getElementById('theme-toggle-mobile')
        ].filter(Boolean);

        toggles.forEach(toggle => {
            const moonIcon = toggle.querySelector('.fa-moon');
            const sunIcon = toggle.querySelector('.fa-sun');

            if (this.theme === 'dark') {
                if (moonIcon) {
                    moonIcon.classList.add('hidden');
                }
                if (sunIcon) {
                    sunIcon.classList.remove('hidden');
                }
            } else {
                if (moonIcon) {
                    moonIcon.classList.remove('hidden');
                }
                if (sunIcon) {
                    sunIcon.classList.add('hidden');
                }
            }
        });
    }

    animateToggle(button) {
        // Add a subtle animation to the toggle button
        button.style.transform = 'scale(0.95)';
        button.style.transition = 'transform 0.1s ease';
        
        setTimeout(() => {
            button.style.transform = 'scale(1)';
        }, 100);
        
        setTimeout(() => {
            button.style.transition = '';
        }, 200);
    }

    setupSystemThemeListener() {
        // Listen for system theme changes
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            
            const handleChange = (e) => {
                // Only auto-switch if user hasn't manually set a preference
                const storedTheme = this.getStoredTheme();
                if (!storedTheme) {
                    const systemTheme = e.matches ? 'dark' : 'light';
                    this.applyTheme(systemTheme);
                    this.updateThemeToggles();
                }
            };

            // Modern browsers
            if (mediaQuery.addEventListener) {
                mediaQuery.addEventListener('change', handleChange);
            } 
            // Legacy browsers
            else if (mediaQuery.addListener) {
                mediaQuery.addListener(handleChange);
            }
        }
    }

    // Public method to manually set theme
    setTheme(theme) {
        if (theme === 'dark' || theme === 'light') {
            this.applyTheme(theme);
            this.updateThemeToggles();
        }
    }

    // Public method to get current theme
    getCurrentTheme() {
        return this.theme;
    }

    // Reset to system preference
    resetToSystem() {
        try {
            localStorage.removeItem('theme');
        } catch (e) {
            console.warn('Could not remove theme from localStorage');
        }
        
        const systemTheme = this.getPreferredTheme();
        this.applyTheme(systemTheme);
        this.updateThemeToggles();
    }
}

// Initialize theme manager when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Create global theme manager instance
    window.themeManager = new ThemeManager();
    
    // Add keyboard shortcuts for theme switching
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + Shift + T to toggle theme
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'T') {
            e.preventDefault();
            window.themeManager.toggleTheme();
        }
    });
});

// Utility functions for external use
window.setTheme = function(theme) {
    if (window.themeManager) {
        window.themeManager.setTheme(theme);
    }
};

window.getCurrentTheme = function() {
    return window.themeManager ? window.themeManager.getCurrentTheme() : 'light';
};

window.toggleTheme = function() {
    if (window.themeManager) {
        window.themeManager.toggleTheme();
    }
};

// Handle theme persistence across page loads
(function() {
    // Apply theme immediately to prevent flash
    const storedTheme = (() => {
        try {
            return localStorage.getItem('theme');
        } catch (e) {
            return null;
        }
    })();
    
    const preferredTheme = (() => {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    })();
    
    const theme = storedTheme || preferredTheme;
    
    if (theme === 'dark') {
        document.documentElement.classList.add('dark');
    }
})();

// CSS transition helper
const addThemeTransitions = () => {
    const css = `
        * {
            transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
        }
        
        .theme-transition-disabled * {
            transition: none !important;
        }
    `;
    
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
};

// Add transitions after initial load to prevent flash
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(addThemeTransitions, 100);
});

// Export for module usage if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ThemeManager;
}
