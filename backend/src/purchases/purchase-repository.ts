import db from "../config/db";
import { purchaseModel, purchaseItemModel } from "../purchases/purchase-model";
import { getPurchaseById } from "./purchase-controller";
import { getPurchaseByIdService } from "./purchase-service";

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

//Omite os valores que  não são necessários declarar no INSERT, os mesmos são gerados automaticamente pelo banco de dados.
interface newPurchaseInput extends Omit<purchaseModel, 'id' | 'data_cadastro' | 'data_atualizacao' | 'itens' | 'valor_bruto' | 'valor_total'> {
  itens: Omit<purchaseItemModel, 'id' | 'valor_subtotal'>[];
}

export const insertPurchase = async (data: newPurchaseInput): Promise<purchaseModel> => {
  const client = await db.connect();

  try {        //Roda o BEGIN pra caso ocorra algum erro, no final executa ROLLBACK, evita gravações parciais.
    await client.query('BEGIN');

    //Insert para tabela "compras"
    const insertPurchaseQuery = `
      INSERT INTO compras (
        fornecedor_id,
        data_emissao,
        tipo_pagamento,
        desconto_comercial,
        desconto_financeiro,
        status,
        data_cadastro,
        data_atualizacao
      ) VALUES ( $1, $2, $3, $4, $5, $6, NOW(), NOW() )
       RETURNING id`;

    //Guarda os valores no array   
    const purchaseValues = [
        data.fornecedor_id,
        data.data_emissao,
        data.tipo_pagamento,
        data.desconto_comercial,
        data.desconto_financeiro,
        data.status
    ];
  
    const result = await client.query( insertPurchaseQuery, purchaseValues );
    const purchaseId = result.rows[0].id;

    //Insert na tabela "itens_compra", não precisa enviar subtotal, o mesmo é calculado direto na coluna no banco de dados.
    const insertItemQuery = `
      INSERT INTO itens_compra (
      compra_id,
      produto_id,
      quantidade,
      preco_unitario,
      desconto_volume
      ) VALUES ($1, $2, $3, $4, $5)`;

    for (const item of data.itens) {
    await client.query(insertItemQuery, [
      purchaseId,
      item.produto_id,
      item.quantidade,
      item.preco_unitario,
      item.desconto_volume
    ]);
  }
  
    //Caso a query dê certo, dá o COMMIT e retorna a compra.
    await client.query('COMMIT');

    // SELECT para consulta, depois retorna todos os dados da compra inserida no JSON de resposta.
    const insertedPurchaseResponse = `
      SELECT
        c.id AS compra_id,
        c.fornecedor_id,
        c.data_emissao,
        c.tipo_pagamento,
        c.desconto_comercial,
        c.desconto_financeiro,
        c.valor_bruto,
        c.valor_total,
        c.status,
        c.data_cadastro,
        c.data_atualizacao,

        ic.id AS item_id,
        ic.produto_id,
        ic.quantidade,
        ic.preco_unitario,
        ic.desconto_volume,
        ic.valor_subtotal
      FROM compras c
      INNER JOIN itens_compra ic ON c.id = ic.compra_id
      WHERE c.id = $1
    `;

    const selectResult = await client.query(insertedPurchaseResponse, [purchaseId]);
    const rows = selectResult.rows;

    //Modelo de resposta da compra
    const compra: purchaseModel = {
      id: rows[0].compra_id,
      fornecedor_id: rows[0].fornecedor_id,
      fornecedor_nome: rows[0].fornecedor_nome,
      data_emissao: rows[0].data_emissao,
      tipo_pagamento: rows[0].tipo_pagamento,
      desconto_comercial: rows[0].desconto_comercial,
      desconto_financeiro: rows[0].desconto_financeiro,
      valor_bruto: rows[0].valor_bruto,
      valor_total: rows[0].valor_total,
      status: rows[0].status,
      data_cadastro: rows[0].data_cadastro,
      data_atualizacao: rows[0].data_atualizacao,
      itens: rows.map((row: any) => ({
        id: row.item_id,
        purchase_id: row.compra_id,
        produto_id: row.produto_id,
        quantidade: row.quantidade,
        preco_unitario: row.preco_unitario,
        desconto_volume: row.desconto_volume,
        valor_subtotal: row.valor_subtotal
      }))
    };

    return compra;

    //Caso dê erro, executa rollback e joga o erro.
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

//Verificar se existe um fornecedor com o ID informado antes de criar a compra.
export const verifySupplierId = async (fornecedor_id: number): Promise<purchaseModel | null> => {
  const result = await db.query(
    `SELECT * FROM fornecedores where id = $1 limit 1`,
    [fornecedor_id]
  );

  return result.rows[0] || null;
};

// Atualizar compra + itens
export const updatePurchase = async (id: number, fieldsToUpdate: Partial<purchaseModel>) => {
  const client = await db.connect();
  try {
    await client.query("BEGIN");

    const { itens, ...purchaseFields } = fieldsToUpdate;

    const keys = Object.keys(purchaseFields);
    const values = Object.values(purchaseFields);

    if (keys.length > 0) {
      const setClause = keys.map((key, index) => `${key} = $${index + 1}`).join(", ");
      const query = `UPDATE compras SET ${setClause} WHERE id = $${keys.length + 1}`;
      await client.query(query, [...values, id]);
    }

    if (itens && Array.isArray(itens)) {
      await updatePurchaseItems(client, id, itens);
    }

    await client.query("COMMIT");

    return getPurchaseByIdQuery(id); // Retorna a compra completa
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

// Atualizar itens
const updatePurchaseItems = async (client: any, purchaseId: number, items: any[]) => {
  const currentItems = await client.query(
    `SELECT id FROM itens_compra WHERE compra_id = $1`,
    [purchaseId]
  );
  const currentItemIds = currentItems.rows.map((row) => row.id);

  const itemsToUpdate = items.filter((item) => item.item_id !== undefined && item.item_id !== null);
  const itemsToCreate = items.filter((item) => !item.item_id);
  const itemsToDelete = currentItemIds.filter(
    (id) => !items.some((item) => item.item_id === id)
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
           SET produto_id = $1, quantidade = $2, preco_unitario = $3, desconto_volume = $4
           WHERE id = $5 AND compra_id = $6`,
          [
            item.produto_id,
            item.quantidade,
            item.preco_unitario,
            item.desconto_volume || 0,
            item.item_id,
            purchaseId,
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
            compra_id, produto_id, quantidade, preco_unitario, desconto_volume
          ) VALUES ($1, $2, $3, $4, $5)`,
          [
            purchaseId,
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

// Buscar compra com itens
export async function getPurchaseByIdQuery(id: number) {
  const purchaseResult = await db.query(
    `SELECT * FROM compras WHERE id = $1`,
    [id]
  );

  if (purchaseResult.rows.length === 0) return null;

  const itemsResult = await db.query(
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
}

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
