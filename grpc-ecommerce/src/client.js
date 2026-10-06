import { getGrpcClient } from "./helpers/encontraCliente.js";
import grpc from "@grpc/grpc-js";

const estoqueService = getGrpcClient("../../proto/estoque.proto", "EstoqueService")

const cliente = new estoqueService(
    "localhost:50051",
    grpc.credentials.createInsecure()
);

const request = {
    produtoId: 1,
    quantidadeDesejada: 3
}

cliente.VerificaEstoque(request, (erro, resposta) => {
    if (erro) {
        console.error("Erro no servidor", erro.message)
        return
    }
    console.log("Disponibilidade:", resposta.disponivel, "Quantidade disponível:", resposta.quantidadeDisponivel)
}) 