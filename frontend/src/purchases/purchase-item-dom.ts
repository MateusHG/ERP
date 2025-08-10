import { attachItemAutoComplete } from "../utils/autocomplete";
import { formatCurrency } from "../utils/formatters";
import { setupItemRowEvents } from "./purchase-items-controller";

// Manipulação de DOM para os itens da compra.

const makeCellInput = (name: string, type = "text", initial = "") => {
  const td = document.createElement("td");
  const input = document.createElement("input");
  input.type = type;
  input.name = name;
  input.value = initial;
  input.autocomplete = "off";
  input.style.minWidth = "60px";
  td.appendChild(input);
  return { td, input };
};

export function createEditableRow(): HTMLTableRowElement {
  const tr = document.createElement("tr");

  const { td: tdProductId, input: inputProductId } = makeCellInput("item-product-id");
  tr.appendChild(tdProductId);

  const { td: tdCode, input: inputCode } = makeCellInput("item-code");
  tr.appendChild(tdCode);

  const { td: tdName, input: inputName } = makeCellInput("item-name");
  tr.appendChild(tdName);

  attachItemAutoComplete(inputName, (item) => {
    const row = inputName.closest("tr")!;
    const inputProductId = row.querySelector('input[name="item-product-id"]') as HTMLInputElement;
    const inputCode = row.querySelector('input[name="item-code"]') as HTMLInputElement;
    const inputItemName = row.querySelector('input[name="item-name"]') as HTMLInputElement;

    inputProductId.value = item.id || "";
    inputCode.value = item.codigo || "";
    inputItemName.value = item.nome || "";
  });

  const { td: tdQuantity, input: inputQuantity } = makeCellInput("item-quantity", "number", "1");
  inputQuantity.min = "1";
  tr.appendChild(tdQuantity);

  const { td: tdUnitPrice, input: inputUnitPrice } = makeCellInput("item-unit-price", "number", "0.00");
  inputUnitPrice.min = "0";
  tr.appendChild(tdUnitPrice);

  const { td: tdDiscount, input: inputDiscount } = makeCellInput("item-discount-volume", "number", "0.00");
  inputDiscount.min = "0";
  tr.appendChild(tdDiscount);

  const tdTotal = document.createElement("td");
  tdTotal.textContent = formatCurrency(0);
  tdTotal.classList.add("item-line-total");
  tr.appendChild(tdTotal);

  // Ações, edit, save, delete.
  const tdActions = document.createElement("td");

  const btnSave = document.createElement("button");
  btnSave.type = "button";
  btnSave.textContent = "✅";
  btnSave.title = "Salvar";

  const btnEdit = document.createElement("button");
  btnEdit.type = "button";
  btnEdit.textContent = "✏️";
  btnEdit.title = "Editar";
  btnEdit.disabled = true; // Começa em edição, então editar desabilitado.

  const btnRemove = document.createElement("button");
  btnRemove.type = "button";
  btnRemove.textContent = "❌";
  btnRemove.title = "Remover";

  tdActions.appendChild(btnSave);
  tdActions.appendChild(btnEdit);
  tdActions.appendChild(btnRemove);
  tr.appendChild(tdActions);

  //Chama o controller para aplicar os eventos.
  setupItemRowEvents(tr);

  return tr;
};
