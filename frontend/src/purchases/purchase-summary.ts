import { formatCurrency } from "../utils/formatters";

export function updatePurchaseSummary() {
  const itemsBody = document.getElementById("items-body")!;
  const rows = Array.from(itemsBody.querySelectorAll("tr"));
  let subtotal = 0;

  rows.forEach(row => {
    const totalCell = row.querySelector(".item-line-total") as HTMLElement;
    if (!totalCell) return;

    const text = totalCell.textContent || "";
    const numeric = parseFloat(
      text
        .replace(/\./g, "")
        .replace(",", ".")
        .replace(/[^\d\.]/g, "")
    );

    if (!isNaN(numeric)) subtotal += numeric;
  });

  const valorBrutoInput = document.getElementById("valor-bruto") as HTMLInputElement | null;
  const valorTotalInput = document.getElementById("valor-total") as HTMLInputElement | null;
  const subtotalSpan = document.getElementById("subtotal") as HTMLInputElement | null;
  const discountSpan = document.getElementById("discounts") as HTMLInputElement | null;

  const descontoFinanceiro = parseFloat((document.getElementById("edit-desconto-financeiro") as HTMLInputElement)?.value) || 0;
  const descontoComercial = parseFloat((document.getElementById("edit-desconto-comercial") as HTMLInputElement)?.value) || 0;
  const totalDescontos = descontoFinanceiro + descontoComercial;

  const valorTotal = subtotal - totalDescontos;

  if (valorBrutoInput) valorBrutoInput.value = subtotal.toFixed(2);
  if (valorTotalInput) valorTotalInput.value = valorTotal.toFixed(2);
  if (subtotalSpan) subtotalSpan.textContent = formatCurrency(subtotal);
  if (discountSpan) discountSpan.textContent = formatCurrency(totalDescontos);
};