import grpc from "@grpc/grpc-js";
import path from "path";
import { fileURLToPath } from "url";
import { db } from "./database/connection.js";
import { getGrpcService } from "./helpers/encontraPacote.js";
import { verificaEstoqueHandler } from "./handlers/estoqueHandler.js";
import { iniciarMigration } from "./migrations/executaMigration.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const servidor = new grpc.Server();

const estoqueService = getGrpcService(
  "../../proto/estoque.proto",
  "EstoqueService",
);

async function iniciarServidor() {
  try {
    console.log("iniciando verificação de migrations...");

    const pastaMigrations = path.join(__dirname, "migrations");

    await iniciarMigration(db, pastaMigrations);

    servidor.addService(estoqueService, {
      VerificaEstoque: verificaEstoqueHandler,
    });

    servidor.bindAsync(
      "0.0.0.0:50051",
      grpc.ServerCredentials.createInsecure(),
      (erro) => {
        if (erro) {
          console.error(`Erro ao subir o servidor: ${erro.message}`);
          process.exit(1);
        }
        console.log("Servidor de pé na porta 50051.");
      },
    );
  } catch (erro) {
    console.error(
      "Não foi possível iniciar o servidor devido a um erro",
      erro,
    );
    process.exit(1);
  }
}

iniciarServidor();
