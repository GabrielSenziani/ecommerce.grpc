import { BusinessError, InvalidArgumentError } from "../errors/errors.js";
import { verificaDisponibilidadeEstoque } from "../gateways/estoqueGateways.js";
import { salvarPagamento } from "../repositories/pagamentoRepository.js";

export async function processaPagamentoService(produtoId, quantidade, valorInformado) {
    if (typeof valorInformado !== "number" || valorInformado <= 0) {
        throw new InvalidArgumentError("O valor informado deve ser um número válido e maior que 0.")
    }

        const { disponivel, valorTotalEmCentavos } = await verificaDisponibilidadeEstoque(produtoId, quantidade)

        if (!disponivel) {
            throw new BusinessError(`Não foi possivel processar o pagamento: o produto id ${produtoId} não possui estoque suficiente.`)
        }

        if (valorTotalEmCentavos !== valorInformado) {
            throw new InvalidArgumentError("O valor informado não corresponde ao valor real do produto.")
        }

        const precoProdutoEmCentavos = valorTotalEmCentavos / quantidade
        const valorPago = valorInformado

        salvarPagamento(produtoId, quantidade, precoProdutoEmCentavos, valorPago, true)

       return {
        produtoId: produtoId,
        valorEsperado: valorTotalEmCentavos,
        valorPagoPeloUsuario: valorPago,
        compraAprovada: true
       }   
}