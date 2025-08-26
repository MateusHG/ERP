import { authorizedFetch } from "../utils/fetch-helper";
import { saleItemModel, saleModel } from "./sale-model";

export async function loadSalesAPI() {
  const result = await authorizedFetch(`https://localhost:3000/api/vendas`, {
    method: "GET"
  });

  return await result.json();
};

export async function searchSalesWithFilterAPI(filters: {
  id?: string,
  cliente_nome?: string,
  status?: string,
  data_emissao_inicio?: string,
  data_emissao_final?: string
}) {
  const params = new URLSearchParams();

  if (filters.id) params.append("id", filters.id);
  if (filters.cliente_nome) params.append("cliente_nome", filters.cliente_nome);
  if (filters.status) params.append("status", filters.status);
  if (filters.data_emissao_inicio) params.append("data_emissao_inicio", filters.data_emissao_inicio);
  if (filters.data_emissao_final) params.append("data_emissao_final", filters.data_emissao_final);
  
  const result = await authorizedFetch(`https://localhost:3000/api/vendas?${params.toString()}`, {
    method: "GET"
  });

  return await result.json();
};

export async function getSaleByIdAPI(id: number): Promise<saleModel> {
  const result = await authorizedFetch(`https://localhost:3000/api/vendas/${id}`, {
    method: "GET"
  });

  return result.json();
};

export async function postSaleAPI(newSaleData: any) {
  const response = await authorizedFetch(`https://localhost:3000/api/vendas`, {
    method: "POST",
    body: JSON.stringify(newSaleData)
  });

  return response.json();
};

export async function updateSaleAPI(saleId: number, updatedSaleData: any) {
  const response = await authorizedFetch(`https://localhost:3000/api/vendas/${saleId}`, {
    method: "PATCH",
    body: JSON.stringify(updatedSaleData)
  });

  const result = await response.json();

  return {
    ok: response.ok,
    message: result.body?.message || null,
    data: result.body?.data || result.body || null,
  };
};

export async function getItemsBySaleIdAPI(id: number): Promise<saleItemModel[]> {
  const result = await authorizedFetch(`https://localhost:3000/api/venda-itens/${id}`, {
    method: "GET"
  });

  return result.json();
};

export async function deleteSaleAPI(id: number) {
  const response = await authorizedFetch(`https://localhost:3000/api/vendas/${id}`, {
    method: "DELETE"
  });

  return response.json();
};

export async function fetchProductSuggestions(filters: {id?: string, codigo?: string, nome?: string}) {
  const params = new URLSearchParams();

  if (filters.id) params.append("id", filters.id);
  if (filters.codigo) params.append("codigo", filters.codigo);
  if (filters.nome) params.append("nome", filters.nome);

  const result = await authorizedFetch(`https://localhost:3000/api/produtos?${params.toString()}`);
  if (!result.ok) return [];
  return await result.json();
};