export interface purchaseModel {
  id: number;
  fornecedor_id: number;
  fornecedor_nome: string,
  data_emissao: Date;
  tipo_pagamento: 'pix' | 'boleto' | 'cartao' | 'transferencia' | 'dinheiro';
  desconto_comercial: number;   // acordos, promoções, contratos
  desconto_financeiro: number;  // pagamento à vista, antecipado
  desconto_volume: number;       // total dos decontos dos itens
  valor_bruto: number;           // calculado pelo service(back-end)
  valor_total: number;            // ((valor_bruto - desconto_volume) - desconto_comercial - desconto_financeiro) -- gerado via STORED pelo DB.
  status: PurchaseStatusType;
  itens: purchaseItemModel[];
  data_cadastro: Date;
  created_by: number;
  data_atualizacao: Date;
  updated_by: number;
};

export interface purchaseItemModel {
  id: number;
  compra_id: number;         // FK
  produto_id: number;
  produto_codigo?: string;
  produto_nome?: string;
  quantidade: number;
  preco_unitario: number;
  desconto_unitario: number;    // desconto por item por unidade
  valor_bruto: number;         // preco_unitario * quantidade
  valor_desconto: number;         // desconto_unitario * quantidade
  valor_liquido: number;               // (preco_unitario - desconto_volume) * quantidade
  data_cadastro: Date;
  created_by: number;
  data_atualizacao: Date;
  updated_by: number;
};

export type PurchaseStatusType = | 'aberto' | 'aguardando' | 'aprovado' | 'recebido' | 'finalizado' | 'cancelado';

export type NewPurchaseInput = {
  fornecedor_id: number;
  data_emissao: Date;
  tipo_pagamento: 'pix' | 'boleto' | 'cartao' | 'transferencia' | 'dinheiro' | null;
  desconto_comercial?: number;
  desconto_financeiro?: number;
  desconto_volume?: number;
  valor_bruto: number;
  status: PurchaseStatusType;
  itens: NewPurchaseItemInput[];
};

export type NewPurchaseItemInput = {
  produto_id: number;
  quantidade: number;
  preco_unitario: number;
  desconto_unitario?: number;
};