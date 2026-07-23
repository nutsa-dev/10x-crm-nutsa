/**
 * 10X CRM - Auth Guard & Common Utilities
 * This file is responsible for page route protection, centralized storage helpers,
 * shared toast notifications, and handling user sessions (Logout).
 */

// ==========================================================================
// 1. Central Storage & Configuration Constants
// ==========================================================================
const STORAGE_KEYS = {
    USERS: 'crm_users',
    SESSION: 'crm_session',
    CLIENTS: 'crm_clients',
    THEME: 'crm_theme'
};

const Storage = {
    get(key, defaultValue = null) {
        try {
            if (key === STORAGE_KEYS.SESSION) {
                let data = sessionStorage.getItem(key);
                if (!data) {
                    data = localStorage.getItem(key);
                }
                return data ? JSON.parse(data) : defaultValue;
            }
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (error) {
            console.error(`Error reading ${key} from storage:`, error);
            return defaultValue;
        }
    },
    set(key, value, persist = true) {
        try {
            if (key === STORAGE_KEYS.SESSION) {
                if (persist) {
                    localStorage.setItem(key, JSON.stringify(value));
                    sessionStorage.removeItem(key);
                } else {
                    sessionStorage.setItem(key, JSON.stringify(value));
                    localStorage.removeItem(key);
                }
                return;
            }
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error(`Error saving ${key} to storage:`, error);
        }
    },
    remove(key) {
        localStorage.removeItem(key);
        if (key === STORAGE_KEYS.SESSION) {
            sessionStorage.removeItem(key);
        }
    }
};

// ==========================================================================
// 2. Centralized Toast Notification System
// ==========================================================================
function showToast(message, isSuccess = true) {
    const toast = document.getElementById('toast');
    if (!toast) return;

    toast.textContent = message;
    toast.style.color = isSuccess ? 'var(--accent-orange)' : 'var(--danger-color)';
    toast.classList.add('show');

    // Clear previous timeout if user triggers multiple toasts in sequence
    if (window.toastTimeout) {
        clearTimeout(window.toastTimeout);
    }
    
    window.toastTimeout = setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Ensure other files can call it easily under different names temporarily
window.showToast = showToast;
window.showGlobalToast = showToast;
window.showProfileToast = showToast;

// ==========================================================================
// 3. Routing & Authentication Guard
// ==========================================================================
function isAuthenticated() {
    return Storage.get(STORAGE_KEYS.SESSION) !== null;
}

// Keep functions globally accessible
window.isAuthenticated = isAuthenticated;

function checkAuthForProtectedRoute() {
    if (!isAuthenticated()) {
        window.location.href = 'index.html'; // Redirect to login if not authenticated
    }
}

function checkAuthForPublicPage() {
    if (isAuthenticated()) {
        window.location.href = 'dashboard.html'; // Redirect to dashboard if already logged in
    }
}

// Session Logout logic
function logout() {
    Storage.remove(STORAGE_KEYS.SESSION);
    window.location.href = 'index.html';
}

// Make logout globally available for any inline onclick attributes
window.logout = logout;

// Route checking supporting both HTML extensions and extensionless paths (Netlify/Vercel)
const currentPath = window.location.pathname.toLowerCase();
const protectedRoutes = ['dashboard', 'clients', 'profile'];
const publicRoutes = ['index', 'signup', 'forgot-password'];

const isProtectedRoute = protectedRoutes.some(route => currentPath.includes(route));
const isPublicRoute = publicRoutes.some(route => currentPath.includes(route)) || currentPath === '/' || currentPath.endsWith('/');

if (isProtectedRoute) {
    checkAuthForProtectedRoute();
} else if (isPublicRoute) {
    checkAuthForPublicPage();
}