import { renderInventoryList } from "./inventory-dom";
import { loadInventoryAPI } from "./inventory-service";
import { registerGlobalEvents } from "./register-global-events";

async function init() {
  registerGlobalEvents();
  const inventory = await loadInventoryAPI();
  renderInventoryList(inventory);
};

init();