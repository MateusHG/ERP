import { authorizedFetch } from "../utils/fetch-helper";

export async function loadInventoryAPI() {
  const result = await authorizedFetch(`https://localhost:3000/api/estoque/listar`, {
    method: "GET"
  });

  return await result.json();
};

export async function listInventoryWithFilterAPI(filters: { id?: string, codigo?: string, nome?: string, categoria?: string, status?: string, saldo?: string }) {
  const params = new URLSearchParams();
  console.log("Filtros enviados:", filters) // DEBUG

  if (filters.id) params.append("id", filters.id);
  if (filters.codigo) params.append("codigo", filters.codigo);
  if (filters.nome) params.append("nome", filters.nome);
  if (filters.categoria) params.append("categoria", filters.categoria);
  if (filters.status) params.append("status", filters.status);
  if (filters.saldo) params.append("saldo", filters.saldo);

  const response = await authorizedFetch(`https://localhost:3000/api/estoque/listar?${params.toString()}`);
  return response.json();
};

export async function loadInventoryMovements(produtoId: number) {
  const result = await authorizedFetch(`https://localhost:3000/api/estoque/movimentacoes/${produtoId}`, {
  method: "GET"
});

  return await result.json();
};

export async function postInventoryAdjustmentAPI(newAdjustmentData: any) {
  const response = await authorizedFetch(`https://localhost:3000/api/estoque/ajuste`, {
    method: "POST",
    body: JSON.stringify(newAdjustmentData)
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