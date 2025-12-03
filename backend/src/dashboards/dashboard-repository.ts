import db  from "../config/db";

export const getGeneralDashboard = async (data_inicial: string, data_final: string) => {
  const query = `
   SELECT
      (SELECT COUNT(*) FROM vendas WHERE data_emissao BETWEEN $1 AND $2 AND status = 'finalizado') AS total_vendas_finalizadas,
      (SELECT SUM(valor_total) FROM vendas WHERE data_emissao BETWEEN $1 AND $2 AND status = 'finalizado') AS total_vendas_finalizadas_valores,
      (SELECT COUNT(*) FROM vendas WHERE data_emissao BETWEEN $1 AND $2 AND status <> 'finalizado') AS total_vendas_pendentes,
      (SELECT COUNT(*) FROM vendas WHERE data_emissao BETWEEN $1 AND $2 AND status = 'aguardando') AS total_vendas_aguardando_aprovacao,

      (SELECT COUNT(*) FROM compras WHERE data_emissao BETWEEN $1 AND $2 AND status = 'finalizado') AS total_compras_finalizadas,
      (SELECT SUM(valor_total) FROM compras WHERE data_emissao BETWEEN $1 and $2 AND status = 'finalizado') AS total_compras_valores,
      (SELECT COUNT(*) FROM compras WHERE data_emissao BETWEEN $1 AND $2 AND status <> 'finalizado') AS total_compras_pendentes,
      (SELECT COUNT(*) FROM compras WHERE data_emissao BETWEEN $1 AND $2 AND status = 'aguardando') AS total_compras_aguardando_aprovacao,

      (SELECT COUNT(*) AS produtos_estoque_baixo FROM produtos p INNER JOIN estoque_saldo es ON p.id = es.produto_id WHERE es.quantidade < p.estoque_minimo),
      (SELECT COUNT(*) AS produtos_estoque_medio FROM produtos p INNER JOIN estoque_saldo es ON p.id = es.produto_id WHERE es.quantidade BETWEEN p.estoque_minimo AND p.estoque_maximo),
      (SELECT COUNT(*) AS produtos_estoque_alto FROM produtos p INNER JOIN estoque_saldo es ON p.id = es.produto_id WHERE es.quantidade > p.estoque_maximo),

      (SELECT COUNT(*) FROM fornecedores WHERE status = 'ativo') AS fornecedores_ativos,
      (SELECT COUNT(*) FROM fornecedores WHERE status = 'inativo') AS fornecedores_inativos,
      (SELECT COUNT(*) AS fornecedores_novos_mes FROM fornecedores WHERE data_cadastro >= DATE_TRUNC('month', CURRENT_DATE) AND data_cadastro < DATE_TRUNC('month', CURRENT_DATE + INTERVAL '1 month')
      AND status = 'ativo'),

      (SELECT COUNT(*) FROM clientes WHERE status = 'ativo') AS clientes_ativos,
      (SELECT COUNT(*) FROM clientes WHERE status = 'inativo') AS clientes_inativos,
      (SELECT COUNT(*) AS clientes_novos_mes FROM clientes WHERE data_cadastro >= DATE_TRUNC('month', CURRENT_DATE) AND data_cadastro < DATE_TRUNC('month', CURRENT_DATE + INTERVAL '1 month')
      AND status = 'ativo')
  `;

    const values = [data_inicial, data_final];
    const result = await db.query(query, values);
    return result.rows[0]; // retorna um objeto com todos os counts.
};