export interface salesModel {
  id: number;
  cliente_id: number; //FK
  cliente_nome: string,
  data_emissao: Date;
  tipo_pagamento: 'pix' | 'boleto' | 'cartao' | 'transferencia' | 'dinheiro';
  desconto_comercial: number;   // acordos, promoções, contratos
  desconto_financeiro: number;  // pagamento à vista, antecipado
  desconto_volume: number;
  valor_bruto: number;           // soma dos itens sem desconto
  valor_total: number;           // valor final após descontos aplicados
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
  produto_codigo?: string;
  produto_nome?: string;
  quantidade: number;
  preco_unitario: number;
  desconto_unitario: number;
  valor_bruto: number;
  valor_desconto: number;
  valor_liquido: number;
  data_cadastro: Date;
  created_by: number;
  data_atualizacao: Date;
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

export type NewSaleInput = {
  cliente_id: number;
  data_emissao: Date;
  tipo_pagamento: 'pix' | 'boleto' | 'cartao' | 'transferencia' | 'dinheiro' | null;
  desconto_comercial?: number;
  desconto_financeiro?: number;
  desconto_volume?: number;
  valor_bruto: number;
  status: SaleStatusType;
  itens: NewSaleItemInput[];
};

export type NewSaleItemInput = {
  produto_id: number;
  quantidade: number;
  preco_unitario: number;
  desconto_unitario?: number;
};