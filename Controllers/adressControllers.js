import chalk from "chalk";
import joi from "joi";
import { ObjectId } from "mongodb";
import db from "./../db.js";

export async function postAdress(req, res) {
  const addressSchema = joi.object({
    destinatario: joi.string().required(),
    rua: joi.string().required(),
    bairro: joi.string().required(),
    cep: joi.string().required(),
    id: joi.string().required(),
  })
  try {
    const endereço = req.body;
    const validação = addressSchema.validate(endereço); // Usar o abort Early
    if (validação.error) {
      console.log(chalk.bold.red(validação.error));
      return res.status(422).send("Todos os campos são obrigatórios");
    }
    await db.collection("enderecos").insertOne(endereço);
    res.send("Endereço salvo no banco").status(201);
  }
  catch (error) {
    console.log("erro", error);
  }
}

export async function getAdress(req, res) {
  const { id } = req.headers;
  try {
    const endereços = await db.collection("enderecos").find({ id: id }).toArray();
    res.send(endereços).status(200);
  }
  catch (error) {
    console.error(error);
    res.status(500).send(chalk.red.bold("Falha na obtenção dos endereços"))
  }
}

export async function deleteAdress(req, res) {
  const { id } = req.params;
  try {
    await db.collection("enderecos").deleteOne({ _id: new ObjectId(id) })
    res.send("Deletado com sucesso").status(200);
  }
  catch (error) {
    console.error(error);
    res.status(500).send(chalk.red.bold("Falha na remoção do endereço"))
  }
}