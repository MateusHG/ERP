import { formatCep, formatCnpj, formatPhoneNumber } from "./formatters";

// Funções que recebem o formulário, busca os inputs, adicionam os listeners e aplicam as funções do formaters.ts

export function attachInputFormatters(form: HTMLFormElement) {
  const cnpjInput = form.elements.namedItem("cnpj") as HTMLInputElement | null;
  const phoneInput = form.elements.namedItem("telefone") as HTMLInputElement | null;
  const cellInput = form.elements.namedItem("celular") as HTMLInputElement | null;
  const cepInput = form.elements.namedItem("cep") as HTMLInputElement | null;

  // Evita adicionar listeners duplicados
  function attachOnce(input: HTMLInputElement | null, formatter: (v: string) => string) {
    if (!input) return;

    if (input.dataset.listenerAttached === "true") return;
    input.dataset.listenerAttached = "true";

    input.addEventListener("input", (e) => {
      const target = e.target as HTMLInputElement;

      // Se o campo estiver bloqueado, não formata
      if (target.readOnly) {
        e.preventDefault();
        return;
      }

      const cursorPosition = target.selectionStart ?? 0;
      const oldLength = target.value.length;

      target.value = formatter(target.value);

      const newLength = target.value.length;
      const diff = newLength - oldLength;
      target.selectionStart = target.selectionEnd = cursorPosition + diff;
    });
  }

  // Aplica formatação
  attachOnce(cnpjInput, formatCnpj);
  attachOnce(phoneInput, formatPhoneNumber);
  attachOnce(cellInput, formatPhoneNumber);
  attachOnce(cepInput, formatCep);
};
