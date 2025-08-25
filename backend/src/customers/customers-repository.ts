import db from "../config/db";
import { customerModel } from "../customers/customer-model";

export const searchAllCustomers = async (
  filters: { id?: number, nome_fantasia?: string, razao_social?: string, cnpj?: string, email?: string, status?: string }
): Promise<customerModel[]> => {
  let query = `SELECT * FROM clientes`;
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

  query += ` ORDER BY id DESC`;

  const result = await db.query(query, values);
  return result.rows;
};

export const searchCustomerById = async (id: number): Promise<customerModel | null> => {
  const result = await db.query(`SELECT * FROM clientes where id = $1`, [id]);
  return result.rows[0];
};

export const insertCustomer = async (customer: Omit<customerModel, 'id' | 'data_cadastro' | 'data_atualizacao'>): Promise<customerModel> => {
  const { razao_social,
          nome_fantasia,
          cnpj, 
          cpf, 
          inscricao_estadual, 
          email,
          telefone, 
          celular, 
          rua, 
          numero,
          complemento, 
          bairro, 
          cidade, 
          uf,
          cep, 
          status } = customer;

  const result = await db.query(
    `INSERT INTO clientes (
          razao_social,
          nome_fantasia,
          cnpj, 
          cpf, 
          inscricao_estadual, 
          email,
          telefone, 
          celular, 
          rua, 
          numero,
          complemento, 
          bairro, 
          cidade, 
          uf,
          cep, 
          status)
      VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *`,
      [razao_social, nome_fantasia, cnpj, cpf, inscricao_estadual, email, telefone, celular, rua, numero, complemento, bairro, cidade, uf, cep, status]
  );

  return result.rows[0]
};

//Consultas para verificar e depois utilizar na service como validação e não deixar duplicar registros com mesmo CPF, CNPJ, EMAIL, RAZAO SOCIAL.
export const verifyRazao = async (razao: string, ignoredId?: number) => {
  const query = `SELECT 1 FROM clientes WHERE razao_social = $1 ${ignoredId ? "AND id <> $2" : ""} LIMIT 1`;
    
  const values = ignoredId ? [razao, ignoredId]: [razao];
  const result = await db.query(query, values);
  return result.rowCount > 0;
};

export const verifyCnpj = async (cnpj: string, ignoredId?: number) => {
  const query = `SELECT 1 FROM clientes WHERE cnpj = $1 ${ignoredId ? "AND id <> $2" : ""}
                 LIMIT 1
                `;

  const values = ignoredId ? [cnpj, ignoredId]: [cnpj];
  const result = await db.query(query, values);
  return result.rowCount > 0;
};

export const verifyEmail = async (email: string, ignoredId?:number) => {
  const query =
    `SELECT 1 FROM clientes WHERE email = $1 ${ignoredId ? "AND id <> $2" : ""} LIMIT 1`;
  const values = ignoredId ? [email, ignoredId]: [email];
  const result = await db.query(query, values);
  return result.rowCount > 0;
};

export const verifyCpf = async (cpf: string): Promise<customerModel |  null> => {
  const result = await db.query(
    `SELECT * FROM clientes where cpf = $1 limit 1`,
    [cpf]
  );

  return result.rows[0] || null;
};

export const updateCustomer = async (id: number, fieldsToUpdate: Partial<customerModel>) => {
  const keys = Object.keys(fieldsToUpdate);
  const values = Object.values(fieldsToUpdate);

  if (keys.length === 0) return null;

  const setClause = keys.map((key, index) => `${key} = $${index + 1}`).join(', ');
  const query = `UPDATE clientes SET ${setClause} WHERE id =$${keys.length + 1} RETURNING *`;

  const result = await db.query(query, [...values, id]);
  return result.rows[0];
};

export const deleteCustomerById = async (id: number): Promise<boolean> => {
  const result = await db.query(`DELETE FROM clientes where id = $1`, [id]);
  return result.rowCount> 0;
};