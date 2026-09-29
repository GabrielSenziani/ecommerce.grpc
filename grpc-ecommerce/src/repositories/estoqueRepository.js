import { db } from "../database/connection.js";
import { DatabaseError } from "../errors/errors.js";

export function buscaPorProdutoId(produtoId) {
    try {
        const busca = db.prepare(`
            SELECT *
            FROM Estoque
            WHERE ProdutoId = ?
            `)

        const produto = busca.get(produtoId)

        return produto

    } catch (erro) {
        throw new DatabaseError("Falha ao buscar produto no banco de dados", erro)
    }
}