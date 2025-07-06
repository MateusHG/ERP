interface productModel {
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
  data_cadastro: string;
  data_atualizacao: string;
}

export default productModel;