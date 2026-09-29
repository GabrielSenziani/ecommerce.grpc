import { verificaEstoque } from "../services/verificaEstoqueService.js"
import { NotFoundError, DatabaseError } from "../errors/errors.js"
import grpc from "@grpc/grpc-js"

export function verificaEstoqueHandler(call, callback) {
    const { produtoId, quantidadeDesejada } = call.request

    try {
        const resultado = verificaEstoque(produtoId, quantidadeDesejada)

        callback(null, resultado)

    } catch (erro) {
        if (erro instanceof NotFoundError) {
            callback({ 
                code: grpc.status.NOT_FOUND, 
                message: "Não foi possivel encontrar o produto"
            })
        } else if (erro instanceof DatabaseError) {
            callback({ 
                code: grpc.status.INTERNAL, 
                message: "Erro interno no servidor"
            })
        } else {
            callback({
                code: grpc.status.UNKNOWN,
                message: "Erro desconhecido"
            })
        }
        
    }
}