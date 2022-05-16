import chalk from "chalk";
import { ObjectId } from "mongodb";
import db from "./../db.js"

export async function getCheckout(req, res) {
  const { user } = res.locals
  try {
      return res.send(user).status(200);
  }
  catch (error) {
      console.error(error);
      res.status(500).send(chalk.red.bold("Falha no cadastro de usuário novo"))
  }
}

export async function postCheckout(req, res) {
  const {nome, email, address, payment, id} = req.body
  console.log(req.body);
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

    await db.collection("carrinho").deleteMany({id:id});
    // await db.collection("carrinho").deleteOne({ _id: new ObjectId(id) })

    res.send("post feito com sucesso").status(201);
    } catch (error) {
      console.log("Erro ao tentar obter usuário através da sessão");
      return res.sendStatus(500);
    }
}