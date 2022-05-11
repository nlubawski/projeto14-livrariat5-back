import express, {json} from "express";
import dotenv from "dotenv";
import chalk from "chalk";
import { MongoClient, ObjectId } from "mongodb";
import joi from "joi";
import cors from "cors";

const app = express();
app.use(json());
app.use(cors());
dotenv.config();

/* url do mongo para deploy
MONGO_URL=mongodb+srv://projetao:ljwIFCV7qVYWxuTU@livrariat5.d682m.mongodb.net/projetao14?retryWrites=true&w=majority
*/

let db = null;
const mongoClient = new MongoClient(process.env.MONGO_URL)

try {
  await mongoClient.connect();
    db = mongoClient.db(process.env.DATABASE);
    console.log("Sucesso ao conectar MongoDB")
} catch (error) {
    console.log("Erro ao conectar MongoDB");
    console.log("erro",error);
}

//aqui vai ser o post

const livros = [
  {titulo: "titulo1", imagem: "imagem1", preco: "preço1", id: 1},
  {titulo: "titulo2", imagem: "imagem2", preco: "preço2", id: 2},
  {titulo: "titulo3", imagem: "imagem3", preco: "preço3", id: 3},
  {titulo: "titulo4", imagem: "imagem4", preco: "preço4", id: 4},
  {titulo: "titulo5", imagem: "imagem5", preco: "preço5", id: 5},
];

// Comandos usados para criar o banco de dados de livros

  // try {
  //   livros.forEach(livro => {
  //     db.collection("livros").insertOne(livro);
  //     console.log("Salvou o livro no banco");
  //   })
  //   res.send("Livros salvos no banco").status(201);
  // }

app.get("/products", async (req, res) => {
  try {
    const produtos = await db.collection("livros").find().toArray();
    console.log(chalk.bold.green(produtos));
    res.send(produtos).status(201);
  }
  catch (error) {
    console.log("Erro ao obter os produtos");
    console.log("erro",error);
  }
});

app.get("/products/:id", async (req, res) => {
  // O front end precisa mandar esse id corretamente
  // A ideia dessa página é mostrar os produtos com mais detalhes e o preço
  // Nessa rota também vai ter a opção de add no carrinho
  const {id} = req.params;
  try {
    const procuraProduto = await db.collection("livros").findOne({_id: new ObjectId(id)});
    if (!procuraProduto) return res.sendStatus(401);
    else res.send(procuraProduto).status(200);
  }
  catch (error) {
    console.log("Erro ao obter um produto específico");
    console.log("erro",error);
  }
})

app.post("/carrinho", async (req,res) => {
  const {titulo, imagem, preco, id} = req.body;
  const produtoEscolhido = {
    titulo,
    imagem,
    preco,
    id
  }
  try {
    await db.collection("carrinho").insertOne(produtoEscolhido);
    console.log(chalk.bold.blue("Produto salvo no carrinho"));
  }
  catch (error) {
    console.log("Erro ao enviar o produto pro carrinho");
    console.log("erro",error);
  }
  res.sendStatus(201);
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Servidor ok na porta ${port}`)
})