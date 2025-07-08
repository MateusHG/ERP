import { Request, Response } from 'express';
import * as AuthService from './auth-service';
import { httpResponse } from '../utils/http-helper';

export async function registerController(req: Request, res: Response) {
  const { username, password } = req.body;

  try {
    const result = await AuthService.registerUserService(username, password);

    return res.status(result.statusCode).json(result.body);
  } catch (error) {
    return res.status(500).json({ message: 'Erro interno no servidor.' });
  }
}

export async function loginController(req: Request, res: Response) {
  const { username, password } = req.body;

  try {
    const result: httpResponse | {token: string} = await AuthService.loginUserService(username, password);

    if ('statusCode' in result) {
      return res.status(result.statusCode).json(result.body);
    }

    return res.status(200).json(result); // ← aqui está o ponto central
  } catch (error) {
    return res.status(500).json({ message: 'Erro interno no servidor.' });
  }
}