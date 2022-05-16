import express from "express";
import {postCadastrar, postLogin} from "./../Controllers/authControllers.js"

const authRouters = express.Router();

authRouters.post("/login", postLogin);

authRouters.post("/cadastrar", postCadastrar);


export default authRouters