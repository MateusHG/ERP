import { Request, Response } from "express";
import { createProductService, deleteProductsByIdService, getProductsByIdService, getProductsService, updateProductByIdService } from "../products/products-service";

// GET
export const getProducts = async (req: Request, res: Response) => {
  const filters = {
    id: typeof req.query.id === 'string' ? Number(req.query.id) : undefined,
    codigo: req.query.codigo as string,
    nome: req.query.nome as string,
    categoria: req.query.categoria as string,
    status: req.query.status as string,
  };

  const httpResponse = await getProductsService(filters);
  res.status(httpResponse.statusCode).json(httpResponse.body);
};

//GET pelo ID
export const getProductsById = async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  //Verifica se o ID enviado é um número, se tentar mandar letra retorna a mensagem de erro.
  if (isNaN(id)) {
    res.status(400).json({ erro: 'ID inválido.'});
    return;
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
    res.status(400).json({erro: 'ID Inválido.'});
  }

  const httpResponse = await updateProductByIdService(id, data);
  res.status(httpResponse.statusCode).json(httpResponse.body);
};