import { Request, Response } from "express";
import { createSupplierService, deleteSupplierByIdService, getSupplierByIdService, getSuppliersService, updateSupplierByIdService } from "../suppliers/suppliers-service";

export const getSuppliers = async (req: Request, res: Response) => {
  const filters = {
    id: typeof req.query.id === 'string' ? Number(req.query.id): undefined,
    nome_fantasia: req.query.nome_fantasia as string,
    razao_social: req.query.razao_social as string,
    cnpj: req.query.cnpj as string,
    email: req.query.email as string,
    status: req.query.status as string,
    limit: req.query.limit ? Number(req.query.limit): undefined,
    orderBy: req.query.orderBy as string | undefined,
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