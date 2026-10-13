//(id, quantidadeDesejada)
//return com só o valor do pagamento
//resolve se o pagamento for valido, reject se não
import { DatabaseError, NotFoundError } from "../errors/errors.js";
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
         if (erro.code === grpc.status.NOT_FOUND) {
            return reject(new NotFoundError(erro.details || `Produto ID ${produtoId} não encontrado.`))
        }

        return reject (new DatabaseError(`Falha ao se comunicar com o gRPC de Estoque: ${erro.message}`, erro));
        }        
        const valorTotalEmCentavos = (resposta.precoDoProdutoEmCentavos || 0) * quantidadeDesejada;

        resolve({
            disponivel: resposta.disponivel,
            valorTotalEmCentavos: valorTotalEmCentavos
        })
      })
    })
}
