import db from "../config/db"
import { salesItemModel, salesModel } from "./sales-model"

export const searchAllSales = async (
  filters: { id?: number, cliente_nome?: string, status?: string, data_emissao_inicio: string, data_emissao_final: string }
): Promise<salesModel[]> => {
  let query = `
    SELECT v.*, c.nome_fantasia AS cliente_nome
    FROM vendas v
    JOIN clientes c ON v.cliente_id = c.id`

  const conditions: string[] = [];
  const values: any[] = [];

  if (filters.id) {
    values.push(`${filters.id}%`);
    conditions.push(`CAST(v.id AS TEXT) ILIKE $${values.length}`);
  }

  if (filters.cliente_nome) {
    values.push(`%${filters.cliente_nome}%`);
    conditions.push(`c.nome_fantasia ILIKE $${values.length}`);
  }

  if (filters.status) {
    values.push(`${filters.status}`);
    conditions.push(`v.status = $${values.length}`);
  }

  if (filters.data_emissao_inicio && filters.data_emissao_final) {
    values.push(filters.data_emissao_inicio);
    conditions.push(`v.data_emissao >= $${values.length}`);

    values.push(filters.data_emissao_final);
    conditions.push(`v.data_emissao <= $${values.length}`);
  }

  if (conditions.length > 0) {
    query += ` WHERE ` + conditions.join (" AND ");
  }

  query += ` ORDER BY id DESC`;

  const result = await db.query(query, values);
  return result.rows;
};

// -------------------------------------------------------------------------------------------------------------------------------------------------

export const searchSaleById = async (id: number): Promise<salesModel | null> => {
  const result = await db.query(
    `SELECT v.*, c.nome_fantasia AS cliente_nome
     FROM vendas v
     JOIN clientes c ON v.cliente_id = c.id
     WHERE v.id = $1`,
  [id]);

  return result.rows[0];
};

// -------------------------------------------------------------------------------------------------------------------------------------------

interface newSaleInput extends Omit<salesModel, 'id' | 'data_cadastro' | 'data_atualizacao' | 'itens' | 'valor_bruto' | 'valor_total'> {
  itens: Omit<salesItemModel, 'id' | 'valor_subtotal'>[];
}

