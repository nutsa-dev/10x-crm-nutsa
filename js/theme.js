/**
 * 10X CRM - Theme Management (Head-Optimized)
 */

// 1. მყისიერი შემოწმება DOM-ის ჩატვირთვამდე (Flicker-ის თავიდან ასაცილებლად)
(function initTheme() {
    const savedTheme = localStorage.getItem('crm_theme');
    if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark-mode'); // <html> ტეგზე ამატებს კლასს
    }
})();

// 2. გვერდის ჩატვირთვის შემდეგ აიკონების განახლება
document.addEventListener('DOMContentLoaded', () => {
    // თუ <html>-ზე არის dark-mode, body-საც გადავცეთ თავსებადობისთვის
    if (document.documentElement.classList.contains('dark-mode')) {
        document.body.classList.add('dark-mode');
    }
    updateThemeIcon();
});

// 3. თემის გადართვა
function toggleTheme() {
    const isDarkHtml = document.documentElement.classList.toggle('dark-mode');
    document.body.classList.toggle('dark-mode', isDarkHtml);
    
    localStorage.setItem('crm_theme', isDarkHtml ? 'dark' : 'light');
    updateThemeIcon();
}

// 4. აიკონის განახლება
function updateThemeIcon() {
    const toggleBtns = document.querySelectorAll('.btn-theme-fixed, #themeToggleBtn');
    const isDark = document.documentElement.classList.contains('dark-mode') || document.body.classList.contains('dark-mode');

    toggleBtns.forEach(btn => {
        if (btn) {
            btn.textContent = isDark ? '☀️' : '🌙';
        }
    });
}