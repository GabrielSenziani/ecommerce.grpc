import { readFile, readdir } from "fs/promises";
import { criaTabelaDeControle } from "./schemaMigration.js";
import { DatabaseError } from "../errors/errors.js";
import path from "path";

export async function iniciarMigration(db, caminhoDasMigrations) {
    criaTabelaDeControle(db)
    try {
      const todosOsArquivos = await readdir(caminhoDasMigrations)

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
        const caminhoCompleto = path.join(caminhoDasMigrations, nomeArquivo)
        const sql = await readFile(caminhoCompleto, "utf-8")

        db.exec(sql)

        insereHistorico.run(nomeArquivo)
    }
    console.log("Processo de migrations finalizada com sucesso")
     

    } catch (erro) {
     throw new DatabaseError("Erro ao executar migrations", erro)
    }
}