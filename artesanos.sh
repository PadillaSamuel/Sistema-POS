#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$(readlink -f "$0")")" && pwd)"
cd "$SCRIPT_DIR"

if ! command -v docker &> /dev/null; then
    echo "ERROR: Docker no está instalado."
    echo "Instalalo con: sudo apt install docker.io"
    read -rp "Presioná Enter para cerrar..."
    exit 1
fi

if ! docker info &> /dev/null; then
    echo "ERROR: Docker no está corriendo."
    echo "Iniciá Docker Desktop o ejecutá: sudo systemctl start docker"
    read -rp "Presioná Enter para cerrar..."
    exit 1
fi

echo "Levantando el sistema..."
if docker compose version &> /dev/null; then
    docker compose up -d
else
    docker-compose up -d
fi
RC=$?

echo ""
if [ "$RC" -eq 0 ]; then
    echo "Listo. Sistema arriba."
    echo "  - App:      http://localhost"
    echo "  - Backend:  http://localhost:8080"
else
    echo "Algo falló al levantar el sistema. Revisá los mensajes de Docker."
fi
echo ""
read -rp "Presioná Enter para cerrar..."
