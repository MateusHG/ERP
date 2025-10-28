//Formatação de data
export function formatData(dataStr: string): string {
  const data = new Date(dataStr);
  return data.toLocaleDateString("pt-BR");
};

// Formatação de Data + Hora
export function formatDataAndTime(dataStr: string): string {
  if (!dataStr) return "-";

  const data = new Date(dataStr.replace(" ", "T"));

  if (isNaN(data.getTime())) return "-";

  const day = String(data.getDate()).padStart(2, "0");
  const month = String(data.getMonth() + 1).padStart(2, "0");
  const year = data.getFullYear();

  const hours = String(data.getHours()).padStart(2, "0");
  const minutes = String(data.getMinutes()).padStart(2, "0");
  const seconds = String(data.getSeconds()).padStart(2, "0");

  return `${day}/${month}/${year} às ${hours}:${minutes}:${seconds}`;
}

export function getCurrentMonthDateRange(): { start: string, end: string } {
  // Gera datas padrão para o mês atual
  const today = new Date();
  const month = today.getMonth(); // 0 = Janeiro
  const year = today.getFullYear();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  //Formata a data.
  const formatDate = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

  return {
    start: formatDate(firstDay),
    end: formatDate(lastDay)
  };
};

//Formatar os valores em reais;
export const formatCurrency = (value: number | string ): string  => {
  if (value === undefined || value === null ) return "R$ 0,00";

  const numberValue = typeof value === "string" ? parseFloat(value): value;

  if (isNaN(numberValue)) return "R$ 0,00";
  
  return numberValue.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
};

// Formatar os valores ao abrir os modais de edição/criação de nova compra.
export function parseCurrency(value: string): number {
  if (!value) return 0;

  // Remove tudo que não seja número, vírgula ou ponto
  // Remove "R$", espaços e pontos de milhar
  const cleaned = value
    .replace(/\s/g, "")
    .replace("R$", "")
    .replace(/\./g, "")
    .replace(/,/g, ".");

  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

const currencyInputIds = [
  "desconto-itens",
  "descontos-totais",
  "valor-bruto",
  "valor-total",

];

// Aplica a máscara (formatação) no input mantendo o cursor próximo da posição correta
function applyCurrencyMask(input: HTMLInputElement) {
  // Guarda posição do cursor antes da formatação
  const cursorPos = input.selectionStart ?? 0;
  const oldLength = input.value.length;

  // Pega valor numérico limpo (parse de string formatada)
  const numericValue = parseCurrency(input.value);

  if (input.readOnly) {
    input.value = formatCurrency(numericValue);
  } else {
    input.value = formatCurrency(numericValue).replace("R$", "").trim();
  }

  if (!input.readOnly) {
  const newLength = input.value.length;
  const diff = newLength - oldLength;
  const newCursorPos = Math.max(0, cursorPos + diff);
  input.setSelectionRange(newCursorPos, newCursorPos);
  }
}

// Inicializa os inputs para aplicar máscara no evento 'input'
export function setupCurrencyInputs(): void {
    const currencyInputs = document.querySelectorAll<HTMLInputElement>(
       "#desconto-itens, #descontos-totais, #valor-bruto, #valor-total, #edit-desconto-financeiro, #edit-desconto-comercial"
    );

    currencyInputs.forEach((input) => {
      applyCurrencyMask(input);

    if (!input.readOnly) {
      input.addEventListener("input", () => applyCurrencyMask(input));

      input.addEventListener("paste", (event) => {
        event.preventDefault();
        const pastText = event.clipboardData?.getData("text") ?? "";
        input.value = formatCurrency(parseCurrency(pastText)).replace("R$", "").trim();
      });
    }

    // Opcional: tratar colar para manter formato
    input.addEventListener("paste", (event) => {
      event.preventDefault();
      const pasteText = event.clipboardData?.getData("text") ?? "";
      const numericValue = parseCurrency(pasteText);
      input.value = formatCurrency(numericValue);
    });
  });
}

//Gera um <span> com R$, para usar nos campos de itens que são criados dinamicamente.
// Formata número para pt-BR sem R$
export const formatEditableCurrency = (value: number | string): string => {
  const numberValue = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(numberValue)) return "0,00";
  return numberValue.toFixed(2).replace(".", ",");
};

// Cria célula de input monetário com prefixo R$
export const makeCurrencyCellInput = (name: string, initial: number | string = "") => {
  const td = document.createElement("td");
  td.style.position = "relative";

  // Prefixo R$
  const span = document.createElement("span");
  span.textContent = "R$";
  span.classList.add("prefix");
  span.style.position = "absolute";
  span.style.left = "12px";
  span.style.top = "50%";
  span.style.transform = "translateY(-50%)";
  span.style.pointerEvents = "none";

  // Input
  const input = document.createElement("input");
  input.type = "text";
  input.name = name;
  input.autocomplete = "off";
  input.style.width = "100%";
  input.style.paddingLeft = "30px"; // espaço para o R$

  if (initial !== undefined && initial!== null && initial !== "") {
    input.value = Number(initial).toFixed(2).replace(".", ",");
  } else {
    input.value = "";
  }

  input.addEventListener("input", () => {
    input.value = input.value.replace(/[^\d,]/g, "");
  });

  // Formata ao perder foco, mas permite campo vazio
  input.addEventListener("blur", () => {
    const trimmed = input.value.trim();
    if (!trimmed) return; // mantém vazio se usuário apagou tudo
    const numericValue = parseFloat(trimmed.replace(",", ".")); 
    if (!isNaN(numericValue)) {
      input.value = numericValue.toFixed(2).replace(".", ",");
    }
  });

  td.appendChild(span);
  td.appendChild(input);

  return { td, input };
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