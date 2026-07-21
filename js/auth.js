/**
 * 10X CRM - Authentication & Session Management (P1, P2, P0.2)
 */

// --- დამხმარე ფუნქციები ---

// იღებს მომხმარებლების სიას localStorage-დან
function getUsers() {
    return JSON.parse(localStorage.getItem('crm_users')) || [];
}

// ინახავს მომხმარებლების სიას localStorage-ში
function saveUsers(users) {
    localStorage.setItem('crm_users', JSON.stringify(users));
}

// ასუფთავებს წინა ვალიდაციის შეცდომებს
function clearErrors(formElement) {
    const errorTexts = formElement.querySelectorAll('.error-text');
    errorTexts.forEach(el => el.textContent = '');
    
    const inputs = formElement.querySelectorAll('.form-input-neo');
    inputs.forEach(input => input.classList.remove('input-error'));

    const globalErr = document.getElementById('globalError');
    if (globalErr) globalErr.textContent = '';
}

// აჩვენებს კონკრეტული ველის შეცდომას (P0.4)
function showFieldError(inputId, errorId, message) {
    const inputElement = document.getElementById(inputId);
    const errorElement = document.getElementById(errorId);
    if (inputElement && errorElement) {
        inputElement.classList.add('input-error');
        errorElement.textContent = message;
    }
}

// აჩვენებს დროებით Toast შეტყობინებას (P0.4)
function showToast(message, isSuccess = true) {
    const toast = document.getElementById('toast');
    if (toast) {
        toast.textContent = message;
        toast.style.display = 'block';
        toast.style.backgroundColor = isSuccess ? '#2e7d32' : '#c62828'; // მწვანე წარმატებისთვის, წითელი შეცდომისთვის
        
        setTimeout(() => {
            toast.style.display = 'none';
        }, 3000);
    }
}


// --- 1. რეგისტრაციის ლოგიკა (P1 Sign Up) ---

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
    const company = companyInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    let hasError = false;

    // ა) Full Name ვალიდაცია: სავალდებულო, მინ. 3 სიმბოლო
    if (fullName.length < 3) {
        showFieldError('fullName', 'fullNameError', 'Full name must be at least 3 characters');
        hasError = true;
    }

    // ბ) Email ვალიდაცია: ფორმატის შემოწმება
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showFieldError('email', 'emailError', 'Please enter a valid email address');
        hasError = true;
    } else {
        // გ) Email დუბლიკატის შემოწმება
        const users = getUsers();
        const emailExists = users.some(u => u.email === email);
        if (emailExists) {
            showFieldError('email', 'emailError', 'An account with this email already exists');
            hasError = true;
        }
    }

    // დ) Password ვალიდაცია: მინ. 8 სიმბოლო, 1 ასო და 1 ციფრი
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasDigit = /[0-9]/.test(password);
    if (password.length < 8 || !hasLetter || !hasDigit) {
        showFieldError('password', 'passwordError', 'Password must be at least 8 characters and contain a letter and a number');
        hasError = true;
    }

    // ე) Confirm Password ვალიდაცია: დამთხვევა
    if (password !== confirmPassword) {
        showFieldError('confirmPassword', 'confirmPasswordError', 'Passwords do not match');
        hasError = true;
    }

    // თუ რაიმე შეცდომაა, ვაჩერებთ პროცესს
    if (hasError) return;

    // ახალი მომხმარებლის ობიექტი
    const newUser = {
        id: Date.now(),
        fullName: fullName,
        email: email,
        password: password, // რეალურ პროექტში იჰეშება, სასწავლო მიზნებისთვის ვინახავთ ასე
        company: company,
        createdAt: new Date().toISOString()
    };

    // შენახვა
    const users = getUsers();
    users.push(newUser);
    saveUsers(users);

    // წარმატების შეტყობინება და გადამისამართება
    showToast('Account created successfully! Please log in.', true);
    
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1500);
}


// --- 2. ავტორიზაციის ლოგიკა (P2 Login) ---

function handleLogin(event) {
    event.preventDefault();
    const form = event.target;
    clearErrors(form);

    const emailInput = document.getElementById('loginEmail');
    const passwordInput = document.getElementById('loginPassword');

    const email = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value;

    let hasError = false;

    // ა) ცარიელი ველების შემოწმება
    if (!email) {
        showFieldError('loginEmail', 'loginEmailError', 'Email is required');
        hasError = true;
    }

    if (!password) {
        showFieldError('loginPassword', 'loginPasswordError', 'Password is required');
        hasError = true;
    }

    if (hasError) return;

    // ბ) მომხმარებლის ძებნა ბაზაში
    const users = getUsers();
    const foundUser = users.find(u => u.email === email && u.password === password);

    if (!foundUser) {
        // უსაფრთხოების მიზნით, შეცდომა არის განზოგადებული
        const globalErrorElement = document.getElementById('globalError');
        if (globalErrorElement) {
            globalErrorElement.textContent = 'Invalid email or password';
        }
        return;
    }

    // გ) სესიის შექმნა
    const session = {
        userId: foundUser.id,
        email: foundUser.email,
        loginAt: new Date().toISOString()
    };
    localStorage.setItem('crm_session', JSON.stringify(session));

    // გადაყვანა დეშბორდზე
    window.location.href = 'dashboard.html';
}


// --- 3. გამოსვლის ლოგიკა (Logout - P0.2) ---

function handleLogout() {
    localStorage.removeItem('crm_session'); // ვშლით მხოლოდ მიმდინარე სესიას
    window.location.href = 'index.html'; // გადამისამართება ლოგინზე
}