let register = document.querySelector('#register');

if (register) {
    let validateUsername = setupFieldValidation(
        'username', 'usernameError',
        (val) => /^\S+$/.test(val),
        'Spaces not allowed',
        'Username'
    );

    let validateEmail = setupFieldValidation(
        'email', 'emailError',
        (val) => /^[^\s@]+@[^\s@]+\.com$/.test(val),
        'Enter a valid Email address',
        'Email'
    );

    let validatePassword = setupFieldValidation(
        'password', 'passwordError',
        null, '', 'Password'
    );


    let validateConfirmPassword = () => {
        let password = document.getElementById('password').value.trim();
        let confirmPassword = document.getElementById('confirm_password').value.trim();
        let error = document.getElementById('confirm_passwordError');

        if (confirmPassword === '') {
            error.textContent = 'Confirm Password is required';
            error.classList.remove('d-none');
            return false;
        } else if (password !== confirmPassword) {
            error.textContent = 'Passwords do not match';
            error.classList.remove('d-none');
            return false;
        } else {
            error.classList.add('d-none');
            return true;
        }
    };

    document.getElementById('confirm_password').addEventListener('input', validateConfirmPassword);

    register.addEventListener('click', async (e) => {
        e.preventDefault();

        let validUsername = validateUsername();
        let validEmail = validateEmail();
        let validPassword = validatePassword();
        let validConfirmPassword = validateConfirmPassword();

        if (!validUsername || !validEmail || !validPassword || !validConfirmPassword) {
            return;
        }

        let isEmailValid = validateEmail();

        if (isEmailValid) {
        }


        const csrftoken = getCookie('csrftoken');

        const data = {
            username: document.getElementById('username').value.trim(),
            email: document.getElementById('email').value.trim(),
            password: document.getElementById('password').value.trim(),
            confirm_password: document.getElementById('confirm_password').value.trim()
        };

        try {
            const response = await fetch('/register/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrftoken,
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            console.log(result);

            const messageEl = document.getElementById('message');

            if (result.success) {
                window.location.href = result.redirect_url || '/home/';
            } else {
                messageEl.textContent = result.message || 'Something went wrong';
                messageEl.classList.remove('d-none');
                messageEl.style.opacity = '1';
                messageEl.style.display = 'block';

                if (result.message.toLowerCase().includes('username')) {
                    document.getElementById('username').value = '';
                    document.getElementById('username').focus();
                }

                if (result.message.toLowerCase().includes('email')) {
                    document.getElementById('email').value = '';
                    document.getElementById('email').focus();
                }

                setTimeout(() => {
                    messageEl.style.transition = 'opacity 0.5s ease';
                    messageEl.style.opacity = '0';
                    setTimeout(() => {
                        messageEl.style.display = 'none';
                    }, 500);
                }, 1500);
            }

        } catch (error) {
            console.error('Error during registration:', error);
        }
    });
}

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            cookie = cookie.trim();
            if (cookie.startsWith(name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

let messageEl = document.getElementById('message');
messageEl.addEventListener('DOMContentLoaded', ()=> {
    let message = messageEl?.dataset?.message;

    if (message) {
        messageEl.textContent = message;
        messageEl.classList.remove('d-none');
        messageEl.style.display = 'block';
    }
});



let isSubmitted = false;

function setupFieldValidation(fieldId, errorId, customValidator = null, customMessage = '', fieldLabel = '') {
    let field = document.getElementById(fieldId);
    let error = document.getElementById(errorId);

    let requiredMsg = `${fieldLabel || 'This field'} is required`;

    field.addEventListener('input', () => {
        let value = field.value.trim();

        if (!isSubmitted) return;

        if (value === '') {
            error.textContent = requiredMsg;
            error.classList.remove('d-none');
        } else if (customValidator && !customValidator(value)) {
            error.textContent = customMessage;
            error.classList.remove('d-none');
        } else {
            error.classList.add('d-none');
        }
    });

    return () => {
        isSubmitted = true;

        let value = field.value.trim();

        if (value === '') {
            error.textContent = requiredMsg;
            error.classList.remove('d-none');
            return false;
        } else if (customValidator && !customValidator(value)) {
            error.textContent = customMessage;
            error.classList.remove('d-none');
            return false;
        } else {
            error.classList.add('d-none');
            return true;
        }
    };
}