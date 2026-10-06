import grpc from "@grpc/grpc-js";
import { getGrpcService } from "./helpers/encontraPacote.js";
import { verificaEstoqueHandler } from "./handlers/estoqueHandler.js";

const servidor = new grpc.Server();

const estoqueService = getGrpcService("../../proto/estoque.proto", "EstoqueService")

servidor.addService(estoqueService, {
    VerificaEstoque: verificaEstoqueHandler
})

servidor.bindAsync(
    "0.0.0.0:50051",
    grpc.ServerCredentials.createInsecure(),
    (erro) => {
        if(erro) {
            console.error(`Erro ao subir o servidor: ${erro.message}`)
            return
        }
        console.log("Servidor de pé.")
    }
)