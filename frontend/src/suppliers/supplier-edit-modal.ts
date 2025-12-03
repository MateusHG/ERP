import { renderSuppliersList } from "./suppliers-dom";
import { getSupplierByIdAPI, loadSuppliersAPI, updateSupplierAPI } from "./suppliers-service";
import { formatData } from "../utils/formatters";
import { getFormDataSnapshot, isFormChanged } from "../utils/validations";
import { showConfirm, showMessage } from "../utils/messages";
import { initTabs } from "../utils/ui-tabs";
import { lockSupplierFormFields, unlockSupplierFormFields } from "./supplier-form-locks";
import { attachInputFormatters } from "../utils/input-formatters";
import { updateSupplierStatusBadge } from "./supplier-ui";

const supplierEditModal = document.getElementById("edit-modal")!;
initTabs(supplierEditModal);

const form = document.getElementById("edit-form") as HTMLFormElement;
const cancelBtn = document.getElementById("cancel-edit");

let currentEditId: number | null = null;
let originalFormData: Record<string, string> = {};

// --------------------------------------------------------------------------------------------------

export async function openEditModal(id: number) {
 
  currentEditId = id;
  const supplier = await getSupplierByIdAPI(id);
  document.getElementById("edit-supplier-id")!.textContent = String(supplier.id);

  (form.elements.namedItem("id") as HTMLInputElement).value = supplier.id.toString();
  (form.elements.namedItem("razao") as HTMLInputElement).value = supplier.razao_social;
  (form.elements.namedItem("nome_fantasia") as HTMLInputElement).value = supplier.nome_fantasia || "";
  (form.elements.namedItem("cnpj") as HTMLInputElement).value = supplier.cnpj.toString();
  (form.elements.namedItem("iestadual") as HTMLInputElement).value = supplier.inscricao_estadual;
  (form.elements.namedItem("telefone") as HTMLInputElement).value = supplier.telefone || "";
  (form.elements.namedItem("celular") as HTMLInputElement).value = supplier.celular || "";
  (form.elements.namedItem("email") as HTMLInputElement).value = supplier.email;
  (form.elements.namedItem("status") as HTMLInputElement).value = supplier.status;
  (form.elements.namedItem("cep") as HTMLInputElement).value = supplier.cep;
  (form.elements.namedItem("uf") as HTMLSelectElement).value = supplier.uf ?? "";
  (form.elements.namedItem("rua") as HTMLInputElement).value = supplier.rua;
  (form.elements.namedItem("numero") as HTMLInputElement).value = supplier.numero;
  (form.elements.namedItem("complemento") as HTMLInputElement).value = supplier.complemento;
  (form.elements.namedItem("bairro") as HTMLInputElement).value = supplier.bairro;
  (form.elements.namedItem("cidade") as HTMLInputElement).value = supplier.cidade;
  (form.elements.namedItem("data_cadastro") as HTMLInputElement).value = formatData(supplier.data_cadastro);
  (form.elements.namedItem("data_atualizacao") as HTMLInputElement).value = formatData(supplier.data_atualizacao);

  updateSupplierStatusBadge(supplier.status);
  attachInputFormatters(form);

  if (supplier.has_purchases) {
    lockSupplierFormFields(form, "Este fornecedor possui movimentações de compra e não pode ter dados sensíveis alterados.");
  } else {
    unlockSupplierFormFields(form);
  }

  supplierEditModal.classList.remove("hidden");
  originalFormData = getFormDataSnapshot(form);
}

cancelBtn?.addEventListener("click", async () => {
  if (isFormChanged(form, originalFormData)) {
    const confirmed = await showConfirm("Você tem alterações não salvas. Deseja realmente sair?");
    if (!confirmed) return;
}
    supplierEditModal.classList.add("hidden");
    currentEditId = null;
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!currentEditId) return;

  const formData = new FormData(form);
  // Filtra apenas os campos que NÃO estão locked(readOnly ou disabled)
  const updatedSupplierData: Record<string, string> = {};

  Array.from(form.elements).forEach((el) => {
    if (!(el instanceof HTMLInputElement || el instanceof HTMLSelectElement)) return;
    const name = el.name;
    if (!name) return;

    // Ignora os campos bloqueados
    if ((el instanceof HTMLInputElement && el.readOnly) || (el instanceof HTMLSelectElement && el.disabled)) return;

    updatedSupplierData[name] = formData.get(name)?.toString().trim() || "";

    const statusField = formData.get("status")?.toString().trim() || "Ativo";
    updatedSupplierData["status"] =  statusField;
  })

  try {
    const response = await updateSupplierAPI(currentEditId, updatedSupplierData);
    showMessage(response.message);

    supplierEditModal.classList.add("hidden");
    
    renderSuppliersList(await loadSuppliersAPI());
  
  } catch (err: any) {
    showMessage(err.message);
  }
});