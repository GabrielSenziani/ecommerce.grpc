CREATE TABLE IF NOT EXISTS Pagamentos (
  PagamentoId INTEGER PRIMARY KEY AUTOINCREMENT,
  ProdutoId INTEGER NOT NULL REFERENCES Estoque(ProdutoId),
  Quantidade INTEGER NOT NULL CHECK(Quantidade > 0),
  PrecoProdutoCentavos INTEGER NOT NULL CHECK(PrecoProdutoCentavos > 0),
  ValorPago INTEGER NOT NULL CHECK(ValorPago >= 0),
  AprovacaoDoPagamento BOOLEAN NOT NULL DEFAULT TRUE
)