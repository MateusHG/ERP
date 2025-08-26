import { registerGlobalEvents } from "./register-global-events";
import { renderSalesList } from "./sales-dom";
import { loadSalesAPI } from "./sales-service";

async function init() {
  registerGlobalEvents();
  const sales = await loadSalesAPI();
  renderSalesList(sales);
};

init();