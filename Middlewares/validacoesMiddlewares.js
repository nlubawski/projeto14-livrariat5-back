import db from "../db.js"
import chalk from "chalk";

export async function validarToken (req, res, next) {
    const { authorization } = req.headers;
    const token = authorization?.replace('Bearer', '').trim();
    if (!token) return res.send("Token inexistente").status(401);
    else console.log("Passou na primeira validação")
    
    try {
        const session = await db.collection("sessions").findOne({token})
        if (!session) return res.sendStatus(401); 
        else console.log("Passou na segunda validação")

     const user = await db.collection("clientes").findOne({ _id: session.clienteId });
     if (!user) res.sendStatus(404); 
     else console.log("Passou na terceira validação");

     res.locals.user = user;
     
        next();
    }
    catch (error) {
        console.error(error);
        res.status(500).send(chalk.red.bold("Falha na verificação do token"))
    }
}