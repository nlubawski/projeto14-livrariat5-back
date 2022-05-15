import express from "express";
// import { MongoClient, ObjectId } from "mongodb";
import {getProducts, getProductsId} from "./../Controllers/productsControllers.js"

const productsRouter = express.Router();

productsRouter.get("/products", getProducts);

productsRouter.get("/products/:id", getProductsId);

export default productsRouter