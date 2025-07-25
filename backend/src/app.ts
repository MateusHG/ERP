import express, {json} from "express";
import cors from "cors";
import cookieParser from 'cookie-parser';
import suppliersRouter from "./suppliers/suppliers-routes";
import productsRouter from "./products/products-routes";
import customerRouter from "./customers/customers-routes";
import purchaseRouter from "./purchases/purchase-routes";
import purchaseItemRouter from "./purchases/purchase-item-routes";
import salesRouter from "./sales/sales-routes";
import saleItemRouter from "./sales/sale-item-routes";
import authRouter from "./auth/auth-routes";
import dashboardsRoutes from "./dashboards/dashboard-routes";

function createApp() {
const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(json());
app.use(cookieParser()); // Habilita o uso de cookies nas rotas.
app.use('/api/auth', authRouter);
app.use('/api/dashboard', dashboardsRoutes);
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