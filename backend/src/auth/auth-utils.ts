import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { AuthPayLoad, TokenPayLoad } from "./auth-types";
//
//Arquivo responsável pela geração e verificação de  JWT, hash e comparação.
//

const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const JWT_REFRESH_SECRET = process.env.JWET_REFRESH_SECRET || 'refresh-secret';

export function generateAcessToken(payload: AuthPayLoad): string {
  return jwt.sign(payload, JWT_SECRET, {expiresIn: '15m' });
};

export function generateRefreshToken(payload: AuthPayLoad) {
  return jwt.sign(payload, JWT_REFRESH_SECRET, {expiresIn: '7d' });
};

export function verifyToken(token: string): AuthPayLoad {
  return jwt.verify(token, JWT_SECRET) as TokenPayLoad;
};

export function verifyRefreshToken(token: string): TokenPayLoad {
  return jwt.verify(token, JWT_REFRESH_SECRET) as TokenPayLoad;
};

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
};

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
};