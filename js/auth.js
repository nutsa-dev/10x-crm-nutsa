// ==========================================================================
// 1. დამხმარე ფუნქციები LocalStorage-თან და DOM-თან სამუშაოდ
// ==========================================================================

// მომხმარებლების მასივის წაკითხვა LocalStorage-იდან
function getUsers() {
    const users = localStorage.getItem('crm_users');
    return users ? JSON.parse(users) : [];
}

// მომხმარებლების მასივის შენახვა LocalStorage-ში
function saveUsers(users) {
    localStorage.setItem('crm_users', JSON.stringify(users));
}

// შეცდომების ტექსტებისა და წითელი საზღვრების გასუფთავება
function clearErrors(form) {
    const errorElements = form.querySelectorAll('.error-text');
    errorElements.forEach(el => el.textContent = '');

    const inputs = form.querySelectorAll('.form-input-neo');
    inputs.forEach(input => input.classList.remove('input-error'));

    const globalError = document.getElementById('globalError');
    if (globalError) globalError.textContent = '';
}

// კონკრეტულ ველზე შეცდომის გამოსახვა
function showFieldError(inputId, errorId, message) {
    const input = document.getElementById(inputId);
    const errorEl = document.getElementById(errorId);
    
    if (input) input.classList.add('input-error');
    if (errorEl) errorEl.textContent = message;
}

// Toast შეტყობინების გამოჩენა (ეკრანის კუთხეში)
function showToast(message, isSuccess = true) {
    const toast = document.getElementById('toast');
    if (!toast) return;

    toast.textContent = message;
    toast.style.color = isSuccess ? 'var(--accent-orange)' : 'var(--danger-color)';
    toast.style.display = 'block';

    setTimeout(() => {
        toast.style.display = 'none';
    }, 3000);
}


// ==========================================================================
// 2. ავტორიზაციის ლოგიკა (Login)
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

    // სესიის შენახვა LocalStorage-ში
    localStorage.setItem('crm_session', JSON.stringify({
        userId: user.id,
        email: user.email,
        fullName: user.fullName,
        loginTime: new Date().toISOString()
    }));

    // გადამისამართება დეშბორდზე
    window.location.href = 'dashboard.html';
}


// ==========================================================================
// 3. რეგისტრაციის ლოგიკა (Sign Up)
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

    // Full Name ვალიდაცია
    if (fullName.length < 3) {
        showFieldError('fullName', 'fullNameError', 'Full name must be at least 3 characters');
        hasError = true;
    }

    // Email ფორმატის ვალიდაცია Regex-ით
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showFieldError('email', 'emailError', 'Please enter a valid email address');
        hasError = true;
    }

    // Email დუბლიკატის შემოწმება ბაზაში
    const users = getUsers();
    if (users.some(u => u.email === email)) {
        showFieldError('email', 'emailError', 'An account with this email already exists');
        hasError = true;
    }

    // Password სირთულის ვალიდაცია
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasDigit = /[0-9]/.test(password);

    if (password.length < 8 || !hasLetter || !hasDigit) {
        showFieldError('password', 'passwordError', 'Password must be at least 8 characters and contain a letter and a number');
        hasError = true;
    }

    // Confirm Password დამთხვევა
    if (password !== confirmPassword) {
        showFieldError('confirmPassword', 'confirmPasswordError', 'Passwords do not match');
        hasError = true;
    }

    if (hasError) return;

    // ახალი მომხმარებლის ობიექტი
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

    showToast('Account created successfully! Redirecting to login...', true);

    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1500);
}


// ==========================================================================
// 4. პაროლის აღდგენის ლოგიკა (Forgot / Reset Password)
// ==========================================================================
let verifiedResetEmail = null; // ინახავს დადასტურებულ ელფოსტას

function handlePasswordReset(event) {
    event.preventDefault();
    const form = event.target;
    clearErrors(form);

    const emailInput = document.getElementById('resetEmail');
    const newPassInput = document.getElementById('resetNewPassword');
    const confirmPassInput = document.getElementById('resetConfirmPassword');
    const submitBtn = document.getElementById('resetSubmitBtn');
    const newPasswordStepGroup = document.getElementById('newPasswordStepGroup');

    // ნაბიჯი 1: ელფოსტის შემოწმება ბაზაში
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

        // ელფოსტა იპოვა - გადავდივართ მე-2 ნაბიჯზე
        verifiedResetEmail = email;
        emailInput.disabled = true; // ელფოსტის ველს ვბლოკავთ
        newPasswordStepGroup.style.display = 'block'; // ვხსნით ახალ ველებს
        submitBtn.textContent = 'Update Password';
        showToast('Email verified! Enter your new password.', true);
        return;
    }

    // ნაბიჯი 2: ახალი პაროლის ვალიდაცია და შენახვა
    const newPassword = newPassInput.value;
    const confirmPassword = confirmPassInput.value;
    let hasError = false;

    const hasLetter = /[a-zA-Z]/.test(newPassword);
    const hasDigit = /[0-9]/.test(newPassword);

    if (newPassword.length < 8 || !hasLetter || !hasDigit) {
        showFieldError('resetNewPassword', 'resetNewPasswordError', 'Password must be at least 8 characters and contain a letter and a number');
        hasError = true;
    }

    if (newPassword !== confirmPassword) {
        showFieldError('resetConfirmPassword', 'resetConfirmPasswordError', 'Passwords do not match');
        hasError = true;
    }

    if (hasError) return;

    // LocalStorage-ში პაროლის განახლება
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