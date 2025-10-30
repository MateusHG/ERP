import { Request, Response } from 'express';
import { getBalanceService, listInventoryService, listMovementsService, registerMovementService } from "./inventory-service";

// Lista os produtos do estoque com o respectivo saldo.
export const listInventoryController = async (req: Request, res: Response) => {
  const filters = {
    id: typeof req.query.id === 'string' ? Number(req.query.id) : undefined,
    codigo: req.query.codigo as string,
    nome: req.query.nome as string,
    categoria: req.query.categoria as string,
    status: req.query.status as string,
    saldo: req.query.saldo as string,
  };

  const httpResponse = await listInventoryService(filters)
  res.status(httpResponse.statusCode).json(httpResponse.body);
};

export const registerMovementController = async (req: Request, res: Response) => {
  try{
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Usuário não autenticado." });
    }

    //Inclui o ID do usuário no corpo da movimentação.
    const movementData = { ...req.body, usuario_id: userId };

    const httpResponse = await registerMovementService(movementData);
    return res.status(httpResponse.statusCode).json(httpResponse.body);
  
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro interno no servidor" });
  }
};

// Busca apenas o saldo dos produtos da tabela estoque_saldo.
export const getBalanceController = async (req: Request, res: Response) => {
  const productId = Number(req.params.id);

  const httpResponse = await getBalanceService(productId);
  res.status(httpResponse.statusCode).json(httpResponse.body);
};


// Busca o histórico de movimentações de um determinado produto.
export const listMovementsController = async (req: Request, res: Response) => {
  const productId = Number(req.params.id)
  
  const httpResponse = await listMovementsService(productId);
  res.status(httpResponse.statusCode).json(httpResponse.body);
};

