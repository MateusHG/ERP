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

    if (Object.keys(data).length === 0) {
      return badRequest('Nenhum campo enviado para atualização.')
    }

    // Verifica se há estoque antes de salvar(Monta a mensagem para enviar ao front-end) + trigger de fallback no postgres.
    if (data.itens && Array.isArray(data.itens)) {
      const itensNegativos: estoqueNegativoItem[] = [];

      for (const item of data.itens as salesItemModel[]) {
        const saldoAtual = await salesRepository.getProductBalance(item.produto_id);
        const estoqueFicaria = saldoAtual - item.quantidade;

        if (estoqueFicaria < 0) {
          const produtoInfo = await salesRepository.getProductInfo(item.produto_id);

          itensNegativos.push({
            produto: produtoInfo.nome,
            codigo: produtoInfo.codigo,
            estoqueAtual: saldoAtual,
            tentativaSaida: item.quantidade,
            estoqueFicaria,
          });
        }
      }

      if (itensNegativos.length > 0) {
        return {
          statusCode: 400,
          body: {
            tipo: "estoque_negativo",
            message: "Estoque insuficiente para realizar a movimentação.",
            itens: itensNegativos,
          },
        };
      }
    }

    const updatedSale = await salesRepository.updateSaleById(id, data);
    return ok(updatedSale);
  
  } catch (err: any) {
    console.error(err);
    return internalServerError('Erro ao atualizar venda.')
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