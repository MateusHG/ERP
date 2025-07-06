import { Request, Response } from "express";
import { createProductService, deleteProductsByIdService, getProductsByIdService, getProductsService, updateProductByIdService } from "../services/products-service";

// GET
export const getProducts = async (req: Request, res: Response) => {
  const httpResponse = await getProductsService();
  res.status(httpResponse.statusCode).json(httpResponse.body);
};

//GET pelo ID
export const getProductsById = async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  //Verifica se o ID enviado é um número, se tentar mandar letra retorna a mensagem de erro.
  if (isNaN(id)) {
    return res.status(400).json({ erro: 'ID inválido.'})
  }

  const httpResponse = await getProductsByIdService(id);
  res.status(httpResponse.statusCode).json(httpResponse.body);
};

// POST
export const postProduct = async (req: Request, res: Response) => {
  const product = req.body;
  const httpResponse = await createProductService(product);
  res.status(httpResponse.statusCode).json(httpResponse.body);
};

// DELETE pelo ID(sempre).
export const deleteProductById = async (req: Request, res: Response) => {
  const id = Number(req.params.id)
  const httpResponse = await deleteProductsByIdService(id);
  res.status(httpResponse.statusCode).json(httpResponse.body);
};

export const patchProductById = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const data = req.body;

  if (isNaN(id)) {
    return res.status(400).json({erro: 'ID Inválido.'});
  }

  const httpResponse = await updateProductByIdService(id, data);
  res.status(httpResponse.statusCode).json(httpResponse.body);
};