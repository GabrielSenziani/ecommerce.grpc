export class NotFoundError extends Error {
    constructor(mensagem) {
        super(mensagem);
        this.name = "NotFoundError"
    }
}

export class DatabaseError extends Error {
    constructor(mensagem, erroOriginal) {
        super(mensagem, {cause: erroOriginal})
        this.name = "DatabaseError"
    }
}