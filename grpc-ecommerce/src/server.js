import path from "path";
import { fileURLToPath } from "url";
import { loadSync } from "@grpc/proto-loader";
import grpc from "@grpc/grpc-js";

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

const protoPath = path.join(__dirname, "..", "proto", "estoque.proto");

const interprete = loadSync(protoPath);

const pacoteDefinido = grpc.loadPackageDefinition(interprete);

const estoqueService = pacoteDefinido.EstoqueService.service;

const servidor = new grpc.Server();

servidor.addService(estoqueService, {
    VerificaEstoque: (call, callback) => {
        const estoqueAtual = 5
        const id = call.request.produtoId
        const desejada = call.request.quantidadeDesejada
    
        const resposta = {
            disponivel: true,
            produtoId: id,
            quantidadeDisponivel: estoqueAtual
        }

        if (estoqueAtual < desejada) {
            resposta.disponivel = false
           return callback(null, resposta)
        }

        callback(null, resposta)
    }
})

servidor.bindAsync(
    "0.0.0.0:50051",
    grpc.ServerCredentials.createInsecure(),
    (erro) => {
        if(erro) {
            console.error(`Erro ao subir o servidor: ${erro.message}`)
            return
        }
    }
)