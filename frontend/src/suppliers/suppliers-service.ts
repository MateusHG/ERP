import supplierModel from "./supplier-model";

export async function loadSuppliersAPI(): Promise<supplierModel[]> {
  const result = await fetch(`http://localhost:3000/api/fornecedores`);
  if (!result.ok) throw new Error('Erro ao buscar fornecedores');
  return result.json();
};

//Monta a busca de produtos com filtro chamando o backend.
export async function searchSuppliersWithFilterAPI(filters: {id?: string, nome_fantasia?: string, razao_social?: string, cnpj?: string, email?: string, status?: string}) {
  const params = new URLSearchParams();

  if (filters.id) params.append("id", filters.id);
  if (filters.nome_fantasia) params.append("nome_fantasia", filters.nome_fantasia);
  if (filters.razao_social) params.append("razao_social", filters.razao_social);
  if (filters.cnpj) params.append("cnpj", filters.cnpj);
  if (filters.email) params.append("email", filters.email);
  if (filters.status) params.append("status", filters.status);

  const response = await fetch (`http://localhost:3000/api/fornecedores?${params.toString()}`);

  if (!response.ok) {
    throw new Error("Erro ao buscar fornecedores.")
  }

  return await response.json();
};

export async function getSupplierByIdAPI(id: number): Promise<supplierModel> {
  const result = await fetch(`http://localhost:3000/api/fornecedores/${id}`);
  if (!result.ok)
    throw new Error("Fornecedor não encontrado.");
  return await result.json();
};

export async function postSupplierAPI(newSupplierData: any) {
  const response = await fetch(`http://localhost:3000/api/fornecedores`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newSupplierData)
  });

  const body = await response.json();

  if (!response.ok) {
    throw new Error(body.message || "Erro ao cadastrar fornecedor.");
  }

  return body;
};

export async function updateSupplierAPI(id: number, data: any): Promise<{ message: string }> {
  const response = await fetch(`http://localhost:3000/api/fornecedores/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || result.erro || "Erro ao atualizar o fornecedor.");
  }

  return result;
};

export async function deleteSupplierAPI(id: number): Promise<{ message: string }> {
  const result = await fetch(`http://localhost:3000/api/fornecedores/${id}`, {
    method: "DELETE"
  });

  if (!result.ok) {
    const erro = await result.json();
    throw new Error(erro.message || "Erro ao deletar produto.")
  }

  return await result.json();
};