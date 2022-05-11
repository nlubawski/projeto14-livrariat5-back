import express, {json} from "express";
import dotenv from "dotenv";
import {MongoClient} from "mongodb"
import joi from "joi";
import cors from "cors";

const app = express();
app.use(cors());
app.use(json());
dotenv.config();


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

app.post("/cadastrar", async (req, res) => {
  
  const {name, email, password, confirmPassword} = req.body;

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
      confirmPassword})
    console.log("tamo ai")
    res.send("OK")
    return;
    
  } catch (error) {
    res.status(422).send("deu erro", name, email, password, confirmPassword);
    return;
  }
  })

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Servidor ok na porta ${port}`)
})