import { showConfirm } from "../utils/messages";
import { formatCurrency } from "../utils/formatters";
import { recalcLine, updatePurchaseItemSummary } from "./purchase-item-summary";

// Atualiza o estado de visualização ou edição de uma linha.
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

// Aplica os eventos aos botões e inputs da linha.
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
    updatePurchaseItemSummary();
  });

  btnEdit.addEventListener("click", () => {
    setViewMode(tr, false);
  });

  btnRemove.addEventListener("click", async () => {
    const confirm = await showConfirm("Confirma a remoção do item?")
    if (!confirm) return;

    tr.remove();
    updatePurchaseItemSummary();
  });
}

// Coleta todos os dados das linhas preenchidas.
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
