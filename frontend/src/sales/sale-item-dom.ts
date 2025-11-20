import { formatCurrency, makeCurrencyCellInput } from "../utils/formatters";
import { attachItemAutoComplete } from "../utils/autocomplete";
import { setupItemRowEvents, setViewMode  } from "./sale-items-controller";

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

  if (item?.id) {
    tr.dataset.id = String(item.id);
  }

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

  const { td: tdQuantity, input: inputQuantity } = makeCellInput(
    "item-quantity", "number", item?.quantidade.toString() || "1"
  );
  inputQuantity.min = "1";
  tr.appendChild(tdQuantity);

  const { td: tdUnitPrice, input: inputUnitPrice } = makeCurrencyCellInput(
    "item-unit-price",
    item?.preco_unitario != null ? item.preco_unitario : 0
  );
  tr.appendChild(tdUnitPrice);

  const { td: tdDiscount, input: inputDiscount} = makeCurrencyCellInput(
    "item-discount-volume",
    item?.desconto_volume != null ? item.desconto_volume : 0
  );
  tr.appendChild(tdDiscount);

  const tdTotalDiscount = document.createElement("td");
  tdTotalDiscount.classList.add("item-total-discount");
  const discountValue = item?.desconto_volume && item?.quantidade
  ? Number(item.desconto_volume) * Number(item.quantidade) 
  : 0;
  tdTotalDiscount.textContent = formatCurrency(discountValue);
  tr.appendChild(tdTotalDiscount);

  const tdTotal = document.createElement("td");
  tdTotal.textContent = item ? formatCurrency(Number(item.valor_subtotal || 0)): formatCurrency(0);
  tdTotal.classList.add("item-line-total");
  tr.appendChild(tdTotal);

  const tdActions = document.createElement("td");

  const btnSave = document.createElement("button");
  btnSave.type = "button";
  btnSave.textContent = "✅";
  btnSave.title = "Salvar";
  btnSave.disabled = isSaved;

  btnSave.addEventListener("click", () => {
  setViewMode(tr, true); // salva e trava inputs
});

  const btnEdit = document.createElement("button");
  btnEdit.type = "button";
  btnEdit.textContent = "✏️";
  btnEdit.title = "Editar";
  btnEdit.disabled = !isSaved;

  btnEdit.addEventListener("click", () => {
    tr.dataset.status = "editando";
    setViewMode(tr, false);
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
}

export function addItemRowTo(
  container: HTMLElement,
  item?: any,
  prefix: "new" | "edit" = "new",
  isSaved: boolean = false
): HTMLTableRowElement {

  const tr = createEditableRow(item, isSaved);

  container.appendChild(tr);       // 1) primeiro coloca no DOM

  setViewMode(tr, isSaved);        // 2) só depois aplica modo salvo/edição

  setupItemRowEvents(tr, container, prefix, isSaved);  // 3) por último registra eventos

  return tr;
};
