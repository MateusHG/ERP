export interface inventoryListModel {
  id: number,
  codigo: string,
  nome: string,
  categoria: string,
  estoque_minimo: number,
  estoque_maximo: number,
  estoque_atual: number,
  preco_medio_compra: string,
  preco_medio_venda: string,
  status: string,
  saldo: string
}

export interface InventoryMovementModel {
  id: number;
  produto_id: number;
  tipo: "entrada" | "saida";
  quantidade: number;
  preco_unitario?: number;
  valor_total?: number;
  origem: string;
  referencia_id: number;
  usuario_id: number;
  usuario_nome: string,
  created_at: Date;
};