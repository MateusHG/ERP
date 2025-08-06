import { formatCurrency } from "../utils/formatters";
import { updatePurchaseSummary } from "./purchase-summary";

// ✅ Atualiza o estado de visualização ou edição de uma linha
export function setViewMode(tr: HTMLTableRowElement, isView: boolean) {
  const inputs = tr.querySelectorAll("input"); // corrigido para "input" minúsculo
  inputs.forEach((input) => {
    const inp = input as HTMLInputElement;
    inp.readOnly = isView;
    inp.style.background = isView ? "#f9f9f9" : "white";
  });

  const btnSave = tr.querySelector("button[title='Salvar']") as HTMLButtonElement;
  const btnEdit = tr.querySelector("button[title='Editar']") as HTMLButtonElement;

  btnSave.disabled = isView;
  btnEdit.disabled = !isView;
}

// ✅ Recalcula o total da linha
export function recalcLine(tr: HTMLTableRowElement) {
  const quantity = parseFloat((tr.querySelector('[name="item-quantity"]') as HTMLInputElement)?.value) || 0;
  const unit = parseFloat((tr.querySelector('[name="item-unit-price"]') as HTMLInputElement)?.value) || 0;
  const discount = parseFloat((tr.querySelector('[name="item-discount-volume"]') as HTMLInputElement)?.value) || 0;

  const gross = quantity * unit;
  const total = Math.max(0, gross - discount);

  const totalCell = tr.querySelector(".item-line-total") as HTMLElement;
  totalCell.textContent = formatCurrency(total);
}

// ✅ Aplica os eventos aos botões e inputs da linha
export function setupItemRowEvents(tr: HTMLTableRowElement) {
  setViewMode(tr, false);
  recalcLine(tr);

  const btnSave = tr.querySelector("button[title='Salvar']") as HTMLButtonElement;
  const btnEdit = tr.querySelector("button[title='Editar']") as HTMLButtonElement;
  const btnRemove = tr.querySelector("button[title='Remover']") as HTMLButtonElement;

  const inputs = tr.querySelectorAll('input[name="item-quantity"], input[name="item-unit-price"], input[name="item-discount-volume"]');
  inputs.forEach((input) => {
    input.addEventListener("input", () => {
      recalcLine(tr);
    });
  });

  btnSave.addEventListener("click", () => {
    recalcLine(tr);
    setViewMode(tr, true);
    updatePurchaseSummary();
  });

  btnEdit.addEventListener("click", () => {
    setViewMode(tr, false);
  });

  btnRemove.addEventListener("click", () => {
    tr.remove();
    updatePurchaseSummary();
  });
}

// ✅ Coleta todos os dados das linhas preenchidas
export async function collectPurchaseItems() {
  const itemsBody = document.getElementById("items-body")!;
  const rows = Array.from(itemsBody.querySelectorAll("tr"));

  return rows.map(row => {
    const get = (name: string) => {
      const inp = row.querySelector(`input[name="${name}"]`) as HTMLInputElement | null;
      return inp ? inp.value : "";
    };

    const totalText = (row.querySelector(".item-line-total") as HTMLElement).textContent || "";

    return {
      product_id: get("item-product-id"),
      code: get("item-code"),
      name: get("item-name"),
      quantity: get("item-quantity"),
      unit_price: get("item-unit-price"),
      discount_volume: get("item-discount-volume"),
      line_total: totalText,
    };
  });
}
