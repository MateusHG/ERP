import { inventoryListModel, InventoryMovementModel, InventoryMovementResult } from "./inventory-model";
import db  from "../config/db";

export const listInventoryItems = async(filters: { 
  id?: number, 
  codigo?: string, 
  nome?: string, 
  categoria?: string, 
  status?: string, 
  saldo?: string
}): Promise<inventoryListModel[]> => { 
  
  // Base da query
  let query = `
     SELECT p.id,
	   p.codigo,
	   p.nome AS produto_nome,
	   p.categoria,
	   p.estoque_minimo,
	   p.estoque_maximo,
	   COALESCE(es.quantidade, 0) AS estoque_atual,


     -- Cálculo de preço médio de compra ponderado.

     COALESCE(
      SUM(
        CASE
          WHEN m.tipo = 'entrada'
          AND m.origem = 'compra'
          AND m.preco_unitario_liquido IS NOT NULL
          AND m.preco_unitario_liquido > 0
        THEN m.quantidade * m.preco_unitario_liquido
        ELSE 0 
     END
     )
      / NULLIF(
      SUM(CASE
        WHEN m.tipo = 'entrada'
        AND m.origem = 'compra'
        AND m.preco_unitario_liquido IS NOT NULL
        AND m.preco_unitario_liquido > 0
      THEN m.quantidade
      ELSE 0
     END), 0), 0) AS preco_medio_compra,


     -- Preço médio de venda ponderado.

    COALESCE(
      SUM(
        CASE
          WHEN m.tipo = 'saida'
          AND m.origem = 'venda'
          AND m.preco_unitario_liquido IS NOT NULL
          AND m.preco_unitario_liquido > 0
        THEN m.quantidade * m.preco_unitario_liquido
      ELSE 0
      END
      ) 
      / NULLIF(
      SUM(CASE
        WHEN m.tipo = 'saida'
        AND m.origem = 'venda'
        AND m.preco_unitario_liquido IS NOT NULL
        AND m.preco_unitario_liquido > 0
      THEN m.quantidade
      ELSE 0
    END),
  0),
0) AS preco_medio_venda

FROM produtos p
LEFT JOIN estoque_saldo es ON p.id = es.produto_id
LEFT JOIN movimentacoes_estoque m ON p.id = m.produto_id
`;

// Array para condições e valores (fitros).
const conditions: string[] = [];
const values: any[] = [];
let index = 1;

if (filters.id) {
  conditions.push(`CAST(p.id AS TEXT) ILIKE $${index++}`);
  values.push(`${filters.id}%`);
}

if (filters.codigo) {
  conditions.push(`p.codigo ILIKE $${index++}`);
  values.push(`%${filters.codigo}%`);
}

if (filters.nome) {
  conditions.push(`p.nome ILIKE $${index++}`);
  values.push(`%${filters.nome}%`);
}

if (filters.categoria) {
  conditions.push(`p.categoria ILIKE $${index++}`);
  values.push(`%${filters.categoria}%`);
}

if (filters.status) {
  conditions.push(`p.status = $${index++}`);
  values.push(filters.status);
}

if (filters.saldo) {
  // Status de saldo, colunas: estoque_minimo, estoque_maximo, quantidade.
  if (filters.saldo === "baixo") {
    conditions.push(`COALESCE(es.quantidade, 0) < p.estoque_minimo`);
  
  } else if (filters.saldo === "medio") {
    conditions.push(`COALESCE(es.quantidade, 0) BETWEEN p.estoque_minimo AND p.estoque_maximo`);
  
  } else if (filters.saldo === "alto") {
    conditions.push(`COALESCE(es.quantidade, 0) > p.estoque_maximo`);
  }
}

if (conditions.length > 0) {
  query += ` WHERE ` + conditions.join(" AND ");
}

query += `
    GROUP BY 
      p.id, p.codigo, p.nome, p.categoria, 
      p.estoque_minimo, p.estoque_maximo, es.quantidade
    ORDER BY p.id;
  `;

  const result = await db.query(query, values);
  return result.rows;
};

// ***************************************************************************************** //
// ***************************************************************************************** //

