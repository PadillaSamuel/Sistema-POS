#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$(readlink -f "$0")")" && pwd)"
cd "$SCRIPT_DIR"

if ! command -v docker &> /dev/null; then
    echo "ERROR: Docker no está instalado."
    read -rp "Presioná Enter para cerrar..."
    exit 1
fi

if ! docker info &> /dev/null; then
    echo "ERROR: Docker no está corriendo."
    read -rp "Presioná Enter para cerrar..."
    exit 1
fi

echo "Apagando el sistema..."
if docker compose version &> /dev/null; then
    docker compose down
else
    docker-compose down
fi
RC=$?

echo ""
if [ "$RC" -eq 0 ]; then
    echo "Listo. Sistema apagado."
else
    echo "Algo falló al apagar el sistema. Revisá los mensajes de Docker."
fi
echo ""
read -rp "Presioná Enter para cerrar..."
