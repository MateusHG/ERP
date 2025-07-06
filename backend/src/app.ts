import express, {json} from "express";
import cors from "cors";
import suppliersRouter from "./routes/suppliers-routes";
import productsRouter from "./routes/products-routes";
import customerRouter from "./routes/customers-routes";
import purchaseRouter from "./routes/purchase-routes";
import purchaseItemRouter from "./routes/purchase-item-routes";
import salesRouter from "./routes/sales-routes";
import saleItemRouter from "./routes/sale-item-routes";

function createApp() {
const app = express();

app.use(cors());

app.use(json());
app.use("/api/produtos", productsRouter);
app.use("/api/fornecedores", suppliersRouter);
app.use("/api/clientes", customerRouter);
app.use("/api/compras", purchaseRouter);
app.use("/api/compra-itens", purchaseItemRouter);
app.use("/api/vendas", salesRouter);
app.use("/api/venda-itens", saleItemRouter);

  return app;
}

export default createApp;