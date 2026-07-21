/**
 * 10X CRM - Auth Guard (P0.1)
 * ეს ფაილი პასუხისმგებელია გვერდების წვდომის კონტროლზე.
 * იგი მოწმდება ჩატვირთვისთანავე, რათა თავიდან ავიცილოთ ეკრანის "ციმციმი".
 */

// ამოწმებს, არის თუ არა მომხმარებელი ავტორიზებული
function isAuthenticated() {
    return localStorage.getItem('crm_session') !== null;
}

// დაცული გვერდების მცველი (dashboard, clients, profile) 
function checkAuthForProtectedRoute() {
    if (!isAuthenticated()) {
        window.location.href = 'index.html'; // თუ სესია არ არის -> გადამისამართება ლოგინზე [cite: 171, 172]
    }
}

// საჯარო გვერდების მცველი (login, signup) [cite: 173]
function checkAuthForPublicPage() {
    if (isAuthenticated()) {
        window.location.href = 'dashboard.html'; // თუ სესია უკვე არსებობს -> გადამისამართება დეშბორდზე [cite: 173]
    }
}

// უშუალოდ გაშვება გვერდის ტიპის მიხედვით (სანამ DOM სრულად ჩაიტვირთება)
const currentPath = window.location.pathname;
if (currentPath.includes('dashboard.html') || currentPath.includes('clients.html') || currentPath.includes('profile.html')) {
    checkAuthForProtectedRoute();
} else if (currentPath.includes('index.html') || currentPath.includes('signup.html') || currentPath === '/' || currentPath.endsWith('/')) {
    checkAuthForPublicPage();
}