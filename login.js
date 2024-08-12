document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('form-login').addEventListener('submit', async function (e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const authMsg = document.getElementById('auth-msg');
        
        
        try {
            const response = await fetch('http://127.0.0.1:3000/api/login', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ username, password })
            });
            const result = await response.json();
            if (response.ok) {
                localStorage.setItem('token', result.token);
                authMsg.textContent = 'Login successful!';
                authMsg.style.color = 'green';
                // clear fields and redirect to  another page
                window.location.href = 'expenses.html';
                document.getElementById('form-login').reset();

            }

            if (response.status === 400) authMsg.textContent = 'Login Failed: Invalid email or password';
            if (response.status === 500) authMsg.textContent = 'Internal Servar Error';
            
        } catch (error) {
            authMsg.textContent = 'Error occured Loging in ..';
        }
    });
});