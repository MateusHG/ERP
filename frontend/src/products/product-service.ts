import { authorizedFetch } from "../utils/fetch-helper";
import productModel from "./product-model";

export async function loadProductsAPI(): Promise<productModel[]> {
  const response = await authorizedFetch('http://localhost:3000/api/produtos');
  return response.json();
}

export async function searchProductsWithFilterAPI(filters: { id?: string, nome?: string, categoria?: string, status?: string}) {
  const params = new URLSearchParams();
 
  if (filters.id) params.append("id", filters.id);
  if (filters.nome) params.append("nome", filters.nome);
  if (filters.categoria) params.append("categoria", filters.categoria);
  if (filters.status) params.append("status", filters.status);

  const response = await authorizedFetch(`http://localhost:3000/api/produtos?${params.toString()}`);
  return response.json();
}

export async function getProductByIdAPI(id: number): Promise<productModel> {
  const response = await authorizedFetch(`http://localhost:3000/api/produtos/${id}`);
  return response.json();
}

export async function postProductAPI(newProductData: any) {
  const response = await authorizedFetch(`http://localhost:3000/api/produtos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newProductData)
  });
  return response.json();
}

export async function updateProductAPI(id: number, data: any): Promise<{ message: string }> {
  const response = await authorizedFetch(`http://localhost:3000/api/produtos/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function deleteProductAPI(id: number): Promise<{ message: string }> {
  const response = await authorizedFetch(`http://localhost:3000/api/produtos/${id}`, {
    method: "DELETE"
  });
  return response.json();
}