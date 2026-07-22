/**
 * 10X CRM - Clients Management Controller
 * ოქროს ციკლის ლოგიკა: LocalStorage -> API (GET, POST, DELETE) -> Render -> Sync
 */

let clientsState = [];
let currentDetailsClientId = null;

// ფილტრაციის საწყისი მდგომარეობა
let currentFilterStatus = 'All';
let currentSearchQuery = '';
let currentSortOption = 'Newest';

// ==========================================================================
// 1. ინიციალიზაცია და API-დან წამოღება (P4.2)
// ==========================================================================
async function initClients() {
    initClock(); // Header Clock
    const localClients = localStorage.getItem('crm_clients');

    if (localClients) {
        clientsState = JSON.parse(localClients);
        applyFiltersAndRender();
    } else {
        await fetchClientsFromAPI();
    }

    document.getElementById('searchInput')?.addEventListener('input', handleSearchInput);
}

// ცოცხალი საათის ფუნქცია Header-ისთვის
function initClock() {
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

// ჩატვირთვა API-დან + Error Handling (P4.2)
async function fetchClientsFromAPI() {
    const container = document.getElementById('clientsContainer');
    if (container) {
        container.innerHTML = '<div class="loading-box">Loading clients...</div>';
    }

    try {
        const response = await fetch('https://dummyjson.com/users?limit=30');
        
        if (!response.ok) {
            throw new Error('Network response failed');
        }

        const data = await response.json();
        
        clientsState = data.users.map(user => {
            const randomDealValue = Math.floor(Math.random() * (10000 - 500 + 1)) + 500;
            const fullName = `${user.firstName} ${user.lastName}`.trim();

            return {
                id: user.id,
                name: fullName,
                phone: user.phone || '+1 555-0192',
                email: user.email.toLowerCase(),
                company: user.company ? user.company.name : 'Acme Corporation',
                image: user.image || `https://dummyjson.com/icon/emilys/128`,
                status: 'Lead',
                dealValue: randomDealValue,
                notes: [],
                createdAt: new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000).toISOString()
            };
        });

        localStorage.setItem('crm_clients', JSON.stringify(clientsState));
        applyFiltersAndRender();

    } catch (error) {
        console.error('Error fetching clients:', error);
        if (container) {
            container.innerHTML = `
                <div class="error-state-box">
                    <p>Could not load clients. Check your connection and try again.</p>
                    <button class="btn-logout" onclick="fetchClientsFromAPI()">🔄 Retry</button>
                </div>`;
        }
    }
}


