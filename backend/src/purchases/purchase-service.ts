import * as purchasesRepository from "../purchases/purchase-repository";
import { badRequest, created, internalServerError, notFound, ok } from "../utils/http-helper";
import { purchaseItemModel, purchaseModel } from "../purchases/purchase-model";

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


export const createPurchaseService = async (
  purchase: Omit<purchaseModel, 'id' | 'data_cadastro' | 'data_atualizacao' | 'itens' | 'valor_bruto' | 'valor_total'> & {
  itens: Omit<purchaseItemModel, 'id' | 'valor_subtotal'>[]}
) => {
  try {
    if ( !purchase.data_emissao ) {
      return badRequest('Obrigatório informar uma data.')
    }

    if (!purchase.status) {
      return badRequest('Obrigatório informar status da compra.')
    }

    if (!purchase.fornecedor_id) {
      return badRequest("Obrigatório selecionar um fornecedor válido.")
    }

    if (!purchase.tipo_pagamento) {
      return badRequest('Obrigatório informar o tipo de pagamento.')
    }

    if (!purchase.itens) {
      return badRequest('Obrigatório adicionar um item.')
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