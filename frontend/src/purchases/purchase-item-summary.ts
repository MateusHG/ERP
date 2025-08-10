// purchase-item-summary.ts
import { formatCurrency } from "../utils/formatters";

export function recalcLine(tr: HTMLTableRowElement) {
  const quantity = parseFloat((tr.querySelector('[name="item-quantity"]') as HTMLInputElement)?.value) || 0;
  const unit = parseFloat((tr.querySelector('[name="item-unit-price"]') as HTMLInputElement)?.value) || 0;
  const discountPerUnit = parseFloat((tr.querySelector('[name="item-discount-volume"]') as HTMLInputElement)?.value) || 0;

  const gross = quantity * unit;
  const lineDiscount = discountPerUnit * quantity;
  const lineTotal = Math.max(0, gross - lineDiscount);

  const totalCell = tr.querySelector(".item-line-total") as HTMLElement;
  if (totalCell) totalCell.textContent = formatCurrency(lineTotal);
}

export function updatePurchaseItemSummary() {
  const rows = Array.from(document.querySelectorAll("#items-body tr"));

  let subtotal = 0;
  let totalDiscounts = 0;
  let totalItemsWithDiscount = 0;

  for (const row of rows) {
    const quantity = parseFloat((row.querySelector('[name="item-quantity"]') as HTMLInputElement)?.value) || 0;
    const unit = parseFloat((row.querySelector('[name="item-unit-price"]') as HTMLInputElement)?.value) || 0;
    const discountPerUnit = parseFloat((row.querySelector('[name="item-discount-volume"]') as HTMLInputElement)?.value) || 0;

    const gross = quantity * unit;
    const lineDiscount = discountPerUnit * quantity;
    const lineTotal = Math.max(0, gross - lineDiscount);

    subtotal += gross;
    totalDiscounts += lineDiscount;
    totalItemsWithDiscount += lineTotal;

    const totalCell = row.querySelector(".item-line-total") as HTMLElement;
    if (totalCell) totalCell.textContent = formatCurrency(lineTotal);
  }

  //Atualiza os campos espelho no cabeçalho da compra.
  const valorBrutoEl = document.getElementById("valor-bruto") as HTMLInputElement | null;
  if (valorBrutoEl) valorBrutoEl.value = formatCurrency(subtotal);

  const descontoVolumeEl = document.getElementById("desconto-itens") as HTMLInputElement | null;
  if (descontoVolumeEl) descontoVolumeEl.value = formatCurrency(totalDiscounts);

  // Atualiza apenas os totais de itens
  (document.getElementById("subtotal-items") as HTMLElement).textContent = formatCurrency(subtotal);
  (document.getElementById("total-items-discount") as HTMLElement).textContent = formatCurrency(totalDiscounts);
  (document.getElementById("total-items-final") as HTMLElement).textContent = formatCurrency(totalItemsWithDiscount);

  // Dispara evento para o purchase-summary recalcular o total final
  document.dispatchEvent(new CustomEvent("itemsUpdated", {
    detail: { subtotal, totalDiscounts, totalItemsWithDiscount }
  }));
};
