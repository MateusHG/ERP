export interface productModel {
  id: number;
  codigo: string;
  nome: string;
  descricao: string;
  preco: number;
  estoque: number;
  categoria: string;
  status: string;
  estoque_minimo: number;
  estoque_maximo: number;
  data_cadastro: Date;
  data_atualizacao: Date;
}