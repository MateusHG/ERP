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
  data_cadastro: string;
  data_atualizacao: string;
  has_purchases: boolean; // Volta um boolean para o front-end saber se o fornecedor já tem compras no sistema, e fazer bloqueios de exclusão/edição de dados sensíveis.
}

export default supplierModel;