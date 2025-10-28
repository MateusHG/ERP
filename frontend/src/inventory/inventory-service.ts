import { authorizedFetch } from "../utils/fetch-helper";

export async function loadInventoryAPI() {
  const result = await authorizedFetch(`https://localhost:3000/api/estoque/listar`, {
    method: "GET"
  });

  return await result.json();
};

export async function loadInventoryMovements(produtoId: number) {
  const result = await authorizedFetch(`https://localhost:3000/api/estoque/movimentacoes/${produtoId}`, {
  method: "GET"
});

  return await result.json();
};
