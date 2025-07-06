import db from "../config/db";
import { productModel } from "../models/product-model";

export const searchAllProducts = async (filters: { id?: number, nome?: string, categoria?: string, status?: string }): Promise<productModel[]> => {
  let query = `SELECT * FROM produtos`;
  const conditions: string[] = [];
  const values: any[] = [];

  if (filters.id) {
    values.push(`${filters.id}%`);
    conditions.push(`CAST(id AS TEXT) ILIKE $${values.length}`);
  }

  if (filters.nome) {
    values.push(`%${filters.nome}%`);
    conditions.push(`nome ILIKE $${values.length}`);
  }

  if (filters.categoria) {
    values.push(`%${filters.categoria}%`);
    conditions.push(`categoria ILIKE $${values.length}`);
  }

  if (filters.status) {
    values.push(filters.status); // sem o %
    conditions.push(`status = $${values.length}`);
  }

  if (conditions.length > 0) {
    query += ` WHERE ` + conditions.join(" AND ");
  }

  query += ` ORDER BY id`;

  const result = await db.query(query, values);
  return result.rows;
};

export const searchProductsById = async (id: number): Promise<productModel | null> => {
  const result = await db.query(`SELECT * FROM produtos where id = $1`, [id]);
  return result.rows[0];
};

export const insertProduct = async (product: Omit<productModel, 'id' | 'data_cadastro' | 'data_atualizacao'>): Promise<productModel> => {
  const {codigo, nome, descricao, preco, estoque, categoria, status, estoque_minimo, estoque_maximo} = product;

  const result = await db.query(
  `INSERT INTO produtos (codigo, nome, descricao, preco, estoque, categoria, status, estoque_minimo, estoque_maximo)
   VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
   RETURNING *`,
  [codigo, nome, descricao, preco, estoque, categoria, status, estoque_minimo, estoque_maximo]
);

return result.rows[0];
};

export const updateProduct = async (id: number, fieldsToUpdate: Partial<productModel>) => {
  const keys = Object.keys(fieldsToUpdate);
  const values = Object.values(fieldsToUpdate);
  
  if (keys.length === 0) return null;

  //Keys é o array com o nome dos campos, .map percorre cada campo key e monta  a string nome = $1, preco = $2, etc.
  const setClause = keys.map((key, index) => `${key} = $${index + 1}`).join(', ');
  const query = `UPDATE produtos SET ${setClause} where id = $${keys.length + 1} RETURNING *`;

  const result = await db.query(query, [...values, id]);

  return result.rows[0];
};

//Consultas para verificar se já tem outro produto com o mesmo nome ou código e não duplicar ao fazer insert ou update.
//Criado separadamente um para código e um para nome, pois ao fazer os dois juntos a validação estava ocorrendo apenas quando ambos já existiam.
//Assim se mandasse um código já existente porém com outro nome e vice-versa, permitia o update.
export const verifyCodigo = async (codigo: string): Promise<productModel | null> => {
  const result = await db.query('SELECT * FROM produtos where codigo = $1 limit 1',
    [codigo]
  );
  
  return result.rows[0] || null;
};

export const verifyNome = async (nome: string): Promise<productModel | null> => {
  const result = await db.query('SELECT * FROM produtos where nome = $1 limit 1',
    [nome]
  );

  return result.rows[0] || null;
};

export const deleteProduct = async (id:number): Promise<boolean> => {
  const result = await db.query (`DELETE FROM produtos where id = $1`, [id]);
  return result.rowCount> 0; //retorna true se algo foi deletado
};