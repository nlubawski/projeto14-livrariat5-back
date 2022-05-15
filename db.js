import { MongoClient } from "mongodb";

import dotenv from "dotenv";
dotenv.config();

const DATABASE = process.env.DATABASE;
const MONGO_URL = process.env.MONGO_URL;

let db = null;
const mongoClient = new MongoClient(process.env.MONGO_URL)

try {
  await mongoClient.connect();
  db = mongoClient.db(process.env.DATABASE);
  console.log("Sucesso ao conectar MongoDB")
} catch (error) {
  console.log("Erro ao conectar MongoDB");
  console.log("erro", error);
}

export default db;
