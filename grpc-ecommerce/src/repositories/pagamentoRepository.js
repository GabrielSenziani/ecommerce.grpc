import { db } from "../database/connection.js";
import { DatabaseError } from "../errors/errors.js";

export function salvarPagamento(produtoId, quantidade, precoProdutoCentavos, valorPago, aprovado) {
    try {
        const insert = db.prepare(`
            INSERT INTO Pagamentos (ProdutoId, Quantidade, PrecoProdutoCentavos, ValorPago, AprovacaoDoPagamento)
            VALUES (?, ?, ?, ?, ?)
            `)
            
        const statusAprovacao = aprovado ? 1 : 0

        const resultado = insert.run(produtoId, quantidade, precoProdutoCentavos, valorPago, statusAprovacao)

        return resultado.lastInsertRowid

    } catch (erro) {
        throw new DatabaseError("Falha ao salvar o pagamento no banco de dados", erro)
    }
}