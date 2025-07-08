import db from "../config/db";
import { salesItemModel } from "../models/sales-model";

export const searchAllSaleItems = async (saleId: number): Promise<salesItemModel[]> => {
  const result = await db.query(
    `SELECT * from itens_venda WHERE id_venda = $1`, [saleId]
  );

  return result.rows;
};

export const insertSaleItem = async (
  saleId: number,
  saleItem: Omit<salesItemModel, 'id' | 'sale_id' | 'valor_subtotal'>
): Promise<salesItemModel> => {
  const {
    id_produto,
    quantidade,
    preco_unitario,
    desconto_volume
  } = saleItem

  const result = await db.query(
    `INSERT INTO itens_venda (
    id_venda,
    id_produto,
    quantidade,
    preco_unitario,
    desconto_volume
    ) VALUES (
     $1, $2, $3, $4, $5
    ) RETURNING *`,
     [saleId, id_produto, quantidade, preco_unitario, desconto_volume]
  );

  return result.rows[0];
};

export const updateSaleItem = async (
  saleId: number,
  saleItemId: number,
  fieldsToUpdate: Partial<salesItemModel>

): Promise<salesItemModel | null > => {

const allowedFields = ['id_produto', 'quantidade', 'preco_unitario', 'desconto_volume'];
const keys = Object.keys(fieldsToUpdate).filter(key => allowedFields.includes(key));
const values = keys.map(key => fieldsToUpdate[key as keyof typeof fieldsToUpdate]);

if (keys.length === 0) return null;

const setClause = keys.map((key, index) => `${key} = $${index + 1}`).join(', ');

const query = `
  UPDATE itens_venda
  set ${setClause}
  WHERE id_item = $${keys.length + 1} AND id_venda = $${keys.length + 2}
  RETURNING *;
  `;

  const result = await db.query(query, [...values, saleItemId, saleId]);
  return result.rows[0] || null;
}; 

export const deleteSaleItem = async (saleId: number, saleItemId: number): Promise<boolean> => {
  const result = await db.query(`DELETE from itens_venda WHERE id_venda = $1 and id_item = $2`, [saleId, saleItemId])
  return result.rowCount > 0;
};


//Verificações
export const verifySale = async (saleId: number): Promise<boolean> => {
  const result = await db.query(`SELECT * FROM vendas WHERE id_venda = $1 limit 1`, [saleId]);
  return result.rows[0] || null;
};

export const verifySaleItem = async (saleItemId: number): Promise<boolean> => {
  const result = await db.query(`SELECT * FROM itens_venda WHERE id_item = $1 limit 1`, [saleItemId]);
  return result.rows[0] || null;
};

export const verifyProduct = async (productId: number): Promise<boolean> => {
  const result = await db.query(`SELECT * FROM produtos where id = $1 limit 1`,[productId]);
  return result.rows[0] || null;
};