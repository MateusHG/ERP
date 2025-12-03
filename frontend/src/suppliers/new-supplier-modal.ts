import { renderSuppliersList } from "./suppliers-dom";
import { loadSuppliersAPI, postSupplierAPI } from "./suppliers-service";
import { getFormDataSnapshot, isFormChanged } from "../utils/validations";
import { showConfirm, showMessage } from "../utils/messages";
import { initTabs } from "../utils/ui-tabs";
import { attachInputFormatters } from "../utils/input-formatters";

const newSupplierModal = document.getElementById("new-supplier-modal")!;
initTabs(newSupplierModal);

const form = document.getElementById("new-supplier-form") as HTMLFormElement;
const cancelBtn = document.getElementById("cancel-new-supplier")!;

let originalFormData: Record<string, string> = {};

// --------------------------------------------------------------------------------------------------

export async function openNewSupplierModal() {
  form.reset();
  attachInputFormatters(form);
  newSupplierModal.classList.remove("hidden");
  originalFormData = getFormDataSnapshot(form);
}

  cancelBtn.addEventListener("click", async () => {
    if (isFormChanged(form, originalFormData)) {
    const confirmed = await showConfirm("As informações serão perdidas, deseja realmente cancelar?");
      if (!confirmed) return;
    }
      newSupplierModal.classList.add("hidden");
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault(); // Evita reload da página

  const newSupplierData = {
    razao_social: (form.elements.namedItem("razao") as HTMLInputElement).value,
    nome_fantasia: (form.elements.namedItem("fantasia") as HTMLInputElement).value,
    cnpj: (form.elements.namedItem("cnpj") as HTMLInputElement).value,
    inscricao_estadual: (form.elements.namedItem("iestadual") as HTMLInputElement).value,
    telefone: (form.elements.namedItem("telefone") as HTMLInputElement).value,
    celular: (form.elements.namedItem("celular") as HTMLInputElement).value,
    email: (form.elements.namedItem("email") as HTMLInputElement).value,
    status: (form.elements.namedItem("status") as HTMLSelectElement).value,
    cep: (form.elements.namedItem("cep") as HTMLInputElement).value,
    uf: (form.elements.namedItem("uf") as HTMLInputElement).value,
    rua: (form.elements.namedItem("rua") as HTMLInputElement).value,
    numero: parseInt((form.elements.namedItem("numero") as HTMLInputElement).value),
    complemento: (form.elements.namedItem("complemento") as HTMLInputElement).value,
    bairro: (form.elements.namedItem("bairro") as HTMLInputElement).value,
    cidade: (form.elements.namedItem("cidade") as HTMLInputElement).value,
  };

  try {
    const response = await postSupplierAPI(newSupplierData);
    showMessage(response.message || 'Fornecedor cadastrado com sucesso.');

    newSupplierModal.classList.add("hidden"); //Fecha o modal após enviar.

    renderSuppliersList(await loadSuppliersAPI()); //Recarrega a lista atualizada de fornecedores.
  
  } catch (err: any) {
    console.error("Erro ao cadastrar fornecedor:", err);
    showMessage(err.message || "Erro desconhecido ao cadastrar fornecedor.")
  }
  });