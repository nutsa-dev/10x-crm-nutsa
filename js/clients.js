/**
 * 10X CRM - Clients Management (Day 5 - COMPLETE Edition)
 */

let clientsState = [];
let currentDetailsClientId = null;

// ფილტრაციის მიმდინარე მდგომარეობა
let currentFilterStatus = 'All';
let currentSearchQuery = '';
let currentSortOption = 'Newest';

async function initClients() {
    const localClients = localStorage.getItem('crm_clients');

    if (localClients) {
        clientsState = JSON.parse(localClients);
        applyFiltersAndRender();
    } else {
        await fetchClientsFromAPI();
    }

    document.getElementById('searchInput')?.addEventListener('input', handleSearchInput);
}

// ჩატვირთვა API-დან + Error Handling (P4.2)
async function fetchClientsFromAPI() {
    const container = document.getElementById('clientsContainer');

    if (container) {
        container.innerHTML = '<div class="loading-box" id="loadingIndicator">Loading clients...</div>';
    }

    try {
        const response = await fetch('https://dummyjson.com/users?limit=30');
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        
        clientsState = data.users.map(user => {
            const randomDealValue = Math.floor(Math.random() * (10000 - 500 + 1)) + 500;
            
            return {
                id: user.id,
                name: `${user.firstName}${user.lastName}`,
                phone: user.phone,
                email: user.email,
                company: user.company ? user.company.name : 'Independent LLC',
                image: user.image,
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
            // Error Handling: Retry ღილაკით (P4.2)
            container.innerHTML = `
                <div class="loading-box" style="color: var(--danger-color); display: flex; flex-direction: column; gap: 16px; align-items: center;">
                    <p>Could not load clients. Check your connection and try again.</p>
                    <button class="btn-logout" style="width: auto; padding: 10px 20px; font-size: 15px;" onclick="fetchClientsFromAPI()">🔄 Retry</button>
                </div>`;
        }
    }
}

// ფილტრების გატარება
function getVisibleClients() {
    let result = [...clientsState];

    if (currentFilterStatus !== 'All') {
        result = result.filter(client => client.status === currentFilterStatus);
    }

    if (currentSearchQuery) {
        const query = currentSearchQuery.toLowerCase();
        result = result.filter(client => 
            client.name.toLowerCase().includes(query) || 
            client.company.toLowerCase().includes(query)
        );
    }

    if (currentSortOption === 'Newest') {
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (currentSortOption === 'Name') {
        result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (currentSortOption === 'DealValue') {
        result.sort((a, b) => b.dealValue - a.dealValue);
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

// ბარათების რენდერი (ბარათზე დაკლიკებით იხსნება დეტალები) (P4.8)
function renderClients(clients) {
    const container = document.getElementById('clientsContainer');
    if (!container) return;

    if (clients.length === 0) {
        container.innerHTML = '<div class="loading-box">No clients found.</div>';
        return;
    }

    container.innerHTML = '';

    clients.forEach(client => {
        const dealFormatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(client.dealValue);
        const statusClass = `status-${client.status.toLowerCase()}`;

        const cardHTML = `
            <div class="client-card" data-id="${client.id}" onclick="openDetailsModal(${client.id})">
                <div class="client-header">
                    <img src="${client.image}" alt="${client.name}" class="client-avatar" onerror="this.src='https://dummyjson.com/icon/emilys/128'">
                    <div class="client-title-info">
                        <h3 class="client-name">${client.name}</h3>
                        <span class="client-company">${client.company}</span>
                    </div>
                </div>
                <div class="client-details">
                    <div class="client-detail-item">
                        <span>Email:</span>
                        <p style="font-size: 13px; font-weight: 700; color: var(--text-main);">${client.email}</p>
                    </div>
                    <div class="client-detail-item">
                        <span>Phone:</span>
                        <p style="font-size: 13px; font-weight: 700; color: var(--text-main);">${client.phone}</p>
                    </div>
                    <div class="client-detail-item">
                        <span>Deal Value:</span>
                        <span style="color: var(--accent-color); font-weight: 800;">${dealFormatted}</span>
                    </div>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: auto; gap: 10px;">
                    <select class="select-status-inline ${statusClass}" onclick="event.stopPropagation()" onchange="updateClientStatus(${client.id}, this.value)">
                        <option value="Lead" ${client.status === 'Lead' ? 'selected' : ''}>Lead</option>
                        <option value="Contacted" ${client.status === 'Contacted' ? 'selected' : ''}>Contacted</option>
                        <option value="Won" ${client.status === 'Won' ? 'selected' : ''}>Won</option>
                        <option value="Lost" ${client.status === 'Lost' ? 'selected' : ''}>Lost</option>
                    </select>
                    
                    <button class="btn-logout" style="padding: 8px 14px; font-size: 13px; margin: 0;" onclick="event.stopPropagation(); deleteClient(${client.id})">Delete</button>
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


// --- კლიენტის დეტალების მოდალი და შენიშვნები (P4.8) ---

function openDetailsModal(id) {
    const client = clientsState.find(c => c.id === id);
    if (!client) return;

    currentDetailsClientId = id;

    // მონაცემების შევსება
    document.getElementById('detAvatar').src = client.image;
    document.getElementById('detName').textContent = client.name;
    document.getElementById('detCompany').textContent = client.company;
    document.getElementById('detEmail').textContent = client.email;
    document.getElementById('detPhone').textContent = client.phone || 'N/A';
    
    const dateFormatted = new Date(client.createdAt).toLocaleDateString('en-US');
    document.getElementById('detMeta').textContent = `${client.status} • Client since ${dateFormatted}`;

    // შენიშვნების რენდერი
    renderNotes(client.notes);

    // მოდალის ჩვენება
    document.getElementById('clientDetailsModal').style.display = 'flex';

    // "Add Note" ღილაკზე ივენთის მიბმა
    const addNoteBtn = document.getElementById('addNoteBtn');
    addNoteBtn.onclick = handleAddNote;
}

function closeDetailsModal() {
    document.getElementById('clientDetailsModal').style.display = 'none';
    document.getElementById('newNoteInput').value = '';
    currentDetailsClientId = null;
}

// შენიშვნების სია
function renderNotes(notes) {
    const container = document.getElementById('notesContainer');
    if (!container) return;

    if (!notes || notes.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-muted); font-size: 13px;">No notes recorded yet.</p>';
        return;
    }

    container.innerHTML = '';
    notes.forEach(note => {
        const noteHTML = `
            <div style="border-bottom: 1px solid rgba(255, 255, 255, 0.1); padding-bottom: 8px;">
                <p style="font-size: 14px; font-weight: 600; color: var(--text-main); margin-bottom: 2px;">${note.text}</p>
                <span style="font-size: 11px; font-weight: 500; color: var(--text-muted);">${note.date}</span>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', noteHTML);
    });
}

// ახალი შენიშვნის დამატება
function handleAddNote() {
    const input = document.getElementById('newNoteInput');
    const text = input.value.trim();

    if (!text) return; // ცარიელი არ ემატება (P4.8)

    clientsState = clientsState.map(client => {
        if (client.id === currentDetailsClientId) {
            const updatedNotes = [...(client.notes || [])];
            updatedNotes.push({
                text: text,
                date: new Date().toLocaleString('en-US')
            });
            return { ...client, notes: updatedNotes };
        }
        return client;
    });

    localStorage.setItem('crm_clients', JSON.stringify(clientsState));
    
    // განვაახლოთ მიმდინარე მოდალიც
    const updatedClient = clientsState.find(c => c.id === currentDetailsClientId);
    renderNotes(updatedClient.notes);
    
    input.value = '';
}

// 1 წუთიანი შეხსენება (P4.8)
function setOneMinReminder() {
    const client = clientsState.find(c => c.id === currentDetailsClientId);
    if (!client) return;

    showGlobalToast('Reminder set ✓', true);
    closeDetailsModal();

    setTimeout(() => {
        showGlobalToast(`🔔 Follow up: ${client.name}`, true);
    }, 60000); // 60 წამი
}

// დაკლიკება Overlay-ზე დასახურად
document.getElementById('clientDetailsModal')?.addEventListener('click', function(event) {
    if (event.target === this) {
        closeDetailsModal();
    }
});


// --- მოდალის მართვის ფუნქციები (P4.4) ---

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
    if (event.target === this) {
        closeAddClientModal();
    }
});

function clearClientFormErrors() {
    const form = document.getElementById('addClientForm');
    if (!form) return;
    const errorTexts = form.querySelectorAll('.error-text');
    errorTexts.forEach(el => el.textContent = '');
    
    const inputs = form.querySelectorAll('.form-input-neo');
    inputs.forEach(input => input.classList.remove('input-error'));
}

// --- ახალი კლიენტის დამატება (P4.4, P4.5) ---

async function handleAddClient(event) {
    event.preventDefault();
    clearClientFormErrors();

    const nameInput = document.getElementById('clientName');
    const emailInput = document.getElementById('clientEmail');
    const phoneInput = document.getElementById('clientPhone');
    const companyInput = document.getElementById('clientCompany');
    const dealValueInput = document.getElementById('clientDealValue');
    const statusInput = document.getElementById('clientStatus');

    const name = nameInput.value.trim();
    const email = emailInput.value.trim().toLowerCase();
    const phone = phoneInput.value.trim();
    const company = companyInput.value.trim();
    const dealValue = parseFloat(dealValueInput.value);
    const status = statusInput.value;

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

    if (company.length === 0) {
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

        if (!response.ok) throw new Error('API post failed');

        const newClient = {
            id: Date.now(),
            name: name,
            email: email,
            phone: phone || 'N/A',
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

// --- კლიენტის წაშლა (P4.5) ---

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
        showGlobalToast('Failed to delete client', false);
    }
}

// --- TOAST SYSTEM (P0.4) ---

function showGlobalToast(message, isSuccess = true) {
    const toast = document.getElementById('toast');
    if (toast) {
        toast.textContent = message;
        toast.style.display = 'block';
        toast.style.backgroundColor = isSuccess ? '#dcfce7' : '#fee2e2';
        toast.style.color = isSuccess ? '#16a34a' : '#dc2626';
        toast.style.borderLeft = `4px solid ${isSuccess ? '#16a34a' : '#dc2626'}`;

        setTimeout(() => {
            toast.style.display = 'none';
        }, 3000);
    }
}