export interface purchaseModel {
  id: number;
  fornecedor_id: number; //FK
  fornecedor_nome: string,
  data_emissao: Date;
  tipo_pagamento: 'pix' | 'boleto' | 'cartao' | 'transferencia' | 'dinheiro';
  desconto_comercial?: number;   // acordos, promoções, contratos
  desconto_financeiro?: number;  // pagamento à vista, antecipado
  valor_bruto?: number;           // soma dos itens sem desconto
  valor_total?: number;           // valor final após descontos aplicados
  status: 'aberto' | 'aguardando' | 'aprovado' | 'recebido' | 'cancelado';
  itens: [];
  data_cadastro: Date;
  data_atualizacao: Date;
}

export interface purchaseItemModel {
  id: number;
  purchase_id: number;         // FK
  produto_id: number;
  produto_codigo: string,
  produto_nome: string,
  quantidade: number;
  preco_unitario: number;
  desconto_volume?: number;    // desconto por item por quantidade
 // valor_subtotal: number;               // (preco_unitario - desconto_volume) * quantidade -- FEITO DIRETO NO BANCO DE DADOS.
}

