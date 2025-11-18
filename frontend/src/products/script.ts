import { renderProductsList } from "./product-dom";
import { loadProductsAPI } from "./product-service";
import { registerGlobalEvents } from "./register-global-events";

async function init() {
  const products = await loadProductsAPI(); // Carrega os dados
  renderProductsList(products); // Renderiza na tela
  registerGlobalEvents(); // Eventos de clique
}

init();