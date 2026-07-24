/**
 * 10X CRM - Authentication Controller (Login, Sign Up, Password Reset)
 */

// ==========================================================================
// 1. Validation Rules & Constants (Easy to edit during live exam coding!)
// ==========================================================================
const AUTH_RULES = {
    MIN_NAME_LENGTH: 3,
    MIN_PASSWORD_LENGTH: 8,
    EMAIL_REGEX: /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/
};

// ==========================================================================
// 2. Helper Functions
// ==========================================================================

// Get users from the central Storage utility defined in guard.js
function getUsers() {
    let users = Storage.get(STORAGE_KEYS.USERS);
    if (!users || users.length === 0) {
        users = [{
            id: 1720180200000,
            fullName: 'Demo User',
            email: 'demo@test.com',
            password: 'Password123',
            company: '10X Demo LLC',
            isFirstLogin: false,
            createdAt: new Date().toISOString()
        }];
        Storage.set(STORAGE_KEYS.USERS, users);
    }
    return users;
}

// Save users using the central Storage utility defined in guard.js
function saveUsers(users) {
    Storage.set(STORAGE_KEYS.USERS, users);
}

// Clears all form input error states and error messages
function clearErrors(form) {
    const errorElements = form.querySelectorAll('.error-text');
    errorElements.forEach(el => el.textContent = '');

    const inputs = form.querySelectorAll('.form-input-neo');
    inputs.forEach(input => input.classList.remove('input-error'));

    const globalError = document.getElementById('globalError');
    if (globalError) globalError.textContent = '';
}

// Applies error classes to inputs and shows helper messages
function showFieldError(inputId, errorId, message) {
    const input = document.getElementById(inputId);
    const errorEl = document.getElementById(errorId);
    
    if (input) input.classList.add('input-error');
    if (errorEl) errorEl.textContent = message;
}

// ==========================================================================
// 3. Login Flow (P2)
// ==========================================================================
function handleLogin(event) {
    event.preventDefault();
    const form = event.target;
    clearErrors(form);

    const emailInput = document.getElementById('loginEmail');
    const passwordInput = document.getElementById('loginPassword');

    const email = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value;

    let hasError = false;

    if (!email) {
        showFieldError('loginEmail', 'loginEmailError', 'Email is required');
        hasError = true;
    }

    if (!password) {
        showFieldError('loginPassword', 'loginPasswordError', 'Password is required');
        hasError = true;
    }

    if (hasError) return;

    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
        const globalError = document.getElementById('globalError');
        if (globalError) globalError.textContent = 'Invalid email or password';
        return;
    }

    const rememberMe = document.getElementById('rememberMe') ? document.getElementById('rememberMe').checked : false;

    // Save active session using our central Storage helper (P2.3) with rememberMe value
    Storage.set(STORAGE_KEYS.SESSION, {
        userId: user.id,
        email: user.email,
        fullName: user.fullName,
        loginTime: new Date().toISOString()
    }, rememberMe);

    window.location.href = 'dashboard.html';
}

// ==========================================================================
// 4. Registration Flow (Sign Up - P1)
// ==========================================================================
function handleSignUp(event) {
    event.preventDefault();
    const form = event.target;
    clearErrors(form);

    const fullNameInput = document.getElementById('fullName');
    const emailInput = document.getElementById('email');
    const companyInput = document.getElementById('company');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');

    const fullName = fullNameInput.value.trim();
    const email = emailInput.value.trim().toLowerCase();
    const company = companyInput ? companyInput.value.trim() : '';
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    let hasError = false;

    // Full Name validation
    if (fullName.length < AUTH_RULES.MIN_NAME_LENGTH) {
        showFieldError('fullName', 'fullNameError', `Full name must be at least ${AUTH_RULES.MIN_NAME_LENGTH} characters`);
        hasError = true;
    }

    // Email format validation
    if (!AUTH_RULES.EMAIL_REGEX.test(email)) {
        showFieldError('email', 'emailError', 'Please enter a valid email address');
        hasError = true;
    }

    // Duplicate email verification in Local Database
    const users = getUsers();
    if (users.some(u => u.email === email)) {
        showFieldError('email', 'emailError', 'An account with this email already exists');
        hasError = true;
    }

    // Password complexity check (Length, Letters, and Numbers)
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasDigit = /[0-9]/.test(password);

    if (password.length < AUTH_RULES.MIN_PASSWORD_LENGTH || !hasLetter || !hasDigit) {
        showFieldError('password', 'passwordError', `Password must be at least ${AUTH_RULES.MIN_PASSWORD_LENGTH} characters and contain a letter and a number`);
        hasError = true;
    }

    // Confirm Password check
    if (password !== confirmPassword) {
        showFieldError('confirmPassword', 'confirmPasswordError', 'Passwords do not match');
        hasError = true;
    }

    if (hasError) return;

    // User schema construction
    const newUser = {
        id: Date.now(),
        fullName: fullName,
        email: email,
        password: password,
        company: company,
        isFirstLogin: true,
        createdAt: new Date().toISOString()
    };

    users.push(newUser);
    saveUsers(users);

    // Call global showToast function defined in guard.js
    showToast('Account created successfully! Redirecting to login...', true);

    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1500);
}

