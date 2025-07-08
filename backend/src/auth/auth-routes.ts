import { Router } from 'express';
import { loginController, registerController } from './auth-controller';

//Rotas de cadastro/login de usuário.

const authRouter = Router();

authRouter.post('/register', registerController);
authRouter.post('/login', loginController);

export default authRouter;