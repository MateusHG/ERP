import db from "../config/db"
import { NewSaleInput, salesItemModel, salesModel } from "./sales-model"

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

export const insertSale = async (client: any, data: NewSaleInput, userId: number): Promise<salesModel> => {

    //Insert na tabela "vendas".
    const insertSaleQuery = `
      INSERT INTO vendas (
      cliente_id,
      data_emissao,
      tipo_pagamento,
      desconto_comercial,
      desconto_financeiro,
      desconto_volume,
      valor_bruto,
      status,
      created_by,
      updated_by,
      data_cadastro,
      data_atualizacao
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $9, NOW (), NOW ())
       RETURNING id`;

    //Guarda os valores no array
    const saleValues = [
      data.cliente_id,
      data.data_emissao,
      data.tipo_pagamento,
      data.desconto_comercial,
      data.desconto_financeiro,
      data.desconto_volume,
      data.valor_bruto,
      data.status,
      userId
    ];

    const result = await client.query( insertSaleQuery, saleValues );

    const saleId = result.rows[0].id;

    await insertNewSaleItems(client, saleId, data.itens, userId);  

    return await getSaleByIdQuery(client, saleId);
  };

export const insertNewSaleItems = async (client: any, saleId: number, items: NewSaleInput["itens"], userId: number) => {
  //Insert na tabela "itens_venda"
    const insertSaleItemQuery = `
    INSERT INTO vendas_itens (
    venda_id,
    produto_id,
    quantidade,
    preco_unitario,
    desconto_unitario,
    created_by,
    updated_by
    ) VALUES ($1, $2, $3, $4, $5, $6, $7)`;

      for (const item of items) {
      await client.query(insertSaleItemQuery, [
        saleId,
        item.produto_id,
        item.quantidade,
        item.preco_unitario ?? 0,
        item.desconto_unitario ?? 0,
        userId, // created_by
        userId  // updated_by
      ]);
    }
};

// =============================================
// Atualiza a venda completa (itens + cabeçalho)
// ==============================================
export const updateSaleById = async (id: number,fieldsToUpdate: Partial<salesModel>,client: any,userId: number
) => {
    const { itens, ...saleFields } = fieldsToUpdate;

    // Atualiza itens
    if (itens && Array.isArray(itens)) {
      await updateSaleItems(client, id, itens, userId);

      // Recalcula totais baseados nos itens atuais
    const result = await client.query(
      `SELECT
        COALESCE(SUM(valor_bruto), 0) AS total_bruto,
        COALESCE(SUM(valor_desconto), 0) AS total_desc_volume
      FROM vendas_itens
      WHERE venda_id = $1`,
      [id]
    );

    saleFields.valor_bruto = Number(result.rows[0].total_bruto);
    saleFields.desconto_volume = Number(result.rows[0].total_desc_volume);
  }

    // Atualiza cabeçalho da venda
    const keys = Object.keys(saleFields);
    const values = Object.values(saleFields);

    if (keys.length > 0) {
      const setClause = keys.map((key, index) => `${key} = $${index + 1}`).join(", ");
      const query = `UPDATE vendas SET ${setClause} WHERE id = $${keys.length + 1}`;
      await client.query(query, [...values, id]);
    }

    return getSaleByIdQuery(client, id);
};

// ====================================================================================
// Atualiza itens da venda. ===========================================================
// ====================================================================================
async function updateSaleItems(client: any, saleId: number, items: salesItemModel[], userId: number) {
  const currentItems = await client.query(
    `SELECT id FROM vendas_itens WHERE venda_id = $1`,
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
      `DELETE FROM vendas_itens WHERE id = ANY($1) AND venda_id = $2`,
      [itemsToDelete, saleId]
    );
  }

  if (itemsToUpdate.length > 0) {
    await Promise.all(
      itemsToUpdate.map((item) =>
        client.query(
          `UPDATE vendas_itens
           SET produto_id = $1,
               quantidade = $2,
               preco_unitario = $3,
               desconto_unitario = $4,
               updated_by = $5,
               data_atualizacao = NOW()
           WHERE id = $6 AND venda_id = $7`,
          [
            item.produto_id,
            item.quantidade,
            item.preco_unitario,
            item.desconto_unitario ?? 0,
            userId,
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
          `INSERT INTO vendas_itens (
            venda_id, produto_id, quantidade, preco_unitario, desconto_unitario, created_by, updated_by
           ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            saleId,
            item.produto_id,
            item.quantidade,
            item.preco_unitario,
            item.desconto_unitario || 0,
            userId,
            userId
          ]
        )
      )
    );
  }
};

// -------------------------------------------------------------------------------------------------------------------------------------------

// Buscar venda com itens
export async function getSaleByIdQuery(client: any, id: number) {
  const saleResult = await client.query(
    `SELECT * FROM vendas WHERE id = $1`,
    [id]
  );

  if (saleResult.rows.length === 0) return null;

  const itemsResult = await client.query(
    `SELECT vi.*, p.codigo as produto_codigo, p.nome as produto_nome
     FROM vendas_itens vi
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

export const getSaleStatusById = async (id: number) => {
  const result = await db.query(
    `SELECT status FROM vendas WHERE id = $1`, [id]
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