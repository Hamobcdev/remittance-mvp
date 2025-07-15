const express = require("express");
const dotenv = require("dotenv");
const fs = require("fs");
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");

dotenv.config();

const app = express();
const port = 3001;

const LND_PROTO_PATH = "./lnd-rpc.proto";

const packageDefinition = protoLoader.loadSync(LND_PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const lnrpc = grpc.loadPackageDefinition(packageDefinition).lnrpc;

const lndCert = fs.readFileSync(process.env.LND_TLS_CERT_PATH);
const sslCreds = grpc.credentials.createSsl(lndCert);

const macaroon = fs.readFileSync(process.env.LND_MACAROON_PATH).toString("hex");

const metadata = new grpc.Metadata();
metadata.add("macaroon", macaroon);

const macaroonCreds = grpc.credentials.createFromMetadataGenerator((args, cb) => {
  cb(null, metadata);
});

const credentials = grpc.credentials.combineChannelCredentials(sslCreds, macaroonCreds);

const client = new lnrpc.Lightning(
  process.env.LND_GRPC_HOST,
  credentials
);

app.get("/getinfo", (req, res) => {
  client.getInfo({}, (err, response) => {
    if (err) {
      return res.status(500).send(err.details);
    }
    res.send(response);
  });
});

app.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`);
});
