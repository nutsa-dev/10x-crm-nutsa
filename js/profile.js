/**
 * 10X CRM - Profile Management (Day 5 - FULL - P5)
 */

document.addEventListener('DOMContentLoaded', initProfile);

let currentUser = null;

function initProfile() {
    const session = JSON.parse(localStorage.getItem('crm_session'));
    if (!session) {
        window.location.href = 'index.html';
        return;
    }

    const users = JSON.parse(localStorage.getItem('crm_users')) || [];
    currentUser = users.find(u => u.email === session.email);

    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }

    // 1. პროფილის საწყისი რენდერი (P5.1)
    renderProfileHeader();

    // 2. ფორმების შევსება
    document.getElementById('editFullName').value = currentUser.fullName;
    document.getElementById('editCompany').value = currentUser.company || '';

    // ივენთების მიბმა
    document.getElementById('editProfileForm').addEventListener('submit', handleProfileUpdate);
    document.getElementById('changePasswordForm').addEventListener('submit', handlePasswordChange);
}

// ანიციალების და თარიღის დახატვა (P5.1)
function renderProfileHeader() {
    const initials = currentUser.fullName
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase();

    document.getElementById('profInitials').textContent = initials;
    document.getElementById('profName').textContent = currentUser.fullName;
    document.getElementById('profEmail').textContent = currentUser.email;

    const dateFormatted = new Date(currentUser.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    document.getElementById('profMeta').textContent = `${currentUser.company || 'Independent'} • Member since ${dateFormatted}`;
}

function clearProfileErrors() {
    const errorTexts = document.querySelectorAll('.error-text');
    errorTexts.forEach(el => el.textContent = '');
    const inputs = document.querySelectorAll('.form-input-neo');
    inputs.forEach(input => input.classList.remove('input-error'));
}

// ა) პროფილის რედაქტირება (P5.2)
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

    // ბაზაში მომხმარებლის განახლება
    let users = JSON.parse(localStorage.getItem('crm_users')) || [];
    users = users.map(u => {
        if (u.email === currentUser.email) {
            return { ...u, fullName: fullName, company: company };
        }
        return u;
    });

    localStorage.setItem('crm_users', JSON.stringify(users));
    currentUser.fullName = fullName;
    currentUser.company = company;

    renderProfileHeader();
    showProfileToast('Profile updated ✓', true);
}

// ბ) პაროლის შეცვლა (P5.3)
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

    // Current Pass-ის დამთხვევა
    if (currentPass !== currentUser.password) {
        currentPassInput.classList.add('input-error');
        document.getElementById('currentPasswordError').textContent = 'Current password is incorrect';
        hasError = true;
    }

    // ახალი პაროლის წესები (მინ. 8 სიმბოლო, 1 ასო და 1 ციფრი)
    const hasLetter = /[a-zA-Z]/.test(newPass);
    const hasDigit = /[0-9]/.test(newPass);
    if (newPass.length < 8 || !hasLetter || !hasDigit) {
        newPassInput.classList.add('input-error');
        document.getElementById('newPasswordError').textContent = 'Password must be at least 8 characters and contain a letter and a number';
        hasError = true;
    } else if (newPass === currentUser.password) {
        // არ უნდა ემთხვეოდეს მიმდინარეს
        newPassInput.classList.add('input-error');
        document.getElementById('newPasswordError').textContent = 'New password must be different from the current one';
        hasError = true;
    }

    // Confirm Pass დამთხვევა
    if (newPass !== confirmNewPass) {
        confirmNewPassInput.classList.add('input-error');
        document.getElementById('confirmNewPasswordError').textContent = 'Passwords do not match';
        hasError = true;
    }

    if (hasError) return;

    // ბაზაში განახლება
    let users = JSON.parse(localStorage.getItem('crm_users')) || [];
    users = users.map(u => {
        if (u.email === currentUser.email) {
            return { ...u, password: newPass };
        }
        return u;
    });

    localStorage.setItem('crm_users', JSON.stringify(users));
    currentUser.password = newPass;

    // ფორმის გასუფთავება
    document.getElementById('changePasswordForm').reset();
    showProfileToast('Password changed ✓', true);
}

// გ) CRM მონაცემთა Reset (P5.4)
function resetCRMData() {
    const confirmed = confirm("Are you sure you want to clear all modifications? This will re-fetch the base clients.");
    if (!confirmed) return;

    localStorage.removeItem('crm_clients');
    showProfileToast('CRM database successfully reset ✓', true);

    setTimeout(() => {
        window.location.href = 'clients.html'; // გადაყვანა კლიენტებზე, სადაც თავიდან ჩაიტვირთება
    }, 1500);
}

// Toast
function showProfileToast(message, isSuccess = true) {
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