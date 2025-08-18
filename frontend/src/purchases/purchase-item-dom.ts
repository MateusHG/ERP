import { attachItemAutoComplete } from "../utils/autocomplete";
import { formatCurrency } from "../utils/formatters";
import { setupItemRowEvents } from "./purchase-items-controller";

// Manipulação de DOM para os itens da compra.

const makeCellInput = (name: string, type = "text", initial = "", placeholder = "") => {
  const td = document.createElement("td");
  const input = document.createElement("input");
  input.type = type;
  input.name = name;
  input.value = initial;
  input.placeholder = placeholder;
  input.autocomplete = "off";
  input.style.minWidth = "60px";
  td.appendChild(input);
  return { td, input };
};

export function createEditableRow(item?: any, isSaved: boolean = false): HTMLTableRowElement {
  const tr = document.createElement("tr");

  const { td: tdProductId, input: inputProductId } = makeCellInput(
    "item-product-id", "text", item?.produto_id.toString() || "", "Digite o ID..."
  );
  tr.appendChild(tdProductId);

  const { td: tdCode, input: inputCode } = makeCellInput(
    "item-code", "text", item?.produto_codigo || "", "Digite o código..."
  );
  tr.appendChild(tdCode);

  const { td: tdName, input: inputName } = makeCellInput(
    "item-name", "text", item?.produto_nome || "", "Digite o nome.."
  );
  tr.appendChild(tdName);

  const fillRow = (autoItem: any) => {
    inputProductId.value = autoItem.id || "";
    inputCode.value = autoItem.codigo || "";
    inputName.value = autoItem.nome || "";
  };

  attachItemAutoComplete(inputProductId, fillRow);
  attachItemAutoComplete(inputCode, fillRow);
  attachItemAutoComplete(inputName, fillRow);

  const { td: tdQuantity, input: inputQuantity } = makeCellInput(
    "item-quantity", "number", item?.quantidade.toString() || "1"
  );
  inputQuantity.min = "1";
  tr.appendChild(tdQuantity);

  const { td: tdUnitPrice, input: inputUnitPrice } = makeCellInput(
    "item-unit-price", "number", item?.preco_unitario.toString() || "0.00"
  );
  inputUnitPrice.min = "0";
  tr.appendChild(tdUnitPrice);

  const { td: tdDiscount, input: inputDiscount } = makeCellInput(
    "item-discount-volume", "number", item?.desconto_volume?.toString() || "0.00"
  );
  inputDiscount.min = "0";
  tr.appendChild(tdDiscount);

  const tdTotal = document.createElement("td");
  tdTotal.textContent = item ? formatCurrency(Number(item.valor_subtotal || 0)) : formatCurrency(0);
  tdTotal.classList.add("item-line-total");
  tr.appendChild(tdTotal);

  // Ações
  const tdActions = document.createElement("td");

  const btnSave = document.createElement("button");
  btnSave.type = "button";
  btnSave.textContent = "✅";
  btnSave.title = "Salvar";
  btnSave.disabled = isSaved;

  const btnEdit = document.createElement("button");
  btnEdit.type = "button";
  btnEdit.textContent = "✏️";
  btnEdit.title = "Editar";
  btnEdit.disabled = !isSaved;

  const btnRemove = document.createElement("button");
  btnRemove.type = "button";
  btnRemove.textContent = "❌";
  btnRemove.title = "Remover";

  tdActions.appendChild(btnSave);
  tdActions.appendChild(btnEdit);
  tdActions.appendChild(btnRemove);
  tr.appendChild(tdActions);

  return tr;
}

export function addItemRowTo(
  container: HTMLElement,
  item?: any,
  prefix: "new" | "edit" = "new",
  isSaved: boolean = false
): HTMLTableRowElement {
  if (!container) {
    console.error("Container não encontrado para adicionar o item.");
    throw new Error("Container não encontrado");
  }

  const tr = createEditableRow(item, isSaved);
  container.appendChild(tr);

  setupItemRowEvents(tr, container, prefix);

  return tr;
};