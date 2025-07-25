import { Request, Response, NextFunction } from "express";
import { verifyToken } from "./auth-utils";
import { notAuthorized } from "../utils/http-helper";
import { AuthPayLoad } from "./auth-types";

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayLoad;
    }
  }
}

// Verifica o JWT antes de rotas protegidas.
export async function authenticate(req: Request, res: Response, next: NextFunction) {
  let token = req.cookies?.token;

  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer')) {
    token = authHeader.split(' ')[1];
  }
}

  if (!token) {
    const error = await notAuthorized("Token não fornecido.");
    return res.status(error.statusCode).json(error.body);
  }
  
  try {
    const user = verifyToken(token);
    req.user = user; //Adiciona o payload ao request
    next();
  } catch {
    const error = await notAuthorized('Token inválido ou expirado.');
    return res.status(error.statusCode).json(error.body);
  }
};