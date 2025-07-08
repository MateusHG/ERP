// Data atual
window.addEventListener('DOMContentLoaded', () => {
  const dateTimeElement = document.getElementById('datetime');
  if (dateTimeElement) {
    setInterval(() => {
      const now = new Date();
      dateTimeElement.textContent = now.toLocaleDateString('pt-BR');
    }, 1000);
  }
});

//Exibe o nome do usuário logado.
window.addEventListener('DOMContentLoaded', () => {
  const loggedUser = document.getElementById('logged-user');

  if (loggedUser) {
    const name = localStorage.getItem('username');
    loggedUser.textContent = name || 'Desconhecido';
  }
});

//Redirecionamento para a página inicial de login ao clicar no botão 'Sair'
window.addEventListener('DOMContentLoaded', () => {
  const logoutBtn = document.getElementById('logout-btn') as HTMLButtonElement;

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.clear(); // Limpa o localStorage, token, sessão etc.

      //Redireciona para a tela inicial de login
      console.log('Saindo da sessão...')
      window.location.href = '/auth/login.html';
    });
  }
});