import express from "express";
import {postAdress, getAdress, deleteAdress} from "./../Controllers/adressControllers.js"

const addressRouters = express.Router();

addressRouters.post("/address", postAdress);
addressRouters.get("/address", getAdress);
addressRouters.delete("/address/:id", deleteAdress);

export default addressRouters