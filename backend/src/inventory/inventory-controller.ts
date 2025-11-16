import { Request, Response } from 'express';
import { getBalanceService, handleSaleInventoryMovementService, listInventoryService, listMovementsService, registerMovementService } from "./inventory-service";
import * as salesRepository from '../sales/sales-repository';
import * as purchaseRepository from '../purchases/purchase-repository';

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


export const handlePurchaseInventoryMovementController = async (req: Request, res: Response) => {
  try {
    const purchaseId = Number(req.params.id);

    const oldPurchase = await purchaseRepository.getPurchaseByIdQuery(purchaseId);
    if (!oldPurchase) {
      return res.status(404).json({error: 'Compra não encontrada.'});
    }

    const newPurchaseData = req.body;

    const updatedPurchase = await purchaseRepository.updatePurchaseById(purchaseId, newPurchaseData);
    const httpResponse = await purchaseRepository.updatePurchaseById(oldPurchase, updatedPurchase)
    return res.status(httpResponse.statusCode).json(httpResponse.body);

  } catch (err) {
    console.error(err);
    return res.status(500).json({error: 'Erro interno do servidor ao processar movimentação de estoque à partir da compra.'});
  }
};

export const handleSaleInventoryMovementController = async (req: Request, res: Response) => {
  try {
    const saleId = Number(req.params.id);
    const oldSale = await salesRepository.getSaleByIdQuery(saleId);
    if (!oldSale) {
      return res.status(404).json({error: 'Venda não encontrada.'});
    }
    
    const newSaleData = req.body;
    const updatedSale = await salesRepository.updateSaleById(saleId, newSaleData);
    const httpResponse = await salesRepository.updateSaleById(oldSale, updatedSale);
    return res.status(httpResponse.statusCode).json(httpResponse.body);

  } catch (err) {
    console.error(err);
    return res.status(500).json({error: 'Erro interno do servidor ao processar movimentação de estoque à partir da venda.'})
  }
}

