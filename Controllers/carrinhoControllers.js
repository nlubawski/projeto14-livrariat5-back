
import chalk from "chalk";
import { MongoClient, ObjectId } from "mongodb";
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
    const { authorization, id } = req.headers;
    const token = authorization?.replace('Bearer', '').trim();
    // 1a validação: Verifica se o token é válido
    if (!token) return res.send("Token inexistente").status(401);
    try {
      // 2a validação: Verifica se o token existe na coleção dos tokens
      const session = await db.collection("sessions").findOne({ token })
      if (!session) return res.sendStatus(401);
      // 3a validação: Busca os dados do usuário associado ao token na coleção de informações
      const user = await db.collection("clientes").findOne({ _id: session.clienteId });
      if (!user) res.sendStatus(404);
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