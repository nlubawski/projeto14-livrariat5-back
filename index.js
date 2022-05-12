import express, {json} from "express";
import dotenv from "dotenv";
import chalk from "chalk";
import { MongoClient, ObjectId } from "mongodb";
import joi from "joi";
import cors from "cors";
import bcrypt from "bcrypt";

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
      confirmPassword}, {abortEarly: false});
      
  } catch (error){
    res.status(422).send("deu erro");
    //return;
  }

  try {
    const cliente = await db.collection("clientes").findOne({email})
    if (cliente){
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
});

app.post("/login", async (req, res) => {
  
  const {email, password} = req.body;

  const loginSchema = joi.object({
    email: joi.string().email().required(),
    password: joi.string().required()
  })

  try {
    await loginSchema.validateAsync(
    {
      email,
      password
    }, {abortEarly: false});
      
  } catch (error){
    res.status(422).send("deu erro");
    //return;
  }

  try {
    const cliente = await db.collection("clientes").findOne({email: email})
    if(!cliente) return res.sendStatus(404);
    if(cliente && bcrypt.compareSync(password, cliente.password)) {
      const token = uuid();
      await db.collection("sessions").insertOne({token, clienteId: cliente._id});
      return res.send({token, name: cliente.name});
    }
    return res.sendStatus(404);         

  } 
  catch (error) {
    console.log("Erro, cliente nao encontrado");
    console.log(error);
    return res.sendStatus(500);
  }
});

// const livros = [
//   {title: "Os segredos da mente milionária", author:"T.Harv Eker",  price: "R$39,90", id: 1, 
//   description:`Se as suas finanças andam na corda bamba, talvez esteja na hora de você refletir sobre o que T. Harv Eker chama de "o seu modelo de dinheiro" – um conjunto de crenças que cada um de nós alimenta desde a infância e que molda o nosso destino financeiro, quase sempre nos levando para uma situação difícil. Neste livro, Eker mostra como substituir uma mentalidade destrutiva – que você talvez nem perceba que tem – pelos "arquivos de riqueza", 17 modos de pensar e agir que distinguem os ricos das demais pessoas.`,
//   image: "",
// },
// ];


app.get("/products", async (req, res) => {
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
    console.log("erro",error);
  }
});

app.get("/products/:id", async (req, res) => {
  // O front end precisa mandar esse id corretamente
  // A ideia dessa página é mostrar os produtos com mais detalhes e o preço
  // Nessa rota também vai ter a opção de add no carrinho
  const {id} = req.params;
  try {
    const procuraProduto = await db.collection("livros").findOne({_id: new ObjectId(id)});
    if (!procuraProduto) return res.sendStatus(401);
    else res.send(procuraProduto).status(200);
  }
  catch (error) {
    console.log("Erro ao obter um produto específico");
    console.log("erro",error);
  }
})

app.post("/carrinho", async (req,res) => {
  const {title, price, id} = req.body;
  const produtoEscolhido = {
    title,
    price,
    id
  }
  try {
    await db.collection("carrinho").insertOne(produtoEscolhido);
    console.log(chalk.bold.blue("Produto salvo no carrinho"));
  }
  catch (error) {
    console.log("Erro ao enviar o produto pro carrinho");
    console.log("erro",error);
  }
  res.sendStatus(201);
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Servidor ok na porta ${port}`)
})