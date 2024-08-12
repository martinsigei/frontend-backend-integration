document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('register_form').addEventListener('submit', async function (e) {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const authMsg = document.getElementById('auth-msg');
        
        try {

            const response = await fetch('http://127.0.0.1:3000/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, username, password })
            });

            if(response.status === 201)  authMsg.textContent = 'User Registered Successfully!!';
            if (response.status === 409)  authMsg.textContent = 'User already exist';
            if (response.status === 500) authMsg.textContent = 'Datbase Error';
        } catch (error) {
            authMsg.textContent = 'Error registering user..';
        }
        
    });
});