import { salesItemModel } from "../sales/sales-model";
import * as saleItemsRepository from "../sales/sale-item-repository";
import { badRequest, created, internalServerError, notFound, ok } from "../utils/http-helper";

export const getSaleItemsService = async(saleId: number) => {
  try {
    if (isNaN(saleId)) {
      return badRequest('ID da Venda Inválido.')
    }

    const saleItems = await saleItemsRepository.searchAllSaleItems(saleId);
    return ok(saleItems);
  
  } catch (err) {
    console.error(err); {
      return internalServerError('Erro ao buscar itens.')
    }
  } 
};

export const postSaleItemService = async (saleId: number, saleItem: salesItemModel) => {
  try {
    if (isNaN(saleId)) {
      return badRequest('ID da venda inválido.')
    }

    const saleExists = await saleItemsRepository.verifySale(saleId);
      if (!saleExists) {
        return notFound('Venda informada não existe.')
      }

    const insertedItem = await saleItemsRepository.insertSaleItem(saleId, saleItem);
    return created(insertedItem)
  
    } catch (err) {
      console.error(err);
      return internalServerError('Erro ao inserir item.')
    }
};

export const updateSaleItemService = async (saleId: number, saleItemId: number, data: Partial<salesItemModel>) => {
  try {
    if (isNaN(saleId)) {
      return badRequest('ID da venda inválido.')
    }

    if (isNaN(saleItemId)) {
      return badRequest('ID do item inválido.')
    }

    if (Object.keys(data).length === 0) {
      return badRequest('Nenhum campo enviado para atualização.')
    }

    const saleExists = await saleItemsRepository.verifySale(saleId);
    if (!saleExists) {
      return notFound('Venda informada não existe.')
    }

    const saleItemExists = await saleItemsRepository.verifySaleItem(saleItemId);
    if (!saleItemExists) {
      return notFound('ID do item de venda não existe.')
    }

    //Se estiver alterando o produto dentro do item (tabela itens_venda), verifica se o mesmo existe na tabela produtos.
    if (data.id_produto) {
      const productExists = await saleItemsRepository.verifyProduct(data.id_produto);
      if (!productExists) {
        return notFound('Produto informado não existe.')
      }
    }
    const updatedItem = await saleItemsRepository.updateSaleItem(saleId, saleItemId, data);
    return ok(updatedItem);
  } catch (err) {
    console.error(err);
    return internalServerError('Erro ao atualizar item de venda.')
  }
};

export const deleteSaleItemService = async (saleId: number, saleItemId: number) => {
  try {
    if (isNaN(saleId)) {
      return badRequest('ID de venda inválido.')
    }

    if (isNaN(saleItemId)) {
      return badRequest('ID do item inválido')
    }
    
    const saleExists = await saleItemsRepository.verifySale(saleId);
    if (!saleExists) {
      return notFound('Venda informada não existe.')
    }

    const saleItemExists = await saleItemsRepository.verifySaleItem(saleItemId);
    if (!saleItemExists) {
      return notFound('ID do item de venda não existe.')
    }

    await saleItemsRepository.deleteSaleItem(saleId, saleItemId)
    return ok('Item deletado com sucesso.');
  
  } catch (err) {
    console.error(err);
    return internalServerError('Erro ao deletar item de venda.')
  }
};