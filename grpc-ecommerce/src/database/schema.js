import { db } from "./connection.js";

db.pragma("foreign_keys = ON");

db.exec(`
    CREATE TABLE IF NOT EXISTS Estoque(
    ProdutoId INTEGER PRIMARY KEY AUTOINCREMENT,
    NomeDoProduto TEXT NOT NULL CHECK(NomeDoProduto != ''),
    QuantidadeDisponivel INTEGER NOT NULL CHECK(QuantidadeDisponivel >= 0)
    )
    `)

const insert = db.prepare(`
    INSERT INTO Estoque (NomeDoProduto, QuantidadeDisponivel)
    VALUES (?, ?)
    `)

insert.run("Teclado", 10)
insert.run("Mouse", 20)
insert.run("Fone GT3000", 30)