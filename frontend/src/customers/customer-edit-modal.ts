import { renderCustomersList } from "./customers-dom";
import { getCustomerByIdAPI, loadCustomersAPI, updateCustomerAPI } from "./customers-service";
import { formatCnpj, formatPhoneNumber, formatData } from "../utils/formatters";
import { getFormDataSnapshot, isFormChanged } from "../utils/validations";
import { showConfirm, showMessage } from "../utils/messages";

const modal = document.getElementById("edit-modal")!;
const form = document.getElementById("edit-form") as HTMLFormElement;
const cancelBtn = document.getElementById("cancel-edit");

let currentEditId: number | null = null;
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

export async function openEditModal(id: number) {
  currentEditId = id;

  const customer = await getCustomerByIdAPI(id);

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

  
  modal.classList.remove("hidden");
  originalFormData = getFormDataSnapshot(form);
}

cancelBtn?.addEventListener("click", async () => {
  if (isFormChanged(form, originalFormData)) {
    const confirmed = await showConfirm("Você tem alterações não salvas. Deseja realmente sair?");
    if (!confirmed) return;
}
    modal.classList.add("hidden");
    currentEditId = null;
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!currentEditId) return;

  const formData = new FormData(form);

  const updatedCustomerData = {
    razao_social: formData.get("razao")?.toString().trim() || "",
    nome_fantasia: formData.get("fantasia")?.toString().trim() || "",
    cnpj: formData.get("cnpj")?.toString().trim() || "",
    inscricao_estadual: formData.get("iestadual")?.toString().trim() || "",
    telefone: formData.get("telefone")?.toString().trim() || "",
    celular: formData.get("celular")?.toString().trim() || "",
    email: formData.get("email")?.toString().trim() || "",
    status: formData.get("status")?.toString().trim() || "Ativo",
    cep: formData.get("cep")?.toString().trim() || "",
    uf: formData.get("uf")?.toString().trim() || "",
    rua: formData.get("rua")?.toString().trim() || "",
    numero: formData.get("numero")?.toString().trim() || "",
    complemento: formData.get("complemento")?.toString().trim() || "",
    bairro: formData.get("bairro")?.toString().trim() || "",
    cidade: formData.get("cidade")?.toString().trim() || "",
    data_cadastro: formData.get("data_cadastro")?.toString().trim() || "",
    data_atualizacao: formData.get("data_atualizacao")?.toString().trim() || "",
  };

  try {
    const response = await updateCustomerAPI(currentEditId, updatedCustomerData);
    showMessage(response.message);

    modal.classList.add("hidden");
    
    renderCustomersList(await loadCustomersAPI());
  
  } catch (err: any) {
    showMessage(err.message);
  }
});