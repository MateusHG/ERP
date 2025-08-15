import db from "../config/db";
import { purchaseItemModel } from "../purchases/purchase-model";


export const searchAllPurchaseItems = async (purchaseId: number): Promise<purchaseItemModel[]> => {
  const query = `
  SELECT ic.id,
         ic.compra_id AS purchase_id,
         ic.produto_id,
         p.codigo AS produto_codigo,
         p.nome AS produto_nome,
         ic.quantidade,
         ic.preco_unitario,
         ic.desconto_volume,
         ic.valor_subtotal
  FROM itens_compra ic
  JOIN produtos p ON p.id = ic.produto_id
  WHERE ic.compra_id = $1
  ORDER BY ic.id
  `;
  
  const result = await db.query(query, [purchaseId]);
  return result.rows;
};

export const insertPurchaseItem = async (
    purchaseId: number,
    purchaseItem: Omit<purchaseItemModel, 'id' | 'purchase_id' | 'valor_subtotal'>
  ): Promise<purchaseItemModel> => {
    const {
      produto_id,
      quantidade,
      preco_unitario,
      desconto_volume
    } = purchaseItem
  
  const result = await db.query(
    `INSERT INTO itens_compra (
      compra_id,
      produto_id,
      quantidade,
      preco_unitario,
      desconto_volume
    ) VALUES ( 
      $1, $2, $3, $4, $5
    ) RETURNING *`,
     [purchaseId, produto_id, quantidade, preco_unitario, desconto_volume]
  );

  return result.rows[0];
};

export const updatePurchaseItem = async (
  purchaseId: number,
  purchaseItemId: number,
  fieldsToUpdate: Partial<purchaseItemModel>

): Promise<purchaseItemModel | null> => {

  //Cria um filtro para campos permitidos na alteração
  const allowedFields = ['produto_id','quantidade', 'preco_unitario', 'desconto_volume'];
  const keys = Object.keys(fieldsToUpdate).filter(key => allowedFields.includes(key));
  const values = keys.map(key => fieldsToUpdate[key as keyof typeof fieldsToUpdate]);

  if (keys.length === 0) return null;

  const setClause = keys.map((key, index) => `${key} = $${index + 1}`).join(', ');
  
  // WHERE com dois filtros: id (item) e compra_id (compra)
  const query = `
    UPDATE itens_compra
    SET ${setClause}
    WHERE id = $${keys.length + 1} AND compra_id = $${keys.length + 2} 
    RETURNING *;
    `;

  const result = await db.query(query, [...values, purchaseItemId, purchaseId]);
  return result.rows[0] || null;
};

//Validação para ver se a compra existe, mover depois para um arquivo separado.
export const verifyPurchase = async (purchaseId: number): Promise<boolean> => {
  const result = await db.query(`SELECT * FROM compras where id = $1 limit 1`, [purchaseId]);
  return result.rows[0] || null;
};

//Validação para ver se o produto existe, mover depois para um arquivo separado.
export const verifyProduct = async (productId: number): Promise<boolean> => {
  const result = await db.query(`SELECT * FROM produtos where id = $1 limit 1`,[productId]);
  return result.rows[0] || null;
};

//Validação para ver se o id do item dentro da compra existe, mover depois para um arquivo separado.
export const verifyPurchaseItem = async (productItemId: number): Promise<boolean> => {
  const result = await db.query(`SELECT * FROM itens_compra where id = $1 limit 1`,[productItemId]);
  return result.rows[0] || null;
};

export const deletePurchaseItem = async (purchaseId: number, purchaseItemId: number): Promise<boolean> => {
  const result = await db.query(`DELETE FROM itens_compra where compra_id = $1 and id = $2`, [purchaseId, purchaseItemId])
  return result.rowCount> 0;
};