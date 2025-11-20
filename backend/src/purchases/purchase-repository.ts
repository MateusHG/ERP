import db from "../config/db";
import { purchaseModel, purchaseItemModel, NewPurchaseInput } from "../purchases/purchase-model";

export const searchAllPurchases = async (
  filters: { id?: number, fornecedor_nome?: string, status?: string,  data_emissao_inicio: string, data_emissao_final: string}
): Promise<purchaseModel[]> => {
  let query = `
    SELECT c.*, f.nome_fantasia AS fornecedor_nome
    FROM compras c
    JOIN fornecedores f ON c.fornecedor_id = f.id`;
  
    const conditions: string[] = [];
    const values: any[] = [];

  if (filters.id) {
    values.push(`${filters.id}%`);
    conditions.push(`CAST(c.id AS TEXT) ILIKE $${values.length}`);
  }

  if (filters.fornecedor_nome) {
    values.push(`%${filters.fornecedor_nome}%`);
    conditions.push(`f.nome_fantasia ILIKE $${values.length}`);
  }

  if (filters.status) {
    values.push(`${filters.status}`);
    conditions.push(`c.status = $${values.length}`);
  }

  if (filters.data_emissao_inicio && filters.data_emissao_final) {
    values.push(filters.data_emissao_inicio);
    conditions.push(`c.data_emissao >= $${values.length}`);

    values.push(filters.data_emissao_final);
    conditions.push(`c.data_emissao <= $${values.length}`);
  }

  if (conditions.length > 0) {
    query += ` WHERE ` + conditions.join (" AND ");
  }

  query += ` ORDER BY id DESC`;

  const result = await db.query(query, values);
    return result.rows;
}; 

export const searchPurchaseById = async (id: number): Promise<purchaseModel | null> => {
  const result = await db.query(
     `SELECT c.*, f.nome_fantasia AS fornecedor_nome
      FROM compras c
      JOIN fornecedores f ON c.fornecedor_id = f.id
      WHERE c.id = $1`,
    [id]
  );

  return result.rows[0];
};

export const insertPurchase = async (client: any, data: NewPurchaseInput, userId: number): Promise<purchaseModel> => {

    //Insert para tabela "compras"
    const insertPurchaseQuery = `
      INSERT INTO compras (
        fornecedor_id,
        data_emissao,
        tipo_pagamento,
        desconto_comercial,
        desconto_financeiro,
        status,
        created_by,
        updated_by,
        data_cadastro,
        data_atualizacao
      ) VALUES ( $1, $2, $3, $4, $5, $6, $7, $7, NOW(), NOW())
       RETURNING id`;

    //Guarda os valores no array   
    const purchaseValues = [
        data.fornecedor_id,
        data.data_emissao,
        data.tipo_pagamento,
        data.desconto_comercial,
        data.desconto_financeiro,
        data.status,
        userId
    ];
  
    const result = await client.query( insertPurchaseQuery, purchaseValues );
    
    const purchaseId = result.rows[0].id;

    await insertNewPurchaseItems(client, purchaseId, data.itens, userId);

    return await getPurchaseByIdQuery(client, purchaseId);
  }

  export const insertNewPurchaseItems = async (client: any, purchaseId: number, items: NewPurchaseInput["itens"], userId: number) => {

    const insertPurchaseItemQuery = `
      INSERT INTO itens_compra (
      compra_id,
      produto_id,
      quantidade,
      preco_unitario,
      desconto_volume,
      created_by,
      updated_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)`;

    for (const item of items) {
    await client.query(insertPurchaseItemQuery, [
      purchaseId,
      item.produto_id,
      item.quantidade,
      item.preco_unitario,
      item.desconto_volume,
      userId,
      userId
    ]);
  }
};

//Verificar se existe um fornecedor com o ID informado antes de criar a compra.
export const verifySupplierId = async (fornecedor_id: number): Promise<purchaseModel | null> => {
  const result = await db.query(
    `SELECT * FROM fornecedores WHERE id = $1 limit 1`,
    [fornecedor_id]
  );

  return result.rows[0] || null;
};

