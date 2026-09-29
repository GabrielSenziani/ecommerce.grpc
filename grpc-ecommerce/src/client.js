import path from "path";
import { fileURLToPath } from "url";
import { loadSync } from "@grpc/proto-loader";
import grpc from "@grpc/grpc-js";

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

const protoPath = path.join(__dirname, "..", "proto", "estoque.proto");

const interprete = loadSync(protoPath);

const pacoteDefinido = grpc.loadPackageDefinition(interprete);

const estoqueService = pacoteDefinido.EstoqueService;

const cliente = new estoqueService(
    "localhost:50051",
    grpc.credentials.createInsecure()
);

const request = {
    produtoId: 10,
    quantidadeDesejada: 3
}

cliente.VerificaEstoque(request, (erro, resposta) => {
    if (erro) {
        console.error("Erro no servidor", erro.message)
        return
    }
    console.log("Disponibilidade:", resposta.disponivel, "Quantidade disponível:", resposta.quantidadeDisponivel)
}) 