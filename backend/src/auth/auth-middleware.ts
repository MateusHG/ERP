import { Request, Response, NextFunction } from "express";
import { verifyToken } from "./auth-utils";
import { notAuthorized } from "../utils/http-helper";

// Verifica o JWT antes de rotas protegidas.

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer')) {
    return notAuthorized('Token não fornecido.');
  }

  const token = authHeader.split(' ')[1];

  try {
    const user = verifyToken(token);
    req.user = user; //Adiciona o payload ao request
    next();
  } catch {
    return notAuthorized('Token inválido ou expirado.');
  }
};