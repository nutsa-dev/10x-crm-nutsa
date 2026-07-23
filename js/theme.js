/**
 * 10X CRM - Global Theme & Live Clock Controller
 * Manages theme application, theme toggling, and updating the global header clock.
 */

// Avoid initial transitions on page load
document.documentElement.classList.add('no-transitions');
window.addEventListener('load', () => {
    setTimeout(() => {
        document.documentElement.classList.remove('no-transitions');
    }, 100);
});

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
    playASMRPop();
    const isDark = document.body.classList.toggle('dark-mode');
    const newTheme = isDark ? 'dark' : 'light';
    
    // Uses the central Storage helper defined in guard.js
    Storage.set(STORAGE_KEYS.THEME, newTheme);

    const toggleBtns = document.querySelectorAll('#themeToggleBtn, .btn-theme-fixed');
    toggleBtns.forEach(btn => {
        btn.textContent = isDark ? '☀️' : '🌙';
    });
    
    // Refresh dashboard chart colors dynamically
    if (typeof renderDashboardMetrics === 'function') {
        renderDashboardMetrics();
    }
}

// Make globally available for backward-compatibility with inline HTML events
window.toggleTheme = toggleTheme;

// Web Audio API ASMR Click Pop Feedback
function playASMRPop() {
    try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(180, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.05);
        
        gain.gain.setValueAtTime(0.015, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
        
        osc.start();
        osc.stop(ctx.currentTime + 0.05);
    } catch (e) {
        // AudioContext browser permission block
    }
}
window.playASMRPop = playASMRPop;
