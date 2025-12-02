import { showConfirm, showMessage } from "../utils/messages";
import { getFormDataSnapshot, isFormChanged } from "../utils/validations";
import { renderInventoryList } from "./inventory-dom";
import { loadInventoryAPI, postInventoryAdjustmentAPI } from "./inventory-service";

// Elementos
const newAdjustmentModal = document.getElementById("new-inventory-adjustment-modal")!;
const form = document.getElementById("new-inventory-adjustment-form") as HTMLFormElement;
const cancelBtn = document.getElementById("cancel-new-inventory-adjustment")!;
const itemsBodyNew = document.getElementById("items-body-new-adjustment-modal")!;
const addItemBtnNew = document.getElementById("add-item-new-adjustment-modal")!;

let originalFormData: Record<string, string> = {};

export function openNewInventoryAdjustmentModal() {
  form.reset();
  itemsBodyNew.innerHTML = "";

  newAdjustmentModal.classList.remove("hidden");
  originalFormData = getFormDataSnapshot(form);

  const todayISO = new Date().toISOString().split("T")[0];
  const dateInput = document.getElementById("new-ajuste-data") as HTMLInputElement;
  dateInput.value = todayISO;
}

cancelBtn.addEventListener("click", async() => {
  if (isFormChanged(form, originalFormData)) {
    const confirmed = await showConfirm("As informações serão perdidas, deseja realmente cancelar?");
      if (!confirmed) return;
  }

      newAdjustmentModal.classList.add("hidden");
});

form.addEventListener("submit", async (e) => {
  e.preventDefault(); // Evita o reload padrão da página

  // Pega as linhas dos itens 
  const itemRows = Array.from(itemsBodyNew.querySelectorAll("tr"));
  if (itemRows.length === 0) {
    return showMessage("Obrigatório adicionar um item.");
  }

  const isEditing = itemRows.some(row => row.dataset.status !== "salvo");
  if (isEditing) {
    return showMessage("Obrigatório salvar todos os itens antes de salvar o ajuste.");
  }

  const motivoInput = form.elements.namedItem("new-ajuste-motivo") as HTMLInputElement;
  if (!motivoInput.value || motivoInput.value.trim() === "") {
    return showMessage("Obrigatório informar o motivo do ajuste.");
  }
 
  const items = itemRows.map(row => ({
    produto_id: (row.querySelector('input[name="item-product-id"]') as HTMLInputElement).value,
    quantidade: (row.querySelector('input[name="item-quantity"]') as HTMLInputElement).value,
    preco_unitario: Number((row.querySelector('input[name="item-unit-price"]') as HTMLInputElement).value.replace(",", "."))
  }));

  const newAdjustmentData = {
    data_ajuste: (form.elements.namedItem("new-ajuste-data") as HTMLInputElement)!.value,
    tipo: (form.elements.namedItem("new-ajuste-tipo") as HTMLSelectElement)!.value,
    motivo: (form.elements.namedItem("new-ajuste-motivo") as HTMLInputElement)!.value,
    observacao: (form.elements.namedItem("new-ajuste-observacao") as HTMLInputElement)!.value,
    items
  };

  try {
    const confirmed = await showConfirm(
        "<b>🛑 Atenção! 🛑</b><br><br>" +
        "Ao salvar o ajuste o sistema irá <b>movimentar o estoque.</b><br><br>" +
        "<b>Deseja continuar?</b>")

        if (!confirmed) {
          await showMessage(
            "<b>Operação cancelada ✅</b><br><br>" +
          "- Estoque não foi alterado."
          );
          return;
        }

    // Envio ao backend
    const response = await postInventoryAdjustmentAPI(newAdjustmentData);

    await showMessage(response.message || "Ajuste realizado com sucesso.");

    newAdjustmentModal.classList.add("hidden");

    renderInventoryList(await loadInventoryAPI());
  
  } catch (err: any) {
    console.error("Erro ao cadastrar ajuste:", err);
    showMessage(err.message || "Erro desconhecido ao cadastrar ajuste.");
  }
});