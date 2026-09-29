import { verificaEstoqueHandler } from "./estoqueHandler.js";

const resultado = {
    request: {produtoId: 99, quantidadeDesejada: 100}
}

verificaEstoqueHandler(resultado, (erro, sucesso) => {
    if (erro) {
        console.log("erro detectado", erro)
    } else {
        console.log("sucesso", sucesso)
    }
})

const outroResultado = {
    request: {produtoId: 1, quantidadeDesejada: 9}
}

verificaEstoqueHandler(outroResultado, (erro, sucesso) => {
    if (erro) {
        console.log("erro detectado", erro)
    } else {
        console.log("sucesso", sucesso)
    }
})
