import { verificaEstoque } from "../services/verificaEstoqueService.js";
import { buscaPorProdutoId } from "./estoqueRepository.js";
import { salvarPagamento } from "./pagamentoRepository.js";

const sucesso = buscaPorProdutoId(1)
console.log(sucesso)

const falha = buscaPorProdutoId(999)
console.log(falha)

const sucessoNaVerificacao = verificaEstoque(1, 8)
console.log(sucessoNaVerificacao)

const falhaNaVerificacao = verificaEstoque(1, 11)
console.log(falhaNaVerificacao)

try{
  const idInexistenteParaVerificacao = verificaEstoque(999, 1)
} catch(erro) {
  console.log("Erro esperado de produto inexistente:", erro.message)
}


try {
    const novoPagamento = salvarPagamento(1, 2, 1500, 3000, true)
    console.log("Pagamento registrado", novoPagamento)
} catch (erro) {
    console.error("O teste falhou", erro.message)
}

try {
    salvarPagamento(1, 0, 1500, 3000, true)
} catch (erro) {
    console.log("O teste falhou como esperado:", erro.message)
}