// Consulta saldo dos produtos
export async function getBalance(produto_id: number) {
  const result = await db.query(
    `SELECT * FROM estoque_saldo WHERE produto_id = $1`,
    [produto_id]
  );
  return result.rows[0] || 0;
};

// ***************************************************************************************** //
// ***************************************************************************************** //

// Lista movimentações do produto(histórico).
export async function listMovements(produto_id: number) {
  const result = await db.query(
    `
    SELECT 
      m.id,
      m.produto_id,

      -- quantidade com sinal (entrada +, saída -)
      CASE 
        WHEN LOWER(m.tipo::text) IN ('saida') THEN -m.quantidade
        ELSE m.quantidade
      END AS qtd_movimentada,

      m.tipo,
      m.origem,
      m.referencia_id,
      m.preco_unitario_liquido,
      m.valor_total_liquido,
      m.usuario_id,
      u.username AS usuario,
      m.created_at AS data_hora,


      -- saldo antes da movimentação

      COALESCE(
        SUM(
          CASE
            WHEN LOWER(m.tipo::text) IN ('saida') THEN -m.quantidade ELSE m.quantidade END
        ) OVER (
        PARTITION BY m.produto_id
        ORDER BY m.created_at
        ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING
      ), 0
    ) AS saldo_anterior,

    -- saldo depois da movimentação

      COALESCE(
        SUM(
          CASE
            WHEN LOWER(m.tipo::text) IN ('saida') THEN -m.quantidade ELSE m.quantidade END
        ) OVER (
          PARTITION BY m.produto_id
          ORDER BY m.created_at, m.id
          ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
        ), 0
      ) AS saldo_posterior
    
    FROM movimentacoes_estoque m
    INNER JOIN users u ON u.id = m.usuario_id
    WHERE m.produto_id = $1
    ORDER BY m.created_at DESC
    `,
    [produto_id]
  );
  return result.rows;
};

// ***************************************************************************************** //
// ***************************************************************************************** //

// Registra a movimentação de AJUSTE no estoque .
//------------------------------------
export async function registerMovement(mov: InventoryMovementModel) {
  const client = await db.connect();
  try {
    await client.query("BEGIN");

    const quantidade = Math.floor(Number(mov.quantidade));

    // Bloqueia o registro para evitar concorrência
    const saldoRes = await client.query(
      `SELECT quantidade FROM estoque_saldo WHERE produto_id = $1 FOR UPDATE`,
      [mov.produto_id]
    );

    const saldoAtual = saldoRes.rows[0]?.quantidade || 0;
    const fator = mov.tipo === "saida" ? -1 : 1;
    const novoSaldo = saldoAtual + quantidade * fator;

    if (novoSaldo < 0) {
      throw new Error(`Saldo insuficiente para registrar a saída. Saldo atual: ${saldoAtual}, Quantidade movimentada: ${quantidade}`);
    }


    // Insert no log de movimentações
    const result = await client.query(
      `INSERT INTO movimentacoes_estoque
       (produto_id, tipo, quantidade, origem, referencia_id, usuario_id, preco_unitario_liquido)
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
      [
        mov.produto_id,
        mov.tipo,
        quantidade,
        mov.origem,
        mov.referencia_id,
        mov.usuario_id,
        mov.preco_unitario_liquido ?? null,
      ]
    );

    // Atualizar saldo na tabela estoque_saldo
    await client.query(
      `INSERT INTO estoque_saldo (produto_id, quantidade)
       VALUES ($1, $2)
       ON CONFLICT (produto_id)
       DO UPDATE SET quantidade = $2`,
      [mov.produto_id, novoSaldo] 
    );

    await client.query("COMMIT");
    return result.rows[0];

  } catch (error: any) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};


// *********************************************************************** //
// *********************************************************************** //

// Movimentações de COMPRA.
export async function registerPurchaseMovement(mov: InventoryMovementModel, client: any): Promise<InventoryMovementResult> {

  try {

    const quantidade = Math.floor(Number(mov.quantidade));

    const produtoRes = await client.query(
      `SELECT
      es.quantidade AS estoque_atual,
      p.nome AS produto,
      p.codigo
      FROM estoque_saldo es
      JOIN produtos p ON p.id = es.produto_id
      WHERE es.produto_id = $1
      FOR UPDATE`,
      [mov.produto_id]
    );

    const estoque_atual = produtoRes.rows[0]?.estoque_atual || 0;
    const produto_nome = produtoRes.rows[0]?.produto || null;
    const codigo = produtoRes.rows[0]?.codigo || null;
    
    const fator = mov.tipo === "entrada" ? 1: -1;
    const estoque_ficaria = estoque_atual + quantidade * fator;

    if (estoque_ficaria < 0) {
      return {
        estoque_insuficiente: true,
        produto_id: mov.produto_id,
        produto: produto_nome,
        codigo,
        estoque_atual,
        tentativa_saida: quantidade,
        estoque_ficaria
      };
    }

    const usuarioId = Number(mov.usuario_id);
    const referenciaId = Number(mov.referencia_id);

    await client.query(
      `INSERT INTO movimentacoes_estoque
      (produto_id, tipo, quantidade, origem, referencia_id, usuario_id, preco_unitario_liquido)
      VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        mov.produto_id,
        mov.tipo,
        quantidade,
        mov.origem,
        !isNaN(referenciaId) ? referenciaId : null,
        !isNaN(usuarioId) ? usuarioId : null,
        mov.preco_unitario_liquido ?? null]
    );

    await client.query(
      `INSERT INTO estoque_saldo (produto_id, quantidade)
      VALUES ($1, $2)
      ON CONFLICT (produto_id)
      DO UPDATE SET quantidade = $2`,
      [mov.produto_id, estoque_ficaria]
    );

    return { estoque_insuficiente : false};
  } catch (error: any) {
    console.error(error)
    throw error;
  }
};

