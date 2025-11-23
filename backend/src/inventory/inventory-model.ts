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
  id?: number;
  produto_id: number;
  tipo: "entrada" | "saida";
  quantidade: number;
  preco_unitario_liquido?: number;
  valor_total?: number;
  origem: "compra" | "venda" | "estorno_compra" | "estorno_venda";
  referencia_id: number;
  usuario_id: number;
  usuario_nome?: string,
  created_at?: Date;
};

export interface InventoryMovementResult {
  estoque_insuficiente: boolean;
  produto_id?: number;
  produto?: string | null;
  codigo?: string | null;
  estoque_atual?: number;
  tentativa_saida?: number;
  estoque_ficaria?: number;
};

export interface stockInsufficientErrorModel {
  produto_id: number,
  produto: string | null;
  codigo: string | null;
  estoque_atual: number;
  tentativa_saida: number;
  estoque_ficaria: number;
};

export class StockInsufficientError extends Error {
  public inconsistencies: stockInsufficientErrorModel[];

  constructor(message: string, inconsistencies: stockInsufficientErrorModel[]) {
    super(message);
    this.name = "StockInsufficientError";
    this.inconsistencies = inconsistencies;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, StockInsufficientError);
    }
  }
}