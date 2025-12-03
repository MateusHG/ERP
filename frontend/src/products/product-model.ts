interface productModel {
  id: number;
  codigo: string;
  nome: string;
  descricao: string;
  estoque: number;
  categoria: string;
  status: string;
  estoque_minimo: number;
  estoque_maximo: number;
  data_cadastro: string;
  data_atualizacao: string;
  has_movements: boolean;
}

export default productModel;