import { renderCustomersList } from "./customers-dom";
import { loadCustomersAPI, postCustomerAPI } from "./customers-service";
import { formatCnpj, formatPhoneNumber } from "../utils/formatters";
import { getFormDataSnapshot, isFormChanged } from "../utils/validations";
import { showConfirm, showMessage } from "../utils/messages";
import { initTabs } from "../utils/ui-tabs";

const newCustomerModal = document.getElementById("new-customer-modal")!;
initTabs(newCustomerModal);

const form = document.getElementById("new-customer-form") as HTMLFormElement;
const submitBtn = document.getElementById("submit-new-customer")!;
const cancelBtn = document.getElementById("cancel-new-customer")!;

let originalFormData: Record<string, string> = {};

//Listener para formatação de CNPJ.
const cnpjInput = form.elements.namedItem("cnpj") as HTMLInputElement | null;

if (cnpjInput) {
  cnpjInput.addEventListener("input", (e) => {
    const target = e.target as HTMLInputElement;
    const cursorPosition = target.selectionStart ?? 0;
    const oldLength = target.value.length;

    target.value = formatCnpj(target.value);
    
    const newLength = target.value.length;
    const difference = newLength - oldLength;
    target.selectionStart = target.selectionEnd = cursorPosition + difference;
  });
};

//Listener para formatação de número de telefone
const phoneNumberInput = form.elements.namedItem("telefone") as HTMLInputElement | null;
const cellNumberInput = form.elements.namedItem("celular") as HTMLInputElement | null;

if (phoneNumberInput) {
  phoneNumberInput.addEventListener("input", (e) => {
    const target = e.target as HTMLInputElement;
    const cursorPosition = target.selectionStart ?? 0;
    const oldLength = target.value.length;

    target.value = formatPhoneNumber(target.value);

    const newLength = target.value.length;
    const difference = newLength - oldLength;
    target.selectionStart = target.selectionEnd = cursorPosition + difference; 
  });
}

if (cellNumberInput) {
  cellNumberInput.addEventListener("input", (e) => {
    const target = e.target as HTMLInputElement;
    const cursorPosition = target.selectionStart ?? 0;
    const oldLength = target.value.length;

    target.value = formatPhoneNumber(target.value);

    const newLength = target.value.length;
    const difference = newLength - oldLength;
    target.selectionStart = target.selectionEnd = cursorPosition + difference;
  });
};

// Abre o modal com os campos vazios;
export function openNewCustomerModal() {
  form.reset(); // Reseta os campos do formulário.
  newCustomerModal.classList.remove("hidden");
  originalFormData = getFormDataSnapshot(form);
}

  cancelBtn.addEventListener("click", async () => {
    if (isFormChanged(form, originalFormData)) {
    const confirmed = await showConfirm("As informações serão perdidas, deseja realmente cancelar?");
      if (!confirmed) return;
    }
      newCustomerModal.classList.add("hidden");
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault(); // Evita reload da página

  const newCustomerData = {
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
    const response = await postCustomerAPI(newCustomerData);
    showMessage(response.message || 'Cliente cadastrado com sucesso.');

    newCustomerModal.classList.add("hidden"); //Fecha o modal após enviar.

    renderCustomersList(await loadCustomersAPI()); //Recarrega a lista atualizada de fornecedores.
  
  } catch (err: any) {
    console.error("Erro ao cadastrar cliente:", err);
    showMessage(err.message || "Erro desconhecido ao cadastrar cliente.")
  }
  });
