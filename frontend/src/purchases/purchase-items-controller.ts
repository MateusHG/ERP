import { formatCurrency } from "../utils/formatters";
import { showConfirm, showMessage } from "../utils/messages";
import { recalcLine, updatePurchaseItemSummary } from "./purchase-item-summary";
import { updateTotalPurchaseDisplay } from "./purchase-summary";
import { fetchProductSuggestions } from "./purchases-service";

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
export function setupItemRowEvents(
  tr: HTMLTableRowElement,
  container?: HTMLElement,
  prefix: "new" | "edit" = "new",
  isSaved = false
) {

  setViewMode(tr, isSaved);
  recalcLine(tr);

  const btnSave = tr.querySelector("button[title='Salvar']") as HTMLButtonElement;
  const btnEdit = tr.querySelector("button[title='Editar']") as HTMLButtonElement;
  const btnRemove = tr.querySelector("button[title='Remover']") as HTMLButtonElement;

  const numericInputs = tr.querySelectorAll<HTMLInputElement>(
    'input[name="item-quantity"], input[name="item-unit-price"], input[name="item-discount-volume"]');

  const numericPattern = /^\d+(,\d{1,2})?$/; // apenas números positivos, com opcional decimal

  numericInputs.forEach(input => {
  input.addEventListener("input", () => {
    let value = input.value.trim();

    // Mantém vazio se o usuário apagou tudo
    if (value === "") {
      recalcLine(tr);
      if (container) updatePurchaseItemSummary(container);
      updateTotalPurchaseDisplay(prefix);
      return;
    }

    // Mantém apenas dígitos e vírgula
    value = value.replace(/[^\d,]/g, "");

    // Trava duas casas decimais
    if (value.includes(",")) {
      const [inteiro, decimal] = value.split(",");
      input.value = decimal.length > 2 ? `${inteiro},${decimal.slice(0, 2)}` : value;
    } else {
      input.value = value;
    }

    // Bloqueia números negativos
    const numericValue = parseFloat(input.value.replace(",", "."));
    if (isNaN(numericValue) || numericValue < 0) {
      input.value = "";
    }

    recalcLine(tr);

    const totalDiscountCell = tr.querySelector(".item-total-discount") as HTMLElement;
    if (totalDiscountCell) {
      const quantity = parseFloat((tr.querySelector('[name="item-quantity"]') as HTMLInputElement).value.replace(",", ".")) || 0; 
      const discountPerUnit = parseFloat((tr.querySelector('[name="item-discount-volume"]') as HTMLInputElement).value.replace(",", ".")) || 0;
      totalDiscountCell.textContent = formatCurrency(quantity * discountPerUnit);
    }

    if (container) updatePurchaseItemSummary(container);
    updateTotalPurchaseDisplay(prefix);
  });
});

  btnSave.addEventListener("click", async () => {
    // Valida campos numéricos antes de salvar (evita números negativos)
    for (const input of numericInputs) {
      const value =input.value.trim();

      if (value === "") {
        await showMessage("Preencha todos os campos numéricos.");
        return;
      }

      if (!numericPattern.test(value)) {
        await showMessage("Valores numéricos devem ser positivos.");
        return;
      }
    }

    const inputId = tr.querySelector('input[name="item-product-id"]') as HTMLInputElement;
    const inputCode = tr.querySelector('input[name="item-code"]') as HTMLInputElement;
    const inputName = tr.querySelector('input[name="item-name"]') as HTMLInputElement;

    //Validação para caso o usuário altere os campos do código e nome, ao salvar substitui os campos com as informações corretas buscando o produto pelo id.
    if (inputId && inputId.value) {
      try {
        const [produto] = await fetchProductSuggestions({ id: inputId.value });

        //Valida se o ID é válido antes de salvar.
        if (!produto) {
          await showMessage("ID do produto inválido.");
          return;
        }
          inputCode.value = produto.codigo;
          inputName.value = produto.nome;

      } catch (err) {
        console.error("Erro ao validar produto:", err);
        await showMessage("Erro ao validar o produto, tente novamente.");
        return;
      }
    } else {
      await showMessage("Informe o ID do produto antes de salvar.");
      return;
    }

    recalcLine(tr);
    setViewMode(tr, true);
    if (container) updatePurchaseItemSummary(container);

    updateTotalPurchaseDisplay(prefix);
  });

  btnEdit.addEventListener("click", () => {
    setViewMode(tr, false);
  });

  btnRemove.addEventListener("click", async () => {
    const confirm = await showConfirm("Confirma a remoção do item?")
    if (!confirm) return;

    tr.remove();
    if (container) updatePurchaseItemSummary(container);
    updateTotalPurchaseDisplay(prefix);
  });
}

// Coleta todos os dados das linhas preenchidas.
export async function collectPurchaseItems(container: HTMLElement) {
  const rows = Array.from(container.querySelectorAll("tr"));

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
