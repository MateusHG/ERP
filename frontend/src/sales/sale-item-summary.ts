import { formatCurrency } from "../utils/formatters";

export function recalcLine(tr: HTMLTableRowElement) {
  const quantity = parseFloat((tr.querySelector('[name="item-quantity"]') as HTMLInputElement)?.value.replace(",", ".")) || 0;
  const unitPrice = parseFloat((tr.querySelector('[name="item-unit-price"]') as HTMLInputElement)?.value.replace(",", ".")) || 0;
  const discountPerUnit = parseFloat((tr.querySelector('[name="item-discount-volume"]') as HTMLInputElement)?.value.replace(",", ".")) || 0;

  const gross = quantity * unitPrice;
  const lineDiscount = discountPerUnit * quantity;
  const lineTotal = Math.max(0, gross - lineDiscount);

  const discountCell = tr.querySelector(".item-line-discount") as HTMLElement;
  if (discountCell) discountCell.textContent = formatCurrency(lineDiscount);

  const totalCell = tr.querySelector(".item-line-total") as HTMLElement;
  if (totalCell) totalCell.textContent = formatCurrency(lineTotal)
};

export function updateSaleItemSummary(container: HTMLElement, prefix: "new" | "edit" = "new") {
  const rows = Array.from(container.querySelectorAll("tr"));

  let subtotal = 0;
  let totalDiscounts = 0;
  let totalItemsWithDiscount = 0;

  for (const row of rows) {
    const quantity = parseFloat((row.querySelector('[name="item-quantity"]') as HTMLInputElement)?.value.replace(",", ".")) || 0;
    const unitPrice = parseFloat((row.querySelector('[name="item-unit-price"]') as HTMLInputElement)?.value.replace(",", ".")) || 0;
    const discountPerUnit = parseFloat((row.querySelector('[name="item-discount-volume"]') as HTMLInputElement).value.replace(",", ".")) || 0;

    const gross = quantity * unitPrice;
    const lineDiscount = discountPerUnit * quantity;
    const lineTotal = Math.max(0, gross - lineDiscount);

    subtotal += gross;
    totalDiscounts += lineDiscount;
    totalItemsWithDiscount += lineTotal;

    const discountCell = row.querySelector(".item-line-discount") as HTMLElement;
    if (discountCell) discountCell.textContent = formatCurrency(lineDiscount);
    
    const totalCell = row.querySelector(".item-line-total") as HTMLElement;
    if (totalCell) totalCell.textContent = formatCurrency(lineTotal);
  }

  // Atualiza os campos espelho no cabeçalho da venda.
  const valorBrutoEl = document.getElementById(`${prefix}-valor-bruto`) as HTMLInputElement | null;
  if (valorBrutoEl) valorBrutoEl.value = formatCurrency(subtotal);

  const descontoVolumeEl = document.getElementById(`${prefix}-desconto-itens`) as HTMLInputElement | null;
  if (descontoVolumeEl) descontoVolumeEl.value = formatCurrency(totalDiscounts);

  const subtotalItems = document.getElementById(`${prefix}-subtotal-items`) as HTMLInputElement | null;
  if (subtotalItems) subtotalItems.textContent = formatCurrency(subtotal);

  const totalItemsDiscountEl = document.getElementById(`${prefix}-total-items-discount`) as HTMLInputElement | null;
  if (totalItemsDiscountEl) totalItemsDiscountEl.textContent = formatCurrency(totalDiscounts);

  const totalItemsFinal = document.getElementById(`${prefix}-total-items-final`) as HTMLInputElement | null;
  if (totalItemsFinal) totalItemsFinal.textContent = formatCurrency(totalItemsWithDiscount);
};

// Reseta os valores do summary, necessário pois ao cadastrar uma venda e depois cadastrar uma nova em seguida,
// estava trazendo os valores da venda anterior.
export function resetSaleItemSummary(prefix: "new" | "edit" = "new") {
  const zero = formatCurrency(0);

  const valorBrutoEl = document.getElementById(`${prefix}-valor-bruto`) as HTMLInputElement | null;
  if (valorBrutoEl) valorBrutoEl.value = zero;

  const descontoVolumeEl = document.getElementById(`${prefix}-desconto-itens`) as HTMLInputElement | null;
  if (descontoVolumeEl) descontoVolumeEl.value = zero;

  const subtotalItemsEl = document.getElementById(`${prefix}-subtotal-items`) as HTMLElement | null;
  if (subtotalItemsEl) subtotalItemsEl.textContent = zero;

  const totalItemsDiscountEl = document.getElementById(`${prefix}-total-items-discount`) as HTMLElement | null;
  if (totalItemsDiscountEl) totalItemsDiscountEl.textContent = zero;

  const totalItemsFinalEl = document.getElementById(`${prefix}-total-items-final`) as HTMLElement | null;
  if (totalItemsFinalEl) totalItemsFinalEl.textContent = zero;

  // Garante que o purchase-summary também recalcule zerado
  document.dispatchEvent(new CustomEvent("itemsUpdated", { detail: { container: null, prefix } }));
};