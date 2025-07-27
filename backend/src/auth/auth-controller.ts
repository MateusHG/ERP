import { Request, Response } from 'express';
import * as AuthService from './auth-service';

export async function registerController(req: Request, res: Response) {
  return AuthService.registerUserService(req, res);
};

export async function loginController(req: Request, res: Response) {
  return AuthService.loginUserService(req, res);
};

export async function refreshTokenController(req: Request, res: Response) {
  return AuthService.refreshTokenService(req, res);
}

export async function logoutController(req: Request, res: Response) {
  return AuthService.logoutService(req, res);
}

export async function getUserInfo(req: Request, res: Response) {
  if (!req.user) {
    res.status(401).json({ message: 'Usuário não autenticado.'});
    return;
  }
  
  const { id, username } = req.user;
  
  res.status(200).json( { id, username });
  return;
};