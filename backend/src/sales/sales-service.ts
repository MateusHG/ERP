import { StockInsufficientError } from "../inventory/inventory-model";
import { handleSaleInventoryMovementService } from "../inventory/inventory-service";
import { estoqueNegativoItem, salesItemModel, salesModel } from "../sales/sales-model";
import * as salesRepository from "../sales/sales-repository";
import { badRequest, created, internalServerError, notFound, ok } from "../utils/http-helper";

export const getAllSalesService = async (
  filters: { id?: number, cliente_nome?: string, status?: string, data_emissao_inicio: string, data_emissao_final: string }
) => {
  try {
    const sales = await salesRepository.searchAllSales(filters);
    return ok(sales);
  
  } catch (err) {
    console.error(err);
    return internalServerError('Erro ao buscar vendas.')
  } 
};

export const getSaleByIdService = async (id: number) => {
  try {
    if (isNaN(id)) {
      return badRequest('ID Inválido.')
    }

    const sale = await salesRepository.searchSaleById(id);

    if(!sale) {
      return notFound('Venda não encontrada.')
    }
      return ok(sale);
  
    } catch (err) {
      console.error(err);
      return internalServerError('Erro ao buscar venda pelo ID.')
    }
};

export const createSalesService = async (
  //Omitindo campos que são gerados automaticamente pelo banco de dados.
  sale: Omit<salesModel, 'id' | 'data_cadastro' | 'data_atualizacao' | 'itens' | 'valor_bruto' | 'valor_total'> & {
  itens: Omit<salesItemModel, 'id'  | 'valor_subtotal'>[]}
) => {
  try {
    if ( !sale.status || !sale.cliente_id || !sale.tipo_pagamento || !sale.itens ) {
      return badRequest(
        'Campos obrigatórios estão ausentes: status da venda, cliente, tipo de pagamento ou itens. ')
    }

    const clientExists = await salesRepository.verifyClientId(sale.cliente_id);
    if (!clientExists) {
      return badRequest('Cliente informado não existe.')
    }

    const insertedSale = await salesRepository.insertSale(sale);
    return created(insertedSale);
  
  } catch (err) {
    console.error(err);
    return internalServerError('Erro ao cadastrar venda.')
  }
};

export const updateSaleByIdService = async (id: number, data: Partial<salesModel>) => {
  try {
    if (isNaN(id)) {
      return badRequest('ID da venda inválido.')
    }

    const saleExists = await salesRepository.verifySaleId(id);
    if (!saleExists) {
      return notFound('Venda informada não existe.')
    }

    if ("data_emissao" in data && !data.data_emissao) {
      return badRequest("Obrigatório informar a data da emissão")
    }

    if (Object.keys(data).length === 0) {
      return badRequest('Nenhum campo enviado para atualização.')
    }

    // Busca venda antiga para comparar status
    const oldSale = await salesRepository.getSaleByIdQuery(id);

    // ------------------------------------
    // 1) VALIDAR ESTOQUE ANTES DO UPDATE
    // ------------------------------------
    const saleStatusWithStockImpact = ['entregue', 'finalizado'];
    const statusChanged = data.status && oldSale.status !== data.status;

    if (statusChanged && saleStatusWithStockImpact.includes(data.status!)) {

      // Projeta como ficará a venda com o novo status antes de dar update.
      const projectedSale = { ...oldSale, ...data };

      // Chama o serviço de estoque para validar a movimentação
      await handleSaleInventoryMovementService(oldSale, projectedSale);   // --> Chama o serviço no módulo de estoque.
    }

    // ------------------------------------------
    // 2) SÓ FAZ O UPDATE SE A VALIDAÇÃO PASSOU
    // -------------------------------------------
    const updatedSale = await salesRepository.updateSaleById(id, data);

    return ok(updatedSale);
  
  } catch (err: any) {
    console.error(err);

    // Propaga o erro de estoque negativo para o controller tratar.
    if (err instanceof StockInsufficientError) {
      throw err;
    }

    return internalServerError('Erro ao atualizar venda.');
  }
};

export const deleteSaleByIdService = async (id: number) => {
  try {
    if (isNaN(id)) {
      return badRequest('ID Inválido.')
    }

    const saleExists = await salesRepository.verifySaleId(id);
    if (!saleExists) {
      return notFound('Venda informada não existe.')
    }

    await salesRepository.deleteSaleById(id);
    return ok({ message: 'Venda deletada com sucesso.' } );
  
    } catch (err) {
      console.error(err);
      return internalServerError('Erro ao deletar venda.');
    }
};