import express from "express";
import {postCarrinho, getCarrinho, deleteItemCarrinho} from "./../Controllers/carrinhoControllers.js"

const carrinhoRouters = express.Router();

carrinhoRouters.post("/carrinho", postCarrinho);
carrinhoRouters.get("/carrinho", getCarrinho);
carrinhoRouters.delete("/carrinho/:id", deleteItemCarrinho);

export default carrinhoRouters
