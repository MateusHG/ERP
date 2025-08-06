import { authorizedFetch } from "../utils/fetch-helper";
import { purchaseItemModel, purchaseModel } from "./purchase-model";

export async function loadPurchasesAPI() {
  const result = await authorizedFetch(`https://localhost:3000/api/compras`, {
    method: "GET"
  });

  return await result.json();
};

export async function searchPurchasesWithFilterAPI(filters: {id?: string, fornecedor_id?: string, status?: string}) {
  const params = new URLSearchParams();

  if (filters.id) params.append("id", filters.id);
  if (filters.fornecedor_id) params.append("fornecedor_id", filters.fornecedor_id);
  if (filters.status) params.append("status", filters.status);

  const result = await authorizedFetch(`https://localhost:3000/api/compras?${params.toString()}`, {
    method: "GET"
  });

  console.log("Resposta do filter fornecedor id:", filters.fornecedor_id);
  return await result.json();
};

export async function getItemsByPurchaseIdAPI(id: number): Promise<purchaseItemModel> {
  const result = await authorizedFetch(`https://localhost:3000/api/compra-itens/${id}`, {
    method: "GET"
  });

  return result.json();
};

export async function postPurchaseAPI(newPurchaseData: any) {
  const response = await authorizedFetch(`https://localhost:3000/api/compras`, {
    method: "POST",
    body: JSON.stringify(newPurchaseData)
  });

  return response.json();
};

export async function fetchProductSuggestions(query: string) {
  const result = await authorizedFetch(`https://localhost:3000/api/produtos?nome=${encodeURIComponent(query)}`);
  if (!result.ok) return [];
  return await result.json();
};