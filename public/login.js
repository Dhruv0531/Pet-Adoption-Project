document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const errorMsg = document.getElementById('error-msg');

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    
    if (!res.ok) {
      throw new Error('Invalid credentials');
    }
    
    const { token } = await res.json();
    
    // Store the token and redirect to the admin dashboard
    localStorage.setItem('admin-token', token);
    window.location.href = '/admin'; // Redirect!

  } catch (err) {
    errorMsg.textContent = 'Login failed. Please check your username and password.';
  }
});