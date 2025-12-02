export interface inventoryListModel {
  id: number,
  codigo: string,
  produto_nome: string,
  categoria: string,
  estoque_minimo: number,
  estoque_maximo: number,
  estoque_atual: number,
  preco_medio_compra: string,
  preco_medio_venda: string
};

export interface inventoryMovementsModel {
  data_hora: string,
  tipo_mov: string,
  origem: string,
  quantidade: number,
  preco_unitario_liquido: string,
  valor_total_liquido: string,
  user: string
};

export const tipoMovLabels: Record<string, string> = {
  entrada: "Entrada",
  saida: "Saída",
};

export const origemMovLabels: Record<string, string> = {
  compra: "Compra ID: ",
  venda: "Venda ID: ",
  estorno_compra: "Estorno da Compra ID: ",
  estorno_venda: "Estorno da Venda ID: ",
  ajuste: "Ajuste Manual #"
};

