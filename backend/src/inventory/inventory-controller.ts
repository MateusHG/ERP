import { Request, Response } from 'express';
import { listInventoryService, listMovementsService, registerInventoryAdjustmentService } from "./inventory-service";
import * as salesRepository from '../sales/sales-repository';
import * as purchaseRepository from '../purchases/purchase-repository';
import { StockInsufficientError } from './inventory-model';

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

// Busca o histórico de movimentações de um determinado produto.
export const listMovementsController = async (req: Request, res: Response) => {
  const productId = Number(req.params.id)
  const httpResponse = await listMovementsService(productId);
  res.status(httpResponse.statusCode).json(httpResponse.body);
};


export const registerInventoryAdjustmentController = async (req: Request, res: Response) => {
  try{
    const userId = req.user!.id;

    const { ajuste, items } = req.body;

    const httpResponse = await registerInventoryAdjustmentService(ajuste, items, userId);
    
    res.status(httpResponse.statusCode).json(httpResponse.body);
  
  } catch (err: any) {
    console.error(err);

    if (err instanceof StockInsufficientError) {
      res.status(400).json({
        message: err.message,
        inconsistencies: err.inconsistencies,
      });
    }

    res.status(500).json({ error: "Erro interno no servidor ao registrar ajuste de estoque." });
  }
};


export const handlePurchaseInventoryMovementController = async (req: Request, res: Response) => {
  try {
    const purchaseId = Number(req.params.id);
    const userId = req.user!.id;

    const oldPurchase = await purchaseRepository.getPurchaseByIdQuery(undefined, purchaseId);
    if (!oldPurchase) {
      res.status(404).json({error: 'Compra não encontrada.'});
    }

    const newPurchaseData = req.body;

    const updatedPurchase = await purchaseRepository.updatePurchaseById(purchaseId, newPurchaseData, undefined, userId);
    
    const httpResponse = await purchaseRepository.updatePurchaseById(oldPurchase, updatedPurchase, undefined, userId);

    res.status(httpResponse.statusCode).json(httpResponse.body);

  } catch (err: any) {
    console.error(err);

    // Repassa pra o front-end o erro de estoque negativo.
    if (err instanceof StockInsufficientError) {
      res.status(400).json({
        message: err.message,
        inconsistencies: err.inconsistencies,
      });
    }

    res.status(500).json({error: 'Erro interno do servidor ao processar movimentação de estoque à partir da compra.'});
  }
};

export const handleSaleInventoryMovementController = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    
    const saleId = Number(req.params.id);

    const oldSale = await salesRepository.getSaleByIdQuery(undefined, saleId);
    if (!oldSale) {
      res.status(404).json({error: 'Venda não encontrada.'});
    }
    
    const newSaleData = req.body;

    const updatedSale = await salesRepository.updateSaleById(saleId, newSaleData, undefined, userId);

    const httpResponse = await salesRepository.updateSaleById(oldSale, updatedSale, undefined, userId);

    res.status(httpResponse.statusCode).json(httpResponse.body);

  } catch (err: any) {
    console.error(err);

    // Repassa para o front o erro de estoque negativo.
    if (err instanceof StockInsufficientError) {
        res.status(400).json({
        message: err.message,
        inconsistencies: err.inconsistencies,
      });
    }
    
    res.status(500).json({error: 'Erro interno do servidor ao processar movimentação de estoque à partir da venda.'})
  }
}

