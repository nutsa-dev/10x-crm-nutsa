/**
 * 10X CRM - Global Theme & Live Clock Controller
 * ტვირთავს თემას (Light/Dark) და მართავს ჰედერის ცოცხალ საათს ყველა გვერდზე.
 */

// გვერდის ჩატვირთვისთანავე ვუშვებთ თემას და საათს
document.addEventListener('DOMContentLoaded', () => {
    applyStoredTheme();
    initGlobalClock();
});

// ==========================================================================
// 1. ცოცხალი საათის გლობალური ფუნქცია (Dashboard, Clients, Profile)
// ==========================================================================
function initGlobalClock() {
    const clockElement = document.getElementById('liveClock');
    if (!clockElement) return;

    function updateTime() {
        const now = new Date();
        clockElement.textContent = now.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
    }

    updateTime();
    setInterval(updateTime, 1000);
}

// ==========================================================================
// 2. თემის გადართვის ლოგიკა (Light / Dark Mode)
// ==========================================================================
function applyStoredTheme() {
    const savedTheme = localStorage.getItem('crm_theme') || 'light';
    const toggleBtn = document.getElementById('themeToggleBtn');

    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        if (toggleBtn) toggleBtn.textContent = '☀️';
    } else {
        document.body.classList.remove('dark-mode');
        if (toggleBtn) toggleBtn.textContent = '🌙';
    }
}

function toggleTheme() {
    const isDark = document.body.classList.toggle('dark-mode');
    const newTheme = isDark ? 'dark' : 'light';
    localStorage.setItem('crm_theme', newTheme);

    const toggleBtn = document.getElementById('themeToggleBtn');
    if (toggleBtn) {
        toggleBtn.textContent = isDark ? '☀️' : '🌙';
    }
}