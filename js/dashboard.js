/**
 * 10X CRM - Executive Dashboard Controller
 */

document.addEventListener('DOMContentLoaded', () => {
    initClock();
    renderWelcomeBanner();
    renderDashboardMetrics();
});

function initClock() {
    const clockElement = document.getElementById('liveClock');
    const dateElement = document.getElementById('currentDate');

    function updateTime() {
        const now = new Date();

        if (clockElement) {
            clockElement.textContent = now.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
            });
        }

        if (dateElement) {
            dateElement.textContent = now.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
    }

    updateTime();
    setInterval(updateTime, 1000);
}

function renderWelcomeBanner() {
    const greetingEl = document.getElementById('welcomeGreeting');
    if (!greetingEl) return;

    const sessionData = localStorage.getItem('crm_session');
    if (!sessionData) return;

    const session = JSON.parse(sessionData);
    const users = JSON.parse(localStorage.getItem('crm_users') || '[]');

    const currentUserIndex = users.findIndex(u => u.id === session.userId || u.email === session.email);
    const firstName = session.fullName ? session.fullName.split(' ')[0] : 'User';

    if (currentUserIndex !== -1 && users[currentUserIndex].isFirstLogin) {
        greetingEl.textContent = `Welcome, ${firstName}! 👋`;
        users[currentUserIndex].isFirstLogin = false;
        localStorage.setItem('crm_users', JSON.stringify(users));
    } else {
        greetingEl.textContent = `Welcome back, ${firstName}! 👋`;
    }
}

function renderDashboardMetrics() {
    const clients = JSON.parse(localStorage.getItem('crm_clients') || '[]');
    const totalClientsCount = clients.length;

    document.getElementById('totalClients').textContent = totalClientsCount;

    const activeDeals = clients.filter(c => ['Lead', 'Contacted', 'Proposal'].includes(c.status));
    document.getElementById('activeDeals').textContent = activeDeals.length;

    const totalValue = clients.reduce((sum, c) => sum + (parseFloat(c.budget) || parseFloat(c.dealValue) || 0), 0);
    document.getElementById('totalRevenue').textContent = `$${totalValue.toLocaleString('en-US')}`;

    const wonClients = clients.filter(c => c.status === 'Won').length;
    const winRate = totalClientsCount > 0 ? Math.round((wonClients / totalClientsCount) * 100) : 0;
    document.getElementById('conversionRate').textContent = `${winRate}%`;

    // Pipeline რაოდენობები
    const stageCounts = { Lead: 0, Contacted: 0, Proposal: 0, Won: 0, Lost: 0 };
    clients.forEach(c => {
        if (stageCounts.hasOwnProperty(c.status)) {
            stageCounts[c.status]++;
        }
    });

    // რიცხვების ჩაწერა
    document.getElementById('countLead').textContent = stageCounts.Lead;
    document.getElementById('countContacted').textContent = stageCounts.Contacted;
    document.getElementById('countProposal').textContent = stageCounts.Proposal;
    document.getElementById('countWon').textContent = stageCounts.Won;
    document.getElementById('countLost').textContent = stageCounts.Lost;

    // 📊 ინფოგრაფიკის პროგრეს-ბარების პროპორციული გამოთვლა %-ებში
    const maxCount = Math.max(...Object.values(stageCounts), 1); // ნულზე გაყოფის თავიდან ასაცილებლად

    document.getElementById('barLead').style.width = `${(stageCounts.Lead / maxCount) * 100}%`;
    document.getElementById('barContacted').style.width = `${(stageCounts.Contacted / maxCount) * 100}%`;
    document.getElementById('barProposal').style.width = `${(stageCounts.Proposal / maxCount) * 100}%`;
    document.getElementById('barWon').style.width = `${(stageCounts.Won / maxCount) * 100}%`;
    document.getElementById('barLost').style.width = `${(stageCounts.Lost / maxCount) * 100}%`;

    renderRecentClientsTable(clients);
}

function renderRecentClientsTable(clients) {
    const tableBody = document.getElementById('recentClientsTable');
    if (!tableBody) return;

    if (clients.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; color: var(--text-muted); padding: 1.5rem;">
                    No clients added yet. <a href="clients.html" style="color: var(--accent-orange);">Add your first client</a>
                </td>
            </tr>
        `;
        return;
    }

    const recentClients = [...clients]
        .sort((a, b) => new Date(b.createdAt || b.id) - new Date(a.createdAt || a.id))
        .slice(0, 5);

    tableBody.innerHTML = recentClients.map(client => {
        const addedDate = client.createdAt 
            ? new Date(client.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            : 'N/A';

        const statusClass = `badge-${(client.status || 'lead').toLowerCase()}`;

        return `
            <tr>
                <td><strong>${escapeHTML(client.name || 'Unnamed')}</strong></td>
                <td>${escapeHTML(client.company || '-')}</td>
                <td><span class="status-badge ${statusClass}">${client.status || 'Lead'}</span></td>
                <td>${addedDate}</td>
            </tr>
        `;
    }).join('');
}

function escapeHTML(str) {
    return String(str).replace(/[&<>"']/g, match => {
        const escapeMap = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
        return escapeMap[match];
    });
}