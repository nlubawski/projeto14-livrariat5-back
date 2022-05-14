import express, { json } from "express";
import dotenv from "dotenv";
import chalk from "chalk";
import { MongoClient, ObjectId } from "mongodb";
import { v4 as uuid } from 'uuid';
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
  console.log("erro", error);
}

app.post("/cadastrar", async (req, res) => {

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
});

app.post("/login", async (req, res) => {

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
    console.log("erro", error);
  }
});

app.get("/products/:id", async (req, res) => {
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
})

app.post("/carrinho", async (req, res) => {
  const { title, author, price } = req.body;
  const livroCarrinho = {
    title,
    author,
    price
  }
  try {
    await db.collection("carrinho").insertOne(livroCarrinho);
    console.log(chalk.bold.blue("Produto salvo no carrinho"));
    res.send("Livro salvo no carrinho").status(201);
  }
  catch (error) {
    console.log("Erro ao enviar o produto pro carrinho");
    console.log("erro", error);
  }
});

/* Talvez trocar a rota, pois depois que o carrinho passar pra frente as informações
o checkout pode criar um novo banco */

app.get("/carrinho", async (req,res) => {
  // const {id} = req.params;
  // Receber por params o id do usuário para mostrar apenas seus livros
  try {
    // Aqui trocar depois pela coleção do carrinho
    const livros = await db.collection("carrinho").find().toArray();
    res.send(livros).status(200);
  }
  catch (error) {
    console.error(error);
    res.status(500).send(chalk.red.bold("Falha na remoção do endereço"))
  }
})

app.delete("/carrinho/:id", async (req, res) => {
  const {id} = req.params;
  try {
    await db.collection("carrinho").deleteOne({ _id: new ObjectId(id) })
    res.send("Livro deletado com sucesso do carrinho").status(200);
  }
  catch (error) {
    console.error(error);
    res.status(500).send(chalk.red.bold("Falha na remoção do endereço"))
  }
})

app.get("/carrinho", async (req,res) => {
  try {
    const carrinho = await db.collection("carrinho").find().toArray();
    console.log(chalk.bold.blue("Produtos achados no carrinho"));
    res.send(carrinho).status(201);
  }
  catch (error) {
    console.log("Erro no get/carrinho");
    console.log("erro",error);
  }
});

app.post("/finalizar", async (req, res) => {
  const {authorization} = req.headers;
  const token = authorization?.replace("Bearer", "").trim();
  const {id} = req.body;
    
  if(!token || token === null) {
    alert("Faça Login ou Cadastre-se!")
  }

  try {
    const session = await db.collection("sessions").findOne({ token });
    if (!session) return res.sendStatus(401);
    else console.log("Passou na segunda validação")

    const cliente = await db.collection("clientes").findOne({id});
    if(!cliente) return res.status(401).send("Cliente não encontrado");   
    console.log(cliente)

    const clienteTESTE = await db.collection("clientes").findOne({_id: session.clienteId});
    const livros = await db.collection("carrinho").find().toArray();
    const {name, email, _id } = {clienteTESTE};
    await db.collection("finalizadas").insertOne({
      name, 
      email,
      cliente,
      livros,      
    })
    return res.sendStatus(201);
    } catch (error) {
      console.log("Erro ao tentar obter usuário através da sessão");
      console.log(error);
      return res.sendStatus(500);
    }

  })

app.get("/checkout", async (req, res) => {
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
});

app.post("/address", async (req,res) => {
  const { destinatario, rua, bairro, cep } = req.body;
  try {
    await db.collection("enderecos").insertOne(req.body);
    console.log(chalk.bold.blue("Endereço salvo no banco"));
    res.send("Endereço salvo no banco").status(201);
  }
  catch (error) {
    console.log("Erro ao enviar o produto pro carrinho");
    console.log("erro", error);
  }
})

app.get("/address", async (req,res) => {
  const { authorization, id } = req.headers;
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
    else console.log("Passou na terceira validação");

    console.log(id);

    const endereços = await db.collection("enderecos").find({id: id}).toArray();
    res.send(endereços).status(200);
  }

  catch (error) {
    console.error(error);
    res.status(500).send(chalk.red.bold("Falha na obtenção dos endereços"))
  }
  
})

app.delete("/address/:id", async (req,res) => {
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

})

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Servidor ok na porta ${port}`)
})