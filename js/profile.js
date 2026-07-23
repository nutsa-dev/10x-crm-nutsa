/**
 * 10X CRM - Profile Management Controller (P5 - FULL)
 * Handles viewing/editing user details, modifying account passwords, and clearing CRM databases.
 */

document.addEventListener('DOMContentLoaded', initProfile);

// ==========================================================================
// 1. Validation Rules & Constants (Easy to edit during live exam coding!)
// ==========================================================================
const PROFILE_RULES = {
    MIN_NAME_LENGTH: 3,
    MIN_PASSWORD_LENGTH: 8
};

// Global state holding current active user structure
let currentUser = null;

// ==========================================================================
// 2. Initialization and UI rendering
// ==========================================================================
function initProfile() {
    // 2.1. Verify session exists
    const session = Storage.get(STORAGE_KEYS.SESSION);
    if (!session) {
        window.location.href = 'index.html';
        return;
    }

    const users = Storage.get(STORAGE_KEYS.USERS, []);
    
    // Find active user profile from database
    currentUser = users.find(u => u.email === session.email || u.id === session.userId);

    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }

    // 2.2. Render user metadata and avatar (P5.1)
    renderProfileHeader();

    // 2.3. Pre-fill form inputs with active user values
    const nameInput = document.getElementById('editFullName');
    const companyInput = document.getElementById('editCompany');
    if (nameInput) nameInput.value = currentUser.fullName || '';
    if (companyInput) companyInput.value = currentUser.company || '';

    // 2.4. Bind Event Listeners dynamically
    document.getElementById('editProfileForm')?.addEventListener('submit', handleProfileUpdate);
    document.getElementById('changePasswordForm')?.addEventListener('submit', handlePasswordChange);
}

// Generates initials and loads dynamic join date and company metadata
function renderProfileHeader() {
    const names = (currentUser.fullName || 'User Name').trim().split(' ');
    const initials = names.length > 1 
        ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
        : `${names[0][0] || 'U'}`.toUpperCase();

    const initialsEl = document.getElementById('profileInitials');
    const nameEl = document.getElementById('profileFullName');
    const emailEl = document.getElementById('profileEmail');
    const metaEl = document.getElementById('profileMeta');

    if (initialsEl) initialsEl.textContent = initials;
    if (nameEl) nameEl.textContent = currentUser.fullName;
    if (emailEl) emailEl.textContent = currentUser.email;

    if (metaEl) {
        const joinDate = currentUser.createdAt 
            ? new Date(currentUser.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
            : 'Recently';
        metaEl.textContent = `${currentUser.company || 'Independent LLC'} • Member since ${joinDate}`;
    }
}

// Clears validation visual indicators and alert fields
function clearProfileErrors() {
    const errorTexts = document.querySelectorAll('.error-text');
    errorTexts.forEach(el => el.textContent = '');
    const inputs = document.querySelectorAll('.form-input-neo');
    inputs.forEach(input => input.classList.remove('input-error'));
}

// ==========================================================================
// 3. Edit Profile Flow (P5.2)
// ==========================================================================
function handleProfileUpdate(event) {
    event.preventDefault();
    clearProfileErrors();

    const nameInput = document.getElementById('editFullName');
    const companyInput = document.getElementById('editCompany');

    const fullName = nameInput.value.trim();
    const company = companyInput.value.trim();

    // Verify name length
    if (fullName.length < PROFILE_RULES.MIN_NAME_LENGTH) {
        nameInput.classList.add('input-error');
        document.getElementById('editFullNameError').textContent = `Full name must be at least ${PROFILE_RULES.MIN_NAME_LENGTH} characters`;
        return;
    }

    // 3.1. Update central USERS array in storage
    let users = Storage.get(STORAGE_KEYS.USERS, []);
    users = users.map(u => {
        if (u.email === currentUser.email) {
            return { ...u, fullName: fullName, company: company };
        }
        return u;
    });
    Storage.set(STORAGE_KEYS.USERS, users);

    // 3.2. Update active session storage (keeps greeting name and initials updated on dashboard)
    const session = Storage.get(STORAGE_KEYS.SESSION) || {};
    session.fullName = fullName;
    Storage.set(STORAGE_KEYS.SESSION, session);

    // 3.3. Update current memory reference and refresh UI view
    currentUser.fullName = fullName;
    currentUser.company = company;

    renderProfileHeader();
    showToast('Profile updated successfully ✓', true);
}

// ==========================================================================
// 4. Change Password Flow (P5.3)
// ==========================================================================
function handlePasswordChange(event) {
    event.preventDefault();
    clearProfileErrors();

    const currentPassInput = document.getElementById('currentPassword');
    const newPassInput = document.getElementById('newPassword');
    const confirmNewPassInput = document.getElementById('confirmNewPassword');

    const currentPass = currentPassInput.value;
    const newPass = newPassInput.value;
    const confirmNewPass = confirmNewPassInput.value;

    let hasError = false;

    // 4.1. Verify existing password matches current user
    if (currentPass !== currentUser.password) {
        currentPassInput.classList.add('input-error');
        document.getElementById('currentPasswordError').textContent = 'Current password is incorrect';
        hasError = true;
    }

    // 4.2. Verify new password meets complexity rules
    const hasLetter = /[a-zA-Z]/.test(newPass);
    const hasDigit = /[0-9]/.test(newPass);
    if (newPass.length < PROFILE_RULES.MIN_PASSWORD_LENGTH || !hasLetter || !hasDigit) {
        newPassInput.classList.add('input-error');
        document.getElementById('newPasswordError').textContent = `Password must be at least ${PROFILE_RULES.MIN_PASSWORD_LENGTH} characters and contain a letter and a number`;
        hasError = true;
    } else if (newPass === currentUser.password) {
        newPassInput.classList.add('input-error');
        document.getElementById('newPasswordError').textContent = 'New password must be different from current password';
        hasError = true;
    }

    // 4.3. Verify pass confirm match
    if (newPass !== confirmNewPass) {
        confirmNewPassInput.classList.add('input-error');
        document.getElementById('confirmNewPasswordError').textContent = 'Passwords do not match';
        hasError = true;
    }

    if (hasError) return;

    // Save password modification to users array
    let users = Storage.get(STORAGE_KEYS.USERS, []);
    users = users.map(u => {
        if (u.email === currentUser.email) {
            return { ...u, password: newPass };
        }
        return u;
    });

    Storage.set(STORAGE_KEYS.USERS, users);
    currentUser.password = newPass;

    document.getElementById('changePasswordForm').reset();
    showToast('Password changed successfully ✓', true);
}

// ==========================================================================
// 5. CRM Data Reset System (P5.4)
// ==========================================================================
function resetCRMData() {
    const confirmed = confirm("Are you sure you want to clear all client modifications? This will re-fetch the base clients from API.");
    if (!confirmed) return;

    Storage.remove(STORAGE_KEYS.CLIENTS);
    showToast('CRM database successfully reset ✓', true);

    setTimeout(() => {
        window.location.href = 'clients.html';
    }, 1200);
}

// Make globally accessible for backward-compatibility with inline HTML click triggers
window.resetCRMData = resetCRMData;