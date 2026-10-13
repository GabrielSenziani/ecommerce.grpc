import { processaPagamentoService } from "../services/pagamentoService.js";
import { InvalidArgumentError, DatabaseError, BusinessError, NotFoundError } from "../errors/errors.js";
import grpc from "@grpc/grpc-js"

export async function verificaPagamentoHandler(call, callback) {
    const { produtoId, quantidadeDesejada, valorPago } = call.request

    try {
        const resultado = await processaPagamentoService(produtoId, quantidadeDesejada, valorPago)

        callback(null, resultado)

    } catch (erro) {
        if (erro instanceof InvalidArgumentError) {
            callback({
                 code: grpc.status.INVALID_ARGUMENT,
                 message: "Valor informado não condiz ou é inválido ao valor do prduto"
            })
        }

        if (erro instanceof BusinessError) {
            callback({
                code: grpc.status.FAILED_PRECONDITION,
                message: erro.message
            })
        }

        if (erro instanceof NotFoundError) {
            callback({
                code: grpc.status.NOT_FOUND,
                message: erro.message
            })
        }
        else if (erro instanceof DatabaseError) {
            callback({
                code: grpc.status.INTERNAL,
                message: "Erro interno no servidor"
            })
        }
        else {
            callback({
                code: grpc.status.UNKNOWN,
                message: "Erro desconhecido"
            })
        }
    }
}