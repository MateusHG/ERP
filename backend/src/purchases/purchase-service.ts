import * as purchasesRepository from "../purchases/purchase-repository";
import { badRequest, created, internalServerError, notFound, ok } from "../utils/http-helper";
import { NewPurchaseInput, purchaseModel } from "../purchases/purchase-model";
import { handlePurchaseInventoryMovementService } from "../inventory/inventory-service";
import db from "../config/db";
import { StockInsufficientError } from "../inventory/inventory-model";

export const getAllPurchasesService = async (
  filters: {id?: number, fornecedor_nome?: string, status?: string, data_emissao_inicio: string, data_emissao_final: string}
) => {
  try {
    const purchases = await purchasesRepository.searchAllPurchases(filters);
    return ok(purchases);

  } catch (err) {
    console.error(err);
    return internalServerError('Erro ao buscar compras.')
  }
};

export const getPurchaseByIdService = async (id: number) => {
  try {
    if (isNaN(id)) {
      return badRequest('ID inválido.')
    }

    const purchaseId = await purchasesRepository.searchPurchaseById(id);
    if (!purchaseId) {
      return notFound('Compra não encontrada.')
    }

    return ok(purchaseId);
  
  } catch (err) {
    console.error(err);
    return internalServerError('Erro ao buscar compra pelo ID.')
  }
};


export const createPurchaseService = async (purchase: NewPurchaseInput, userId: number) => {
  const client = await db.connect(); 
  
  try {
    await client.query("BEGIN")

    if ( !purchase.data_emissao ) {
      await client.query("ROLLBACK");
      return badRequest('Obrigatório informar a data de emissão.')
    }

    if (!purchase.status) {
      await client.query("ROLLBACK");
      return badRequest('Obrigatório informar status da compra.')
    }

    if (!purchase.fornecedor_id) {
      await client.query("ROLLBACK");
      return badRequest("Obrigatório selecionar um fornecedor válido.")
    }

    if (!purchase.tipo_pagamento) {
      await client.query("ROLLBACK");
      return badRequest('Obrigatório informar o tipo de pagamento.')
    }

    if (!purchase.itens) {
      await client.query("ROLLBACK");
      return badRequest('Obrigatório adicionar um item.')
    }

    const supplierExists = await purchasesRepository.verifySupplierId(purchase.fornecedor_id);
    if (!supplierExists) {
      await client.query("ROLLBACK");
      return badRequest('Fornecedor informado não existe.')
    }

    // ================================
    // Projeção da compra ANTES de criar
    // ==================================
    const insertedPurchase = await purchasesRepository.insertPurchase(client, purchase, userId);

    const fullPurchase = await purchasesRepository.getPurchaseByIdQuery(client, insertedPurchase.id);

    const purchaseStatusWithStockImpact = ["recebido", "finalizado"];

    if (purchaseStatusWithStockImpact.includes(fullPurchase.status)) {
      const oldPurchase: purchaseModel = {
        ...fullPurchase,
        status: "aberto",
        itens: [],
      };

      console.log("ITENS DA FULLPURCHASE:", fullPurchase.itens);
      await handlePurchaseInventoryMovementService(oldPurchase, fullPurchase, userId, client);
    }

    await client.query("COMMIT");
    return created(fullPurchase);
  
  } catch (err: any) {
    await client.query("ROLLBACK")
    console.error(err);

    if (err instanceof StockInsufficientError) {
      throw err;
    }

    return internalServerError('Erro ao cadastrar compra.')
    
  } finally {
    client.release();
  }
};

export const updatePurchaseByIdService = async (id: number, data: Partial<purchaseModel>, userId: number) => {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    if (isNaN(id)) {
      await client.query("ROLLBACK");
      return badRequest("ID da compra inválido.")
    }

    const oldPurchase = await purchasesRepository.getPurchaseByIdQuery(client, id);
    if (!oldPurchase) {
      await client.query("ROLLBACK");
      return notFound("Compra informada não existe.")
    }

    if (Object.keys(data).length === 0) {
      await client.query("ROLLBACK");
      return badRequest('Nenhum campo enviado para atualização.')
    }

    if ("data_emissao" in data && !data.data_emissao) {
      await client.query("ROLLBACK");
      return badRequest("Obrigatório informar a data da emissão.")
    }

    // Projeta a compra como ficaria após a atualização
    const projectedPurchase: purchaseModel = {
      ...oldPurchase,
      ...data,
      itens: data.itens ?? oldPurchase.itens // garante que os itens existam
    };

    const purchaseStatusWithStockImpact = ['recebido', 'finalizado'];
    const statusChanged = data.status && oldPurchase.status !== data.status;
    
    if (statusChanged) {
      await handlePurchaseInventoryMovementService(oldPurchase, projectedPurchase, userId, client);
    }

    const updatedPurchase = await purchasesRepository.updatePurchaseById(id, data, client, userId);

    await client.query("COMMIT");
    return ok(updatedPurchase);

    } catch (err: any) {
      await client.query("ROLLBACK");
      console.error(err);

    if (err instanceof StockInsufficientError) {
      throw err;
    }

    return internalServerError('Erro ao atualizar compra.')
  } finally {
    client.release();
  }
};

export const deletePurchaseByIdService = async (id: number) => {
  try {
    if (isNaN(id)) {
      return badRequest('ID Inválido.');
    }

    const deleted = await purchasesRepository.deletePurchaseById(id);
    
    if (!deleted) {
      return notFound('ID não encontrado.')
    }
      return ok( { message:  'Compra deletada com sucesso.' });
  
    } catch (err) {
      console.error(err);
      return internalServerError('Erro ao deletar compra.');
    }
};