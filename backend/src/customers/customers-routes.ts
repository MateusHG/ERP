import { Router } from "express";
import { deleteCustomerById, getCustomers, getCustomersById, patchCustomerById, postCustomer } from "../customers/customers-controller";
import authenticate from "../auth/auth-middleware";

const customerRouter = Router();

//Usa o middleware de autenticação em todas as rotas.
customerRouter.use(authenticate);

customerRouter.get("/", getCustomers);
customerRouter.get("/:id", getCustomersById);

customerRouter.post("/", postCustomer);

customerRouter.patch("/:id", patchCustomerById);

customerRouter.delete("/:id", deleteCustomerById);


export default customerRouter;