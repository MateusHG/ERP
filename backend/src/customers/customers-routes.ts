import { Router } from "express";
import { deleteCustomerById, getCustomers, getCustomersById, patchCustomerById, postCustomer } from "../customers/customers-controller";

const customerRouter = Router();

customerRouter.get("/", getCustomers);
customerRouter.get("/:id", getCustomersById);

customerRouter.post("/", postCustomer);

customerRouter.patch("/:id", patchCustomerById);

customerRouter.delete("/:id", deleteCustomerById);


export default customerRouter;