export const insertSale = async (data: newSaleInput): Promise<salesModel> => {
  const client = await db.connect();

  //Inicío da transição
  try {
    await client.query('BEGIN');

    //Insert na tabela "vendas".
    const insertSaleQuery = `
      INSERT INTO vendas (
      cliente_id,
      data_emissao,
      tipo_pagamento,
      desconto_comercial,
      desconto_financeiro,
      status,
      data_cadastro,
      data_atualizacao
      ) VALUES (
       $1,
       $2,
       $3,
       $4,
       $5,
       $6,
       NOW (),
       NOW () )
       RETURNING id`;

    //Guarda os valores no array
    const saleValues = [
      data.cliente_id,
      data.data_emissao,
      data.tipo_pagamento,
      data.desconto_comercial,
      data.desconto_financeiro,
      data.status
    ];

    const result = await client.query( insertSaleQuery, saleValues );
    const saleId = result.rows[0].id;

    //Insert na tabela "itens_venda"
    const insertSaleItemQuery = `
    INSERT INTO itens_venda (
    venda_id,
    produto_id,
    quantidade,
    preco_unitario,
    desconto_volume
    ) VALUES ($1, $2, $3, $4, $5)`;

      for (const item of data.itens) {
      await client.query(insertSaleItemQuery, [
        saleId,
        item.produto_id,
        item.quantidade,
        item.preco_unitario,
        item.desconto_volume
      ]);
    }

    //Se a transição ocorreu sem erros, executa COMMIT.
    await client.query('COMMIT');

    // SELECT para consulta, depois retorna todos os dados da venda inserida no JSON de resposta.
    const insertedSaleResponse = `
      SELECT
        v.id AS venda_id,
        v.cliente_id,
        v.data_emissao,
        v.tipo_pagamento,
        v.desconto_comercial,
        v.desconto_financeiro,
        v.valor_bruto,
        v.valor_total,
        v.status,
        v.data_cadastro,
        v.data_atualizacao,

        iv.id AS id_item,
        iv.produto_id,
        iv.quantidade,
        iv.preco_unitario,
        iv.desconto_volume,
        iv.valor_subtotal
      FROM vendas v
      INNER JOIN itens_venda iv ON v.id = iv.venda_id
      WHERE v.id = $1
    `;

    const selectResult = await client.query(insertedSaleResponse, [saleId]);
    return selectResult.rows;
  
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

// ========================================================================================
// Atualiza a venda completa (itens + cabeçalho) usando transação(begin/commit/rollback).
// ========================================================================================
export const updateSaleById = async (
  id: number,
  fieldsToUpdate: Partial<salesModel>
) => {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const { itens, ...saleFields } = fieldsToUpdate;

    // Atualiza itens
    if (itens && Array.isArray(itens)) {
      await updateSaleItems(client, id, itens);
    }

    // Atualiza cabeçalho da venda
    const keys = Object.keys(saleFields);
    const values = Object.values(saleFields);

    if (keys.length > 0) {
      const setClause = keys.map((key, index) => `${key} = $${index + 1}`).join(", ");
      const query = `UPDATE vendas SET ${setClause} WHERE id = $${keys.length + 1}`;
      await client.query(query, [...values, id]);
    }

    await client.query("COMMIT");

    return getSaleByIdQuery(id);

  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
    
  } finally {
    client.release();
  }
};

// ====================================================================================
// Atualiza itens da venda. ===========================================================
// ====================================================================================
async function updateSaleItems(client: any, saleId: number, items: salesItemModel[]) {
  const currentItems = await client.query(
    `SELECT id FROM itens_venda WHERE venda_id = $1`,
    [saleId]
  );

  const currentItemIds = currentItems.rows.map((row: { id: number }) => row.id);

  const itemsToUpdate = items.filter((item) => item.id);
  const itemsToCreate = items.filter((item) => !item.id);
  const itemsToDelete = currentItemIds.filter(
    (id: number) => !items.some((item) => item.id === id)
  );

  if (itemsToDelete.length > 0) {
    await client.query(
      `DELETE FROM itens_venda WHERE id = ANY($1) AND venda_id = $2`,
      [itemsToDelete, saleId]
    );
  }

  if (itemsToUpdate.length > 0) {
    await Promise.all(
      itemsToUpdate.map((item) =>
        client.query(
          `UPDATE itens_venda
           SET produto_id = $1,
               quantidade = $2,
               preco_unitario = $3,
               desconto_volume = $4
           WHERE id = $5 AND venda_id = $6`,
          [
            item.produto_id,
            item.quantidade,
            item.preco_unitario,
            item.desconto_volume || 0,
            item.id,
            saleId,
          ]
        )
      )
    );
  }

  if (itemsToCreate.length > 0) {
    await Promise.all(
      itemsToCreate.map((item) =>
        client.query(
          `INSERT INTO itens_venda (
            venda_id, produto_id, quantidade, preco_unitario, desconto_volume
           ) VALUES ($1, $2, $3, $4, $5)`,
          [
            saleId,
            item.produto_id,
            item.quantidade,
            item.preco_unitario,
            item.desconto_volume || 0,
          ]
        )
      )
    );
  }
};

// -------------------------------------------------------------------------------------------------------------------------------------------

// Buscar venda com itens
export async function getSaleByIdQuery(id: number) {
  const saleResult = await db.query(
    `SELECT * FROM vendas WHERE id = $1`,
    [id]
  );

  if (saleResult.rows.length === 0) return null;

  const itemsResult = await db.query(
    `SELECT vi.*, p.codigo as produto_codigo, p.nome as produto_nome
     FROM itens_venda vi
     LEFT JOIN produtos p ON vi.produto_id = p.id
     WHERE vi.venda_id = $1`,
     [id]
  );

  return {
    ...saleResult.rows[0],
    itens: itemsResult.rows,
  };
};

// -------------------------------------------------------------------------------------------------------------------------------------------

export const deleteSaleById = async (id: number): Promise<boolean> => {
  const client = await db.connect()
  
  //Início da transição, precisa apagar na tabela vendas e itens_venda, evita delete parcial.
  try {
    await client.query('BEGIN');

    //DELETE primeiro na itens_venda por chave estrangeira (FK).
    await client.query(`DELETE FROM itens_venda WHERE venda_id = $1`, [id]);

    //DELETE na tabela vendas.
    const result = await client.query(`DELETE FROM vendas WHERE id = $1`, [id]);

    await client.query('COMMIT');
    return result.rowCount > 0;

  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    return false;
    
  } finally {
    client.release();
  }
};

//Validação se o cliente existe no banco de dados, mover para um arquivo separado depois (Validations etc).
export const verifyClientId = async (id_cliente: number): Promise<salesModel | null> => {
  const result = await db.query(
    `SELECT * FROM clientes WHERE id = $1 limit 1`,
    [id_cliente]
  );

  return result.rows[0] || null;
};

export const verifySaleId = async (id: number): Promise<salesModel | null> => {
  const result = await db.query(
    `SELECT * FROM vendas WHERE id = $1 limit 1`,
    [id]
  );

  return result.rows[0] || null;
};

// Busca o saldo do produto para validar estoque negativo.
export const getProductBalance = async (produtoId: number): Promise<number> => {
  const result = await db.query(
    `SELECT quantidade FROM estoque_saldo WHERE produto_id = $1`,
    [produtoId]
  );
  return result.rows[0]?.quantidade ?? 0;
};

//Busca informações do produto para montar a resposta de estoque negativo.
export const getProductInfo = async (produtoId: number): Promise<{ nome: string; codigo: string }> => {
  const result = await db.query(
    `SELECT nome, codigo FROM produtos WHERE id = $1`,
    [produtoId]
  );
  return result.rows[0];
};