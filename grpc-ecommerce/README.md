# gRPC E-commerce --- Microsserviços de Estoque e Pagamento

Projeto backend que simula parte do fluxo de compra de um e-commerce
utilizando **Node.js, gRPC, HTTP/2 e SQLite**.

A aplicação separa as responsabilidades de estoque e pagamento. O
serviço de pagamento consulta disponibilidade e preço por meio de
comunicação gRPC, sem precisar consultar diretamente os dados de
estoque. O projeto explora comunicação entre serviços, separação de
responsabilidades, validação de regras de negócio, persistência
relacional, migrations e tratamento de erros com códigos de status do
gRPC.

## Sumário

-   [Arquitetura](#arquitetura)
-   [Fluxo do sistema](#fluxo-do-sistema)
-   [Estrutura do projeto](#estrutura-do-projeto)
-   [Contratos gRPC](#contratos-grpc)
-   [Modelo de dados](#modelo-de-dados)
-   [Decisões de engenharia](#decisões-de-engenharia)
-   [Tratamento de erros](#tratamento-de-erros)
-   [Tecnologias e conceitos](#tecnologias-e-conceitos)
-   [Execução](#execução)

## Arquitetura

O sistema possui dois serviços com responsabilidades distintas:

-   **Estoque:** recebe consultas de produtos, consulta os dados
    persistidos e aplica as regras de negócio relacionadas à
    disponibilidade.
-   **Pagamento:** valida os dados da compra, consulta estoque e preço
    por meio do `EstoqueGateway` e registra os dados da transação.

A comunicação entre pagamento e estoque é síncrona e utiliza gRPC sobre
HTTP/2. Os contratos das chamadas são definidos em arquivos Protocol
Buffers (`.proto`).

``` mermaid
flowchart TB
    C(["Cliente"])

    subgraph EST["MICROSSERVICO DE ESTOQUE"]
        direction TB
        EH["EstoqueHandler"]
        ES["EstoqueService"]
        ER["EstoqueRepository"]
        EH --> ES --> ER
    end

    subgraph PAG["MICROSSERVICO DE PAGAMENTO"]
        direction TB
        PH["PagamentoHandler"]
        PS["PagamentoService"]
        EG["EstoqueGateway - Cliente gRPC"]
        PR["PagamentoRepository"]
        PH --> PS
        PS --> EG
        PS --> PR
    end

    DB[("SQLite")]

    C -->|"Consulta produtos"| EH
    EH -->|"Resposta ao cliente"| C
    C -->|"Solicita pagamento"| PH
    EG <-->|"Chamada gRPC"| EH
    ER <-->|"Consulta estoque"| DB
    PR -->|"Persiste pagamento"| DB
    PH -->|"Resultado ou erro"| C

    classDef client fill:#2E1065,stroke:#A78BFA,color:#F5F3FF
    classDef stock fill:#064E3B,stroke:#34D399,color:#D1FAE5
    classDef payment fill:#172554,stroke:#60A5FA,color:#DBEAFE
    classDef database fill:#27272A,stroke:#A1A1AA,color:#FFFFFF

    class C client
    class EH,ES,ER stock
    class PH,PS,EG,PR payment
    class DB database

    style EST fill:#101F1A,stroke:#34D399,color:#A7F3D0
    style PAG fill:#111827,stroke:#60A5FA,color:#BFDBFE
```

> O diagrama representa a organização lógica dos componentes. Os
> repositórios utilizam o banco SQLite do projeto; a consulta de estoque
> feita pelo serviço de pagamento acontece por meio do gateway gRPC.

## Fluxo do sistema

### Consulta de estoque

1.  O cliente solicita informações sobre um produto ou sua
    disponibilidade.
2.  O `EstoqueHandler` recebe a requisição e encaminha o processamento
    ao `EstoqueService`.
3.  O service utiliza o `EstoqueRepository` para consultar os dados no
    SQLite.
4.  O service aplica as regras de negócio e retorna o resultado ao
    handler.
5.  O handler responde ao cliente com os dados solicitados ou com um
    erro apropriado.

### Processamento de pagamento

1.  O cliente envia uma requisição ao `PagamentoHandler`.
2.  O handler encaminha a operação ao `PagamentoService`.
3.  O service utiliza o `EstoqueGateway` para chamar o método
    `VerificaEstoque` do serviço de estoque via gRPC.
4.  O serviço de estoque retorna a disponibilidade, a quantidade
    disponível e o preço do produto.
5.  O `PagamentoService` valida os dados da compra, incluindo quantidade
    e valor pago.
6.  Quando a operação atende às regras de negócio, o
    `PagamentoRepository` registra os dados do pagamento.
7.  O `PagamentoHandler` retorna o resultado ao cliente ou comunica a
    falha por meio de um erro apropriado.

## Estrutura do projeto

``` text
grpc-ecommerce/
├── proto/
│   ├── estoque.proto
│   └── pagamento.proto
├── src/
│   ├── database/
│   │   ├── connection.js
│   │   ├── ecommerce.db
│   │   └── schema.js
│   ├── errors/
│   │   └── errors.js
│   ├── gateways/
│   │   └── estoqueGateways.js
│   ├── handlers/
│   │   ├── estoqueHandler.js
│   │   ├── pagamentoHandler.js
│   │   └── test-handler.js
│   ├── helpers/
│   │   ├── encontraCliente.js
│   │   └── encontraPacote.js
│   ├── migrations/
│   │   ├── arquivos de migration
│   │   ├── executaMigration.js
│   │   └── schemaMigration.js
│   ├── repositories/
│   │   ├── estoqueRepository.js
│   │   ├── pagamentoRepository.js
│   │   └── test-repository.js
│   ├── services/
│   │   ├── pagamentoService.js
│   │   └── verificaEstoqueService.js
│   ├── client.js
│   └── server.js
├── package.json
├── package-lock.json
└── .gitignore
```

### Responsabilidades das camadas

  -----------------------------------------------------------------------
  Componente                          Responsabilidade
  ----------------------------------- -----------------------------------
  `handlers/`                         Receber requisições, encaminhar
                                      operações e retornar respostas ou
                                      erros ao cliente.

  `services/`                         Executar regras de negócio e
                                      validar as operações.

  `repositories/`                     Consultar e persistir dados no
                                      SQLite.

  `gateways/`                         Encapsular a comunicação gRPC com o
                                      serviço de estoque.

  `proto/`                            Definir os contratos RPC e os
                                      formatos das mensagens.

  `database/`                         Configurar a conexão, definir o
                                      schema e armazenar o banco SQLite.

  `errors/`                           Centralizar o tratamento e a
                                      representação dos erros da
                                      aplicação.

  `migrations/`                       Aplicar e registrar alterações na
                                      estrutura do banco.

  `helpers/`                          Reunir funções auxiliares usadas
                                      pela aplicação.
  -----------------------------------------------------------------------

## Contratos gRPC

Os arquivos Protocol Buffers definem os métodos RPC disponíveis e os
campos das mensagens trocadas entre cliente e serviço.

### Estoque --- `estoque.proto`

O serviço `EstoqueService` disponibiliza o método `VerificaEstoque`.

**Requisição --- `EstoqueRequest`**

  Campo                  Tipo      Descrição
  ---------------------- --------- ---------------------------
  `produtoId`            `int32`   Identificador do produto.
  `quantidadeDesejada`   `int32`   Quantidade solicitada.

**Resposta --- `EstoqueResponse`**

  ----------------------------------------------------------------------------
  Campo                        Tipo                    Descrição
  ---------------------------- ----------------------- -----------------------
  `disponivel`                 `bool`                  Indica se a quantidade
                                                       solicitada está
                                                       disponível.

  `produtoId`                  `int32`                 Identificador do
                                                       produto consultado.

  `quantidadeDisponivel`       `int32`                 Quantidade disponível
                                                       em estoque.

  `precoDoProdutoEmCentavos`   `int32`                 Preço do produto em
                                                       centavos, obtido a
                                                       partir do preço
                                                       registrado no estoque.
  ----------------------------------------------------------------------------

Método RPC:

``` protobuf
rpc VerificaEstoque(EstoqueRequest) returns (EstoqueResponse);
```

### Pagamento --- `pagamento.proto`

O serviço `PagamentoService` disponibiliza o método `VerificaPagamento`.

**Requisição --- `PagamentoRequest`**

  Campo                  Tipo      Descrição
  ---------------------- --------- --------------------------------------------
  `produtoId`            `int32`   Identificador do produto.
  `quantidadeDesejada`   `int32`   Quantidade solicitada.
  `valorPago`            `int32`   Valor informado pelo usuário, em centavos.

**Resposta --- `PagamentoResponse`**

  ------------------------------------------------------------------------
  Campo                    Tipo                    Descrição
  ------------------------ ----------------------- -----------------------
  `produtoId`              `int32`                 Identificador do
                                                   produto da operação.

  `valorEsperado`          `int32`                 Valor esperado para a
                                                   compra, conforme as
                                                   regras de negócio.

  `valorPagoPeloUsuario`   `int32`                 Valor informado pelo
                                                   usuário.

  `compraAprovada`         `bool`                  Indica se a compra foi
                                                   aprovada.
  ------------------------------------------------------------------------

Método RPC:

``` protobuf
rpc VerificaPagamento(PagamentoRequest) returns (PagamentoResponse);
```

Os campos monetários são representados como inteiros em centavos para
evitar imprecisões associadas à representação de valores financeiros com
ponto flutuante.

## Modelo de dados

### Tabela `Estoque`

Armazena os produtos, seus preços e suas quantidades disponíveis.

  Campo                    Descrição
  ------------------------ ----------------------------------------
  `ProdutoId`              Identificador do produto.
  `NomeDoProduto`          Nome do produto.
  `QuantidadeDisponivel`   Quantidade disponível em estoque.
  `PrecoCentavos`          Preço unitário do produto em centavos.

A coluna `PrecoCentavos` foi adicionada por meio da migration
`001-adiciona-preco-ao-estoque.sql`. Ela utiliza o tipo `INTEGER`,
possui uma restrição para impedir valores negativos e define `0` como
valor padrão. A migration também atualiza os preços iniciais dos
produtos existentes.

O preço é disponibilizado ao microsserviço de pagamento por meio do
campo `precoDoProdutoEmCentavos`, definido no contrato `estoque.proto`.
Dessa forma, o pagamento obtém o preço consultando o serviço de estoque
via gRPC, sem precisar consultar diretamente a tabela `Estoque`.

### Tabela de migrations

Mantém o histórico das alterações aplicadas ao banco de dados.

  -----------------------------------------------------------------------
  Campo                               Descrição
  ----------------------------------- -----------------------------------
  `Id`                                Identificador do registro da
                                      migration.

  `Nome`                              Nome da migration executada.

  `Data`                              Data e hora em que a migration foi
                                      registrada, armazenadas como
                                      `DATETIME`.
  -----------------------------------------------------------------------

Os arquivos da pasta `migrations/` definem as alterações estruturais do
banco. `executaMigration.js` e `schemaMigration.js` dão suporte à
execução e ao controle dessas alterações.

### Tabela de pagamentos

O repositório de pagamento registra os dados da transação com os
seguintes campos, essa tabela foi adicionada por meio da migration `002-adiciona-tabela-pagamento.sql`:

  Campo                      Descrição
  -------------------------- -----------------------------------------------
  `PagamentoId`              Identificador do pagamento.
  `ProdutoId`                Identificador do produto.
  `QuantidadeDesejada`       Quantidade solicitada.
  `PrecoProdutoEmCentavos`   Preço unitário do produto em centavos.
  `ValorPago`                Valor informado para a operação.
  `Aprovacao`                Indicador booleano do resultado do pagamento.

## Decisões de engenharia

### Comunicação por gateway

O serviço de pagamento não consulta diretamente a tabela de estoque para
obter disponibilidade e preço. Ele utiliza o `EstoqueGateway`, que
encapsula a chamada gRPC ao serviço responsável por esses dados.

### Separação de responsabilidades

O `PagamentoService` concentra as regras de negócio da compra. O gateway
realiza a comunicação com o serviço de estoque, enquanto o repository é
responsável pela persistência do pagamento.

### Validação do pagamento

O serviço utiliza os dados retornados pelo estoque para validar a
compra, incluindo a disponibilidade da quantidade solicitada e a
correspondência entre o valor pago e o valor esperado.

### Migrations

As migrations versionam as alterações estruturais do banco. A tabela de
controle registra o nome e a data de cada alteração aplicada,
facilitando o acompanhamento da evolução do schema.

### Tratamento de erros com gRPC

O sistema diferencia erros de validação, condições de negócio, ausência
de recursos e falhas internas por meio de códigos de status do gRPC,
permitindo que o cliente receba respostas mais específicas.

## Tratamento de erros

  -----------------------------------------------------------------------
  Código gRPC                         Utilização
  ----------------------------------- -----------------------------------
  `INVALID_ARGUMENT`                  Argumentos inválidos, como
                                      quantidade negativa ou valor
                                      informado divergente do esperado.

  `NOT_FOUND`                         Produto solicitado não encontrado.

  `FAILED_PRECONDITION`               Operação impedida por uma condição
                                      de negócio, como estoque
                                      insuficiente.

  `INTERNAL`                          Erro interno inesperado durante o
                                      processamento.
  -----------------------------------------------------------------------

Os códigos são utilizados para comunicar a natureza da falha. O
comportamento exato depende das validações e do mapeamento de erros
implementados nos handlers e services.

## Tecnologias e conceitos

-   Node.js
-   JavaScript
-   gRPC
-   HTTP/2
-   Protocol Buffers
-   SQLite
-   SQL
-   Microsserviços
-   Separação de responsabilidades
-   Regras de negócio e validação
-   Migrations de banco de dados
-   Tratamento de erros com status gRPC

## Execução

O projeto contém `src/server.js` e `src/client.js` como pontos de
entrada da aplicação.

Para executar o projeto:

1.  Instale as dependências com npm install.
2.  Configure o banco SQLite e aplique as migrations necessárias.
3.  Inicie o servidor gRPC com node src/server.js.
4.  Em outro terminal, execute o cliente com node src/client.js para enviar requisições aos serviços.

As migrations estão localizadas em src/migrations/. Verifique a configuração do banco e a ordem de execução das migrations antes de iniciar a aplicação.

Observação: o package.json ainda não possui scripts específicos para inicialização do servidor e do cliente, por isso os arquivos são executados diretamente pelo Node.js.

------------------------------------------------------------------------

## Objetivo do projeto

Este projeto foi desenvolvido para aprofundar conhecimentos de backend e
arquitetura distribuída, com foco em comunicação entre microsserviços,
contratos gRPC, validação de operações de compra, persistência
relacional e organização de responsabilidades.
