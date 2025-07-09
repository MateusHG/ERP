import db  from "../config/db";

export const getGeneralDashboard = async (data_inicial: string, data_final: string) => {
  const query = `
   SELECT
      (SELECT COUNT(*) FROM vendas WHERE data_emissao BETWEEN $1 AND $2) AS total_vendas,
      (SELECT COUNT(*) FROM compras WHERE data_emissao BETWEEN $1 AND $2) AS total_compras,
      (SELECT COUNT(*) FROM produtos WHERE estoque < estoque_minimo) AS produtos_estoque_baixo,
      (SELECT COUNT(*) FROM fornecedores WHERE status = 'Ativo') AS fornecedores_ativos,
      (SELECT COUNT(*) FROM clientes WHERE status = 'Ativo') AS clientes_ativos;
  `;

    const values = [data_inicial, data_final];
    const result = await db.query(query, values);
    return result.rows[0]; // retorna um objeto com todos os counts.
};