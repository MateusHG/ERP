import db  from "../config/db";

export const getGeneralDashboard = async (data_inicial: string, data_final: string) => {
  const query = `
   SELECT
      (SELECT COUNT(*) FROM vendas WHERE data_emissao BETWEEN $1 AND $2 AND status = 'finalizado') AS total_vendas_finalizadas,
      (SELECT SUM(valor_total) FROM vendas WHERE data_emissao BETWEEN $1 AND $2 AND status = 'finalizado') AS total_vendas_finalizadas_valores,
      (SELECT COUNT(*) FROM vendas WHERE data_emissao BETWEEN $1 AND $2 AND status <> 'finalizado') AS total_vendas_pendentes,
      (SELECT COUNT(*) FROM vendas WHERE data_emissao BETWEEN $1 AND $2 AND status = 'aguardando') AS total_vendas_aguardando_aprovacao,

      (SELECT COUNT(*) FROM compras WHERE data_emissao BETWEEN $1 AND $2 AND status = 'finalizado') AS total_compras_finalizadas,
      (SELECT SUM(valor_total) FROM compras WHERE data_emissao BETWEEN $1 and $2 AND status = 'finalizado') AS total_compras_finalizadas_valores,
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



export async function getTopCustomers(data_inicial: string, data_final: string) {
  const query = `
    SELECT
      c.id,
      c.nome_fantasia AS cliente,
      COUNT(v.id) AS quantidade_vendas,
      COALESCE(SUM(v.valor_total), 0::numeric) AS total_vendido
    FROM clientes c
    LEFT JOIN vendas v
    ON v.cliente_id = c.id
      AND v.status in ('finalizado', 'entregue')
      AND v.data_emissao BETWEEN $1 AND $2
    GROUP BY c.id, c.nome_fantasia
    ORDER BY total_vendido DESC
    LIMIT 5;
  `;

  const result = await db.query(query, [data_inicial, data_final]);
  return result.rows;
};

export async function getTopSuppliers(data_inicial:string , data_final: string) {
  const query = `
    SELECT 
      f.id,
      f.nome_fantasia AS fornecedor,
      COUNT(c.id) AS quantidade_compras,
      COALESCE(SUM(c.valor_total), 0::numeric) AS total_comprado
    FROM fornecedores f
    LEFT JOIN compras c
    ON c.fornecedor_id = f.id
      AND c.status IN ('recebido', 'finalizado')
      AND c.data_emissao BETWEEN $1 AND $2
    GROUP BY f.id, f.nome_fantasia
    ORDER BY total_comprado DESC
    LIMIT 5;
  `;

  const result = await db.query(query, [data_inicial, data_final]);
  return result.rows;
};