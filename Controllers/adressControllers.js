import chalk from "chalk";
import { ObjectId } from "mongodb";
import db from "./../db.js"

export async function postAdress(req, res) {
    const { destinatario, rua, bairro, cep } = req.body;
    try {
      await db.collection("enderecos").insertOne(req.body);
      res.send("Endereço salvo no banco").status(201);
    }
    catch (error) {
      console.log("erro", error);
    }
  }

export async function getAdress(req, res) {
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
      const endereços = await db.collection("enderecos").find({id: id}).toArray();
      res.send(endereços).status(200);
    }
    catch (error) {
      console.error(error);
      res.status(500).send(chalk.red.bold("Falha na obtenção dos endereços"))
    } 
  }
  
export async function deleteAdress(req, res) {
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
  
  }