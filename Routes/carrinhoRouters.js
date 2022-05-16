import express from "express";
import {postCarrinho, getCarrinho, deleteItemCarrinho} from "./../Controllers/carrinhoControllers.js"
import { validarToken } from "./../Middlewares/validacoesMiddlewares.js";

const carrinhoRouters = express.Router();

carrinhoRouters.post("/carrinho", postCarrinho);
carrinhoRouters.get("/carrinho", validarToken, getCarrinho);
carrinhoRouters.delete("/carrinho/:id", deleteItemCarrinho);

export default carrinhoRouters
