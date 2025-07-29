import { Router } from "express";
import { getSupplierById, getSuppliers, postSupplier, deleteSupplierById, patchSupplierById } from "../suppliers/suppliers-controller";
import { authenticate } from "../auth/auth-middleware";

const suppliersRouter = Router();

//Protege todas as rotas com o middleware.
suppliersRouter.use(authenticate);

suppliersRouter.get("/", getSuppliers);
suppliersRouter.get("/:id", getSupplierById);

suppliersRouter.post("/", postSupplier);

suppliersRouter.patch("/:id", patchSupplierById);

suppliersRouter.delete("/:id" ,deleteSupplierById);

export default suppliersRouter;