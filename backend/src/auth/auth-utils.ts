import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { AuthPayLoad } from "./auth-types";
//
//Arquivo responsável pela geração e verificação de  JWT, hash e comparação.
//

const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const EXPIRES_IN = '2h';

export function generateToken(payload: AuthPayLoad): string {
  return jwt.sign(payload, JWT_SECRET, {expiresIn: EXPIRES_IN });
};

export function verifyToken(token: string): AuthPayLoad {
  return jwt.verify(token, JWT_SECRET) as AuthPayLoad;
};

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
};

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
};