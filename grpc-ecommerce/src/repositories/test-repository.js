import { verificaEstoque } from "../services/verificaEstoqueService.js";
import { buscaPorProdutoId } from "./estoqueRepository.js";

const sucesso = buscaPorProdutoId(1)
console.log(sucesso)

const falha = buscaPorProdutoId(999)
console.log(falha)

const sucessoNaVerificacao = verificaEstoque(1, 8)
console.log(sucessoNaVerificacao)

const falhaNaVerificacao = verificaEstoque(1, 11)
console.log(falhaNaVerificacao)

const idInexistenteParaVerificacao = verificaEstoque(999, 1)
console.log(idInexistenteParaVerificacao)