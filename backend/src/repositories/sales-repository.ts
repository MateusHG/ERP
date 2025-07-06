import db from "../config/db"
import { salesItemModel, salesModel } from "../models/sales-model"

export const searchAllSales = async (): Promise<salesModel[]> => {
  const result = await db.query(
    `SELECT
  v.id_venda AS id_venda,
  v.data_emissao,
  v.tipo_pagamento,
  v.desconto_comercial,
  v.desconto_financeiro,
  v.valor_bruto,
  v.valor_total,
  v.status,
  v.data_cadastro,
  v.data_atualizacao,
  v.id_cliente,

  iv.id_venda AS id_venda,
  iv.id_item,
  iv.id_produto,
  iv.quantidade,
  iv.preco_unitario,
  iv.desconto_volume,
  iv.valor_subtotal
FROM
	vendas v
INNER JOIN
	itens_venda iv ON v.id_venda = iv.id_venda`);

  return result.rows;
};

export const searchSaleById = async (id: number): Promise<salesModel | null> => {
  const result = await db.query(
    `SELECT
  v.id_venda AS id_venda,
  v.data_emissao,
  v.tipo_pagamento,
  v.desconto_comercial,
  v.desconto_financeiro,
  v.valor_bruto,
  v.valor_total,
  v.status,
  v.data_cadastro,
  v.data_atualizacao,
  v.id_cliente,

  iv.id_venda AS id_venda,
  iv.id_item,
  iv.id_produto,
  iv.quantidade,
  iv.preco_unitario,
  iv.desconto_volume,
  iv.valor_subtotal
FROM
	vendas v
INNER JOIN
	itens_venda iv ON v.id_venda = iv.id_venda
WHERE v.id_venda = $1`,
  [id]);

  return result.rows[0];
};

interface newSaleInput extends Omit<salesModel, 'id' | 'data_cadastro' | 'data_atualizacao' | 'itens' | 'valor_bruto' | 'valor_total'> {
  items: Omit<salesItemModel, 'id' | 'valor_subtotal'>[];
}

export const insertSale = async (data: newSaleInput): Promise<salesModel> => {
  const client = await db.connect();

  //Inicío da transição
  try {
    await client.query('BEGIN');

    //Insert na tabela "vendas".
    const insertSaleQuery = `
      INSERT INTO vendas (
      id_cliente,
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
       RETURNING id_venda`;

    //Guarda os valores no array
    const saleValues = [
      data.id_cliente,
      data.data_emissao,
      data.tipo_pagamento,
      data.desconto_comercial,
      data.desconto_financeiro,
      data.status
    ];

    const result = await client.query( insertSaleQuery, saleValues );
    const saleId = result.rows[0].id_venda;

    //Insert na tabela "itens_venda"
    const insertSaleItemQuery = `
    INSERT INTO itens_venda (
    id_venda,
    id_produto,
    quantidade,
    preco_unitario,
    desconto_volume
    ) VALUES (
     $1,
     $2,
     $3,
     $4,
     $5 );`

      for (const item of data.items) {
      await client.query(insertSaleItemQuery, [
        saleId,
        item.id_produto,
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
        v.id_venda AS id_venda,
        v.id_cliente,
        v.data_emissao,
        v.tipo_pagamento,
        v.desconto_comercial,
        v.desconto_financeiro,
        v.valor_bruto,
        v.valor_total,
        v.status,
        v.data_cadastro,
        v.data_atualizacao,

        iv.id_item AS id_item,
        iv.id_produto,
        iv.quantidade,
        iv.preco_unitario,
        iv.desconto_volume,
        iv.valor_subtotal
      FROM vendas v
      INNER JOIN itens_venda iv ON v.id_venda = iv.id_venda
      WHERE v.id_venda = $1
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

export const updateSaleById = async (id: number, fieldsToUpdate: Partial<salesModel>) => {
  const keys = Object.keys(fieldsToUpdate);
  const values = Object.values(fieldsToUpdate);

  if (keys.length === 0) return null;

  const setClause = keys.map((key, index) => `${key} = $${index + 1}`).join(', ');
  const query = `UPDATE vendas SET ${setClause} WHERE id_venda = $${keys.length + 1} RETURNING *`;

  const result = await db.query(query, [...values, id]);
  return result.rows[0];
};

export const deleteSaleById = async (id: number): Promise<boolean> => {
  const client = await db.connect()
  
  //Início da transição, precisa apagar na tabela vendas e itens_venda, evita delete parcial.
  try {
    await client.query('BEGIN');

    //DELETE primeiro na itens_venda por chave estrangeira (FK).
    await client.query(`DELETE FROM itens_venda WHERE id_venda = $1`, [id]);

    //DELETE na tabela vendas.
    const result = await client.query(`DELETE FROM vendas WHERE id_venda = $1`, [id]);

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
    `SELECT * from vendas WHERE id_venda = $1 limit 1`,
    [id]
  );

  return result.rows[0] || null;
};