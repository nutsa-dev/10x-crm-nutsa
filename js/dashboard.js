/**
 * 10X CRM - Executive Dashboard Controller (P3 - FULL)
 * Updates metrics cards, pipeline graphics, and populates the recent clients table.
 */

document.addEventListener('DOMContentLoaded', () => {
    initClock();
    renderWelcomeBanner();
    renderDashboardMetrics();
});

// 1. Clock and date initialization in greeting section
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

// 2. Personalised user greeting banner based on active session
function renderWelcomeBanner() {
    const greetingEl = document.getElementById('welcomeGreeting');
    if (!greetingEl) return;

    // Use centralized Storage utility (guard.js)
    const session = Storage.get(STORAGE_KEYS.SESSION);
    if (!session) return;

    const users = Storage.get(STORAGE_KEYS.USERS, []);

    const currentUserIndex = users.findIndex(u => u.id === session.userId || u.email === session.email);
    const firstName = session.fullName ? session.fullName.split(' ')[0] : 'User';

    if (currentUserIndex !== -1 && users[currentUserIndex].isFirstLogin) {
        greetingEl.textContent = `Welcome, ${firstName}!`;
        users[currentUserIndex].isFirstLogin = false;
        Storage.set(STORAGE_KEYS.USERS, users);
    } else {
        greetingEl.textContent = `Welcome back, ${firstName}!`;
    }
}

// 3. Metric card and Pipeline value calculations
function renderDashboardMetrics() {
    // Use centralized Storage utility (guard.js)
    const clients = Storage.get(STORAGE_KEYS.CLIENTS, []);
    const totalClientsCount = clients.length;

    // 3.1. Total Clients
    document.getElementById('totalClients').textContent = totalClientsCount;

    // 3.2. Active Deals count
    const activeDeals = clients.filter(c => ['Lead', 'Contacted', 'Proposal'].includes(c.status));
    document.getElementById('activeDeals').textContent = activeDeals.length;

    // 3.3. Pipeline Value sum
    const totalValue = clients.reduce((sum, c) => sum + (parseFloat(c.dealValue) || parseFloat(c.budget) || 0), 0);
    document.getElementById('totalRevenue').textContent = `$${totalValue.toLocaleString('en-US')}`;

    // 3.4. Win Rate ratio
    const wonClients = clients.filter(c => c.status === 'Won').length;
    const winRate = totalClientsCount > 0 ? Math.round((wonClients / totalClientsCount) * 100) : 0;
    document.getElementById('conversionRate').textContent = `${winRate}%`;

    // 3.5. Pipeline distribution calculations
    const stageCounts = { Lead: 0, Contacted: 0, Proposal: 0, Won: 0, Lost: 0 };
    clients.forEach(c => {
        if (stageCounts.hasOwnProperty(c.status)) {
            stageCounts[c.status]++;
        }
    });

    document.getElementById('countLead').textContent = stageCounts.Lead;
    document.getElementById('countContacted').textContent = stageCounts.Contacted;
    document.getElementById('countProposal').textContent = stageCounts.Proposal;
    document.getElementById('countWon').textContent = stageCounts.Won;
    document.getElementById('countLost').textContent = stageCounts.Lost;

    // Proportional progress bar width rendering
    const maxCount = Math.max(...Object.values(stageCounts), 1);
    if (document.getElementById('barLead')) document.getElementById('barLead').style.width = `${(stageCounts.Lead / maxCount) * 100}%`;
    if (document.getElementById('barContacted')) document.getElementById('barContacted').style.width = `${(stageCounts.Contacted / maxCount) * 100}%`;
    if (document.getElementById('barProposal')) document.getElementById('barProposal').style.width = `${(stageCounts.Proposal / maxCount) * 100}%`;
    if (document.getElementById('barWon')) document.getElementById('barWon').style.width = `${(stageCounts.Won / maxCount) * 100}%`;
    if (document.getElementById('barLost')) document.getElementById('barLost').style.width = `${(stageCounts.Lost / maxCount) * 100}%`;

    renderRecentClientsTable(clients);
}

// 4. Populate top 5 recently registered clients
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

// Helper to sanitize HTML strings
function escapeHTML(str) {
    return String(str || '').replace(/[&<>"']/g, match => {
        const escapeMap = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
        return escapeMap[match];
    });
}