ALTER TABLE Estoque
ADD COLUMN PrecoCentavos INTEGER NOT NULL DEFAULT 0 
CHECK(PrecoCentavos >= 0);

UPDATE Estoque
SET PrecoCentavos = 10000
WHERE ProdutoId = 1;

UPDATE Estoque
SET PrecoCentavos = 5000
WHERE ProdutoId = 2;

UPDATE Estoque
SET PrecoCentavos = 3000
WHERE ProdutoId = 3;