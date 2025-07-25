import { registerGlobalEvents } from "./register-global-events";
import { renderSuppliersList } from "./suppliers-dom";
import { loadSuppliersAPI } from "./suppliers-service";

async function init() {
  registerGlobalEvents();
  const suppliers = await loadSuppliersAPI();
  renderSuppliersList(suppliers);
};

init();