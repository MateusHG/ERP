import db from "../config/db";
import { supplierModel } from "../suppliers/supplier-model";

export const searchAllSuppliers = async (
  filters: { id?: number, nome_fantasia?: string, razao_social?: string, cnpj?: string, email?: string, status?: string, limit?: number, orderBy?: string }):
   Promise<supplierModel[]> => {
  let query = `SELECT f.*, EXISTS(SELECT 1 FROM compras c WHERE c.fornecedor_id = f.id) AS has_purchases FROM fornecedores f`;
  const conditions: string[] = [];
  const values: any[] = [];

  if (filters.id) {
    values.push(`${filters.id}%`);
    conditions.push(`CAST(id AS TEXT) ILIKE $${values.length}`);
  }

  if (filters.nome_fantasia) {
    values.push(`%${filters.nome_fantasia}%`);
    conditions.push(`nome_fantasia ILIKE $${values.length}`);
  }

  if (filters.razao_social) {
    values.push(`%${filters.razao_social}%`);
    conditions.push(`razao_social ILIKE $${values.length}`);
  }

  if (filters.cnpj) {
    values.push(`${filters.cnpj}%`);
    conditions.push(`CAST(cnpj AS TEXT) ILIKE $${values.length}`);
  } 

  if (filters.email) {
    values.push(`%${filters.email}%`);
    conditions.push(`email ILIKE $${values.length}`);
  }

  if (filters.status) {
    values.push(filters.status);
    conditions.push(`status = $${values.length}`);
  }

  if (conditions.length > 0) {
    query += ` WHERE ` + conditions.join(" AND ");
  }

   // Aplicar ORDER BY dinâmico (com validação simples)
  if (filters.orderBy && ['id', 'nome_fantasia', 'razao_social'].includes(filters.orderBy)) {
    query += ` ORDER BY ${filters.orderBy} ASC`;
  } else {
    query += ` ORDER BY id DESC`;
  }

  // Aplicar LIMIT se informado e válido
  if (filters.limit && Number.isInteger(filters.limit) && filters.limit > 0) {
    query += ` LIMIT ${filters.limit}`;
  }

  const result = await db.query(query, values);       /* Debug dos campos que estão chegando no backend. */
  return result.rows;                                 /* console.log("Filtros recebidos:", filters); */
                                                      /* console.log("Query:", query); */
                                                      /* console.log("Values:", values); */
};


export const searchSupplierById = async (id: number): Promise<supplierModel | null > => {
  const result = await db.query(`SELECT f.*, EXISTS (SELECT 1 FROM compras c WHERE c.fornecedor_id = f.id) AS has_purchases FROM fornecedores f WHERE f.id = $1`, [id]);
  return result.rows[0] || null;
};

export const insertSupplier = async (supplier: Omit<supplierModel, 'id' | 'data_cadastro'| 'data_atualizacao'>): Promise<supplierModel> => {
  const { razao_social, nome_fantasia, cnpj, inscricao_estadual, email, telefone, celular, rua, numero, complemento, bairro, cidade, uf, cep,  status } = supplier;

  const result = await db.query(
    `INSERT INTO fornecedores (razao_social, nome_fantasia, cnpj, inscricao_estadual, email, telefone, celular, rua, numero, complemento, bairro, cidade, uf, cep, status)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
    RETURNING *`,
    [razao_social, nome_fantasia, cnpj, inscricao_estadual, email, telefone, celular, rua, numero, complemento, bairro, cidade, uf, cep, status]
  );

  return result.rows[0];
};

export const verifyNomeFantasia = async (nome_fantasia: string): Promise<supplierModel | null> => {
  const result = await db.query(`SELECT * FROM fornecedores WHERE nome_fantasia = $1 LIMIT 1`,
    [nome_fantasia]
  );

  return result.rows[0] || null;
};

export const verifyRazao = async (razao: string): Promise<supplierModel | null> => {
  const result = await db.query(`SELECT * FROM fornecedores WHERE razao_social = $1 LIMIT 1`,
    [razao]
  );
  
  return result.rows[0] || null;
};

export const verifyCnpj = async (cnpj: string): Promise<supplierModel | null> => {
  const result = await db.query(`SELECT * FROM fornecedores WHERE cnpj = $1 LIMIT 1`,
    [cnpj]
  );

  return result.rows[0] || null;
};

export const verifyEmail = async (email: string): Promise<supplierModel | null> => {
  const result = await db.query(`SELECT * FROM fornecedores WHERE email = $1 LIMIT 1`,
    [email]
  );

  return result.rows[0] || null;
};

export const updateSupplier = async (id: number, fieldsToUpdate: Partial<supplierModel>) => {
  const keys = Object.keys(fieldsToUpdate);
  const values = Object.values(fieldsToUpdate);

  if (keys.length === 0) return null;

  const setClause = keys.map((key, index) => `${key} = $${index + 1}`).join(', ');
  const query = `UPDATE fornecedores SET ${setClause} WHERE id = $${keys.length + 1} RETURNING *`;

  const result = await db.query(query, [...values, id]);
  return result.rows[0];
};

export const deleteSupplierById = async (id:number): Promise<boolean> => {
  const result = await db.query(`DELETE FROM fornecedores WHERE id = $1`, [id]);
  return result.rowCount> 0;
};

export const verifySupplierPurchases = async (id: number): Promise<boolean> => {
  const result = await db.query(`SELECT * FROM compras WHERE fornecedor_id = $1 LIMIT 1`, [id]);
  return result.rowCount > 0;
};