#!/bin/bash

# Script de despliegue para Users API con MongoDB Atlas
# Uso: ./deploy.sh

set -e

echo "🚀 Iniciando despliegue de Users API..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para imprimir mensajes coloreados
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar si Docker está instalado
if ! command -v docker &> /dev/null; then
    print_error "Docker no está instalado. Por favor instala Docker primero."
    exit 1
fi

# Verificar si Docker Compose está instalado
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    print_error "Docker Compose no está instalado. Por favor instala Docker Compose primero."
    exit 1
fi

# Verificar si existe el archivo .env
if [ ! -f ".env" ]; then
    print_error "Archivo .env no encontrado. Copia .env.example a .env y configura las variables."
    print_status "Ejecuta: cp .env.example .env"
    exit 1
fi

# Verificar variables de entorno críticas
if ! grep -q "DOMAIN=" .env; then
    print_error "DOMAIN no está configurado en .env"
    exit 1
fi

if ! grep -q "MONGO_URI=" .env; then
    print_error "MONGO_URI no está configurado en .env"
    exit 1
fi

if ! grep -q "JWT_SECRET=" .env; then
    print_error "JWT_SECRET no está configurado en .env"
    exit 1
fi

# Verificar que la red traefik-net existe
if ! docker network ls | grep -q traefik-net; then
    print_error "La red 'traefik-net' no existe. Asegúrate de que esté definida en tu docker-compose principal con Traefik."
    print_status "Ejemplo: networks: traefik-net: external: true"
    exit 1
fi

print_status "Deteniendo contenedores existentes..."
docker-compose -f docker-compose.prod.yml down || true

print_status "Eliminando imágenes no utilizadas..."
docker image prune -f || true

print_status "Construyendo y iniciando servicios..."
docker-compose -f docker-compose.prod.yml up -d --build

print_status "Esperando a que la API esté lista..."
sleep 10

# Verificar que la API esté corriendo
if docker-compose -f docker-compose.prod.yml exec -T users-api curl -f http://localhost:$(grep PORT .env | cut -d '=' -f2)/health &> /dev/null; then
    print_status "✅ Users API está corriendo correctamente"
else
    print_warning "⚠️  Health check falló, pero el contenedor puede estar iniciándose"
fi

DOMAIN=$(grep DOMAIN .env | cut -d '=' -f2)
print_status "🎉 Despliegue completado!"
print_status "API disponible en: https://$DOMAIN"
print_status "Documentación Swagger: https://$DOMAIN/api"

print_status "Comandos útiles:"
echo "  Ver logs: docker-compose -f docker-compose.prod.yml logs -f"
echo "  Reiniciar: docker-compose -f docker-compose.prod.yml restart"
echo "  Detener: docker-compose -f docker-compose.prod.yml down"
echo "  Verificar Traefik: docker-compose logs -f traefik (desde tu docker-compose principal)"