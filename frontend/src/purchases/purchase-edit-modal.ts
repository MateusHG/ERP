import { formatData } from "../utils/formatters";
import { getFormDataSnapshot, isFormChanged } from "../utils/validations";
import { showConfirm, showMessage } from "../utils/messages";
import { loadPurchasesAPI } from "./purchases-service";
import { renderPurchasesList } from "./purchases-dom";

const modal = document.getElementById("edit-modal")!;
const form = document.getElementById("edit-form") as HTMLFormElement;
const cancelBtn = document.getElementById("cancel-edit");

let currentEditId: number | null = null;
let originalFormData: Record<string, string> = {};

export async function openEditModal(id: number) {
  currentEditId = id;

  const supplier = await getPurchaseByIdAPI(id);

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

  const updatedPurchaseData = {
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
    const response = await updatePurchaseAPI(currentEditId, updatedPurchaseData);
    showMessage(response.message);

    modal.classList.add("hidden");
    
    renderPurchasesList(await loadPurchasesAPI());
  
  } catch (err: any) {
    showMessage(err.message);
  }
});