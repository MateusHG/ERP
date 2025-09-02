export interface InventoryMovementModel {
  id: number;
  produto_id: number;
  tipo: "entrada" | "saida" | "ajuste";
  quantidade: number;
  origem?: string;
  referencia_id?: number;
  usuario_id?: number;
  created_at?: Date;
}