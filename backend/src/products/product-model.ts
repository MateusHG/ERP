export interface productModel {
  id: number;
  codigo: string;
  nome: string;
  descricao: string;
  categoria: string;
  status: string;
  estoque_minimo: number;
  estoque_maximo: number;
  data_cadastro: Date;
  data_atualizacao: Date;
  has_movements: boolean;
}