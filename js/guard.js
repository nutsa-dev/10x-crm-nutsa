/**
 * 10X CRM - Auth Guard
 * ეს ფაილი პასუხისმგებელია გვერდების წვდომის კონტროლზე და სესიის დახურვაზე (Logout).
 */

// 1. ამოწმებს, არის თუ არა მომხმარებელი ავტორიზებული
function isAuthenticated() {
    return localStorage.getItem('crm_session') !== null;
}

// 2. დაცული გვერდების მცველი (dashboard, clients, profile)
function checkAuthForProtectedRoute() {
    if (!isAuthenticated()) {
        window.location.href = 'index.html'; // თუ სესია არ არის -> გადამისამართება ლოგინზე
    }
}

// 3. საჯარო გვერდების მცველი (login, signup, forgot-password)
function checkAuthForPublicPage() {
    if (isAuthenticated()) {
        window.location.href = 'dashboard.html'; // თუ სესია უკვე არსებობს -> გადამისამართება დეშბორდზე
    }
}

// 4. სესიის დახურვა (Logout ფუნქცია, რომელიც აკლდა!)
function logout() {
    localStorage.removeItem('crm_session'); // ვშლით მიმდინარე სესიას
    window.location.href = 'index.html'; // გადავდივართ ლოგინის გვერდზე
}

// 5. ავტომატური შემოწმება გვერდის ჩატვირთვისას (Flicker-ის თავიდან ასაცილებლად)
const currentPath = window.location.pathname;

if (currentPath.includes('dashboard.html') || currentPath.includes('clients.html') || currentPath.includes('profile.html')) {
    checkAuthForProtectedRoute();
} else if (currentPath.includes('index.html') || currentPath.includes('signup.html') || currentPath.includes('forgot-password.html') || currentPath === '/' || currentPath.endsWith('/')) {
    checkAuthForPublicPage();
}