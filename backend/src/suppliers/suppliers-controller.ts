import { Request, Response } from "express";
import { createSupplierService, deleteSupplierByIdService, getSupplierByIdService, getSuppliersService, updateSupplierByIdService } from "../suppliers/suppliers-service";

export const getSuppliers = async (req: Request, res: Response) => {
  const filters = {
    id: typeof req.query.id === 'string' ? Number(req.query.id): undefined,
    nome: req.query.nome as string,
    categoria: req.query.categoria as string,
    status: req.query.status as string,
  };

  const httpResponse = await getSuppliersService(filters);
  res.status(httpResponse.statusCode).json(httpResponse.body);
};

export const getSupplierById = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const httpResponse = await getSupplierByIdService(id);
  res.status(httpResponse.statusCode).json(httpResponse.body);
};

export const postSupplier = async (req: Request, res: Response) => {
  const supplier = req.body
  const httpResponse = await createSupplierService(supplier);
  res.status(httpResponse.statusCode).json(httpResponse.body);
};

export const patchSupplierById = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const data = req.body;

  const httpResponse = await updateSupplierByIdService(id, data);
  res.status(httpResponse.statusCode).json(httpResponse.body);
};

export const deleteSupplierById = async (req: Request, res: Response) => {
  const id = Number(req.params.id)
  const httpResponse = await deleteSupplierByIdService(id);
  res.status(httpResponse.statusCode).json(httpResponse.body);
};