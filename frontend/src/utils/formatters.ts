//Formatação de data
export function formatData(dataStr: string): string {
  const data = new Date(dataStr);
  return data.toLocaleDateString("pt-BR");
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
  "edit-desconto-financeiro",
  "edit-desconto-comercial",
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

  // Formata o valor para moeda BR
  input.value = formatCurrency(numericValue);

  // Ajusta a posição do cursor para evitar pular muito
  const newLength = input.value.length;
  const diff = newLength - oldLength;
  const newCursorPos = Math.max(0, cursorPos + diff);
  input.setSelectionRange(newCursorPos, newCursorPos);
}

// Inicializa os inputs para aplicar máscara no evento 'input'
export function setupCurrencyInputs(): void {
  currencyInputIds.forEach((id) => {
    const input = document.getElementById(id) as HTMLInputElement | null;
    if (!input) return;

    // Se já tiver valor no input (ex: edição), formata na abertura
    input.value = formatCurrency(parseCurrency(input.value));

    // Aplica máscara a cada digitação
    input.addEventListener("input", () => {
      applyCurrencyMask(input);
    });

    // Opcional: tratar colar para manter formato
    input.addEventListener("paste", (event) => {
      event.preventDefault();
      const pasteText = event.clipboardData?.getData("text") ?? "";
      const numericValue = parseCurrency(pasteText);
      input.value = formatCurrency(numericValue);
    });
  });
}

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