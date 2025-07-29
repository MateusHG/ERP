import { registerGlobalEvents } from "./register-global-events";
import { renderCustomersList } from "./customers-dom";
import { loadCustomersAPI } from "./customers-service";

async function init() {
  registerGlobalEvents();
  const customers = await loadCustomersAPI();
  renderCustomersList(customers);
};

init();