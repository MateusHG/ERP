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

  tr.dataset.status = isView ? "salvo" : "editando";
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
      const value = input.value.trim();

      if (value === "") {
        await showMessage("Preencha todos os campos numéricos com quantidades válidas.");
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
    const inputQuantity = tr.querySelector('input[name="item-quantity"]') as HTMLInputElement;

    //Validação para caso o usuário altere os campos do código e nome, ao salvar substitui os campos com as informações corretas buscando o produto pelo id.
    if (!inputId || !inputId.value) {
      await showMessage("Informe o ID do produto antes de salvar.");
      return;
    }

    const itemQuantityValue = Number(inputQuantity.value);

    if (itemQuantityValue <= 0) {
      await showMessage("Obrigatório informar uma quantidade maior que 0.");
      return;
    }

      try {
        const [produto] = await fetchProductSuggestions({ id: inputId.value });

        //Valida se o ID é válido antes de salvar.
        if (!produto) {
          await showMessage("ID do produto inválido.");
          return;
        }

          inputCode.value = produto.codigo;
          inputName.value = produto.nome;

          recalcLine(tr);
          setViewMode(tr, true);
          tr.dataset.saved = "true"; // Marca como salvo

          if (container) updatePurchaseItemSummary(container);
          updateTotalPurchaseDisplay(prefix);
          
      } catch (err) {
        console.error("Erro ao validar produto:", err);
        await showMessage("Erro ao validar o produto, tente novamente.");
        return;
      }
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

    const produto_id = Number(get("item-product-id"));
    if (!produto_id || isNaN(produto_id)) {
      return null;
    }

    return {
      produto_id,
      produto_codigo: get("item-code"),
      produto_nome: get("item-name"),
      quantidade: Number(get("item-quantity")) || 0,
      preco_unitario: parseFloat(get("item-unit-price").replace(",", ".")) || 0,
      desconto_unitario: parseFloat(get("item-discount-volume").replace(",", ".")) || 0,
      valor_subtotal: parseFloat(
          totalText.replace(/[^\d,.-]/g, "").replace(",", ".")
        ) || 0,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null); // remove nulos
};

// Bloqueia botões de adição/edição de itens caso a compra já esteja recebida/finalizada
export function lockPurchaseItems(container: HTMLElement, helperMessage: string) {
  const buttons = container.querySelectorAll("button");
  const inputs = container.querySelectorAll("input");

  const addBtn = document.querySelector("#add-item-edit-modal");
  if (addBtn instanceof HTMLButtonElement) {
    addBtn.disabled = true;
    addBtn.title = helperMessage;
    addBtn.style.cursor = "not-allowed";
  }

  buttons.forEach((btn) => {
    btn.disabled = true;
    btn.title = helperMessage;
    btn.style.cursor = "not-allowed";
  });

  inputs.forEach((inp) => {
    inp.readOnly = true;
    inp.style.background = "#f5f5f5";
    inp.title = helperMessage;
    inp.style.cursor = "not-allowed";
  });
};

export function unlockPurchaseItems(itemsBody: HTMLElement) {
  const rows = itemsBody.querySelectorAll("tr");

  rows.forEach(row => {
    const inputs = row.querySelectorAll<HTMLInputElement | HTMLSelectElement>("input, select");

    inputs.forEach(input => {
      if (input instanceof HTMLInputElement) {
        input.readOnly = false;
      }

      if (input instanceof HTMLSelectElement) {
        input.disabled = false;
      }

      input.style.pointerEvents = "auto";
      input.style.background = "";
      input.style.color = "";
      input.title = "";
      input.style.cursor = "text";
    });
  
    const buttons = row.querySelectorAll("button")
    buttons.forEach(btn => {
      btn.disabled = false;
      btn.title = "";
      btn.style.cursor = "pointer";
    });
  });

  const addBtn = document.querySelector("#add-item-edit-modal");
  if (addBtn instanceof HTMLButtonElement) {
    addBtn.disabled = false;
    addBtn.title = "";
    addBtn.style.cursor = "pointer";
  }
};