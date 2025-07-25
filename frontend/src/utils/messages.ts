//Mostrar mensagens de confirmação
export function showConfirm(message: string): Promise<boolean> {
  return new Promise((resolve) => {
    const box = document.getElementById("confirm-box")!;
    const text = document.getElementById("confirm-text")!;
    const yesBtn = document.getElementById("confirm-yes")!;
    const noBtn = document.getElementById("confirm-no")!;

    text.textContent = message;
    box.classList.remove("hidden");

    const cleanup = () => {
      box.classList.add("hidden");
      yesBtn.removeEventListener("click", onYes);
      noBtn.removeEventListener("click", onNo);
    };

    const onYes = () => {
      cleanup();
      resolve(true);
    };

    const onNo = () => {
      cleanup();
      resolve(false);
    };

    yesBtn.addEventListener("click", onYes);
    noBtn.addEventListener("click", onNo);
  });
}

//Mostrar mensagens de retorno (erro,sucesso etc.)
export function showMessage(message: string): void {
  const box = document.getElementById("message-box")!;
  const text = document.getElementById("message-text")!;
  const closeBtn = document.getElementById("message-close")!;

  text.textContent = message;
  box.classList.remove("hidden");

  const close = () => {
    box.classList.add("hidden");
    closeBtn.removeEventListener("click", close);
  };

  closeBtn.addEventListener("click", close);
};

// Aviso de sessão não autorizada, caso não esteja com o bearer bloqueia a navegação e redireciona para a página de login.
export function showNotAuthorizedMessage() {
  //Limpa o conteúdo da body para ocultar a página.
  document.body.innerHTML = '';

  //Cria o overlay que cobre toda a tela;
  const overlay = document.createElement('div');
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100vw';
  overlay.style.height = '100vh';
  overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.85)';
  overlay.style.zIndex = '9998';

    // Cria o elemento de aviso
  const alertDiv = document.createElement('div');
  alertDiv.textContent = 'Sessão não autorizada!';
  alertDiv.style.position = 'fixed';
  alertDiv.style.top = '50%';
  alertDiv.style.left = '50%';
  alertDiv.style.transform = 'translate(-50%, -50%)';
  alertDiv.style.backgroundColor = 'red';
  alertDiv.style.color = 'white';
  alertDiv.style.padding = '20px 30px';
  alertDiv.style.borderRadius = '8px';
  alertDiv.style.boxShadow = '0 0 10px rgba(0,0,0,0.3)';
  alertDiv.style.zIndex = '9999';
  alertDiv.style.fontSize = '1.2rem';

  document.body.appendChild(overlay);
  document.body.appendChild(alertDiv);

  // Limpa token e redireciona após 3 segundos
  setTimeout(() => {
    localStorage.clear();
    window.location.href = '/auth/login.html';
  }, 3000);
};