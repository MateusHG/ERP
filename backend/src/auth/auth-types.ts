//Tipos usados no módulo.

export interface AuthPayLoad {
  id: number,
  username: string;
}

export interface TokenPayLoad {
  id: number;
  username: string;
  iat?: number;
  exp?: number;
};