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
  data: string,
  tipo_mov: string,
  origem: string,
  quantidade: number,
  valor_un: string,
  total: string,
  user: string
};