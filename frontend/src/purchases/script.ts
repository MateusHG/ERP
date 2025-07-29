import { renderPurchasesList } from "./purchases-dom";
import { loadPurchasesAPI } from "./purchases-service";
import { registerGlobalEvents } from "./register-global-events";

async function init() {
  registerGlobalEvents();
  const purchases = await loadPurchasesAPI();
  renderPurchasesList(purchases);
};

init();