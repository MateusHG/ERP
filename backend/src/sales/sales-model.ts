export interface salesModel {
  id_venda: number;
  id_cliente: number; //FK
  data_emissao: Date;
  tipo_pagamento: 'pix' | 'boleto' | 'cartao' | 'transferencia' | 'prazo';
  desconto_comercial?: number;   // acordos, promoções, contratos
  desconto_financeiro?: number;  // pagamento à vista, antecipado
  valor_bruto?: number;           // soma dos itens sem desconto
  valor_total?: number;           // valor final após descontos aplicados
  status: 'pendente' | 'aprovado' | 'cancelado';
  itens: salesItemModel[];
  data_cadastro: Date;
  data_atualizacao: Date;
}

export interface salesItemModel {
  id_item: number;
  id_venda: number;         // FK
  id_produto: number;
  quantidade: number;
  preco_unitario: number;
  desconto_volume?: number;    // desconto por item por quantidade
  valor_subtotal: number;               // (preco_unitario - desconto_volume) * quantidade -- FEITO DIRETO NO BANCO DE DADOS.
}
