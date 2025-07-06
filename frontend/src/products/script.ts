import { renderProductsList } from "./product-dom";
import { loadProductsAPI } from "./product-service";
import { registerGlobalEvents } from "./register-global-events";

async function init() {
  registerGlobalEvents(); // Eventos de clique
  const products = await loadProductsAPI(); // Carrega os dados
  renderProductsList(products); // Renderiza na tela
}

init();