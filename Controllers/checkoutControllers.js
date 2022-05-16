
import chalk from "chalk";
import { ObjectId } from "mongodb";
import db from "./../db.js"

export async function postCheckout(req, res) {
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
}