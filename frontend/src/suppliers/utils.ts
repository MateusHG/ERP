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

//Pega os dados do cadastro atual, para comparar depois se houve alteração.
export function getFormDataSnapshot(form: HTMLFormElement): Record<string, string> {
  const data: Record<string, string> = {};
  const elements = form.elements;

  for (let i = 0; i < elements.length; i++) {
    const el = elements[i] as HTMLInputElement | HTMLSelectElement;
    if (el.name) {
      data[el.name] = el.value.trim();
    }
  }
    return data;
};

//Valida se os dados originais foram alterados comparando com os atuais.
export function isFormChanged(form: HTMLFormElement, originalData: Record<string, string>): boolean {
  const currentData = getFormDataSnapshot(form);
  const ignoreFields = ["data_cadastro, data_atualizacao"];

  console.log("originalData:", originalData);
  console.log("currentData:", currentData);

  return Object.keys(originalData).some(key => {
    if (ignoreFields.includes(key)) return false;

    const orig = originalData[key]?.trim();
    const curr = currentData[key]?.trim();

    return orig !== curr;
  })
};

//Formatação de número de telefone/celular.
export function formatPhoneNumber(value: string): string {
  //Remove tudo que não for dígito
  value = value.replace(/\D/g, "");

  //Formata o DDD
  if (value.length > 2) {
    value = "(" + value.substring(0, 2) + ") " + value.substring(2);
  }

  // Formata o restante com 9 dígitos.
  if (value.length > 9) {
    value = value.replace(/(\(\d{2}\) )(\d{4})(\d{4})/, "$1$2-$3");
  } else if (value.length > 8) {
     value = value.replace(/(\(\d{2}\) )(\d{4})(\d{4})/, "$1$2-$3");
  }
    return value;
};

//Formatação de CNPJ.
export function formatCnpj(value: string): string {
  //Remove tudo que não for número
  const digits = value.replace(/\D/g, "").slice(0, 14); //Máximo 14 dígitos

  //Aplica máscara, ex: 00.000.000/0000-00
  return digits 
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
};