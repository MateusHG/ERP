import db from "../config/db";
import { customerModel } from "../customers/customer-model";

export const searchAllCustomers = async (): Promise<customerModel[]> => {
  const result = await db.query(`SELECT * FROM clientes order by id`);
  return result.rows
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
          estado,
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
          estado,
          cep, 
          status)
      VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *`,
      [razao_social, nome_fantasia, cnpj, cpf, inscricao_estadual, email, telefone, celular, rua, numero, complemento, bairro, cidade, estado, cep, status]
  );

  return result.rows[0]
};

//Consultas para verificar e depois utilizar na service como validação e não deixar duplicar registros com mesmo CPF, CNPJ, EMAIL, RAZAO SOCIAL.
export const verifyRazao = async (razao: string): Promise<customerModel |  null> => {
  const result = await db.query(
    `SELECT * FROM clientes where razao_social = $1 limit 1`,
    [razao]
  );

  return result.rows[0] || null;
};

export const verifyCnpj = async (cnpj: string): Promise<customerModel |  null> => {
  const result = await db.query(
    `SELECT * FROM clientes where cnpj = $1 limit 1`,
    [cnpj]
  );

  return result.rows[0] || null;
};

export const verifyCpf = async (cpf: string): Promise<customerModel |  null> => {
  const result = await db.query(
    `SELECT * FROM clientes where cpf = $1 limit 1`,
    [cpf]
  );

  return result.rows[0] || null;
};

export const verifyEmail = async (email: string): Promise<customerModel | null> => {
  const result = await db.query(
    `SELECT * FROM clientes where email = $1 limit 1`,
    [email]
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