import supplierModel from "./customer-model";
import { authorizedFetch } from "../utils/fetch-helper";

export async function loadCustomersAPI() {
  const result = await authorizedFetch(`https://localhost:3000/api/clientes`, {
    method: "GET"
  });

  return await result.json();
};

//Monta a busca de produtos com filtro chamando o backend.
export async function searchCustomersWithFilterAPI(filters: { id?: string, nome_fantasia?: string, razao_social?: string, cnpj?: string, email?: string, status?: string }) {
  const params = new URLSearchParams();

  if (filters.id) params.append("id", filters.id);
  if (filters.nome_fantasia) params.append("nome_fantasia", filters.nome_fantasia);
  if (filters.razao_social) params.append("razao_social", filters.razao_social);
  if (filters.cnpj) params.append("cnpj", filters.cnpj);
  if (filters.email) params.append("email", filters.email);
  if (filters.status) params.append("status", filters.status);

  const response = await authorizedFetch(`https://localhost:3000/api/clientes?${params.toString()}`, {
    method: "GET"
  });

  return await response.json();
};

export async function getCustomerByIdAPI(id: number): Promise<supplierModel> {
  const result = await authorizedFetch(`https://localhost:3000/api/clientes/${id}`, {
    method: "GET"
  });

  return result.json();
};

export async function postCustomerAPI(newCustomerData: any) {
  const response = await authorizedFetch(`https://localhost:3000/api/clientes`, {
    method: "POST",
    body: JSON.stringify(newCustomerData)
  });

  const result = await response.json();
  return result;
};

export async function updateCustomerAPI(id: number, data: any): Promise<{ message: string }> {
  const response = await authorizedFetch(`https://localhost:3000/api/clientes/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data)
  });

  const result = await response.json();
  return result;
};

export async function deleteCustomerAPI(id: number): Promise<{ message: string }> {
  const result = await authorizedFetch(`https://localhost:3000/api/clientes/${id}`, {
    method: "DELETE"
  });

  return await result.json();
};