export const verifyPurchaseId = async (id: number): Promise<purchaseModel | null> => {
  const result = await db.query(
    `SELECT * FROM compras WHERE id = $1 limit 1`,
    [id]
  );

  return result.rows[0] || null;
};



// Atualizar compra + itens
export const updatePurchaseById = async (id: number, fieldsToUpdate: Partial<purchaseModel>, client: any, userId: number
) => {
    const { itens, ...purchaseFields } = fieldsToUpdate;

    // Atualiza itens
    if (itens && Array.isArray(itens)) {
      await updatePurchaseItems(client, id, itens, userId);
    }

    const keys = Object.keys(purchaseFields);
    const values = Object.values(purchaseFields);

    if (keys.length > 0) {
      const setClause = keys.map((key, index) => `${key} = $${index + 1}`).join(", ");
      const query = `UPDATE compras SET ${setClause} WHERE id = $${keys.length + 1}`;
      await client.query(query, [...values, id]);
    }

    return getPurchaseByIdQuery(client, id);
};

// Atualizar itens
async function updatePurchaseItems(client: any, purchaseId: number, items: purchaseItemModel[], userId: number) {
  const currentItems = await client.query(
    `SELECT id FROM itens_compra WHERE compra_id = $1`,
    [purchaseId]
  );

  const currentItemIds = currentItems.rows.map((row: {id: number}) => row.id);

  const itemsToUpdate = items.filter((item) => item.id);
  const itemsToCreate = items.filter((item) => !item.id);
  const itemsToDelete = currentItemIds.filter(
    (id: number) => !items.some((item) => item.id === id)
  );

  // Deletar
  if (itemsToDelete.length > 0) {
    await client.query(
      `DELETE FROM itens_compra WHERE id = ANY($1) AND compra_id = $2`,
      [itemsToDelete, purchaseId]
    );
  }

  // Atualizar
  if (itemsToUpdate.length > 0) {
    await Promise.all(
      itemsToUpdate.map((item) =>
        client.query(
          `UPDATE itens_compra
           SET produto_id = $1, quantidade = $2, preco_unitario = $3, desconto_volume = $4, updated_by = $7
           WHERE id = $5 AND compra_id = $6`,
          [
            item.produto_id,
            item.quantidade,
            item.preco_unitario,
            item.desconto_volume || 0,
            item.id,
            purchaseId,
            userId
          ]
        )
      )
    );
  }

  // Criar
  if (itemsToCreate.length > 0) {
    await Promise.all(
      itemsToCreate.map((item) =>
        client.query(
          `INSERT INTO itens_compra (
            compra_id, produto_id, quantidade, preco_unitario, desconto_volume, created_by, updated_by
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            purchaseId,
            item.produto_id,
            item.quantidade,
            item.preco_unitario,
            item.desconto_volume || 0,
            userId,
            userId
          ]
        )
      )
    );
  }
};

// Buscar compra com itens
export async function getPurchaseByIdQuery(client: any, id: number) {
  const purchaseResult = await client.query(
    `SELECT * FROM compras WHERE id = $1`,
    [id]
  );

  if (purchaseResult.rows.length === 0) return null;

  const itemsResult = await client.query(
    `SELECT ci.*, p.codigo as produto_codigo, p.nome as produto_nome
     FROM itens_compra ci
     LEFT JOIN produtos p ON ci.produto_id = p.id
     WHERE ci.compra_id = $1`,
    [id]
  );

  return {
    ...purchaseResult.rows[0],
    itens: itemsResult.rows,
  };
};

export const deletePurchaseById = async (id: number): Promise<boolean> => {
  const client = await db.connect()
  try {
    await client.query(`BEGIN`);

    //Delete primeiro na itens_compra por chave estrangeira (FK)
    await client.query(`DELETE FROM itens_compra where compra_id = $1`, [id]);

    //Delete na tabela compras
    const result = await client.query(`DELETE FROM compras where id = $1`, [id]);

    await client.query(`COMMIT`);
    return result.rowCount > 0;

  } catch (error) {
    await client.query(`ROLLBACK`);
    console.error(error);
    return false;
  
  } finally {
    client.release();
  }
};
