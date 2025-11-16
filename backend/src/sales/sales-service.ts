import db from "../config/db";
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

export const updateSaleByIdService = async (id: number, data: Partial<salesModel>, userId: number) => {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    if (isNaN(id)) {
      await client.query("ROLLBACK");
      return badRequest('ID da venda inválido.');
    }

    const oldSale = await salesRepository.getSaleByIdQuery(id);
    if (!oldSale) {
      await client.query("ROLLBACK");
      return notFound('Venda informada não existe.');
    }

    if ("data_emissao" in data && !data.data_emissao) {
      await client.query("ROLLBACK");
      return badRequest("Obrigatório informar a data da emissão.");
    }

    if (Object.keys(data).length === 0) {
      await client.query("ROLLBACK");
      return badRequest('Nenhum campo enviado para atualização.');
    }

    // Projeta a venda como ficaria após a atualização
    const projectedSale: salesModel = {
      ...oldSale,
      ...data,
      itens: data.itens ?? oldSale.itens, // garante que os itens existam
    };

    // Verifica se o status mudou
    const saleStatusWithStockImpact = ['entregue', 'finalizado'];
    const statusChanged = data.status && oldSale.status !== data.status;

    if (statusChanged) {
      // Chama o serviço de movimentação de estoque
      await handleSaleInventoryMovementService(oldSale, projectedSale, userId);
    }

    // Atualiza a venda no banco
    const updatedSale = await salesRepository.updateSaleById(id, data, client);

    await client.query("COMMIT");
    return ok(updatedSale);

  } catch (err: any) {
    await client.query("ROLLBACK");
    console.error(err);

    if (err instanceof StockInsufficientError) {
      throw err;
    }

    return internalServerError('Erro ao atualizar venda.');
  } finally {
    client.release();
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