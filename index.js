import express, { json } from "express";
import dotenv from "dotenv";
import chalk from "chalk";
import { MongoClient, ObjectId } from "mongodb";
import { v4 as uuid } from 'uuid';
import joi from "joi";
import cors from "cors";
import bcrypt from "bcrypt";
import db from "./db.js"
import productsRouter from "./Routes/productsRouters.js"
import authRouters from "./Routes/authRouters.js";
import carrinhoRouters from "./Routes/carrinhoRouters.js";
import adressRouters from "./Routes/adressRouters.js";

const app = express();
app.use(cors());
app.use(json());
dotenv.config();

app.use(productsRouter);
app.use(authRouters)
app.use(carrinhoRouters)
app.use(adressRouters)

app.get("/checkout", async (req, res) => {
  const { authorization } = req.headers;
  const token = authorization?.replace('Bearer', '').trim();
  // 1a validação: Verifica se o token é válido
  if (!token) return res.send("Token inexistente").status(401);
  else console.log("Passou na primeira validação");
  try {
    // 2a validação: Verifica se o token existe na coleção dos tokens
    const session = await db.collection("sessions").findOne({ token })
    if (!session) return res.sendStatus(401);
    else console.log("Passou na segunda validação")

    // 3a validação: Busca os dados do usuário associado ao token na coleção de informações
    const user = await db.collection("clientes").findOne({ _id: session.clienteId });
    if (!user) res.sendStatus(404);
    else {
      console.log("Passou na terceira validação");
      return res.send(user).status(200);
    }
    // const registro = await db.collection("clientes").find({ name: user.nome }).toArray();
  }

  catch (error) {
    console.error(error);
    res.status(500).send(chalk.red.bold("Falha na verificação do token"))
  }
});

app.post("/finalizar", async (req, res) => {
  const {authorization} = req.headers;
  const token = authorization?.replace("Bearer", "").trim();
  const {id} = req.body;
  console.log(token)  
  try {
    const session = await db.collection("sessions").findOne({ token });
    if (!session) return res.sendStatus(401);
    else console.log("Passou na segunda validação")

    const cliente = await db.collection("clientes").findOne({id});
    if(!cliente) return res.status(401).send("Cliente não encontrado");   
    console.log(cliente)

    const clienteTESTE = await db.collection("clientes").findOne({_id: session.clienteId});
    const livros = await db.collection("carrinho").find().toArray();
    const {name, email, _id } = {clienteTESTE};
    await db.collection("finalizadas").insertOne({
      name, 
      email,
      cliente,
      livros,      
    })
    return res.sendStatus(201);
    } catch (error) {
      console.log("Erro ao tentar obter usuário através da sessão");
      console.log(error);
      return res.sendStatus(500);
    }

  })

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Servidor ok na porta ${port}`)
})