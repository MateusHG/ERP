import * as purchaseItemsRepository from "../purchases/purchase-item-repository";
import { purchaseItemModel } from "../purchases/purchase-model";
import { badRequest, created, internalServerError, notFound, ok } from "../utils/http-helper";

export const getPurchaseItemsService = async (purchaseId: number) => {
  try {
    if (isNaN(purchaseId)) {
      return badRequest('ID da compra inválido.')
    }
    
    const purchaseItems = await purchaseItemsRepository.searchAllPurchaseItems(purchaseId);
    return ok(purchaseItems);
  
    } catch(err) {
      console.error(err); {
      return internalServerError('Erro ao buscar itens.')  
    }
  } 
};

export const postPurchaseItemService = async (purchaseId: number, purchaseItem: purchaseItemModel) => {
  try {
    if (isNaN(purchaseId)) {
      return badRequest('ID da compra inválido.')
    }

    const purchaseExists = await purchaseItemsRepository.verifyPurchase(purchaseId);
      if (!purchaseExists) {
      return notFound('Compra informada não existe.')
    }

    const insertedItem = await purchaseItemsRepository.insertPurchaseItem(purchaseId, purchaseItem);
    return created(insertedItem);

    } catch (err) {
      console.error(err); {
      return internalServerError('Erro ao inserir item.')
    }
  }
};

export const updatePurchaseItemService = async (purchaseId: number, purchaseItemId: number, data: Partial<purchaseItemModel>) => {
  try {
    if (isNaN(purchaseId)) {
      return badRequest('ID da compra inválido.')
    }

    if (isNaN(purchaseItemId)) {
      return badRequest('ID do item de compra inválido.')
    }

    if (Object.keys(data).length === 0) {
      return badRequest('Nenhum campo enviado para atualização.')
    }

    const purchaseExists = await purchaseItemsRepository.verifyPurchase(purchaseId);
    if (!purchaseExists) {
      return notFound('Compra informada não existe.')
    }

    const purchaseItemExists = await purchaseItemsRepository.verifyPurchaseItem(purchaseItemId);
    if (!purchaseItemExists) {
      return notFound('ID do item de compra não existe.')
    }
    
    //Se estiver alterando o produto dentro do item (tabela itens_compra), verifica se o mesmo existe na tabela produtos.
    if (data.produto_id) {
      const productExists = await purchaseItemsRepository.verifyProduct(data.produto_id);
      if(!productExists) {
        return notFound('Produto informado não existe.')
      }
    }
    
    const updatedItem = await purchaseItemsRepository.updatePurchaseItem(purchaseId, purchaseItemId, data);
    return ok(updatedItem);

  } catch (err) {
    console.error(err);
    return internalServerError('Erro ao atualizar item de compra.')
  }
};

export const deletePurchaseItemService = async (purchaseId: number, purchaseItemId: number) => {
  try {  
    if (isNaN(purchaseId)) {
      return badRequest('ID da compra inválido.')
    }

    if (isNaN(purchaseItemId)) {
      return badRequest('ID do item da compra inválido.')
    }
   
    const purchaseExists = await purchaseItemsRepository.verifyPurchase(purchaseId);
    if (!purchaseExists) {
      return notFound('Compra informada não existe.')
    }

    const purchaseItemExists = await purchaseItemsRepository.verifyPurchaseItem(purchaseItemId);
    if (!purchaseItemExists) {
      return notFound('ID do item de compra não existe.')
    }

    await purchaseItemsRepository.deletePurchaseItem(purchaseId, purchaseItemId)
    return ok('Item deletado com sucesso.');

    } catch (error) {
      console.error(error);
      return internalServerError('Erro ao deletar item da compra.')
    }
};