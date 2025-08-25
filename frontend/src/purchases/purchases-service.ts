import { showMessage } from "../utils/messages";
import { authorizedFetch } from "../utils/fetch-helper";
import { purchaseItemModel, purchaseModel } from "./purchase-model";

export async function loadPurchasesAPI() {
  const result = await authorizedFetch(`https://localhost:3000/api/compras`, {
    method: "GET"
  });

  return await result.json();
};

export async function searchPurchasesWithFilterAPI(filters: {
  id?: string, 
  fornecedor_nome?: string, 
  status?: string, 
  data_emissao_inicio?: string,
  data_emissao_final?: string
}) {
  const params = new URLSearchParams();

  if (filters.id) params.append("id", filters.id);
  if (filters.fornecedor_nome) params.append("fornecedor_nome", filters.fornecedor_nome);
  if (filters.status) params.append("status", filters.status);
  if (filters.data_emissao_inicio) params.append("data_emissao_inicio", filters.data_emissao_inicio);
  if (filters.data_emissao_final) params.append("data_emissao_final", filters.data_emissao_final);

  const result = await authorizedFetch(`https://localhost:3000/api/compras?${params.toString()}`, {
    method: "GET"
  });

  return await result.json();
};

export async function getPurchaseByIdAPI(id: number): Promise<purchaseModel> {
  const result = await authorizedFetch(`https://localhost:3000/api/compras/${id}`, {
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

export async function updatePurchaseAPI(purchaseId: number, updatedPurchaseData: any) {
  const response = await authorizedFetch(`https://localhost:3000/api/compras/${purchaseId}`, {
    method: "PATCH",
    body: JSON.stringify(updatedPurchaseData)
  });

  const result = await response.json();

   return {
    ok: response.ok,                  // true se HTTP 2xx
    message: result.body?.message || null, // se backend enviar mensagem
    data: result.body?.data || result.body || null, // pega os dados retornados
  };
};

export async function getItemsByPurchaseIdAPI(id: number): Promise<purchaseItemModel[]> {
  const result = await authorizedFetch(`https://localhost:3000/api/compra-itens/${id}`, {
    method: "GET"
  });

  return result.json();
};

export async function deletePurchaseAPI(id: number) {
  const response = await authorizedFetch(`https://localhost:3000/api/compras/${id}`, {
    method: "DELETE"
  });

  return response.json();
}

export async function fetchProductSuggestions(filters: {id?: string, codigo?: string, nome?: string}) {
  const params = new URLSearchParams();

  if (filters.id) params.append("id", filters.id);
  if (filters.codigo) params.append("codigo", filters.codigo);
  if (filters.nome) params.append("nome", filters.nome);

  const result = await authorizedFetch(`https://localhost:3000/api/produtos?${params.toString()}`);
  if (!result.ok) return [];
  return await result.json();
};