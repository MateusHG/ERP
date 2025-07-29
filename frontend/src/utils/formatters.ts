//Formatação de data
export function formatData(dataStr: string): string {
  const data = new Date(dataStr);
  return data.toLocaleDateString("pt-BR");
};

//Formatar os valores em reais;
export const formatCurrency = (value: number | string ): string  => {
  if (value === undefined || value === null ) return "R$ 0,00";

  const numberValue = typeof value === "string" ? parseFloat(value): value;

  if (isNaN(numberValue)) return "R$ 0,00";
  
  return numberValue.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
};

//Formatação de número de telefone/celular.
export function formatPhoneNumber(value: string): string {
  //Remove tudo que não for dígito
  value = value.replace(/\D/g, "");

  //Formata o DDD
  if (value.length > 2) {
    value = "(" + value.substring(0, 2) + ") " + value.substring(2);
  }

  // Formata o restante com 9 dígitos.
  if (value.length > 9) {
    value = value.replace(/(\(\d{2}\) )(\d{4})(\d{4})/, "$1$2-$3");
  } else if (value.length > 8) {
     value = value.replace(/(\(\d{2}\) )(\d{4})(\d{4})/, "$1$2-$3");
  }
    return value;
};

//Formatação de CNPJ.
export function formatCnpj(value: string): string {
  //Remove tudo que não for número
  const digits = value.replace(/\D/g, "").slice(0, 14); //Máximo 14 dígitos

  //Aplica máscara, ex: 00.000.000/0000-00
  return digits 
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
};