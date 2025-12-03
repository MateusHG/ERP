// Modal para criação de um produto novo.
import { renderProductsList } from "./product-dom";
import { loadProductsAPI, postProductAPI } from "./product-service";
import { showConfirm, showMessage } from "../utils/messages";
import { getFormDataSnapshot, isFormChanged } from "../utils/validations";
import { initTabs } from "../utils/ui-tabs";
import { initCharCounter } from "../utils/forms";

//Elementos
const newProductModal = document.getElementById("new-product-modal")!;
const form = document.getElementById("new-product-form") as HTMLFormElement;
const cancelBtn = document.getElementById("cancel-new-product")!;

let originalFormData: Record<string, string> = {};

initTabs(newProductModal);
initCharCounter('new-descricao', 'desc-count', 500);

// ----------------------------------------------------------------------------------------------- //

// Abre o modal com os campos vazios.
export function openNewProductModal() {
  form.reset();
  newProductModal.classList.remove("hidden");
  originalFormData = getFormDataSnapshot(form);
}

  // Valores padrão já definidos
  (form.elements.namedItem("status") as HTMLInputElement).value = "Ativo";
  (form.elements.namedItem("estoque_min") as HTMLInputElement).value = "0";
  (form.elements.namedItem("estoque_max") as HTMLInputElement).value = "0";

  cancelBtn.addEventListener("click", async () => {
    if (isFormChanged(form, originalFormData)) {
    const confirmed = await showConfirm("As informações serão perdidas, deseja realmente cancelar?");
      if (!confirmed) return;
    }
      newProductModal.classList.add("hidden");
  });

  //Envia o formulário ao clicar em criar.
  form.addEventListener("submit", async (e) => {
    e.preventDefault(); //Evita o reload da página.

    const newProductData = {
      codigo: (form.elements.namedItem("codigo") as HTMLInputElement).value,
      nome: (form.elements.namedItem("nome") as HTMLInputElement).value,
      descricao: (form.elements.namedItem("descricao") as HTMLInputElement).value,
      categoria: (form.elements.namedItem("categoria") as HTMLInputElement).value,
      status: (form.elements.namedItem("status") as HTMLSelectElement).value,
      estoque_minimo: parseInt((form.elements.namedItem("estoque_min") as HTMLInputElement).value),
      estoque_maximo: parseInt((form.elements.namedItem("estoque_max") as HTMLInputElement).value),
  };

  try {
    const response = await postProductAPI(newProductData); //pega o formulário e envia para a API.
    showMessage(response.message || 'Produto cadastrado com sucesso.'); // Retorna a mensagem do backend.

    newProductModal.classList.add("hidden"); // fecha o modal após enviar.

    renderProductsList(await loadProductsAPI()); //Recarrega a lista atualizada de produtos.

  } catch (err: any) {
    console.error("Erro ao criar produto:", err);
    showMessage(err.message || "Erro desconhecido ao cadastrar produto.")
  };
});