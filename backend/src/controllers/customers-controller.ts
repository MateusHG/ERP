import { Request, Response } from "express";
import { createCustomerService, deleteCustomerByIdService, getCustomerByIdService, getCustomersService, updateCustomerByIdService } from "../services/customers-service";

export const getCustomers = async (req: Request, res: Response) => {
  const httpResponse = await getCustomersService();
  res.status(httpResponse.statusCode).json(httpResponse.body);
};

export const getCustomersById = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const httpResponse = await getCustomerByIdService(id);
  res.status(httpResponse.statusCode).json(httpResponse.body);
};

export const postCustomer = async (req: Request, res: Response) => {
  const insertedCustomer = req.body;
  const httpResponse = await createCustomerService(insertedCustomer);
  res.status(httpResponse.statusCode).json(httpResponse.body);
};

export const patchCustomerById = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const data = req.body;
  const httpResponse = await updateCustomerByIdService(id, data);
  res.status(httpResponse.statusCode).json(httpResponse.body);
};

export const deleteCustomerById = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const httpResponse = await deleteCustomerByIdService(id);
  res.status(httpResponse.statusCode).json(httpResponse.body);
};