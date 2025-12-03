import { renderCustomersList } from "./customers-dom";
import { getCustomerByIdAPI, loadCustomersAPI, updateCustomerAPI } from "./customers-service";
import { formatData } from "../utils/formatters";
import { getFormDataSnapshot, isFormChanged } from "../utils/validations";
import { showConfirm, showMessage } from "../utils/messages";
import { initTabs } from "../utils/ui-tabs";
import { attachInputFormatters } from "../utils/input-formatters";
import { updateCustomerStatusBadge } from "./customer-ui";
import { lockCustomerFormFields, unlockCustomerFormFields } from "./customer-form-locks";

const customerEditModal = document.getElementById("edit-modal")!;
initTabs(customerEditModal)

const form = document.getElementById("edit-form") as HTMLFormElement;
const cancelBtn = document.getElementById("cancel-edit");

let currentEditId: number | null = null;
let originalFormData: Record<string, string> = {};

// --------------------------------------------------------------------------------------------------

export async function openEditModal(id: number) {
  
  currentEditId = id;
  const customer = await getCustomerByIdAPI(id);
  document.getElementById("edit-customer-id")!.textContent = String(customer.id);

  (form.elements.namedItem("id") as HTMLInputElement).value = customer.id.toString() || "";
  (form.elements.namedItem("razao") as HTMLInputElement).value = customer.razao_social;
  (form.elements.namedItem("fantasia") as HTMLInputElement).value = customer.nome_fantasia || "";
  (form.elements.namedItem("cnpj") as HTMLInputElement).value = String(customer.cnpj ?? "");
  (form.elements.namedItem("iestadual") as HTMLInputElement).value = customer.inscricao_estadual;
  (form.elements.namedItem("telefone") as HTMLInputElement).value = customer.telefone || "";
  (form.elements.namedItem("celular") as HTMLInputElement).value = customer.celular || "";
  (form.elements.namedItem("email") as HTMLInputElement).value = customer.email;
  (form.elements.namedItem("status") as HTMLInputElement).value = customer.status;
  (form.elements.namedItem("cep") as HTMLInputElement).value = customer.cep;
  (form.elements.namedItem("uf") as HTMLSelectElement).value = customer.uf ?? "";
  (form.elements.namedItem("rua") as HTMLInputElement).value = customer.rua;
  (form.elements.namedItem("numero") as HTMLInputElement).value = customer.numero;
  (form.elements.namedItem("complemento") as HTMLInputElement).value = customer.complemento;
  (form.elements.namedItem("bairro") as HTMLInputElement).value = customer.bairro;
  (form.elements.namedItem("cidade") as HTMLInputElement).value = customer.cidade;
  (form.elements.namedItem("data_cadastro") as HTMLInputElement).value = formatData(customer.data_cadastro);
  (form.elements.namedItem("data_atualizacao") as HTMLInputElement).value = formatData(customer.data_atualizacao);

  updateCustomerStatusBadge(customer.status);
  attachInputFormatters(form);

  if (customer.has_sales) {
    lockCustomerFormFields(form, "Este cliente já possui movimentações de venda e não pode ter dados sensíveis alterados.");
  } else {
    unlockCustomerFormFields(form);
  }
  
  customerEditModal.classList.remove("hidden");
  originalFormData = getFormDataSnapshot(form);
}

cancelBtn?.addEventListener("click", async () => {
  if (isFormChanged(form, originalFormData)) {
    const confirmed = await showConfirm("Você tem alterações não salvas. Deseja realmente sair?");
    if (!confirmed) return;
}
    customerEditModal.classList.add("hidden");
    currentEditId = null;
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!currentEditId) return;

  const formData = new FormData(form);

  // Filtra apenas os campos que não estão bloqueados(readOnly ou disabled)
  const updatedCustomerData: Record<string, string> = {};

  Array.from(form.elements).forEach((el) => {
    if (!(el instanceof HTMLInputElement) || (el instanceof HTMLSelectElement && el.disabled)) return;
    const name = el.name;
    if (!name) return;

    //Ignora os campos bloqueados
    if ((el instanceof HTMLInputElement && el.readOnly) || (el instanceof HTMLSelectElement && el.disabled)) return;

    updatedCustomerData[name] = formData.get(name)?.toString().trim() || "";

    const statusField = formData.get("status")?.toString().trim() || "Ativo";
    updatedCustomerData["status"] = statusField;
  })

  try {
    const response = await updateCustomerAPI(currentEditId, updatedCustomerData);
    showMessage(response.message);

    customerEditModal.classList.add("hidden");
    
    renderCustomersList(await loadCustomersAPI());
  
  } catch (err: any) {
    showMessage(err.message);
  }
});