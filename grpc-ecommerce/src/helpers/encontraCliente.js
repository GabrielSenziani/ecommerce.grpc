import path from "path";
import { fileURLToPath } from "url";
import { loadSync } from "@grpc/proto-loader";
import grpc from "@grpc/grpc-js";

const __filename = fileURLToPath(import.meta.url)

const __dirname = path.dirname(__filename)

export function getGrpcClient(relativeProtoPath, serviceName) {
    const protoPath = path.join(__dirname, relativeProtoPath)

    const interprete = loadSync(protoPath, {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true
    });

    const pacoteDefinido = grpc.loadPackageDefinition(interprete)

    if(!pacoteDefinido[serviceName]) {
        throw new Error(`O serviço "${serviceName}" não foi encontrado no pacote gRPC`)
    }

    return pacoteDefinido[serviceName]
}