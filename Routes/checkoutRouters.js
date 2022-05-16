import express from "express";
import {getCheckout, postCheckout} from "./../Controllers/checkoutControllers.js"
import { validarToken } from "./../Middlewares/validacoesMiddlewares.js";

const checkoutRouters = express.Router();

checkoutRouters.get("/checkout",validarToken, getCheckout);
checkoutRouters.post("/checkout", postCheckout);

export default checkoutRouters