import db from "./../db.js"
import { ObjectId } from "mongodb";

export async function getProducts(req, res) {

// const livros = [
//   {
//     title:"Harry Potter e a Câmara Secreta",
//     author:"J.K.Rowling",
//     price: "49,90",
//     description:"A trama de Harry Potter e a câmara secreta começa com o pequeno feiticeiro passando as férias na casa de seus tios trouxas (não-bruxos) e sendo, como sempre, muito maltratado. Seu aniversário de 12 anos é o pior de todos: ninguém o cumprimenta, não ganha nenhum presente, nada. O garoto, órfão de pai e mãe, chega a cantar Parabéns pra você</I> baixinho como se quisesse, ele próprio, provar que está vivo. Para piorar, os tios o prendem num quarto cercado de grades com direito a apenas uma refeição por dia — que ele divide com sua coruja, igualmente encarcerada numa gaiola. De repente, aparece um carro voador com amigos feiticeiros que livram Harry Potter dessa amargura.",
//     image:"data:image/jpeg;base64,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",
//     status: "Ficção"
//   },
//   {
//     title:"Harry Potter e o Prisioneiro de Azkaban",
//     author:"J.K.Rowling",
//     price: "39,90",
//     description: "Com muita ação, humor e magia, Harry Potter e o prisioneiro de Azkaban traz de volta o gigante atrapalhado Rúbeo Hagrid, o sábio diretor Alvo Dumbledore, a exigente professora de transformação Minerva MacGonagall e o novo mestre Lupin, que guarda grandes surpresas para Harry.",
//     image:"data:image/jpeg;base64,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",
//     status: "Ficção"
//   },
//   {
//     title:"Harry Potter e o Cálice de Fogo",
//     author:"J.K.Rowling",
//     price: "39,90",
//     description: "Tendo a seu lado os fiéis amigos Rony Weasley, Hermione Granger e agora também o seu padrinho, o bruxo Sirius Black, que fugiu de Azkaban no ano anterior, o menino feiticeiro tentará escapar mais uma vez das armadilhas de Lord Voldemort. Além de todos os desafios, há feitiços a serem aprendidos, poções a serem preparadas e aulas de Adivinhação, entre outras, a serem assistidas, Harry terá que lidar ainda com os problemas comuns da adolescência: amor, amizade, aceitação e rejeição.",
//     image:"",
//     status: "Ficção"
//   },
//   {
//     title:"Harry Potter e a Ordem da Fenix",
//     author:"J.K.Rowling",
//     price: "49,90",
//     description: "Harry vai enfrentar as investidas de Voldemort sem a proteção de Dumbledore, já que o diretor de Hogwarts é afastado da escola. E vai ser sem a ajuda de seu protetor que o jovem herói enfrentará descobertas sobre a personalidade controversa de seu pai, Tiago Potter, e a já anunciada morte de alguém muito próximo. O desaparecimento de um dos personagens centrais da trama é um dos trunfos de A Ordem da Fênix que, com isto, transforma-se no livro mais dramático da série até agora. Não foi por acaso que J. K. Rowling chegou às lágrimas escrevendo."
//     image:,
//     status: "Ficção"
//   },
//   {
//     title:"Harry Potter e o Enigma do Príncipe",
//     author:"J.K.Rowling",
//     price: "49,90",
//     description: "É o auge do verão, mas há uma inesperada névoa persistente através da vidraça. Harry Potter está esperando ansiosamente no seu quarto na casa dos Dursley pela visita do Professor Dumbledore em pessoa. Na última vez em que ele o viu foi durante um violento duelo contra Voldemort, e Harry não pode acreditar que o Dumbledore realmente irá aparecer em sua casa. Por que o Professor vai visitá-lo agora? Por que ele não pode esperar até Harry voltar para Hogwarts em algumas semanas? O sexto ano de Harry em Hogwarts começa de uma forma diferente, enquanto o mundo dos trouxas e o mundo da magia se entrelaçam..."
//     image:,
//     status: "Ficção"
//   },
//   {
//     title:"Harry Potter e as Relíquias da Morte",
//     author:"J.K.Rowling",
//     price: "49,90",
//     description: "Desta vez, Harry Potter foi encarregado de uma tarefa obscura, perigosa e aparentemente impossível: localizar e destruir os Horcruxes remanescentes de Voldemort. Potter nunca esteve tão sozinho nem teve de enfrentar um futuro tão sombrio. Porém, de algum modo, Harry deve encontrar dentro de si próprio a força para completar a tarefa que lhe foi dada: ele deve sair do ambiente acolhedor e seguro da Toca para seguir sem temor nem hesitação pelo inexorável caminho que lhe foi traçado... Na sétima e última parte da saga de Harry Potter, J.K. Rowling revela de modo espetacular respostas que há muito são esperadas. A encantadora e elaborada narrativa, com guinadas repentinas em compassos de tirar o fôlego, confirma a autora como uma grande contadora de histórias cujos livros serão lidos, re-lidos e lidos mais uma vez."
//     image:,
//     status: "Ficção"
//   },
  

// ]

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
}

export async function getProductsId(req, res) {
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
}