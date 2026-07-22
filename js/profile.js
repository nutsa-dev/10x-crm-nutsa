/**
 * 10X CRM - Profile Management Controller (P5 - FULL)
 * პასუხისმგებელია პროფილის მონაცემების გამოჩენაზე, რედაქტირებაზე, პაროლის შეცვლასა და CRM Data Reset-ზე.
 */

document.addEventListener('DOMContentLoaded', initProfile);

let currentUser = null;

function initProfile() {
    // 1. სესიის შემოწმება
    const sessionData = localStorage.getItem('crm_session');
    if (!sessionData) {
        window.location.href = 'index.html';
        return;
    }

    const session = JSON.parse(sessionData);
    const users = JSON.parse(localStorage.getItem('crm_users') || '[]');
    
    // მიმდინარე მომხმარებლის პოვნა ბაზაში
    currentUser = users.find(u => u.email === session.email || u.id === session.userId);

    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }

    // 2. პროფილის საწყისი რენდერი (P5.1)
    renderProfileHeader();

    // 3. ინპუტების შევსება არსებული მონაცემებით
    const nameInput = document.getElementById('editFullName');
    const companyInput = document.getElementById('editCompany');
    if (nameInput) nameInput.value = currentUser.fullName || '';
    if (companyInput) companyInput.value = currentUser.company || '';

    // 4. ივენთების მიბმა ფორმებზე
    document.getElementById('editProfileForm')?.addEventListener('submit', handleProfileUpdate);
    document.getElementById('changePasswordForm')?.addEventListener('submit', handlePasswordChange);
}

// ==========================================================================
// 1. პროფილის ჰედერის რენდერინგი (P5.1)
// ==========================================================================
function renderProfileHeader() {
    // ინიციალების გამოთვლა (მაგ: Nutsa Beridze -> NB)
    const names = (currentUser.fullName || 'User Name').trim().split(' ');
    const initials = names.length > 1 
        ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
        : `${names[0][0] || 'U'}`.toUpperCase();

    // DOM ელემენტების განახლება (HTML-ის ID-ებთან სრულ სინქრონში)
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

function clearProfileErrors() {
    const errorTexts = document.querySelectorAll('.error-text');
    errorTexts.forEach(el => el.textContent = '');
    const inputs = document.querySelectorAll('.form-input-neo');
    inputs.forEach(input => input.classList.remove('input-error'));
}

// ==========================================================================
// 2. პროფილის რედაქტირება (P5.2)
// ==========================================================================
function handleProfileUpdate(event) {
    event.preventDefault();
    clearProfileErrors();

    const nameInput = document.getElementById('editFullName');
    const companyInput = document.getElementById('editCompany');

    const fullName = nameInput.value.trim();
    const company = companyInput.value.trim();

    if (fullName.length < 3) {
        nameInput.classList.add('input-error');
        document.getElementById('editFullNameError').textContent = 'Full name must be at least 3 characters';
        return;
    }

    // ა) განახლება crm_users-ში
    let users = JSON.parse(localStorage.getItem('crm_users') || '[]');
    users = users.map(u => {
        if (u.email === currentUser.email) {
            return { ...u, fullName: fullName, company: company };
        }
        return u;
    });
    localStorage.setItem('crm_users', JSON.stringify(users));

    // ბ) განახლება crm_session-ში (რომ დეშბორდზეც ახალი სახელი გამოჩნდეს)
    const session = JSON.parse(localStorage.getItem('crm_session') || '{}');
    session.fullName = fullName;
    localStorage.setItem('crm_session', JSON.stringify(session));

    // გ) ლოკალური ობიექტის განახლება
    currentUser.fullName = fullName;
    currentUser.company = company;

    renderProfileHeader();
    showProfileToast('Profile updated successfully ✓', true);
}

// ==========================================================================
// 3. პაროლის შეცვლა (P5.3)
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

    // 1. Current Pass შემოწმება
    if (currentPass !== currentUser.password) {
        currentPassInput.classList.add('input-error');
        document.getElementById('currentPasswordError').textContent = 'Current password is incorrect';
        hasError = true;
    }

    // 2. ახალი პაროლის ვალიდაცია (მინ. 8 სიმბოლო, 1 ასო, 1 ციფრი)
    const hasLetter = /[a-zA-Z]/.test(newPass);
    const hasDigit = /[0-9]/.test(newPass);
    if (newPass.length < 8 || !hasLetter || !hasDigit) {
        newPassInput.classList.add('input-error');
        document.getElementById('newPasswordError').textContent = 'Password must be at least 8 characters and contain a letter and a number';
        hasError = true;
    } else if (newPass === currentUser.password) {
        newPassInput.classList.add('input-error');
        document.getElementById('newPasswordError').textContent = 'New password must be different from current password';
        hasError = true;
    }

    // 3. Confirm Pass შემოწმება
    if (newPass !== confirmNewPass) {
        confirmNewPassInput.classList.add('input-error');
        document.getElementById('confirmNewPasswordError').textContent = 'Passwords do not match';
        hasError = true;
    }

    if (hasError) return;

    // ბაზაში განახლება
    let users = JSON.parse(localStorage.getItem('crm_users') || '[]');
    users = users.map(u => {
        if (u.email === currentUser.email) {
            return { ...u, password: newPass };
        }
        return u;
    });

    localStorage.setItem('crm_users', JSON.stringify(users));
    currentUser.password = newPass;

    document.getElementById('changePasswordForm').reset();
    showProfileToast('Password changed successfully ✓', true);
}

// ==========================================================================
// 4. CRM მონაცემთა Reset (P5.4)
// ==========================================================================
function resetCRMData() {
    const confirmed = confirm("Are you sure you want to clear all client modifications? This will re-fetch the base clients from API.");
    if (!confirmed) return;

    localStorage.removeItem('crm_clients');
    showProfileToast('CRM database successfully reset ✓', true);

    setTimeout(() => {
        window.location.href = 'clients.html';
    }, 1200);
}

// ==========================================================================
// 5. TOAST NOTIFICATION SYSTEM
// ==========================================================================
function showProfileToast(message, isSuccess = true) {
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