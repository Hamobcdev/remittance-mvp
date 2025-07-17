#!/bin/sh

echo "Waiting for bitcoind to be ready..."

until curl -s --user bitcoin:bitcoin --data-binary '{"jsonrpc":"1.0","id":"curl","method":"getblockchaininfo","params":[]}' -H 'content-type:text/plain;' http://bitcoind:18332 | grep '"chain"' > /dev/null
do
  echo "Waiting 3s for bitcoind RPC..."
  sleep 3
done

echo "bitcoind is ready. Starting LND..."
exec lnd "$@"
