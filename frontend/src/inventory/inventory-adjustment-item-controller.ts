import { showConfirm, showMessage } from "../utils/messages";
import { fetchProductSuggestions } from "./inventory-service";

// Controla os estados das linhas do ajuste de estoque

export function setViewMode(tr: HTMLTableRowElement, isView: boolean) {
  const inputs = tr.querySelectorAll("input");
  inputs.forEach(input => {
    const inp = input as HTMLInputElement;
    inp.readOnly = isView;
    inp.style.background = isView ? "#f9f9f9" : "white";
  });

  const btnSave = tr.querySelector("button[title='Salvar']") as HTMLButtonElement | null;
  const btnEdit = tr.querySelector("button[title='Editar']") as HTMLButtonElement | null;

  if (btnSave) btnSave.disabled = isView;
  if (btnEdit) btnEdit.disabled = !isView;

  tr.dataset.status = isView ? "salvo" : "editando";
};

// Aplica os eventos aos botões e inputs da linha
export function setupItemRowEvents(tr: HTMLTableRowElement, container?: HTMLElement, isSaved = false) {
  
  setViewMode(tr, isSaved);

  const btnSave = tr.querySelector("button[title='Salvar']") as HTMLButtonElement;
  const btnEdit = tr.querySelector("button[title='Editar']") as HTMLButtonElement;
  const btnRemove = tr.querySelector("button[title='Remover']") as HTMLButtonElement;

  const numericInputs = tr.querySelectorAll<HTMLInputElement>(
    'input[name="item-quantity"], input[name="item-unit-price"]');

  const numericPattern = /^\d+(,\d{1,2})?$/; // apenas números positivos

  numericInputs.forEach(input => {
    input.addEventListener("input", () => {
      let value = input.value.trim();

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
    });
  });

  btnSave.addEventListener("click", async () => {
    // Valida campos numéricos antes de salvar
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

      // Valida o ID antes de salvar.
      if (!produto) {
        await showMessage("ID do produto inválido.");
        return;
      }

      inputCode.value = produto.codigo;
      inputName.value = produto.nome;

      setViewMode(tr, true);
      tr.dataset.saved = "true" // Marca linha como salvo

    } catch (err) {
      console.error("Erro ao validar produtos", err);
      await showMessage("Erro ao validar produto, tente novamente");
      return;
    }
  });

  btnEdit.addEventListener("click", () => {
    setViewMode(tr, false);
  });

  btnRemove.addEventListener("click", async () => {
    const confirm = await showConfirm("Confirma a remoção do item?");
    if (!confirm) return;

    tr.remove();
  });
};