import { Router } from "express"
import { getProducts, getProductsById, postProduct, deleteProductById, patchProductById } from "../products/products-controller";

const productsRouter = Router();

productsRouter.get("/", getProducts);
productsRouter.get("/:id", getProductsById);

productsRouter.post("/", postProduct);

productsRouter.delete("/:id", deleteProductById);

//Método PATCH, não haverá PUT, já que uma vez que cadastrado o produto não faz sentido o usuário querer mudar todos os campos de uma vez só.
productsRouter.patch("/:id", patchProductById);



export default productsRouter;