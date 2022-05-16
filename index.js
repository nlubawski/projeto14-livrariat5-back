import express, { json } from "express";
import dotenv from "dotenv";
import cors from "cors";
import productsRouter from "./Routes/productsRouters.js"
import authRouters from "./Routes/authRouters.js";
import carrinhoRouters from "./Routes/carrinhoRouters.js";
import adressRouters from "./Routes/adressRouters.js";
import checkoutRouters from "./Routes/checkoutRouters.js"

const app = express();
app.use(cors());
app.use(json());
dotenv.config();

app.use(productsRouter)
app.use(authRouters)
app.use(carrinhoRouters)
app.use(adressRouters)
app.use(checkoutRouters)

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Servidor ok na porta ${port}`)
})