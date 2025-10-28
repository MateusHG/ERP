import { renderProductsList } from "./product-dom";
import { getProductByIdAPI, loadProductsAPI, updateProductAPI } from "./product-service";
import { formatData } from "../utils/formatters";
import { showConfirm, showMessage } from "../utils/messages";
import { getFormDataSnapshot, isFormChanged } from "../utils/validations";

const modal = document.getElementById("edit-modal")!;
const form = document.getElementById("edit-form") as HTMLFormElement;
const cancelBtn = document.getElementById("cancel-edit")!;

let currentEditId: number | null = null;
let originalFormData: Record<string, string> = {};

export async function openEditModal(id: number) {
  currentEditId = id;

  const product = await getProductByIdAPI(id);

  (form.elements.namedItem("id") as HTMLInputElement).value = product.id.toString();
  (form.elements.namedItem("codigo") as HTMLInputElement).value = product.codigo;
  (form.elements.namedItem("nome") as HTMLInputElement).value = product.nome;
  (form.elements.namedItem("descricao") as HTMLInputElement).value = product.descricao;
  (form.elements.namedItem("preco") as HTMLInputElement).value = product.preco.toString();
  (form.elements.namedItem("categoria") as HTMLInputElement).value = product.categoria;
  (form.elements.namedItem("status") as HTMLInputElement).value = product.status;
  (form.elements.namedItem("estoque_min") as HTMLInputElement).value = product.estoque_minimo.toString();
  (form.elements.namedItem("estoque_max") as HTMLInputElement).value = product.estoque_maximo.toString();
  (form.elements.namedItem("data_cadastro") as HTMLInputElement).value = formatData(product.data_cadastro);
  (form.elements.namedItem("data_atualizacao") as HTMLInputElement).value = formatData(product.data_atualizacao);
  

  modal.classList.remove("hidden");
  originalFormData = getFormDataSnapshot(form);
}

//Cancela a edição do produto.
cancelBtn.addEventListener("click", async () => {
  if (isFormChanged(form, originalFormData)) {
    const confirmed = await showConfirm("Você tem alterações não salvas. Deseja realmente sair?");
    if (!confirmed) return;

  }
  modal.classList.add("hidden");
  currentEditId = null;
});

//Envia o PATCH
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!currentEditId) return;

  const formData = new FormData(form);
  
  const updatedProductData = {
    codigo: formData.get("codigo")?.toString().trim() || "",
    nome: formData.get("nome")?.toString().trim() || "",
    descricao: formData.get("descricao")?.toString().trim() || "",
    preco: parseFloat(formData.get("preco") as string) || 0,
    estoque_minimo: parseInt(formData.get("estoque_min") as string) || 0,
    estoque_maximo: parseInt(formData.get("estoque_max") as string) || 0,
    status: formData.get("status")?.toString().trim() || "Ativo",
    categoria: formData.get("categoria")?.toString().trim() || "",
  };

  try {
    const response = await updateProductAPI(currentEditId, updatedProductData);
    showMessage(response.message);

    modal.classList.add("hidden"); // Fecha o modal de edição.

    renderProductsList(await loadProductsAPI()); //Recarrega os produtos.
    
  } catch (err: any) {
    showMessage(err.message || "Erro ao atualizar o produto.")
  }
});