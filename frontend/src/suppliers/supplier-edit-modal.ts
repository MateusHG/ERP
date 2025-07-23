import { renderSuppliersList } from "./suppliers-dom";
import { getSupplierByIdAPI, loadSuppliersAPI, updateSupplierAPI } from "./suppliers-service";
import { formatData, showMessage, showConfirm, getFormDataSnapshot, isFormChanged, formatPhoneNumber, formatCnpj } from "./utils";

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

  const supplier = await getSupplierByIdAPI(id);

  (form.elements.namedItem("id") as HTMLInputElement).value = supplier.id.toString();
  (form.elements.namedItem("razao") as HTMLInputElement).value = supplier.razao_social;
  (form.elements.namedItem("fantasia") as HTMLInputElement).value = supplier.nome_fantasia || "";
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

  const updatedSupplierData = {
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
    const response = await updateSupplierAPI(currentEditId, updatedSupplierData);
    showMessage(response.message);

    modal.classList.add("hidden");
    
    renderSuppliersList(await loadSuppliersAPI());
  
  } catch (err: any) {
    showMessage(err.message || "Erro ao atualizar o produto.")
  }
});