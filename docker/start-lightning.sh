#!/bin/bash
docker compose down --volumes --remove-orphans

docker system prune -a --volumes -f

echo "Starting Bitcoin + Lightning Network nodes..."
docker-compose up -d bitcoind
sleep 5
docker-compose up -d samoa
sleep 5
docker-compose up -d australia
