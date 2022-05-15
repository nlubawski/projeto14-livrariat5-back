import db from "./../db.js"
import { ObjectId } from "mongodb";


export async function getProducts(req, res) {
    try {
        // Comandos usados para criar o banco de dados de livros
        // livros.forEach(livro => {
        //   db.collection("livros").insertOne(livro);
        //   console.log("Salvou o livro no banco");
        // })
        // res.send("Livros salvos no banco").status(201);
        const produtos = await db.collection("livros").find().toArray();
        res.send(produtos).status(201);
      }
      catch (error) {
        console.log("Erro ao obter os produtos");
        console.log("erro", error);
      }
}

export async function getProductsId(req, res) {
    const { id } = req.params;
    try {
      const procuraProduto = await db.collection("livros").findOne({ _id: new ObjectId(id) });
      if (!procuraProduto) return res.sendStatus(401);
      else res.send(procuraProduto).status(200);
    }
    catch (error) {
      console.log("Erro ao obter um produto específico");
      console.log("erro", error);
    }
}