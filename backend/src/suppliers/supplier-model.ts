//Campos com "?" são opcionais. 

export interface supplierModel {
  id: number;
  razao_social: string;
  nome_fantasia?: string;
  cnpj: string;
  inscricao_estadual: string;
  email: string;
  telefone?: string; 
  celular?: string;  
  rua: string;
  numero: string;
  complemento: string;  
  bairro: string;
  cidade: string;
  uf: string;
  cep: string;
  status: 'ativo' | 'inativo';
  data_cadastro: Date;
  data_atualizacao: Date;
  has_purchases: boolean; // Retorna um boolean para o front-end saber se o fornecedor já possui compras movimentadas, e poder bloquear exclusão do cadastro ou edição de dados sensíveis.
}