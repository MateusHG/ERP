export interface salesModel {
  id: number;
  cliente_id: number; //FK
  cliente_nome: string,
  data_emissao: Date;
  tipo_pagamento: 'pix' | 'boleto' | 'cartao' | 'transferencia' | 'dinheiro';
  desconto_comercial?: number;   // acordos, promoções, contratos
  desconto_financeiro?: number;  // pagamento à vista, antecipado
  valor_bruto?: number;           // soma dos itens sem desconto
  valor_total?: number;           // valor final após descontos aplicados
  status: SaleStatusType;
  itens: salesItemModel[];
  data_cadastro: Date;
  data_atualizacao: Date;
  created_by: number;
  updated_by: number;
}

export interface salesItemModel {
  id: number;
  venda_id: number;         // FK
  produto_id: number;
  quantidade: number;
  preco_unitario: number;
  desconto_volume?: number;    // desconto por item por quantidade
  // valor_subtotal: number;               // (preco_unitario - desconto_volume) * quantidade -- FEITO DIRETO NO BANCO DE DADOS.
  created_by: number;
  updated_by: number;
};

export interface estoqueNegativoItem {
  produto: string;
  codigo: string;
  estoqueAtual: number;
  tentativaSaida: number;
  estoqueFicaria: number;
};

export type SaleStatusType = | 'aberto' | 'aguardando'  | 'aprovado' | 'despachado' | 'entregue' | 'finalizado' | 'cancelado';

export type NewSaleInput =Omit<salesModel,'id' | 'data_cadastro' | 'data_atualizacao' | 'valor_bruto' | 'valor_total' | 'itens'> & {
  itens: Omit<salesItemModel, 'id' | 'valor_subtotal'>[];
};