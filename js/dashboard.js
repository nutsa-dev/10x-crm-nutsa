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
    const dateElement = document.getElementById('currentDate');
    if (!dateElement) return;

    function updateTime() {
        const now = new Date();

        dateElement.textContent = now.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
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

    // Proportional progress bar width rendering (delayed slightly to trigger entrance transition animation on load)
    const maxCount = Math.max(...Object.values(stageCounts), 1);
    setTimeout(() => {
        if (document.getElementById('barLead')) document.getElementById('barLead').style.width = `${(stageCounts.Lead / maxCount) * 100}%`;
        if (document.getElementById('barContacted')) document.getElementById('barContacted').style.width = `${(stageCounts.Contacted / maxCount) * 100}%`;
        if (document.getElementById('barProposal')) document.getElementById('barProposal').style.width = `${(stageCounts.Proposal / maxCount) * 100}%`;
        if (document.getElementById('barWon')) document.getElementById('barWon').style.width = `${(stageCounts.Won / maxCount) * 100}%`;
        if (document.getElementById('barLost')) document.getElementById('barLost').style.width = `${(stageCounts.Lost / maxCount) * 100}%`;
    }, 150);

    drawPipelineChart(stageCounts);
    renderRecentClientsTable(clients);
}

let pipelineChartAnimationId = null;

// Draw custom beautiful Canvas doughnut chart for pipeline infographic with transition animation
function drawPipelineChart(stageCounts) {
    const canvas = document.getElementById('pipelineCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Cancel previous animation if it is already running
    if (window.pipelineChartAnimationId) {
        cancelAnimationFrame(window.pipelineChartAnimationId);
    }
    
    const startTime = performance.now();
    const duration = 1200; // 1.2 seconds animation
    
    // Easing function: easeOutCubic
    function easeOutCubic(x) {
        return 1 - Math.pow(1 - x, 3);
    }
    
    function hexToRgb(hex) {
        const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 255, g: 85, b: 0 };
    }
    
    function interpolateColor(color1, color2, factor) {
        const c1 = hexToRgb(color1);
        const c2 = hexToRgb(color2);
        const r = Math.round(c1.r + (c2.r - c1.r) * factor);
        const g = Math.round(c1.g + (c2.g - c1.g) * factor);
        const b = Math.round(c1.b + (c2.b - c1.b) * factor);
        return `rgb(${r}, ${g}, ${b})`;
    }
    
    function animate(currentTime) {
        const elapsedTime = currentTime - startTime;
        let p = Math.min(elapsedTime / duration, 1);
        const easedP = easeOutCubic(p);
        
        renderFrame(easedP);
        
        if (p < 1) {
            window.pipelineChartAnimationId = requestAnimationFrame(animate);
        }
    }
    
    function renderFrame(p) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const total = Object.values(stageCounts).reduce((sum, c) => sum + c, 0);
        
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 20;
        const innerRadius = radius * 0.65;
        
        if (total === 0) {
            ctx.beginPath();
            ctx.arc(centerX, centerY, (radius + innerRadius) / 2, 0, 2 * Math.PI);
            ctx.strokeStyle = '#e2e8f0';
            ctx.lineWidth = radius - innerRadius;
            ctx.stroke();
            
            ctx.font = 'bold 24px Inter, sans-serif';
            ctx.fillStyle = document.body.classList.contains('dark-mode') ? '#f1f3f7' : '#2d3436';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('0', centerX, centerY - 10);
            
            ctx.font = '600 12px Inter, sans-serif';
            ctx.fillStyle = '#828a99';
            ctx.fillText('Total Clients', centerX, centerY + 15);
            return;
        }
        
        // Calculate animated stage counts (Lead/Orange is the base that other stages grow from)
        const animLead = (stageCounts.Lead || 0) * p + total * (1 - p);
        const animContacted = (stageCounts.Contacted || 0) * p;
        const animProposal = (stageCounts.Proposal || 0) * p;
        const animWon = (stageCounts.Won || 0) * p;
        const animLost = (stageCounts.Lost || 0) * p;
        
        const stages = [
            { label: 'Lead', count: animLead, targetColor: '#ff5500' },
            { label: 'Contacted', count: animContacted, targetColor: '#f59e0b' },
            { label: 'Proposal', count: animProposal, targetColor: '#8b5cf6' },
            { label: 'Won', count: animWon, targetColor: '#10b981' },
            { label: 'Lost', count: animLost, targetColor: '#ef4444' }
        ];
        
        const initialColor = '#ff5500'; // start with all orange
        
        // Start angle spins clockwise into place: starts 360 degrees behind and catches up
        let startAngle = -0.5 * Math.PI - (1 - p) * Math.PI * 2;
        
        stages.forEach(stage => {
            if (stage.count === 0) return;
            
            const sliceAngle = (stage.count / total) * 2 * Math.PI;
            const currentColor = interpolateColor(initialColor, stage.targetColor, p);
            
            ctx.beginPath();
            ctx.arc(centerX, centerY, (radius + innerRadius) / 2, startAngle, startAngle + sliceAngle);
            ctx.strokeStyle = currentColor;
            ctx.lineWidth = radius - innerRadius;
            ctx.stroke();
            
            // Draw segment separators
            const isDark = document.body.classList.contains('dark-mode');
            const borderColor = isDark ? '#1e293b' : '#f1f5f9';
            
            ctx.beginPath();
            ctx.moveTo(centerX + innerRadius * Math.cos(startAngle), centerY + innerRadius * Math.sin(startAngle));
            ctx.lineTo(centerX + radius * Math.cos(startAngle), centerY + radius * Math.sin(startAngle));
            ctx.strokeStyle = borderColor;
            ctx.lineWidth = 4;
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(centerX + innerRadius * Math.cos(startAngle + sliceAngle), centerY + innerRadius * Math.sin(startAngle + sliceAngle));
            ctx.lineTo(centerX + radius * Math.cos(startAngle + sliceAngle), centerY + radius * Math.sin(startAngle + sliceAngle));
            ctx.strokeStyle = borderColor;
            ctx.lineWidth = 4;
            ctx.stroke();
            
            startAngle += sliceAngle;
        });
        
        ctx.font = 'bold 24px Inter, sans-serif';
        ctx.fillStyle = document.body.classList.contains('dark-mode') ? '#f1f3f7' : '#2d3436';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(total, centerX, centerY - 10);
        
        ctx.font = '600 12px Inter, sans-serif';
        ctx.fillStyle = '#828a99';
        ctx.fillText('Total Clients', centerX, centerY + 15);
    }
    
    // Trigger animation
    window.pipelineChartAnimationId = requestAnimationFrame(animate);
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