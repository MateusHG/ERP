import * as inventoryRepository from "../inventory/inventory-repository";
import { badRequest, internalServerError, ok } from "../utils/http-helper";
import { InventoryMovementModel } from "./inventory-model";

export const listInventoryService = async() => {
  try {
    const inventoryList = await inventoryRepository.listInventoryItems();
    return ok(inventoryList);
  
  } catch (err) {
    console.error(err);
    return internalServerError('Erro ao listar estoque.')
  }
};

export const registerMovementService = async (mov: InventoryMovementModel) => {
  try {

    const quantidade = Math.floor(Number(mov.quantidade));
    if (isNaN(quantidade) || quantidade <= 0) {
      return badRequest(`Quantidade inválida: ${mov.quantidade}`);
    }
  
    const movement = await inventoryRepository.registerMovement({...mov, quantidade});
    return ok(movement);
  
  } catch (err: any) {
    if (err.message.includes('Saldo insuficiente')) {
      return badRequest(err.message);
    }
    console.error(err);
    return internalServerError('Erro ao registrar movimentação.')
  }
};

export const getBalanceService = async (produto_id: number) => {
  try {
    const balance = await inventoryRepository.getBalance(produto_id);
    return ok(balance);
  
  } catch (err) {
    console.error(err);
    return internalServerError('Erro ao verificar saldo.')
  }
};


export const listMovementsService = async (produto_id: number) => {
  try {
    const movements = await inventoryRepository.listMovements(produto_id);
    return ok(movements);
  
  } catch (err) {
    console.error(err);
    return internalServerError('Erro ao listar movimentações.')
  }
};
