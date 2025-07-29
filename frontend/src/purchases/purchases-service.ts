import { authorizedFetch } from "../utils/fetch-helper";
import { purchaseItemModel } from "./purchase-model";

export async function loadPurchasesAPI() {
  const result = await authorizedFetch(`https://localhost:3000/api/compras`, {
    method: "GET"
  });

  return await result.json();
};

export async function getItemsByPurchaseIdAPI(id: number): Promise<purchaseItemModel> {
  const result = await authorizedFetch(`https://localhost:3000/api/compra-itens/${id}`, {
    method: "GET"
  });

  return result.json();
};