const form = document.getElementById('new-login-form') as HTMLFormElement;
const messageElement = document.getElementById('login-message') as HTMLElement;

form?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = (document.getElementById('user') as HTMLInputElement).value;
  const password = (document.getElementById('password') as HTMLInputElement).value;

  // Limpa a mensagem anterior.
  messageElement.textContent = '';
  messageElement.classList.add('hidden');

  try {
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.log('Erro recebido:', data.message); // <--- debug
       messageElement.textContent = data.message || 'Erro ao fazer login';
       messageElement.classList.remove('hidden');
       return;
    }

      const { token } = data;
      localStorage.setItem('token', token);
      console.log('Login bem-sucedido, redirecionando para dashboard...');
      window.location.href = '/dashboard/dashboard.html';
    } catch (err) {
      messageElement.textContent = 'Erro de rede ou servidor.';
      messageElement.classList.remove('hidden');
    }
});

