import chalk from "chalk";
import { ObjectId } from "mongodb";
import db from "./../db.js"

export async function postCarrinho(req, res) {
  try {
      await db.collection("carrinho").insertOne(req.body);
      res.send("Livro salvo no carrinho").status(201);
    }
    catch (error) {
      console.log("erro", error);
    }
}

export async function getCarrinho(req, res) {
    const { id } = req.headers;
    try {
      const livros = await db.collection("carrinho").find({id: id}).toArray();
      res.send(livros).status(200);
    }
    catch (error) {
      console.error(error);
      res.status(500).send(chalk.red.bold("Falha em mostrar o carrinho"))
    }
  }

export async function deleteItemCarrinho(req, res) {
  const {id} = req.params;
  try {
    await db.collection("carrinho").deleteOne({ _id: new ObjectId(id) })
    res.send("Livro deletado com sucesso do carrinho").status(200);
  }
  catch (error) {
    console.error(error);
    res.status(500).send(chalk.red.bold("Falha na remoção do livro do carrinho"))
  }
}