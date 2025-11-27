import { origemMovLabels } from "../inventory/inventory-model";

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
};

// ========================================================================
export const parseString = (value: FormDataEntryValue | null) => 
    value && value.toString().trim() !== "" ? value.toString() : null;

export const parseNumber = (value: FormDataEntryValue | null) => 
    value ? Number(value.toString().replace(",", ".")) : null;
// =============================================================================

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

export function parseCurrency(value: string | null | undefined): number {
  if (!value) return 0;

  // mantém somente números, vírgula, ponto
  value = value.replace(/[^\d,.\-]/g, "");

  // remove pontos de milhar
  value = value.replace(/\.(?=\d{3})/g, "");

  // normaliza para vírgula (caso tenha vindo com ponto)
  value = value.replace(/\./g, ",");

  // separa parte inteira e decimal
  const [inteira, decimal] = value.split(",");

  // garante somente números na parte inteira
  const intPart = inteira.replace(/\D/g, "") || "0";

  // limita decimais a no máximo 2
  let decPart = (decimal || "").replace(/\D/g, "");
  if (decPart.length > 2) decPart = decPart.slice(0, 2);

  // monta número normalizado no formato JS (com ponto)
  const finalValue = decPart ? `${intPart}.${decPart}` : intPart;

  const num = parseFloat(finalValue);
  return isNaN(num) ? 0 : num;
};


// Aplica a máscara somente para inputs READONLY
// mantendo compatibilidade sem interferir em campos de edição
function applyCurrencyMask(input: HTMLInputElement) {

  // Só formata campos READONLY
  if (!input.readOnly) {
    return; // agora NÃO mexemos em campos editáveis
  }

  // Converter para número
  const numericValue = parseCurrency(input.value);

  // Formatar moeda
  input.value = formatCurrency(numericValue);
};


// Inicializa os inputs para aplicar máscara no evento 'input'
// Inicializa os inputs para aplicar máscara no evento 'input'
export function setupCurrencyInputs(): void {
  const currencyInputs = document.querySelectorAll<HTMLInputElement>(
    "#desconto-itens, #descontos-totais, #valor-bruto, #valor-total, \
     #new-desconto-financeiro, #new-desconto-comercial, \
     #edit-desconto-financeiro, #edit-desconto-comercial"
  );

  currencyInputs.forEach((input) => {

    // ===============================
    // FORMATAR APENAS CAMPOS READONLY
    // ===============================
    if (input.readOnly) {
      const num = parseCurrency(input.value);
      input.value = formatCurrency(num);
      return; // nada de listeners para readonly
    }

    // ===============================
    // DIGITAÇÃO LIVRE (sem moeda)
    // ===============================
    input.addEventListener("input", () => {
      let v = input.value;

      // remover hífens
      v = v.replace(/-/g, "");

      // manter apenas números + vírgula
      v = v.replace(/[^\d,]/g, "");

      // permitir apenas UMA vírgula
      const parts = v.split(",");
      if (parts.length > 2) {
        v = parts[0] + "," + parts.slice(1).join("");
      }

      // limitar a 2 dígitos após a vírgula
      const [inteiro, decimal] = v.split(",");
      if (decimal && decimal.length > 2) {
        v = inteiro + "," + decimal.slice(0, 2);
      }

      input.value = v;
    });

    // ===============================
    // COLAR — sempre limpar e limitar
    // ===============================
    input.addEventListener("paste", (event) => {
      event.preventDefault();

      const pasted = event.clipboardData?.getData("text") ?? "";
      let v = pasted.replace(/[^\d,]/g, "");

      const parts = v.split(",");
      if (parts.length > 2) {
        v = parts[0] + "," + parts.slice(1).join("");
      }

      const [inteiro, decimal] = v.split(",");
      if (decimal && decimal.length > 2) {
        v = inteiro + "," + decimal.slice(0, 2);
      }

      input.value = v;
    });
  });
};


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


// Formatters para movimentações do inventory(estoque)
export function capitalize(str: string) {
  if (!str) return str;
  return str[0].toUpperCase() + str.slice(1).replace(/_/g, " ");
};

export function safeLabel(map: Record<string, string>, key: unknown) {
  if (!key && key !== 0) return "-";
  const k = String(key);
  return map[k] ?? capitalize(k);
};

export function formatOrigemWithRef(origem: any, referencia_id: any) {
  const base = safeLabel(origemMovLabels, origem);
  if (referencia_id || referencia_id === 0) {
    return `${base} Nº #${referencia_id}`;
  }
  return base;
};