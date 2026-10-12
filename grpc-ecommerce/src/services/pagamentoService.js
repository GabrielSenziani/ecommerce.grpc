import { InvalidArgumentError } from "../errors/errors.js";
import { verificaDisponibilidadeEstoque } from "../gateways/estoqueGateways.js";
import { salvarPagamento } from "../repositories/pagamentoRepository.js";

export async function processaPagamentoService(produtoId, quantidade, valorInformado) {
    if (typeof valorInformado !== "number" || valorInformado <= 0) {
        throw new InvalidArgumentError("O valor informado deve ser um número válido e maior que 0.")
    }

        const valorReal = await verificaDisponibilidadeEstoque(produtoId, quantidade)

        if (valorReal !== valorInformado) {
            throw new InvalidArgumentError("O valor informado não corresponde ao valor real do produto.")
        }

        const precoProdutoEmCentavos = valorReal / quantidade
        const valorPago = valorInformado

        salvarPagamento(produtoId, quantidade, precoProdutoEmCentavos, valorPago, true)

       return {
        produtoId: produtoId,
        valorEsperado: valorReal,
        valorPagoPeloUsuario: valorPago,
        compraAprovada: true
       }   
}