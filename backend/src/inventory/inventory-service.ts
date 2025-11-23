import * as inventoryRepository from "../inventory/inventory-repository";
import { purchaseItemModel, purchaseModel } from "../purchases/purchase-model";
import { salesItemModel, salesModel } from "../sales/sales-model";
import { badRequest, internalServerError, ok } from "../utils/http-helper";
import { InventoryMovementModel, StockInsufficientError, stockInsufficientErrorModel } from "./inventory-model";

export const listInventoryService = async(filters: { id?: number, codigo?: string, nome?: string, categoria?: string, status?: string, saldo?: string}) => {
  try {
    const inventoryList = await inventoryRepository.listInventoryItems(filters);
    return ok(inventoryList);
  
  } catch (err) {
    console.error(err);
    return internalServerError('Erro ao listar estoque.')
  }
};

// Movimento de AJUSTE DE ESTOQUE.
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
  client: any
) {
  const purchaseStatusWithStockImpact = ['recebido', 'finalizado'];
  const inconsistencies: stockInsufficientErrorModel[] = [];
  
  try {
    if (
      !purchaseStatusWithStockImpact.includes(oldPurchase.status) &&
      purchaseStatusWithStockImpact.includes(newPurchase.status)
    ) {
      for (const item of newPurchase.itens as purchaseItemModel[]) {

        const precoLiquido =
          Number(item.preco_unitario | 0) -
          Number(item.desconto_unitario || 0);

        const res = await inventoryRepository.registerPurchaseMovement({
          produto_id: item.produto_id,
          quantidade: item.quantidade,
          tipo: 'entrada',
          origem: 'compra',
          referencia_id: newPurchase.id,
          usuario_id: userId,
          preco_unitario_liquido: precoLiquido
        }, client);

        if (res.estoque_insuficiente) {
          inconsistencies.push({
            produto_id: res.produto_id!,
            produto: res.produto!,
            codigo: res.codigo!,
            estoque_atual: res.estoque_atual!,
            tentativa_saida: res.tentativa_saida!,
            estoque_ficaria: res.estoque_ficaria!
          });
        }
      }
    }
    
    // Se reverter de 'recebido, finalizado' para outro status -> estorna a movimentação.
    const purchaseWasReopened =
    purchaseStatusWithStockImpact.includes(oldPurchase.status) &&
    !purchaseStatusWithStockImpact.includes(newPurchase.status);

    if (purchaseWasReopened) {
      console.log('Processando estorno de estoque....');
      console.log('Itens á estornar:', oldPurchase.itens);

      for (const item of oldPurchase.itens as purchaseItemModel[]) {

        const precoLiquido =
          Number(item.preco_unitario || 0) -
          Number(item.desconto_unitario || 0);

        const res = await inventoryRepository.registerPurchaseMovement({
          produto_id: item.produto_id,
          quantidade: item.quantidade,
          tipo: 'saida',
          origem: "estorno_compra",
          referencia_id: newPurchase.id,
          usuario_id: userId,
          preco_unitario_liquido: precoLiquido
        }, client);

        if (res.estoque_insuficiente) {
          inconsistencies.push({
            produto_id: res.produto_id!,
            produto: res.produto!,
            codigo: res.codigo!,
            estoque_atual: res.estoque_atual!,
            tentativa_saida: res.tentativa_saida!,
            estoque_ficaria: res.estoque_ficaria!
          });
        }
      }
    }

    if (inconsistencies.length > 0) {
      throw new StockInsufficientError(
        "Existem itens com saldo insuficiente para estornar.",
        inconsistencies
      );
    }

    return ok("Movimentou estoque á partir da compra com sucesso.")
  
  } catch (error: any) {
    console.error(error);
    return internalServerError('Erro ao movimentar estoque á partir da compra.');
  }
};



// Serviço para movimentar estoque a partir da venda.
export async function handleSaleInventoryMovementService(
  oldSale: salesModel,
  newSale: salesModel,
  userId: number,
  client: any
) {
  const saleStatusWithStockImpact = ['entregue', 'finalizado'];
  const inconsistencies: stockInsufficientErrorModel[] = [];

  try {
    // === Saída de estoque: de status aberto → finalizado/entregue ===
    if (
      !saleStatusWithStockImpact.includes(oldSale.status) &&
      saleStatusWithStockImpact.includes(newSale.status)
    ) {
      for (const item of newSale.itens as salesItemModel[]) {

        const precoLiquido =
          Number(item.preco_unitario || 0) -
          Number(item.desconto_unitario || 0);

        const res = await inventoryRepository.registerSaleMovement({
          produto_id: item.produto_id,
          quantidade: item.quantidade,
          tipo: 'saida',
          origem: "venda",
          referencia_id: newSale.id,
          usuario_id: userId,
          preco_unitario_liquido: precoLiquido
        }, client);

        if (res.estoque_insuficiente) {
          inconsistencies.push({
            produto_id: res.produto_id!,
            produto: res.produto!,
            codigo: res.codigo!,
            estoque_atual: res.estoque_atual!,
            tentativa_saida: res.tentativa_saida!,
            estoque_ficaria: res.estoque_ficaria!
          });
        }
      }
    }

    // === Estorno de venda: de status finalizado/entregue → aberto ===
    const saleWasReopened =
      saleStatusWithStockImpact.includes(oldSale.status) &&
      !saleStatusWithStockImpact.includes(newSale.status);

    if (saleWasReopened) {
      console.log('Processando estorno de estoque...');
      console.log('Itens a estornar:', oldSale.itens);
      
      for (const item of oldSale.itens as salesItemModel[]) {

        const precoLiquido = 
          Number(item.preco_unitario || 0) -
          Number(item.desconto_unitario || 0);

        const res = await inventoryRepository.registerSaleMovement({
          produto_id: item.produto_id,
          quantidade: item.quantidade,
          tipo: 'entrada',
          origem: "estorno_venda",
          referencia_id: newSale.id,
          usuario_id: userId,
          preco_unitario_liquido: precoLiquido
        }, client);

        if (res.estoque_insuficiente) {
          inconsistencies.push({
            produto_id: res.produto_id!,
            produto: res.produto!,
            codigo: res.codigo!,
            estoque_atual: res.estoque_atual!,
            tentativa_saida: res.tentativa_saida!,
            estoque_ficaria: res.estoque_ficaria!
          });
        }
      }
    }

    // === Transição interna entre 'entregue' <-> 'finalizado' → não faz nada ===

    if (inconsistencies.length > 0) {
      throw new StockInsufficientError(
        "Existem itens com saldo insuficiente para dar saída.",
        inconsistencies
      );
    }

    return ok("Movimentou estoque à partir da venda com sucesso.");
    
  } catch (error: any) {
    console.error(error);

    if (error instanceof StockInsufficientError) throw error;
    return internalServerError("Erro ao movimentar estoque à partir da venda.");
  }
}
