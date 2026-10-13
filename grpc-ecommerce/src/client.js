import { getGrpcClient } from "./helpers/encontraCliente.js";
import grpc from "@grpc/grpc-js"
import { verificaDisponibilidadeEstoque } from "./gateways/estoqueGateways.js";

const service = getGrpcClient(
    "../../proto/pagamento.proto", 
    "PagamentoService"
)

const clientePagamento = new service(
    "localhost:50051",
    grpc.credentials.createInsecure()
)

async function rodarTestePagamento() {
    const request = {
        produtoId: 1,
        quantidadeDesejada: 2,
        valorPago: 20000
    }

    clientePagamento.VerificaPagamento(request, (erro, resposta) => {
        if (erro) {
            console.error(`O teste falhou, código: ${erro.code}, mensagem: ${erro.message}`)
            return
        }
        console.log("Conexão gRPC realizada com sucesso.")
        console.log("Resposta do Servidor:", resposta)
    })
}

rodarTestePagamento();