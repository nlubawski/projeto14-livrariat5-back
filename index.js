import express from "express";
import dotenv from "dotenv";
import {MongoClient} from "mongodb"

const app = express();
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

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Servidor ok na porta ${port}`)
})