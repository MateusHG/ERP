import db from '../config/db';
import { badRequest, created, notFound, ok } from '../utils/http-helper';
import { comparePassword, generateToken, hashPassword } from './auth-utils';

// Lógica de autenticações ( Validações, JWT, bcrypt).

//Cadastra o usuário
export async function registerUserService(username: string, password: string) {
  const checkUser = await db.query(
    'SELECT id FROM users WHERE username = $1', [username]
  );

  if (checkUser.rowCount > 0)
    return badRequest('Usuário já cadastrado.');

  const passwordHash = await hashPassword(password);

  await db.query(
    'INSERT INTO users (username, password_hash) VALUES ($1, $2)',
    [username, passwordHash]);

    return created('Usuário cadastrado com sucesso.');
};


//Faz Login
export async function loginUserService(username: string, password: string) {
  const result = await db.query(
    'SELECT * FROM users WHERE username = $1', [username]);

    if (result.rowCount === 0)
      return notFound('Usuário não encontrado');

    const user = result.rows[0];

    const match = await comparePassword(password, user.password_hash);
    if (!match) 
      return badRequest('Senha incorreta.');

    const token = generateToken({ id: user.id, username: user.username });
    return { token };
};

