// Modal para criação de um produto novo.

import { renderProductsList } from "./product-dom";
import { openEditModal } from "./product-edit-modal";
import { loadProductsAPI, postProductAPI } from "./product-service";
import { showMessage } from "./utils";

//Elementos
const newProductModal = document.getElementById("new-product-modal")!;
const form = document.getElementById("new-product-form") as HTMLFormElement;
const submitBtn = document.getElementById("submit-new-product")!;
const cancelBtn = document.getElementById("cancel-new-product")!;

// Abre o modal com os campos vazios.
export function openNewProductModal() {

  form.reset(); // Reseta os campos do formulário.
  
  // Valores padrão já definidos
  (form.elements.namedItem("status") as HTMLInputElement).value = "Ativo";
  (form.elements.namedItem("estoque") as HTMLInputElement).value = "0";
  (form.elements.namedItem("estoque_min") as HTMLInputElement).value = "0";
  (form.elements.namedItem("estoque_max") as HTMLInputElement).value = "0";

  //Abre o modal
  newProductModal.classList.remove("hidden");
}

  //Fecha o modal se clicar no botão de cancelar.
  cancelBtn.addEventListener("click", () => {
    newProductModal.classList.add("hidden");
  });

  //Envia o formulário ao clicar em criar.
  form.addEventListener("submit", async (e) => {
    e.preventDefault(); //Evita o reload da página.

    const newProductData = {
      codigo: (form.elements.namedItem("codigo") as HTMLInputElement).value,
      nome: (form.elements.namedItem("nome") as HTMLInputElement).value,
      descricao: (form.elements.namedItem("descricao") as HTMLInputElement).value,
      preco: parseFloat((form.elements.namedItem("preco") as HTMLInputElement).value),
      estoque: parseInt((form.elements.namedItem("estoque") as HTMLInputElement).value),
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
    showMessage(err.message || "Erro desconhecido ao criar produto.")
  };
});