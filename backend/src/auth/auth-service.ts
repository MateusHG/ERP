import { comparePassword, generateAcessToken, generateRefreshToken, hashPassword, verifyRefreshToken } from './auth-utils';
import * as userRepository from "../auth/users-repository";
import { Request, Response } from 'express';

// Lógica de autenticações ( Validações, JWT, bcrypt).

export async function registerUserService(req: Request, res: Response) {
  const {username, password} = req.body;

  try {
    const userExists = await userRepository.checkUser(username);
    if (userExists) {
      res.status(400).json({ message: 'Usuário já cadastrado.'});
      return;
    }

    const hashedPassword = await hashPassword(password);
    await userRepository.createUser(username, hashedPassword);

    res.status(201).json({ message: 'Usuário cadastrado com sucesso.' });
    return;
  } catch {
    res.status(500).json( { message: 'Erro interno no servidor.'} );
    return;
  }
};

export async function loginUserService(req: Request, res: Response) {
  const { username, password } = req.body;

  try {
    const user = await userRepository.checkUser(username);
    if (!user || !(await comparePassword(password, user.password_hash))) {
      res.status(401).json({ message: 'Credenciais Inválidas.'});
      return;
    }

    const acessToken = await generateAcessToken({ id: user.id, username: user.username });
    const refreshToken = await generateRefreshToken({ id: user.id, username: user.username });

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 Dias.
    await userRepository.storeRefreshToken(user.id, refreshToken, expiresAt);

    res.cookie("token", acessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 Minutos.
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ message: 'Login realizado com sucesso.', acessToken});
    return;
  } catch {
    res.status(500).json({ message: 'Erro interno no servidor.'});
    return;
  }
};

export async function refreshTokenService(req: Request, res: Response) {
  const refreshToken = req.cookies?.refreshToken;
  if (!refreshToken) {
    res.status(401).json({ message: 'Token ausente.' });
    return;
  }

  try {
    const payload = verifyRefreshToken(refreshToken);

    const storedToken = await userRepository.getRefreshToken(payload.id, refreshToken);
    if (!storedToken || new Date(storedToken.expires_at) < new Date()) {
      res.status(401).json({ message: 'Token inválido ou expirado.' });
      return;
    }
    
    const newAccessToken = generateAcessToken({ id: payload.id, username: payload.username});

    res.cookie('token', newAccessToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000
    });

    res.json({message: 'Token renovado com sucesso.' , newAccessToken});
    return; 
  
  } catch {
    res.status(403).json({message: 'Refresh Token inválido.'});
    return;
  }
};

export async function logoutService(req: Request, res: Response) {
  const refreshToken = req.cookies.refreshToken;

  try {
    const payload = verifyRefreshToken(refreshToken);
    await userRepository.deleteRefreshToken(payload.id);
  } catch {}

  res.clearCookie('token');
  res.clearCookie('refreshToken');
  res.status(200).json({message: 'Logout realizado com sucesso.'});
  return
};

export async function getUserByIdService(id: number) {
  return await userRepository.getUserById(id);
};