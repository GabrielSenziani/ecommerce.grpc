import { readFile, readdir } from "fs/promises";
import { db } from "../database/connection.js";
import { criaTabelaDeControle } from "./schemaMigration.js";
import path from "path";
import { fileURLToPath } from 'url';

async function iniciarMigration() {
    criaTabelaDeControle()
    try {
      const __dirname = path.dirname(fileURLToPath(import.meta.url));
      const pastaMigrations = __dirname

      const todosOsArquivos = await readdir(pastaMigrations)

      const arquivosSqlOrdenados = todosOsArquivos
      .filter(nome => nome.endsWith(".sql"))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))

      const busca = db.prepare(`
        SELECT *
        FROM TabelaMigrations
        WHERE Nome = ?
        `)
     
     const insereHistorico = db.prepare(`
            INSERT INTO TabelaMigrations (Nome)
            VALUES (?)    
        `);
    for (const nomeArquivo of arquivosSqlOrdenados) {

        const migrationJaExecutada = busca.get(nomeArquivo)

        if(migrationJaExecutada) {
         console.log(`Pulando... A migration "${nomeArquivo}", já foi executada`)
         continue;
        }
        const caminhoCompleto = path.join(pastaMigrations, nomeArquivo)
        const sql = await readFile(caminhoCompleto, "utf-8")

        db.exec(sql)

        insereHistorico.run(nomeArquivo)
    }
    console.log("Processo de migrations finalizada com sucesso")
     

    } catch (erro) {
     console.error("Erro ao executar a migration", erro.message)
    }
}

iniciarMigration();