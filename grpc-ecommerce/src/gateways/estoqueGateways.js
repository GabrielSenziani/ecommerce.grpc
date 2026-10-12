//(id, quantidadeDesejada)
//return com só o valor do pagamento
//resolve se o pagamento for valido, reject se não
import { getGrpcClient } from "../helpers/encontraCliente.js";
import grpc from "@grpc/grpc-js"

const estoqueService = getGrpcClient("../../proto/estoque.proto", "EstoqueService")

const client = new estoqueService(
    "localhost:50051",
    grpc.credentials.createInsecure()
)

export function verificaDisponibilidadeEstoque(produtoId, quantidadeDesejada) {
    const request = {
        produtoId: produtoId,
        quantidadeDesejada: quantidadeDesejada
    }

    return new Promise((resolve, reject) => {
      client.VerificaEstoque(request, (erro, resposta) => {
        if (erro) {
            return reject(new Error(`Falha ao se comunicar o gRPC de Estoque: ${erro.message}`))
        }
        if (!resposta.disponivel) {
            return reject(new Error(`Produto ID ${produtoId} não possui estoque suficiente para a quantidade desejada.`));
        }

        const valorTotalEmCentavos = resposta.precoDoProdutoEmCentavos * quantidadeDesejada

        resolve(valorTotalEmCentavos)
      })
    })
}
