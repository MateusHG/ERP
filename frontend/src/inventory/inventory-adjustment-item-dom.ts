import { makeCurrencyCellInput } from "../utils/formatters";
import { attachItemAutoComplete } from "../utils/autocomplete";
import { setupItemRowEvents } from "./inventory-adjustment-item-controller";

// DOM dos itens de Ajuste de Estoque

const makeCellInput = (name: string, type = "text", initial = "", placeholder = "") => {
  const td = document.createElement("td");
  const input = document.createElement("input");
  input.type = type;
  input.name = name;
  input.value = initial;
  input.placeholder = placeholder;
  input.autocomplete = "off";
  input.style.minWidth = "60px";
  input.style.textAlign = "center";
  td.appendChild(input);
  return { td, input };
};

export function createEditableRow(item?: any, isSaved: boolean = false): HTMLTableRowElement {
  const tr = document.createElement("tr");

  tr.dataset.status = isSaved ? "salvo" : "editando";

  const { td: tdProductId, input: inputProductId } = makeCellInput(
    "item-product-id", "text", item?.produto_id.toString() || "", "Digite o ID..."
  );
  tr.appendChild(tdProductId);

  const { td: tdCode, input: inputCode } = makeCellInput(
    "item-code", "text", item?.produto_codigo || "", "Digite o código..."
  );

  tr.appendChild(tdCode);

  const { td: tdName, input: inputName } = makeCellInput(
    "item-name", "text", item?.produto_nome || "", "Digite o nome..."
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

  const { td: tdQuantity, input: inputQuantity } =  makeCellInput(
    "item-quantity", "number", item?.quantidade.toString() || "1"
  );
  inputQuantity.min = "1";
  tr.appendChild(tdQuantity);

  const { td: tdUnitPrice, input: inputUnitPrice } =  makeCurrencyCellInput(
    "item-unit-price",
    item?.preco_unitario_liquido ?? 0
  );
  tr.appendChild(tdUnitPrice);

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

  btnEdit.addEventListener("click", () => {
    tr.dataset.status = "editando";
    btnEdit.disabled = true;
  });

  const btnRemove = document.createElement("button");
  btnRemove.type = "button";
  btnRemove.textContent = "❌";
  btnRemove.title = "Remover";

  tdActions.appendChild(btnSave);
  tdActions.appendChild(btnEdit);
  tdActions.appendChild(btnRemove);

  tr.appendChild(tdActions);

  return tr;
};

export function addItemRowTo(container: HTMLElement, item?: any, isSaved: boolean = false): HTMLTableRowElement {
  if (!container) {
    console.error("Container não encontrado para adicionar o item.");
    throw new Error("Container não encontrado.");
  }

  const tr = createEditableRow(item, isSaved);
  container.appendChild(tr);

  setupItemRowEvents(tr, container, isSaved);

  return tr;
};