// ==========================================================================
// 5. Password Recovery Flow (Forgot Password)
// ==========================================================================
let verifiedResetEmail = null; 

function handlePasswordReset(event) {
    event.preventDefault();
    const form = event.target;
    clearErrors(form);

    const emailInput = document.getElementById('resetEmail');
    const newPassInput = document.getElementById('resetNewPassword');
    const confirmPassInput = document.getElementById('resetConfirmPassword');
    const submitBtn = document.getElementById('resetSubmitBtn');
    const newPasswordStepGroup = document.getElementById('newPasswordStepGroup');

    // Step 1: Verify email address exists in user base
    if (!verifiedResetEmail) {
        const email = emailInput.value.trim().toLowerCase();

        if (!email) {
            showFieldError('resetEmail', 'resetEmailError', 'Email address is required');
            return;
        }

        const users = getUsers();
        const foundUser = users.find(u => u.email === email);

        if (!foundUser) {
            showFieldError('resetEmail', 'resetEmailError', 'No account found with this email address');
            return;
        }

        // Email verified, reveal step 2 inputs
        verifiedResetEmail = email;
        emailInput.disabled = true; 
        newPasswordStepGroup.style.display = 'block'; 
        submitBtn.textContent = 'Update Password';
        showToast('Email verified! Enter your new password.', true);
        return;
    }

    // Step 2: Validate new password complexity and confirm identity
    const newPassword = newPassInput.value;
    const confirmPassword = confirmPassInput.value;
    let hasError = false;

    const hasLetter = /[a-zA-Z]/.test(newPassword);
    const hasDigit = /[0-9]/.test(newPassword);

    if (newPassword.length < AUTH_RULES.MIN_PASSWORD_LENGTH || !hasLetter || !hasDigit) {
        showFieldError('resetNewPassword', 'resetNewPasswordError', `Password must be at least ${AUTH_RULES.MIN_PASSWORD_LENGTH} characters and contain a letter and a number`);
        hasError = true;
    }

    if (newPassword !== confirmPassword) {
        showFieldError('resetConfirmPassword', 'resetConfirmPasswordError', 'Passwords do not match');
        hasError = true;
    }

    if (hasError) return;

    // Save changes to storage
    let users = getUsers();
    users = users.map(u => {
        if (u.email === verifiedResetEmail) {
            return { ...u, password: newPassword };
        }
        return u;
    });

    saveUsers(users);

    showToast('Password updated successfully! Redirecting to login...', true);

    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1800);
}

// Password strength indicator logic
function handlePasswordInput(event) {
    const password = event.target.value;
    const container = document.getElementById('passwordStrengthContainer');
    const bar = document.getElementById('strengthBar');
    const text = document.getElementById('strengthText');
    
    if (!container || !bar || !text) return;
    
    if (!password) {
        container.style.display = 'none';
        return;
    }
    
    container.style.display = 'flex';
    
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    let strength = 'weak';
    if (score >= 4) {
        strength = 'strong';
    } else if (score >= 2) {
        strength = 'medium';
    }
    
    text.textContent = strength.charAt(0).toUpperCase() + strength.slice(1);
    
    bar.className = 'strength-bar';
    bar.classList.add(strength);
}

document.addEventListener('DOMContentLoaded', () => {
    const passwordInput = document.getElementById('password');
    if (passwordInput && document.getElementById('passwordStrengthContainer')) {
        passwordInput.addEventListener('input', handlePasswordInput);
    }

    // Block non-ASCII (Georgian, Cyrillic, etc.) characters in email fields on auth pages
    ['loginEmail', 'email', 'resetEmail'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', function() {
                this.value = this.value.replace(/[^\x00-\x7F]/g, '');
            });
        }
    });
});