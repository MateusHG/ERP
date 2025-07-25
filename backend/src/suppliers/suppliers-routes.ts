import { Router } from "express";
import { getSupplierById, getSuppliers, postSupplier, deleteSupplierById, patchSupplierById } from "../suppliers/suppliers-controller";
import { authenticate } from "../auth/auth-middleware";

const suppliersRouter = Router();

suppliersRouter.get("/", authenticate, getSuppliers);
suppliersRouter.get("/:id", authenticate, getSupplierById);

suppliersRouter.post("/", authenticate, postSupplier);

suppliersRouter.patch("/:id", authenticate, patchSupplierById);

suppliersRouter.delete("/:id", authenticate ,deleteSupplierById);

export default suppliersRouter;