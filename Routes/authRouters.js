import express from "express";
import { MongoClient, ObjectId } from "mongodb";
import joi from "joi";
import {postCadastrar, postLogin} from "./../Controllers/authControllers.js"
import db from "./../db.js"
import bcrypt from "bcrypt";
import { v4 as uuid } from 'uuid';

const authRouters = express.Router();

authRouters.post("/login", postLogin);

authRouters.post("/cadastrar", postCadastrar);


export default authRouters