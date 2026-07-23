/**
 * 10X CRM - Clients Management Controller
 */

// ==========================================================================
// 1. Validation Rules & Constants (Easy to edit during live exam coding!)
// ==========================================================================
const CLIENT_RULES = {
    MIN_NAME_LENGTH: 3,
    MIN_DEAL_VALUE: 0,
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
};

// Global state variables
let clientsState = [];
let currentDetailsClientId = null;
let currentFilterStatus = 'All';
let currentSearchQuery = '';
let currentSortOption = 'Newest';

// ==========================================================================
// 2. Initialization and API Sync
// ==========================================================================
async function initClients() {
    const localClients = Storage.get(STORAGE_KEYS.CLIENTS);

    if (localClients) {
        clientsState = localClients;
        applyFiltersAndRender();
    } else {
        await fetchClientsFromAPI();
    }

    document.getElementById('searchInput')?.addEventListener('input', handleSearchInput);
}

// Fetch initial database of 30 mock clients from server (P4.2)
async function fetchClientsFromAPI() {
    const container = document.getElementById('clientsContainer');
    if (container) {
        container.innerHTML = '<div class="loading-box">Loading clients...</div>';
    }

    try {
        const response = await fetch('https://dummyjson.com/users?limit=30');
        if (!response.ok) throw new Error('Network error');

        const data = await response.json();
        
        clientsState = data.users.map(user => {
            const randomDealValue = Math.floor(Math.random() * (10000 - 500 + 1)) + 500;
            const fullName = `${user.firstName} ${user.lastName}`.trim();

            return {
                id: user.id,
                name: fullName,
                phone: user.phone || '+1 555-0192',
                email: user.email.toLowerCase(),
                company: user.company ? user.company.name : 'Independent LLC',
                image: user.image || 'https://dummyjson.com/icon/emilys/128',
                status: 'Lead',
                dealValue: randomDealValue,
                notes: [],
                createdAt: new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000).toISOString()
            };
        });

        Storage.set(STORAGE_KEYS.CLIENTS, clientsState);
        applyFiltersAndRender();

    } catch (error) {
        console.error('Error fetching clients:', error);
        if (container) {
            container.innerHTML = `
                <div class="error-state-box">
                    <p>Could not load clients. Check your connection.</p>
                    <button class="btn-logout" onclick="fetchClientsFromAPI()">🔄 Retry</button>
                </div>`;
        }
    }
}

