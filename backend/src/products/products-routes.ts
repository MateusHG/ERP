import { Router } from "express"
import { getProducts, getProductsById, postProduct, deleteProductById, patchProductById } from "../products/products-controller";
import { authenticate } from "../auth/auth-middleware";

const productsRouter = Router();

productsRouter.get("/", authenticate, getProducts);
productsRouter.get("/:id", authenticate, getProductsById);

productsRouter.post("/", authenticate, postProduct);

//Método PATCH, não haverá PUT, já que uma vez que cadastrado o produto não faz sentido o usuário querer mudar todos os campos de uma vez só.
productsRouter.patch("/:id", authenticate ,patchProductById);

productsRouter.delete("/:id", authenticate, deleteProductById);

export default productsRouter;