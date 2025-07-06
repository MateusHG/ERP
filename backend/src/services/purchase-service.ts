import * as purchasesRepository from "../repositories/purchase-repository";
import { badRequest, created, internalServerError, notFound, ok } from "../utils/http-helper";
import { purchaseItemModel, purchaseModel } from "../models/purchase-model";

export const getAllPurchasesService = async () => {
  try {
    const purchases = await purchasesRepository.searchAllPurchases();
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


export const createPurchaseService = async (
  purchase: Omit<purchaseModel, 'id' | 'data_cadastro' | 'data_atualizacao' | 'itens' | 'valor_bruto' | 'valor_total'> & {
  itens: Omit<purchaseItemModel, 'id' | 'valor_subtotal'>[]}
) => {
  try {
    if ( !purchase.data_emissao || !purchase.status || !purchase.fornecedor_id || !purchase.tipo_pagamento || !purchase.itens) {
      return badRequest(
        'Campos obrigatórios estão ausentes: Data de emissão, status: pendente aprovado ou cancelado, fornecedor, tipo de pagamento ou itens.')
    }

    const supplierExists = await purchasesRepository.verifySupplierId(purchase.fornecedor_id);
    if (!supplierExists) {
      return badRequest('Fornecedor informado não existe.')
    }

    const insertedPurchase = await purchasesRepository.insertPurchase(purchase);
    return created(insertedPurchase);
  
  } catch (err) {
    console.error(err);
    return internalServerError('Erro ao cadastrar compra.')
  }
};

export const updatePurchaseByIdService = async (id: number, data: Partial<purchaseModel>) => {
  try {
    if (Object.keys(data).length === 0) {
      return badRequest('Nenhum campo enviado para atualização.')
    }
    
  } catch (err) {
    console.error(err);
    return internalServerError('Erro ao atualizar compra.')
  }
  
  const updatedPurchase = await purchasesRepository.updatePurchase(id, data);
  return ok(updatedPurchase);
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
      return ok('Compra deletada com sucesso.');
  
    } catch (err) {
      console.error(err);
      return internalServerError('Erro ao deletar compra.');
    }
};