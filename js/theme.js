/**
 * 10X CRM - Global Theme & Live Clock Controller
 * Manages theme application, theme toggling, and updating the global header clock.
 */

document.addEventListener('DOMContentLoaded', () => {
    applyStoredTheme();
    initGlobalClock();
});

// 1. Live clock (Date | Time) updating every second
function initGlobalClock() {
    const clockElement = document.getElementById('liveClock');
    if (!clockElement) return;

    function updateTime() {
        const now = new Date();
        const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });

        // Date + Time format
        clockElement.textContent = `${dateStr}  |  ${timeStr}`;
    }

    updateTime();
    setInterval(updateTime, 1000);
}

// 2. Read stored theme and apply to document body
function applyStoredTheme() {
    // Uses the central Storage helper defined in guard.js
    const savedTheme = Storage.get(STORAGE_KEYS.THEME, 'light');
    const toggleBtns = document.querySelectorAll('#themeToggleBtn, .btn-theme-fixed');

    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        toggleBtns.forEach(btn => btn.textContent = '☀️');
    } else {
        document.body.classList.remove('dark-mode');
        toggleBtns.forEach(btn => btn.textContent = '🌙');
    }
}

// 3. Toggle dark/light mode
function toggleTheme() {
    const isDark = document.body.classList.toggle('dark-mode');
    const newTheme = isDark ? 'dark' : 'light';
    
    // Uses the central Storage helper defined in guard.js
    Storage.set(STORAGE_KEYS.THEME, newTheme);

    const toggleBtns = document.querySelectorAll('#themeToggleBtn, .btn-theme-fixed');
    toggleBtns.forEach(btn => {
        btn.textContent = isDark ? '☀️' : '🌙';
    });
}

// Make globally available for backward-compatibility with inline HTML events
window.toggleTheme = toggleTheme;
