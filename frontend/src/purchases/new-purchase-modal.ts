import { getFormDataSnapshot, isFormChanged } from "../utils/validations";
import { showConfirm, showMessage } from "../utils/messages";
import { renderPurchasesList } from "./purchases-dom";
import { loadPurchasesAPI } from "./purchases-service";
import { setupSupplierAutoComplete } from "../utils/autocomplete";

const newPurchaseModal = document.getElementById("new-purchase-modal")!;
const form = document.getElementById("new-purchase-form") as HTMLFormElement;
const submitBtn = document.getElementById("submit-new-purchase")!;
const cancelBtn = document.getElementById("cancel-new-purchase")!;

setupSupplierAutoComplete("fornecedor-search", "fornecedor-id", "fornecedor-suggestions");

let originalFormData: Record<string, string> = {};

// Abre o modal com os campos vazios;
export function openNewPurchaseModal() {
  form.reset(); // Reseta os campos do formulário.
  newPurchaseModal.classList.remove("hidden");
  originalFormData = getFormDataSnapshot(form);
  
}

  cancelBtn.addEventListener("click", async () => {
    if (isFormChanged(form, originalFormData)) {
    const confirmed = await showConfirm("As informações serão perdidas, deseja realmente cancelar?");
      if (!confirmed) return;
    }
      newPurchaseModal.classList.add("hidden");
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault(); // Evita reload da página

  const newPurchaseData = {
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
    const response = await postPurchaseAPI(newPurchaseData);
    showMessage(response.message || 'Compra cadastrado com sucesso.');

    newPurchaseModal.classList.add("hidden"); //Fecha o modal após enviar.

    renderPurchasesList(await loadPurchasesAPI()); //Recarrega a lista atualizada de fornecedores.
  
  } catch (err: any) {
    console.error("Erro ao cadastrar fornecedor:", err);
    showMessage(err.message || "Erro desconhecido ao cadastrar fornecedor.")
  }
  });
