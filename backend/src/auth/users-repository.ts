import db from '../config/db';

export const checkUser = async (username: string) => {
  const result = await db.query('SELECT id, password_hash, username FROM users WHERE username = $1', [username]);

  return result.rows[0] || null;
};

export async function getUserById(id: number) {
  const result = await db.query(`
    SELECT id, username FROM usuarios WHERE id = $1`,
  [id]);

  return result.rows[0] || null;
};

export const createUser = async (username: string, passwordHash: string) => {
  const result = await db.query(
    'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING *',
    [username, passwordHash]);
  
  return result.rows[0];
};

export async function getRefreshToken(userId: number, token: string) {
  const result = await db.query(`
    SELECT * FROM refresh_tokens WHERE user_id = $1 AND token = $2`,
  [userId, token]);
  return result.rows[0] || null;  
};

//Armazena o token temporário que é gerado automaticamente.
export async function storeRefreshToken(userId: number, token: string, expiresAt: Date) {
  await db.query(`
    INSERT INTO refresh_tokens (user_id, token, expires_at)
    VALUES ($1, $2, $3)
    `, [userId, token, expiresAt]);
};

export async function deleteRefreshToken(userId: number) {
  await db.query(`
    DELETE FROM refresh_tokens WHERE user_id = $1`, [userId]);
};