// *********************************************************************** //
// *********************************************************************** //

// Movimentações de VENDA.
export async function registerSaleMovement(mov: InventoryMovementModel, client: any  
): Promise<InventoryMovementResult> {

  try {

    const quantidade = Math.floor(Number(mov.quantidade));

    // Buscar saldo + nome + código
    const produtoRes = await client.query(
      `SELECT
      es.quantidade AS estoque_atual,
      p.nome AS produto,
      p.codigo
      FROM estoque_saldo es
      JOIN produtos p ON p.id = es.produto_id
      WHERE es.produto_id = $1
      FOR UPDATE`,
      [mov.produto_id]
    );

    const estoque_atual = produtoRes.rows[0]?.estoque_atual || 0;
    const produto_nome = produtoRes.rows[0]?.produto || null;
    const codigo = produtoRes.rows[0]?.codigo || null;

    const fator = mov.tipo === "saida" ? -1 : 1;
    const estoque_ficaria = estoque_atual + quantidade * fator;

    // ==== Se algum dos itens forem ficar negativos, executa ROLLBACK e retorna um objeto JSON para enviar ao front-end. =======
    if (estoque_ficaria < 0) {
      return {
        estoque_insuficiente: true,
        produto_id: mov.produto_id,
        produto: produto_nome,
        codigo,
        estoque_atual,
        tentativa_saida: quantidade,
        estoque_ficaria
      };
    }

    const usuarioId = Number(mov.usuario_id);
    const referenciaId = Number(mov.referencia_id);

    // Se o estoque não for ficar negativo, segue com a movimentação.
    await client.query(
      `INSERT INTO movimentacoes_estoque
      (produto_id, tipo, quantidade, origem, referencia_id, usuario_id, preco_unitario_liquido)
      VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        mov.produto_id,
        mov.tipo,
        quantidade,
        mov.origem,
        !isNaN(referenciaId) ? referenciaId : null,
        !isNaN(usuarioId) ? usuarioId : null,
        mov.preco_unitario_liquido ?? null
      ]
    );

    await client.query(
      `INSERT INTO estoque_saldo (produto_id, quantidade)
      VALUES ($1, $2)
      ON CONFLICT (produto_id)
      DO UPDATE SET quantidade = $2`,
      [mov.produto_id, estoque_ficaria]
    );

    return { estoque_insuficiente : false };
  } catch (error: any) {
    console.error(error)
    throw error;
  }
};