// ==========================================================================
// 3. Search, Filter, and Sort Calculations
// ==========================================================================
function getVisibleClients() {
    let result = [...clientsState];

    // Status filter chip selector logic
    if (currentFilterStatus !== 'All') {
        result = result.filter(client => client.status === currentFilterStatus);
    }

    // Search query search logic
    if (currentSearchQuery) {
        const query = currentSearchQuery.toLowerCase();
        result = result.filter(client => 
            (client.name && client.name.toLowerCase().includes(query)) || 
            (client.company && client.company.toLowerCase().includes(query)) ||
            (client.email && client.email.toLowerCase().includes(query))
        );
    }

    // Sorting options execution
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
    renderClients(getVisibleClients());
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
// 4. Rendering Clients Grid
// ==========================================================================
function renderClients(clients) {
    const container = document.getElementById('clientsContainer');
    if (!container) return;

    if (clients.length === 0) {
        container.innerHTML = '<div class="empty-state-box">No clients found matching your search.</div>';
        return;
    }

    container.innerHTML = '';

    clients.forEach(client => {
        const dealFormatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(client.dealValue || 0);

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
                    <select class="select-status-inline" onchange="updateClientStatus(${client.id}, this.value)">
                        <option value="Lead" ${client.status === 'Lead' ? 'selected' : ''}>Lead</option>
                        <option value="Contacted" ${client.status === 'Contacted' ? 'selected' : ''}>Contacted</option>
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
    clientsState = clientsState.map(client => client.id === id ? { ...client, status: newStatus } : client);
    Storage.set(STORAGE_KEYS.CLIENTS, clientsState);
    applyFiltersAndRender();
    showToast(`Status updated to ${newStatus} ✓`, true);
}

// ==========================================================================
// 5. Client Details Modal (P4.8)
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
    if (addNoteBtn) addNoteBtn.onclick = handleAddNote;
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

    Storage.set(STORAGE_KEYS.CLIENTS, clientsState);
    const updatedClient = clientsState.find(c => c.id === currentDetailsClientId);
    renderNotes(updatedClient.notes);
    input.value = '';
}

// 1-minute timeout reminder
function setOneMinReminder() {
    const client = clientsState.find(c => c.id === currentDetailsClientId);
    if (!client) return;

    showToast('Reminder set ✓', true);
    closeDetailsModal();

    setTimeout(() => {
        showToast(`🔔 Follow up: ${client.name}`, true);
    }, 60000);
}

document.getElementById('clientDetailsModal')?.addEventListener('click', function(event) {
    if (event.target === this) closeDetailsModal();
});

// ==========================================================================
// 6. Add Client Modal (P4.4)
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
    form.querySelectorAll('.error-text').forEach(el => el.textContent = '');
    form.querySelectorAll('.form-input-neo').forEach(input => input.classList.remove('input-error'));
}

// Send POST request on client creation as required by PRD
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

    // Full name validation
    if (name.length < CLIENT_RULES.MIN_NAME_LENGTH) {
        showClientError('clientName', 'clientNameError', `Name must be at least ${CLIENT_RULES.MIN_NAME_LENGTH} characters`);
        hasError = true;
    }

    // Email format validation
    if (!CLIENT_RULES.EMAIL_REGEX.test(email)) {
        showClientError('clientEmail', 'clientEmailError', 'Please enter a valid email address');
        hasError = true;
    }

    // Duplicate email verification in Local Database
    if (clientsState.some(c => c.email.toLowerCase() === email)) {
        showClientError('clientEmail', 'clientEmailError', 'A client with this email already exists');
        hasError = true;
    }

    // Company validation
    if (!company) {
        showClientError('clientCompany', 'clientCompanyError', 'Company name is required');
        hasError = true;
    }

    // Deal value validation
    if (isNaN(dealValue) || dealValue <= CLIENT_RULES.MIN_DEAL_VALUE) {
        showClientError('clientDealValue', 'clientDealValueError', 'Deal value must be a positive number');
        hasError = true;
    }

    if (hasError) return;

    const firstName = name.split(' ')[0] || name;
    const lastName = name.split(' ').slice(1).join(' ') || '';

    try {
        // Send POST request (PRD Requirement)
        const response = await fetch('https://dummyjson.com/users/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                firstName: firstName,
                lastName: lastName,
                email: email,
                phone: phone,
                company: { name: company }
            })
        });

        if (!response.ok) throw new Error('API server returned error on client add');

        const serverUser = await response.json();

        // Construct new client object using API server user template, prepend to database
        const newClient = {
            id: Date.now(), // Ensure unique id for local storage
            name: name,
            email: email,
            phone: phone || '+1 555-0192',
            company: company,
            image: serverUser.image || 'https://dummyjson.com/icon/emilys/128',
            status: status,
            dealValue: dealValue,
            notes: [],
            createdAt: new Date().toISOString()
        };

        clientsState.unshift(newClient);
        Storage.set(STORAGE_KEYS.CLIENTS, clientsState);
        applyFiltersAndRender();
        closeAddClientModal();
        showToast('Client added successfully ✓', true);

    } catch (err) {
        console.error("API error adding client:", err);
        showToast('Could not register client on the server. Try again.', false);
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

// Send DELETE request on client removal as required by PRD
async function deleteClient(id) {
    if (!confirm("Delete this client? This cannot be undone.")) return;

    try {
        // Send DELETE request (PRD Requirement)
        const response = await fetch(`https://dummyjson.com/users/${id}`, {
            method: 'DELETE'
        });

        // 404 is allowed because locally created users do not exist on the DummyJSON server
        if (!response.ok && response.status !== 404) {
            throw new Error('API server returned error on client delete');
        }
    } catch (err) {
        console.error("API error deleting client:", err);
    }

    // Always delete locally and update UI
    clientsState = clientsState.filter(client => client.id !== id);
    Storage.set(STORAGE_KEYS.CLIENTS, clientsState);
    applyFiltersAndRender();
    showToast('Client deleted', true);
}

// ==========================================================================
// 7. Security and Escaping
// ==========================================================================
function escapeHTML(str) {
    return String(str || '').replace(/[&<>"']/g, match => {
        const escapeMap = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
        return escapeMap[match];
    });
}