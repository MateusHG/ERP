// Função que mostra a mensagem que a sessão do usuário expirou.
export function showSessionExpiredMessage() {
  
    // Cria o elemento de aviso
  const alertDiv = document.createElement('div');
  alertDiv.textContent = 'Sua sessão expirou. Redirecionando para o login...';
  alertDiv.style.position = 'fixed';
  alertDiv.style.top = '50%';
  alertDiv.style.left = '50%';
  alertDiv.style.transform = 'translate(-50%, -50%)';
  alertDiv.style.backgroundColor = '#2f80ed';
  alertDiv.style.color = 'white';
  alertDiv.style.padding = '20px 30px';
  alertDiv.style.borderRadius = '8px';
  alertDiv.style.boxShadow = '0 0 10px rgba(0,0,0,0.3)';
  alertDiv.style.zIndex = '9999';
  alertDiv.style.fontSize = '1.2rem';

  document.body.appendChild(alertDiv);

  // Limpa token e redireciona após 3 segundos
  setTimeout(() => {
    localStorage.clear();
    window.location.href = '/auth/login.html';
  }, 3000);
}

//Formatar os valores em reais;
export const formatValues = (valor: string | null | undefined): string  => {
      const number = parseFloat(valor ?? '0');
      return number.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      });
    };