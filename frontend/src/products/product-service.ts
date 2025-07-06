import productModel from "./product-model";
import { showMessage } from "./utils";

// ** Arquivo responsável pelos serviços de comunicação com a API (fetch) ** // 

//Carrega lista de produtos
export async function loadProductsAPI(): Promise<productModel[]> {
  const result = await fetch ('http://localhost:3000/api/produtos');
  if (!result.ok) throw new Error("Erro ao buscar produtos.");
  return result.json();
};

//Monta a busca de produtos com filtro chamando o backend.
export async function searchProductsWithFilterAPI(filters: { id?: string, nome?: string, categoria?: string, status?: string}) {
  const params = new URLSearchParams();
 
  if (filters.id) params.append("id", filters.id);
  if (filters.nome) params.append("nome", filters.nome);
  if (filters.categoria) params.append("categoria", filters.categoria);
  if (filters.status) params.append("status", filters.status);

  const response = await fetch(`http://localhost:3000/api/produtos?${params.toString()}`);

  if (!response.ok) {
    throw new Error("Erro ao buscar produtos.")
  }

  return await response.json();
};


//Pega um produto único pelo ID.
export async function getProductByIdAPI(id: number): Promise<productModel> {
  const result = await fetch (`http://localhost:3000/api/produtos/${id}`);
  if (!result.ok)
  throw new Error("Produto não encontrado.");
  return await result.json();
}

export async function postProductAPI(newProductData: any) {
  const response = await fetch (`http://localhost:3000/api/produtos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newProductData)
  });

  const body = await response.json();

  if (!response.ok) { 
    throw new Error(body.message || "Erro ao criar produto.");
  }

  return body;
};

export async function updateProductAPI(id: number, data: any): Promise<{ message: string }> {
  const response = await fetch (`http://localhost:3000/api/produtos/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  //Verifica se a resposta foi um erro (ex: Bad Request).
  if (!response.ok) {
    throw new Error(result.message || result.erro || "Erro ao atualizar o produto.");
  }

  return result; // retorno da API no padrão { mensagem: "...", dados?: ... }
};

//Deleta produto
export async function deleteProductAPI(id: number): Promise<{ message: string }> {
  const result = await fetch(`http://localhost:3000/api/produtos/${id}`, {
    method: "DELETE"
  });

  if (!result.ok) {
    const erro = await result.json();
    throw new Error(erro.message || "Erro ao deletar produto.")
  }

  return await result.json();
};