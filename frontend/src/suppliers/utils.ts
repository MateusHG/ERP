// ** Utilitários, (formatação de data, mostrar mensagens etc) ** //

//Arquivo responsável pela navegação entre os módulos do sistema
export async function initNavigation() {
  const routes: Record<string, string> = {
    'btn-dashboard': '/dashboard/dashboard.html',
    'btn-products': '/products/products.html',
    'btn-suppliers': '/suppliers/suppliers.html',
  };

  Object.entries(routes).forEach(([btnId, path]) => {
    const btn = document.getElementById(btnId);
    if (btn) {
      btn.addEventListener('click', () => {
        window.location.href = path;
      });
    }
  });
};

//Formatação de data
export function formatData(dataStr: string): string {
  const data = new Date(dataStr);
  return data.toLocaleDateString("pt-BR");
};

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

//Pega os valores dos campos de filtro.
export function getFilterValues() {
  return {
    id: (document.querySelector("#filtro-id") as HTMLInputElement)?.value || "",
    nome: (document.querySelector("#filtro-nome") as HTMLInputElement)?.value || "",
    categoria: (document.querySelector("#filtro-categoria") as HTMLInputElement)?.value || "",
    status: (document.querySelector("#filtro-status") as HTMLSelectElement)?.value || "",
  }
};