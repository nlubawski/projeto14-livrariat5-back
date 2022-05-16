import express from "express";
import {postCheckout} from "./../Controllers/checkoutControllers.js"

const checkoutRouters = express.Router();

checkoutRouters.post("/checkout", postCheckout);

export default checkoutRouters