// ==========================================================================
// 2. ფილტრაცია, ძებნა და სორტირება (P4.7)
// ==========================================================================
function getVisibleClients() {
    let result = [...clientsState];

    // ა. ფილტრაცია სტატუსით
    if (currentFilterStatus !== 'All') {
        result = result.filter(client => client.status === currentFilterStatus);
    }

    // ბ. ძებნა სახელის, კომპანიის ან მეილის მიხედვით
    if (currentSearchQuery) {
        const query = currentSearchQuery.toLowerCase();
        result = result.filter(client => 
            (client.name && client.name.toLowerCase().includes(query)) || 
            (client.company && client.company.toLowerCase().includes(query)) ||
            (client.email && client.email.toLowerCase().includes(query))
        );
    }

    // გ. სორტირება
    if (currentSortOption === 'Newest') {
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (currentSortOption === 'Name') {
        result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (currentSortOption === 'DealValue') {
        result.sort((a, b) => (b.dealValue || 0) - (a.dealValue || 0));
    }

    return result;
}

function applyFiltersAndRender() {
    const visibleClients = getVisibleClients();
    renderClients(visibleClients);
}

function filterByStatus(status) {
    currentFilterStatus = status;
    const chips = document.querySelectorAll('.filter-chips .chip');
    chips.forEach(chip => {
        if (chip.getAttribute('data-status') === status) {
            chip.classList.add('active');
        } else {
            chip.classList.remove('active');
        }
    });
    applyFiltersAndRender();
}

function handleSearchInput(event) {
    currentSearchQuery = event.target.value.trim();
    applyFiltersAndRender();
}

function handleSortChange() {
    const select = document.getElementById('sortSelect');
    if (select) {
        currentSortOption = select.value;
        applyFiltersAndRender();
    }
}


// ==========================================================================
// 3. ბარათების რენდერინგი DOM-ში (P4.3)
// ==========================================================================
function renderClients(clients) {
    const container = document.getElementById('clientsContainer');
    if (!container) return;

    if (clients.length === 0) {
        container.innerHTML = '<div class="empty-state-box">No clients found matching your search criteria.</div>';
        return;
    }

    container.innerHTML = '';

    clients.forEach(client => {
        const dealFormatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(client.dealValue || 0);
        const statusClass = `badge-${(client.status || 'lead').toLowerCase()}`;

        const cardHTML = `
            <div class="client-card" data-id="${client.id}" onclick="openDetailsModal(${client.id})">
                <div class="client-card-header">
                    <img src="${escapeHTML(client.image)}" alt="${escapeHTML(client.name)}" class="client-avatar" onerror="this.src='https://dummyjson.com/icon/emilys/128'">
                    <div class="client-title-info">
                        <h3>${escapeHTML(client.name)}</h3>
                        <span class="client-company-name">${escapeHTML(client.company)}</span>
                    </div>
                </div>

                <div class="client-card-body">
                    <div class="card-info-row">
                        <span>Email:</span>
                        <strong>${escapeHTML(client.email)}</strong>
                    </div>
                    <div class="card-info-row">
                        <span>Phone:</span>
                        <strong>${escapeHTML(client.phone)}</strong>
                    </div>
                    <div class="card-info-row">
                        <span>Value:</span>
                        <strong class="deal-value-text">${dealFormatted}</strong>
                    </div>
                </div>

                <div class="client-card-footer" onclick="event.stopPropagation()">
                    <select class="select-status-inline ${statusClass}" onchange="updateClientStatus(${client.id}, this.value)">
                        <option value="Lead" ${client.status === 'Lead' ? 'selected' : ''}>Lead</option>
                        <option value="Contacted" ${client.status === 'Contacted' ? 'selected' : ''}>Contacted</option>
                        <option value="Proposal" ${client.status === 'Proposal' ? 'selected' : ''}>Proposal</option>
                        <option value="Won" ${client.status === 'Won' ? 'selected' : ''}>Won</option>
                        <option value="Lost" ${client.status === 'Lost' ? 'selected' : ''}>Lost</option>
                    </select>
                    
                    <button type="button" class="btn-delete-client" onclick="deleteClient(${client.id})">Delete</button>
                </div>
            </div>
        `;

        container.insertAdjacentHTML('beforeend', cardHTML);
    });
}

function updateClientStatus(id, newStatus) {
    clientsState = clientsState.map(client => {
        if (client.id === id) {
            return { ...client, status: newStatus };
        }
        return client;
    });

    localStorage.setItem('crm_clients', JSON.stringify(clientsState));
    applyFiltersAndRender();
    showGlobalToast(`Status updated to ${newStatus} ✓`, true);
}


// ==========================================================================
// 4. კლიენტის დეტალების მოდალი და შენიშვნები (P4.8)
// ==========================================================================
function openDetailsModal(id) {
    const client = clientsState.find(c => c.id === id);
    if (!client) return;

    currentDetailsClientId = id;

    document.getElementById('detAvatar').src = client.image || 'https://dummyjson.com/icon/emilys/128';
    document.getElementById('detName').textContent = client.name;
    document.getElementById('detCompany').textContent = client.company;
    document.getElementById('detEmail').textContent = client.email;
    document.getElementById('detPhone').textContent = client.phone || 'N/A';
    
    const dateFormatted = client.createdAt 
        ? new Date(client.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : 'N/A';
        
    document.getElementById('detMeta').textContent = `${client.status} • Client since ${dateFormatted}`;

    renderNotes(client.notes);

    document.getElementById('clientDetailsModal').style.display = 'flex';

    const addNoteBtn = document.getElementById('addNoteBtn');
    addNoteBtn.onclick = handleAddNote;
}

function closeDetailsModal() {
    document.getElementById('clientDetailsModal').style.display = 'none';
    document.getElementById('newNoteInput').value = '';
    currentDetailsClientId = null;
}

function renderNotes(notes) {
    const container = document.getElementById('notesContainer');
    if (!container) return;

    if (!notes || notes.length === 0) {
        container.innerHTML = '<p class="no-notes-text">No notes recorded yet.</p>';
        return;
    }

    container.innerHTML = '';
    notes.forEach(note => {
        const noteHTML = `
            <div class="note-item">
                <p class="note-text">${escapeHTML(note.text)}</p>
                <span class="note-date">${note.date}</span>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', noteHTML);
    });
}

function handleAddNote() {
    const input = document.getElementById('newNoteInput');
    const text = input.value.trim();

    if (!text) return;

    clientsState = clientsState.map(client => {
        if (client.id === currentDetailsClientId) {
            const updatedNotes = [...(client.notes || [])];
            updatedNotes.push({
                text: text,
                date: new Date().toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' })
            });
            return { ...client, notes: updatedNotes };
        }
        return client;
    });

    localStorage.setItem('crm_clients', JSON.stringify(clientsState));
    
    const updatedClient = clientsState.find(c => c.id === currentDetailsClientId);
    renderNotes(updatedClient.notes);
    input.value = '';
}

function setOneMinReminder() {
    const client = clientsState.find(c => c.id === currentDetailsClientId);
    if (!client) return;

    showGlobalToast('Reminder set ✓', true);
    closeDetailsModal();

    setTimeout(() => {
        showGlobalToast(`🔔 Follow up: ${client.name}`, true);
    }, 60000);
}

document.getElementById('clientDetailsModal')?.addEventListener('click', function(event) {
    if (event.target === this) closeDetailsModal();
});


// ==========================================================================
// 5. ახალი კლიენტის დამატების მოდალი (P4.4, P4.5)
// ==========================================================================
function openAddClientModal() {
    const modal = document.getElementById('addClientModal');
    if (modal) {
        modal.style.display = 'flex';
        clearClientFormErrors();
    }
}

function closeAddClientModal() {
    const modal = document.getElementById('addClientModal');
    if (modal) {
        modal.style.display = 'none';
        document.getElementById('addClientForm').reset();
    }
}

document.getElementById('addClientModal')?.addEventListener('click', function(event) {
    if (event.target === this) closeAddClientModal();
});

function clearClientFormErrors() {
    const form = document.getElementById('addClientForm');
    if (!form) return;
    const errorTexts = form.querySelectorAll('.error-text');
    errorTexts.forEach(el => el.textContent = '');
    
    const inputs = form.querySelectorAll('.form-input-neo');
    inputs.forEach(input => input.classList.remove('input-error'));
}

async function handleAddClient(event) {
    event.preventDefault();
    clearClientFormErrors();

    const name = document.getElementById('clientName').value.trim();
    const email = document.getElementById('clientEmail').value.trim().toLowerCase();
    const phone = document.getElementById('clientPhone').value.trim();
    const company = document.getElementById('clientCompany').value.trim();
    const dealValue = parseFloat(document.getElementById('clientDealValue').value);
    const status = document.getElementById('clientStatus').value;

    let hasError = false;

    if (name.length < 3) {
        showClientError('clientName', 'clientNameError', 'Name must be at least 3 characters');
        hasError = true;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showClientError('clientEmail', 'clientEmailError', 'Please enter a valid email address');
        hasError = true;
    } else {
        const emailExists = clientsState.some(c => c.email.toLowerCase() === email);
        if (emailExists) {
            showClientError('clientEmail', 'clientEmailError', 'A client with this email already exists');
            hasError = true;
        }
    }

    if (phone.length > 0 && phone.length < 6) {
        showClientError('clientPhone', 'clientPhoneError', 'Phone number looks too short');
        hasError = true;
    }

    if (!company) {
        showClientError('clientCompany', 'clientCompanyError', 'Company name is required');
        hasError = true;
    }

    if (isNaN(dealValue) || dealValue <= 0) {
        showClientError('clientDealValue', 'clientDealValueError', 'Deal value must be a positive number');
        hasError = true;
    }

    if (hasError) return;

    try {
        const response = await fetch('https://dummyjson.com/users/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                firstName: name.split(' ')[0],
                lastName: name.split(' ')[1] || '',
                email: email,
                phone: phone,
                company: { name: company }
            })
        });

        const newClient = {
            id: Date.now(),
            name: name,
            email: email,
            phone: phone || '+1 555-0192',
            company: company,
            image: `https://dummyjson.com/icon/emilys/128`,
            status: status,
            dealValue: dealValue,
            notes: [],
            createdAt: new Date().toISOString()
        };

        clientsState.unshift(newClient);
        localStorage.setItem('crm_clients', JSON.stringify(clientsState));
        
        applyFiltersAndRender();
        closeAddClientModal();
        showGlobalToast('Client added successfully ✓', true);

    } catch (error) {
        console.error('Error adding client:', error);
        showGlobalToast('Could not save client. Try again.', false);
    }
}

function showClientError(inputId, errorId, message) {
    const input = document.getElementById(inputId);
    const err = document.getElementById(errorId);
    if (input && err) {
        input.classList.add('input-error');
        err.textContent = message;
    }
}


// ==========================================================================
// 6. კლიენტის წაშლა (P4.5)
// ==========================================================================
async function deleteClient(id) {
    const confirmed = confirm("Delete this client? This cannot be undone.");
    if (!confirmed) return;

    try {
        await fetch(`https://dummyjson.com/users/${id}`, {
            method: 'DELETE'
        });

        clientsState = clientsState.filter(client => client.id !== id);
        localStorage.setItem('crm_clients', JSON.stringify(clientsState));
        
        applyFiltersAndRender();
        showGlobalToast('Client deleted', true);

    } catch (error) {
        console.error('Error deleting client:', error);
        // 404-ის შემთხვევაშიც ვშლით State-იდან (DummyJSON შეზღუდვა)
        clientsState = clientsState.filter(client => client.id !== id);
        localStorage.setItem('crm_clients', JSON.stringify(clientsState));
        applyFiltersAndRender();
        showGlobalToast('Client deleted from local session', true);
    }
}


// ==========================================================================
// 7. TOAST SHELTER SYSTEM
// ==========================================================================
function showGlobalToast(message, isSuccess = true) {
    const toast = document.getElementById('toast');
    if (toast) {
        toast.textContent = message;
        toast.style.display = 'block';
        toast.style.color = isSuccess ? 'var(--accent-orange)' : 'var(--danger-color)';

        setTimeout(() => {
            toast.style.display = 'none';
        }, 3000);
    }
}

function escapeHTML(str) {
    return String(str || '').replace(/[&<>"']/g, match => {
        const escapeMap = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
        return escapeMap[match];
    });
}