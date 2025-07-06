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
  estado: string;
  cep: string;
  status: 'ativo' | 'inativo';
  data_cadastro: Date;
  data_atualizacao: Date;
}