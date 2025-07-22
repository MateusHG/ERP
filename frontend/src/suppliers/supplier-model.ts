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
}

export default supplierModel;