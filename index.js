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

const app = express();
app.use(cors());
app.use(json());
dotenv.config();

app.use(productsRouter);

app.use(authRouters)

app.post("/carrinho", async (req, res) => {
  try {
    await db.collection("carrinho").insertOne(req.body);
    console.log(chalk.bold.blue("Produto salvo no carrinho"));
    res.send("Livro salvo no carrinho").status(201);
  }
  catch (error) {
    console.log("Erro ao enviar o produto pro carrinho");
    console.log("erro", error);
  }
});

app.get("/carrinho", async (req,res) => {
  const { authorization, id } = req.headers;
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
    }
    const livros = await db.collection("carrinho").find({ id: id }).toArray();
    res.send(livros).status(200);
  }

  // const {id} = req.params;
  // Receber por params o id do usuário para mostrar apenas seus livros
  // Aqui trocar depois pela coleção do carrinho

  catch (error) {
    console.error(error);
    res.status(500).send(chalk.red.bold("Falha na remoção do endereço"))
  }
})

app.delete("/carrinho/:id", async (req, res) => {
  const {id} = req.params;
  try {
    await db.collection("carrinho").deleteOne({ _id: new ObjectId(id) })
    res.send("Livro deletado com sucesso do carrinho").status(200);
  }
  catch (error) {
    console.error(error);
    res.status(500).send(chalk.red.bold("Falha na remoção do livro do carrinho"))
  }
})

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

app.post("/address", async (req,res) => {
  const { destinatario, rua, bairro, cep } = req.body;
  try {
    await db.collection("enderecos").insertOne(req.body);
    console.log(chalk.bold.blue("Endereço salvo no banco"));
    res.send("Endereço salvo no banco").status(201);
  }
  catch (error) {
    console.log("Erro ao enviar o produto pro carrinho");
    console.log("erro", error);
  }
})

app.get("/address", async (req,res) => {
  const { authorization, id } = req.headers;
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
    else console.log("Passou na terceira validação");

    console.log(id);

    const endereços = await db.collection("enderecos").find({id: id}).toArray();
    res.send(endereços).status(200);
  }

  catch (error) {
    console.error(error);
    res.status(500).send(chalk.red.bold("Falha na obtenção dos endereços"))
  }

})

app.delete("/address/:id", async (req,res) => {
  /* No front end, ele passa o id do endereço clicado pela rota, dai nessa parte do back
  ele recebe o id pelo req.params, e eu uso esse id pra deletar o item que eu quero
  do banco de dados.
  Pra deletar itens do carrinho é o mesmo princípio, vc precisa mandar pelo front
   o id gerado pelo mongodb pro seu app.delete. */
  const {id} = req.params;
  try {
    await db.collection("enderecos").deleteOne({ _id: new ObjectId(id) })
    res.send("Deletado com sucesso").status(200);
  }
  catch (error) {
    console.error(error);
    res.status(500).send(chalk.red.bold("Falha na remoção do endereço"))
  }

})

app.post("/finalizar", async (req, res) => {
  const {nome, email, address, payment, id} = req.body
  try {
    const livros = await db.collection("carrinho").find({ id: id }).toArray();
   
    const endereço = await db.collection("enderecos").find({ _id: new ObjectId(address)}).toArray();
    const pagamento = await db.collection("pagamentos").find({ id: payment }).toArray();

    await db.collection("finalizadas").insertOne({
      nome,
      email,
      destinatario: endereço[0].destinatario,
      rua: endereço[0].rua,
      bairro: endereço[0].bairro,
      cep: endereço[0].cep,
      pagamento: pagamento[0].opcao,
      livros,
    })

    res.send("post feito com sucesso").status(201);
    } catch (error) {
      console.log("Erro ao tentar obter usuário através da sessão");
      console.log(error);
      return res.sendStatus(500);
    }
  })

app.get("/finalizar", async (req,res) => {
  try {
    const ultimo = await db.collection("finalizadas").find({}).sort({_id:-1}).limit(1).toArray();
    res.send(ultimo).status(200);
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