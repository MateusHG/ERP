export interface saleModel {
  id: number;
  cliente_id: number; //FK
  cliente_nome: string,
  data_emissao: string;
  tipo_pagamento: 'pix' | 'boleto' | 'cartao' | 'transferencia' | 'dinheiro';
  desconto_comercial?: number;   // acordos, promoções, contratos
  desconto_financeiro?: number;  // pagamento à vista, antecipado
  valor_bruto?: number;           // soma dos itens sem desconto
  valor_total?: number;           // valor final após descontos aplicados
  status: 'aberto' | 'aguardando' | 'aprovado' | 'recebido' | 'cancelado';
  data_cadastro: string;
  data_atualizacao: string;
};

export interface saleItemModel {
  id: number;
  sale_id: number;         // FK
  produto_id: number;
  produto_codigo: string,
  produto_nome: string,
  quantidade: number;
  preco_unitario: number;
  desconto_unitario?: number;    // desconto por item por quantidade
  valor_total?: number;               // (preco_unitario - desconto_unitario) * quantidade -- FEITO DIRETO NO BANCO DE DADOS.
}

export const paymentLabels: Record<string, string> = {
  pix: "Pix",
  boleto: "Boleto",
  cartao: "Cartão",
  transferencia: "TED/DOC",
  dinheiro: "Dinheiro"
};

export const statusLabels: Record<string, string> = {
  aberto: "Em Aberto",
  aguardando: "Aguardando Aprovação",
  aprovado: "Aprovado",
  despachado: "Despachado",
  entregue: "Entregue",
  finalizado: "Finalizado",
  cancelado: "Cancelado"
};

export interface estoqueNegativoItem {
  produto_id: number;
  produto: string;
  codigo: string;
  estoque_atual: number;
  tentativa_saida: number;
  estoque_ficaria: number;
};