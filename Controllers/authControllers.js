import joi from "joi";
import db from "./../db.js"
import bcrypt from "bcrypt";
import { v4 as uuid } from 'uuid';

export async function postLogin(req, res) {
  const { email, password } = req.body;
  const loginSchema = joi.object({
    email: joi.string().email().required(),
    password: joi.string().required()
  })

  try {
    await loginSchema.validateAsync(
      {
        email,
        password
      }, { abortEarly: false });

  } catch (error) {
    res.status(422).send("deu erro");
    //return;
  }

  try {
    const cliente = await db.collection("clientes").findOne({ email: email })
    if (!cliente) return res.sendStatus(404);
    if (cliente && bcrypt.compareSync(password, cliente.password)) {
      const token = uuid();
      await db.collection("sessions").insertOne({ token, clienteId: cliente._id });
      return res.send({ token, name: cliente.name, clienteId:cliente._id });
    }
    return res.sendStatus(404);

  }
  catch (error) {
    console.log("Erro, cliente nao encontrado");
    console.log(error);
    return res.sendStatus(500);
  }
}

export async function postCadastrar(req, res) {
    const { name, email, password, confirmPassword } = req.body;
  
    const cadastrarSchema = joi.object({
      name: joi.string().required(),
      email: joi.string().email().required(),
      password: joi.string().required(),
      confirmPassword: joi.ref('password')
    })
  
    try {
      await cadastrarSchema.validateAsync({
        name,
        email,
        password,
        confirmPassword
      }, { abortEarly: false });
  
    } catch (error) {
      res.status(422).send("deu erro");
      //return;
    }
  
    try {
      const cliente = await db.collection("clientes").findOne({ email })
      if (cliente) {
        console.log("ja cadastrado")
        res.sendStatus(400);
        return;
      }
    } catch (error) {
  
    }
  
    try {
      const SALT = 10;
      const passwordHash = bcrypt.hashSync(password, SALT);
  
      await db.collection("clientes").insertOne({
        name,
        email,
        password: passwordHash
      });
      return res.sendStatus(201);
  
    } catch (error) {
      console.log("Erro ao criar cliente");
      console.log(error);
      return res.sendStatus(500);
    }  
}