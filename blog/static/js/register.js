let register = document.querySelector('#register');

if (register) {

    register.addEventListener('click', (e) => {


        let username = document.querySelector('#username').value.trim();
        let email = document.querySelector('#email').value.trim();
        let password = document.querySelector('#password').value.trim();
        let confirm_password = document.querySelector('#confirm_password').value.trim();

        let usernameError = document.getElementById('usernameError');
        let emailError = document.getElementById('emailError');
        let passwordError = document.getElementById('passwordError');
        let confirm_passwordError = document.getElementById('confirm_passwordError');

        let usernamePattern = /^\S+$/;
        let emailPattern = /^[^\s@]+@[^\s@]+\.com$/;

        let error = 0;

        if (username === '') {
            usernameError.classList.remove('d-none');
            error = 1;
        } else if (!usernamePattern.test(username)) {
            usernameError.textContent = 'Spaces not allowed';
            usernameError.classList.remove('d-none');
            error = 1;
        } else {
            usernameError.classList.add('d-none');
        }


        if (email === '') {
            emailError.classList.remove('d-none');
            error = 1;
        } else if (!emailPattern.test(email)) {
            emailError.textContent = 'Enter a valid email address.';
            emailError.classList.remove('d-none');
            error = 1;
        } else {
            emailError.classList.add('d-none');
        }


        if (password === '') {
            passwordError.classList.remove('d-none');
            error = 1;
        } else {
            passwordError.classList.add('d-none');
        }


        if (confirm_password === '') {
            confirm_passwordError.classList.remove('d-none');
            error = 1;
        } else if (password !== confirm_password) {
            confirm_passwordError.textContent = 'Passwords do not match';
            confirm_passwordError.classList.remove('d-none');
            error = 1;
        } else {
            confirm_passwordError.classList.add('d-none');
        }


        if (error) {
            e.preventDefault();
        };

    });
}