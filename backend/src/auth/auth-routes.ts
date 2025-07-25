import { Router } from 'express';
import { getUserInfo, loginController, logoutController, refreshTokenController, registerController } from './auth-controller';
import { authenticate } from './auth-middleware';

//Rotas de cadastro/login de usuário.

const authRouter = Router();

authRouter.post('/register', registerController);
authRouter.post('/login', loginController);
authRouter.post('/refresh-token', refreshTokenController);
authRouter.post('/logout', logoutController);
authRouter.get('/me-info', authenticate,  getUserInfo)

export default authRouter;