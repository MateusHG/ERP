import * as inventoryRepository from "../inventory/inventory-repository";
import { purchaseItemModel, purchaseModel } from "../purchases/purchase-model";
import { salesItemModel, salesModel } from "../sales/sales-model";
import { badRequest, internalServerError, ok } from "../utils/http-helper";
import { InventoryMovementModel } from "./inventory-model";

export const listInventoryService = async(filters: { id?: number, codigo?: string, nome?: string, categoria?: string, status?: string, saldo?: string}) => {
  try {
    const inventoryList = await inventoryRepository.listInventoryItems(filters);
    return ok(inventoryList);
  
  } catch (err) {
    console.error(err);
    return internalServerError('Erro ao listar estoque.')
  }
};


export const registerMovementService = async (mov: InventoryMovementModel) => {
  try {

    const quantidade = Math.floor(Number(mov.quantidade));
    if (isNaN(quantidade) || quantidade <= 0) {
      return badRequest(`Quantidade inválida: ${mov.quantidade}`);
    }
  
    const movement = await inventoryRepository.registerMovement({...mov, quantidade});
    return ok(movement);
  
  } catch (err: any) {
    if (err.message.includes('Saldo insuficiente')) {
      return badRequest(err.message);
    }
    console.error(err);
    return internalServerError('Erro ao registrar movimentação.')
  }
};


export const getBalanceService = async (produto_id: number) => {
  try {
    const balance = await inventoryRepository.getBalance(produto_id);
    return ok(balance);
  
  } catch (err) {
    console.error(err);
    return internalServerError('Erro ao verificar saldo.')
  }
};


export const listMovementsService = async (produto_id: number) => {
  try {
    const movements = await inventoryRepository.listMovements(produto_id);
    return ok(movements);
  
  } catch (err) {
    console.error(err);
    return internalServerError('Erro ao listar movimentações.')
  }
};

// Serviço para movimentar estoque á partir da compra.
export async function handlePurchaseInventoryMovementService(
  oldPurchase: purchaseModel,
  newPurchase: purchaseModel,
  userId: number,
  client?: any
) {
  try {
  const purchaseStatusWithStockImpact = ['recebido', 'finalizado'];

  for (const item of newPurchase.itens as purchaseItemModel[]) {
    if (!purchaseStatusWithStockImpact.includes(oldPurchase.status) && purchaseStatusWithStockImpact.includes(newPurchase.status)) {
      await inventoryRepository.registerPurchaseMovement({
        produto_id: item.produto_id,
        quantidade: item.quantidade,
        tipo: 'entrada',
        origem: 'compra',
        referencia_id: newPurchase.id,
        usuario_id: userId,
        preco_unitario: item.preco_unitario
      }, client);
    }

    // Se reverter de 'recebido, finalizado' para outro status -> estorna a movimentação.
    if (purchaseStatusWithStockImpact.includes(oldPurchase.status) && !purchaseStatusWithStockImpact.includes(newPurchase.status)) {
      await inventoryRepository.registerPurchaseMovement({
        produto_id: item.produto_id,
        quantidade: item.quantidade,
        tipo: 'saida', // saída pois é estorno da compra.
        origem: 'estorno_compra',
        referencia_id: newPurchase.id,
        usuario_id: userId,
        preco_unitario: item.preco_unitario
      }, client);
    }
    // Se for mudança de 'recebido' para 'finalizado' e vice-versa, não muda nada.
  }

    return ok('Movimentou estoque á partir da compra com sucesso.');
  } catch (error: any) {
    console.error(error);
    return internalServerError('Erro ao movimentar estoque á partir da compra.');
  }
};

// Serviço para movimentar estoque á partir da venda.
export async function handleSaleInventoryMovementService(
  oldSale: salesModel,
  newSale: salesModel,
  userId: number,
  client?: any
) {
  try {
  const saleStatusWithStockImpact = ['entregue', 'finalizado'];

  for (const item of newSale.itens as salesItemModel[]) {
    // Saída de estoque
    if (!saleStatusWithStockImpact.includes(oldSale.status) && saleStatusWithStockImpact.includes(newSale.status)) {
      await inventoryRepository.registerSaleMovement({
        produto_id: item.produto_id,
        quantidade: item.quantidade,
        tipo: 'saida',
        origem: "venda",
        referencia_id: newSale.id,
        usuario_id: userId,
        preco_unitario: item.preco_unitario
      }, client);
    }

    // Se moveu de 'finalizado' ou 'entregue' para algum outro status -> estorna a venda.
    if (saleStatusWithStockImpact.includes(oldSale.status) && !saleStatusWithStockImpact.includes(newSale.status)) {
      await inventoryRepository.registerSaleMovement({
        produto_id: item.produto_id,
        quantidade: item.quantidade,
        tipo: 'entrada',
        origem: "estorno_venda",
        referencia_id: newSale.id,
        usuario_id: userId,
        preco_unitario: item.preco_unitario
      }, client);
    }

    // Transição interna entre 'entregue' <-> 'finalizado' → não movimenta.
    }

    return ok("Movimentou estoque á partir da venda com sucesso.")
  } catch (error: any) {
    console.error(error);
    return internalServerError("Erro ao movimentar estoque à partir da venda.");
  }
};
