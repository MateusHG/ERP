import { showConfirm } from "../utils/messages";
import { getFormDataSnapshot, isFormChanged } from "../utils/validations";

// Elementos
const newAdjustmentModal = document.getElementById("new-inventory-adjustment-modal")!;
const form = document.getElementById("new-inventory-adjustment-form") as HTMLFormElement;
const cancelBtn = document.getElementById("cancel-new-inventory-adjustment")!;

let originalFormData: Record<string, string> = {};

export function openNewInventoryAdjustmentModal() {
  form.reset();
  newAdjustmentModal.classList.remove("hidden");
  originalFormData = getFormDataSnapshot(form);
}

cancelBtn.addEventListener("click", async() => {
  if (isFormChanged(form, originalFormData)) {
    const confirmed = await showConfirm("As informações serão perdidas, deseja realmente cancelar?");
      if (!confirmed) return;
  }

      newAdjustmentModal.classList.add("hidden");
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const newInventoryAdjustmentData = {
    
  }
})