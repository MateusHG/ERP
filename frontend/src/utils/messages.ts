import { estoqueNegativoItem } from "sales/sale-model";

// Box de mensagens de confirmação
export function showConfirm(message: string): Promise<boolean> {
  return new Promise((resolve) => {
    const box = document.getElementById("confirm-box")!;
    const text = document.getElementById("confirm-text")!;
    const yesBtn = document.getElementById("confirm-yes")!;
    const noBtn = document.getElementById("confirm-no")!;

    // Converte quebras de linha para <br> e permite formatação HTML
    text.innerHTML = message.replace(/\n/g, "<br>");

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
};

//Mostrar mensagens de retorno (erro,sucesso etc.)
export function showMessage(message: string): void {
  const box = document.getElementById("message-box")!;
  const text = document.getElementById("message-text")!;
  const closeBtn = document.getElementById("message-close")!;

  text.innerHTML = message.replace(/\n/g, "<br>");
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

export function showEstoqueNegativoMessage(itens: any[], message?: string) {
  const messageBox = document.getElementById("message-box")!;
  const messageText = document.getElementById("message-text")!;
  const closeButton = document.getElementById("message-close")!;

  // Gera as linhas da tabela
  const rowsHTML = itens
    .map(
      (item) => `
      <tr>
        <td style="padding: 6px; border: 1px solid #ccc;">${item.produto_id}</td>
        <td style="padding: 6px; border: 1px solid #ccc;">${item.produto}</td>
        <td style="padding: 6px; border: 1px solid #ccc;">${item.codigo}</td>
        <td style="padding: 6px; border: 1px solid #ccc; text-align: center;">${item.estoque_atual}</td>
        <td style="padding: 6px; border: 1px solid #ccc; text-align: center;">${item.tentativa_saida}</td>
        <td style="padding: 6px; border: 1px solid #ccc; text-align: center;">${item.estoque_ficaria}</td>
      </tr>`
    )
    .join("");

  // Monta o HTML completo da tabela
  const tableHTML = `
    <table style="
      width: 100%;
      border-collapse: collapse;
      font-size: 0.9rem;
      margin-top: 16px;
      text-align: center;
    ">
      <thead>
        <tr style="background-color: #2e80eb; color: white;">
          <th style="padding: 6px; border: 1px solid #ccc;">ID</th>
          <th style="padding: 6px; border: 1px solid #ccc;">Produto</th>
          <th style="padding: 6px; border: 1px solid #ccc;">Código</th>
          <th style="padding: 6px; border: 1px solid #ccc;">Estoque Atual</th>
          <th style="padding: 6px; border: 1px solid #ccc;">Tentativa de Saída</th>
          <th style="padding: 6px; border: 1px solid #ccc;">Estoque Ficaria</th>
        </tr>
      </thead>
      <tbody>${rowsHTML}</tbody>
    </table>
  `;

  // Atualiza o conteúdo do modal de mensagem
  messageText.innerHTML = `
    <strong>${message || "Estoque insuficiente para dar saída em um ou mais produtos." }</strong>
    ${tableHTML}
  `;

  // Ajusta o estilo da caixa principal para ficar mais larga e evitar quebra
  const content = messageText.closest(".message-content") as HTMLElement;
  if (content) {
    content.style.maxWidth = "700px";
    content.style.width = "90%";
    content.style.overflow = "visible";
    content.style.textAlign = "center";
  }

  messageBox.classList.remove("hidden");

  closeButton.onclick = () => {
    messageBox.classList.add("hidden");
  };
};