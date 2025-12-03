//Campos com "?" são opcionais. 

export interface customerModel {
  id: number;
  razao_social: string;
  nome_fantasia?: string;
  cnpj: string;
  cpf: string;
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
  has_sales: boolean;
}

export default customerModel;