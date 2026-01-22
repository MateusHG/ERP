import db from "../config/db";
import { StockInsufficientError } from "../inventory/inventory-model";
import { handleSaleInventoryMovementService } from "../inventory/inventory-service";
import { estoqueNegativoItem, NewSaleInput, salesItemModel, salesModel } from "../sales/sales-model";
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


export const createSalesService = async (sale: NewSaleInput, userId: number) => {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    if ( !sale.status || !sale.cliente_id || !sale.tipo_pagamento || !sale.itens ) {
      await client.query("ROLLBACK");
      return badRequest(
        'Campos obrigatórios estão ausentes: status da venda, cliente, tipo de pagamento ou itens. ')
    }

    const clientExists = await salesRepository.verifyClientId(sale.cliente_id);
    if (!clientExists) {
      await client.query("ROLLBACK");
      return badRequest('Cliente informado não existe.')
    }

    if (sale.itens.length === 0) {
      await client.query("ROLLBACK");
      return badRequest("A venda deve possuir pelo menos um item.")
    }

    if (!sale.data_emissao) {
      await client.query("ROLLBACK");
      return badRequest("Obrigatório informar a data da emissão.");
    }

    // Cálculos da venda
    let totalBruto = 0;
    let totalDescontoVolume = 0;

    for (const item of sale.itens) {
      const quantidade = Number(item.quantidade);
      const precoUnit = Number(item.preco_unitario);
      const descUnit = Number(item.desconto_unitario ?? 0);

      totalBruto += precoUnit * quantidade;
      totalDescontoVolume += descUnit * quantidade;
    }

    // Injeta cálculos para fazer o INSERT
    sale.valor_bruto = totalBruto;
    sale.desconto_volume = totalDescontoVolume;

    // ================================
    // Projeção da venda ANTES de criar
    // ==================================
    const insertedSale = await salesRepository.insertSale(client, sale, userId);
    const fullSale = await salesRepository.getSaleByIdQuery(client, insertedSale.id);

    const salesStatusWithStockImpact = ["entregue", "finalizado"];

    if (salesStatusWithStockImpact.includes(fullSale.status)) {
      const oldSale: salesModel = {
        ...fullSale,
        status: "aberto",
        itens: [],
      };

      console.log("ITENS DA FULLSALE:", fullSale.itens);
      await handleSaleInventoryMovementService(oldSale, fullSale, userId, client);
    }    

    await client.query("COMMIT");
    return created(fullSale);
  
  } catch (err: any) {
    await client.query("ROLLBACK");
    console.error(err);

    if (err instanceof StockInsufficientError) {
      throw err;
    }

    return internalServerError('Erro ao cadastrar venda.');
  
  } finally {
    client.release();
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

    const oldSale = await salesRepository.getSaleByIdQuery(client, id);

    if (!oldSale) {
      await client.query("ROLLBACK");
      return notFound('Venda informada não existe.');
    }

    // Bloqueio de alteração: Caso a venda já tenha movimentado estoque, não permite alterar, deve-se reabrir(estornar) para poder mexer novamente.
    const blockedStatuses = ["entregue", "finalizado"];
    const isBlocked = blockedStatuses.includes(oldSale.status);

    if (isBlocked) {
       // Permite alterar apenas o status
      const onlyStatusBeingUpdated = 
        Object.keys(data).length === 1 && "status" in data;

      if (!onlyStatusBeingUpdated) {
        await client.query("ROLLBACK");
        return badRequest("Esta venda já foi entregue ou finalizada e não pode ser alterada, altere apenas o status para 'aberto' para estornar e poder editar novamente.");
      }
    }

    if (Object.keys(data).length === 0) {
      await client.query("ROLLBACK");
      return badRequest('Nenhum campo enviado para atualização.');
    }

    if ("data_emissao" in data && !data.data_emissao) {
      await client.query("ROLLBACK");
      return badRequest("Obrigatório informar a data da emissão.");
    }

    // Projetar itens para recálculo de valores
    const projectedItems = data.itens ?? oldSale.itens;

    let totalBruto = 0;
    let totalDescontoVolume = 0;

    for (const item of projectedItems) {
      const quantidade = Number(item.quantidade);
      const precoUnit = Number(item.preco_unitario);
      const descUnit = Number(item.desconto_unitario);

      totalBruto += quantidade * precoUnit;
      totalDescontoVolume += descUnit * quantidade;
    }

    data.valor_bruto = totalBruto
    data.desconto_volume = totalDescontoVolume;

    // Projeta a venda como ficaria após a atualização (necessário para enviar ao inventory validar se o estoque ficará negativo ou não.)
    const projectedSale: salesModel = {
      ...oldSale,
      ...data,
      itens: projectedItems
    };

    // Verifica se o status mudou
    const saleStatusWithStockImpact = ['entregue', 'finalizado'];
    const statusChanged = data.status && oldSale.status !== data.status;

    if (statusChanged) {
      // Chama o serviço de movimentação de estoque
      await handleSaleInventoryMovementService(oldSale, projectedSale, userId, client);
    }

    // Atualiza a venda no banco
    const updatedSale = await salesRepository.updateSaleById(id, data, client, userId);

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

    const sale = await salesRepository.verifySaleId(id);
    if (!sale) {
      return notFound('Venda informada não existe.')
    }

    if (sale.status === 'finalizado' || sale.status === 'entregue') {
      return badRequest('Não é possível excluir uma venda finalizada ou entregue.');
    }

    await salesRepository.deleteSaleById(id);
    return ok({ message: 'Venda deletada com sucesso.' } );
  
    } catch (err) {
      console.error(err);
      return internalServerError('Erro ao deletar venda.');
    }
};