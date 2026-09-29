import { NotFoundError } from "../errors/errors.js";
import { buscaPorProdutoId } from "../repositories/estoqueRepository.js";

export function verificaEstoque(produtoId, quantidadeDesejada) {
    const produto = buscaPorProdutoId(produtoId)

    if (!produto) {
        throw new NotFoundError("Não foi possivel encontrar o produto")
    }

    const disponivel = produto.QuantidadeDisponivel >= quantidadeDesejada

    return {
        disponivel: disponivel,
        produtoId: produtoId,
        quantidadeDisponivel: produto.QuantidadeDisponivel
    }

}