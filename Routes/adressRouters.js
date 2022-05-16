import express from "express";
import {postAdress, getAdress, deleteAdress} from "./../Controllers/adressControllers.js"
import { validarToken } from "./../Middlewares/validacoesMiddlewares.js";

const addressRouters = express.Router();

addressRouters.post("/address", postAdress);
addressRouters.get("/address", validarToken, getAdress);
addressRouters.delete("/address/:id", deleteAdress);

export default addressRouters