import { Router } from "express";
import { getSupplierById, getSuppliers, postSupplier, deleteSupplierById, patchSupplierById } from "../controllers/suppliers-controller";

const suppliersRouter = Router();

suppliersRouter.get("/", getSuppliers);
suppliersRouter.get("/:id", getSupplierById);

suppliersRouter.post("/", postSupplier);

suppliersRouter.patch("/:id", patchSupplierById);

suppliersRouter.delete("/:id", deleteSupplierById);

export default suppliersRouter;