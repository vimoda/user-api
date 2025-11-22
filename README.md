# Users API

Una API de usuarios construida con NestJS siguiendo la arquitectura hexagonal (clean architecture).

## Descripción

Esta API permite gestionar usuarios con operaciones básicas como registro y login. Está diseñada con arquitectura hexagonal para mantener el dominio independiente de las tecnologías externas.

## Arquitectura

El proyecto sigue el patrón de arquitectura hexagonal, que separa las preocupaciones en capas claramente definidas:

### Capas

- **Domain**: Núcleo de negocio independiente
  - `entities/`: Entidades del dominio (User)
  - `value-objects/`: Objetos de valor (Email, Password)
  - `ports/`: Interfaces para dependencias externas

- **Application**: Lógica de aplicación
  - `use-cases/`: Casos de uso que orquestan la lógica de negocio
  - `dto/`: Objetos de transferencia de datos

- **Infrastructure**: Adaptadores y frameworks externos
  - `persistence/`: Adaptadores para base de datos (MongoDB con Mongoose)
  - `auth/`: Adaptadores para autenticación (JWT)
  - `http/`: Controladores REST y guards

### Principios

- **Independencia del dominio**: El núcleo de negocio no depende de frameworks
- **Inyección de dependencias**: Uso de ports/interfaces para desacoplar
- **Flujo de dependencias**: Infraestructura depende de Application, que depende de Domain

## Seguridad

### Medidas de Protección Implementadas

#### 1. Control de Acceso por Roles
- **Registro restringido**: Solo usuarios con rol `admin` pueden crear nuevos usuarios
- **Guard AdminGuard**: Verifica que el usuario autenticado tenga permisos de administrador
- **Sistema de roles**: Los usuarios pueden tener roles como `admin`, `seller`, `client`, etc.

#### 2. Rate Limiting
- **Login**: Máximo 5 intentos por 10 minutos por IP
- **Setup Admin**: Máximo 3 intentos por hora por IP
- **Configuración global**: 10 requests por minuto por defecto

#### 3. Autenticación JWT
- **Tokens RSA**: Uso de claves públicas/privadas para firma de tokens
- **Refresh tokens**: Sistema de tokens renovables
- **Validación de tokens**: Endpoint para verificar validez de tokens

#### 4. Validación de Datos
- **DTOs con validación**: Todos los inputs pasan por class-validator
- **Sanitización**: Eliminación de campos no permitidos con whitelist

### Configuración Inicial

#### Paso 1: Crear Usuario Administrador
```bash
# Solo funciona si no existen usuarios en la base de datos
curl -X POST http://localhost:3001/v1/users/setup-admin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "securepassword123"
  }'
```

#### Paso 2: Obtener Token de Admin
```bash
curl -X POST http://localhost:3001/v1/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "securepassword123"
  }'
```

#### Paso 3: Crear Usuarios Normales (requiere token admin)
```bash
curl -X POST http://localhost:3001/v1/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "email": "user@example.com",
    "password": "userpassword123"
  }'
```

### Endpoints Protegidos

| Endpoint | Método | Protección | Descripción |
|----------|--------|------------|-------------|
| `POST /v1/users` | AdminGuard | Solo administradores | Crear usuario |
| `PUT /v1/users/:id/roles` | JwtAuthGuard | Token válido | Actualizar roles |
| `GET /v1/users/me` | JwtAuthGuard | Token válido | Perfil propio |
| `GET /v1/users/:id` | JwtAuthGuard | Token válido | Obtener usuario |

### Configuración de Rate Limiting

```typescript
// En main.ts
ThrottlerModule.forRoot([
  {
    ttl: 60000, // 1 minuto
    limit: 10, // 10 requests por minuto
  },
])
```

## OAuth 2.0 Support

La API incluye soporte completo para OAuth 2.0 con los siguientes grant types:

### Grant Types Soportados

#### 1. Resource Owner Password Credentials (`password`)
Para autenticación directa de usuarios con username/password.

```bash
curl -X POST http://localhost:3001/v1/oauth/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d 'grant_type=password&username=user@example.com&password=password123&client_id=my-app&client_secret=my-secret'
```

#### 2. Client Credentials (`client_credentials`)
Para autenticación de aplicaciones/servicios sin intervención del usuario.

```bash
curl -X POST http://localhost:3001/v1/oauth/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d 'grant_type=client_credentials&client_id=my-app&client_secret=my-secret'
```

### Parámetros OAuth

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `grant_type` | string | ✅ | `password` o `client_credentials` |
| `username` | string | Para password | Email del usuario |
| `password` | string | Para password | Contraseña del usuario |
| `client_id` | string | ✅ | Identificador del cliente |
| `client_secret` | string | ✅ | Secreto del cliente |
| `scope` | string | ❌ | Alcances solicitados (ej: `read write`) |

### Respuesta OAuth

```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIs...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "scope": "read write",
  "refresh_token": "eyJhbGciOiJSUzI1NiIs..."
}
```

### Uso de Tokens

Los tokens generados pueden usarse en cualquier endpoint protegido:

```bash
curl -X GET http://localhost:3001/v1/users/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Validación de Clientes

Actualmente, la validación de `client_id` y `client_secret` es básica. En producción, implementa:

- Registro de clientes en base de datos
- Hashing de client secrets
- Validación de scopes permitidos
- Rate limiting por cliente

### Endpoint OAuth

- **URL**: `POST /v1/oauth/token`
- **Content-Type**: `application/x-www-form-urlencoded`
- **Rate Limited**: 10 requests por minuto

## Estructura del Proyecto

```
src/
├── domain/
│   ├── entities/
│   │   └── user.entity.ts
│   ├── value-objects/
│   │   ├── email.vo.ts
│   │   └── password.vo.ts
│   └── ports/
│       ├── user.repository.port.ts
│       └── auth.service.port.ts
├── application/
│   ├── use-cases/
│   │   ├── create-user.usecase.ts
│   │   └── login.usecase.ts
│   └── dto/
│       ├── create-user.dto.ts
│       └── login.dto.ts
├── infra/
│   ├── persistence/
│   │   ├── persistence.module.ts
│   │   ├── user.repository.adapter.ts
│   │   └── schemas/
│   │       └── user.schema.ts
│   ├── auth/
│   │   ├── auth.module.ts
│   │   └── jwt.service.adapter.ts
│   └── http/
│       ├── http.module.ts
│       ├── controllers/
│       │   └── user.controller.ts
│       └── guards/
│           └── jwt-auth.guard.ts
├── config/
│   ├── configuration.ts
│   ├── env.d.ts
│   ├── index.ts
│   └── validation.ts
├── app/
│   ├── app.module.ts
│   └── user.module.ts
└── main.ts
```

## Tecnologías

- **NestJS**: Framework para Node.js
- **MongoDB**: Base de datos NoSQL
- **Mongoose**: ODM para MongoDB
- **JWT**: Autenticación basada en tokens
- **bcrypt**: Hashing de contraseñas
- **class-validator**: Validación de DTOs
- **Docker**: Contenedorización

## Instalación y Ejecución

### Requisitos Previos

- Node.js (v18+)
- npm o yarn
- MongoDB (local o Docker)

### Instalación

1. Clona el repositorio:
```bash
git clone <repository-url>
cd user-api
```

2. Instala dependencias:
```bash
npm install
```

3. Configura variables de entorno (opcional):
Crea un archivo `.env` basado en `config/configuration.ts`

### Ejecución

#### Desarrollo
```bash
npm run start:dev
```

#### Producción
```bash
npm run build
npm run start
```

#### Con Docker
```bash
docker-compose up
```

## Despliegue en VPS

Para desplegar la aplicación en un servidor VPS usando Docker y Docker Compose, sigue estos pasos:

### Requisitos Previos

- Un servidor VPS con Ubuntu/Debian o similar
- Acceso SSH al servidor
- Docker y Docker Compose instalados en el VPS

### Instalación de Docker en el VPS

Si Docker no está instalado, ejecuta los siguientes comandos en tu VPS:

```bash
# Actualizar el sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Reiniciar sesión para aplicar cambios de grupo
newgrp docker
```

### Despliegue

1. **Clona el repositorio en el VPS:**
```bash
git clone <repository-url>
cd user-api
```

2. **Configura las variables de entorno:**
Crea un archivo `.env` en la raíz del proyecto con las siguientes variables (ajusta según tu configuración):

```bash
# Puerto en el que correrá la aplicación
PORT=3000

# Nombre de la base de datos MongoDB
MONGO_DB=userdb

# URL de conexión a MongoDB (opcional, por defecto localhost)
# MONGO_URL=mongodb://mongo:27017

# JWT Secret (genera uno seguro)
JWT_SECRET=tu_jwt_secret_muy_seguro_aqui

# URLs de los certificados JWT (si usas realm)
JWT_CERTS_URL=http://localhost:3000/v1/auth/certs

# Otros ajustes según config/configuration.ts
```

3. **Ejecuta la aplicación en modo detached (producción):**
```bash
docker-compose up -d --build
```

4. **Verifica que los contenedores estén corriendo:**
```bash
docker-compose ps
```

5. **Revisa los logs si es necesario:**
```bash
docker-compose logs -f users-api
```

### Comandos Útiles para Gestión

- **Detener la aplicación:**
```bash
docker-compose down
```

- **Reiniciar la aplicación:**
```bash
docker-compose restart
```

- **Actualizar la aplicación (después de cambios en el código):**
```bash
git pull
docker-compose up -d --build
```

- **Ver logs en tiempo real:**
```bash
docker-compose logs -f
```

### Configuración de Firewall

Asegúrate de que el puerto configurado (por defecto 3000) esté abierto en el firewall de tu VPS:

```bash
# Para UFW
sudo ufw allow 3000

# Para firewalld
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --reload
```

### Consideraciones de Seguridad

- Cambia las contraseñas por defecto
- Usa HTTPS en producción (configura un reverse proxy como Nginx con Let's Encrypt)
- Configura backups automáticos para la base de datos MongoDB
- Monitorea los logs regularmente
- Considera usar Docker secrets para variables sensibles en producción

## API Endpoints

La API utiliza el prefijo `/v1` para todas las rutas. Todos los endpoints requieren `Content-Type: application/json` para requests POST.

### Autenticación y Usuarios

#### Crear Usuario
```
POST /v1/users
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Respuesta exitosa (201):**
```json
{
  "id": "uuid-generated",
  "email": "user@example.com",
  "roles": ["user"]
}
```

**Errores:**
- `400 Bad Request`: Datos inválidos (email mal formado, password muy corta)
- `409 Conflict`: Usuario ya existe con ese email

#### Login
```
POST /v1/users/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "realm": "default"  // opcional, default: "default"
}
```

**Respuesta exitosa (200):**
```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 900,
  "refresh_expires_in": 604800,
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "roles": ["user"]
  }
}
```

**Errores:**
- `400 Bad Request`: Credenciales inválidas
- `401 Unauthorized`: Email o password incorrectos

#### Refresh Token
```
POST /v1/users/refresh
Content-Type: application/json

{
  "refresh_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Respuesta exitosa (200):** Similar al login, con nuevos tokens.

**Errores:**
- `400 Bad Request`: Token inválido o expirado
- `401 Unauthorized`: Refresh token no válido

#### Validar Token
```
POST /v1/users/validate
Content-Type: application/json

{
  "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Respuesta exitosa (200):**
```json
{
  "valid": true,
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "roles": ["user"]
  }
}
```

**Respuesta token inválido (200):**
```json
{
  "valid": false,
  "error": "Token expirado" | "Token inválido"
}
```

### Endpoints Protegidos (Requieren JWT)

#### Obtener Usuario Actual
```
GET /v1/users/me
Authorization: Bearer <access_token>
```

**Respuesta exitosa (200):**
```json
{
  "id": "user-id",
  "email": "user@example.com",
  "roles": ["user"]
}
```

**Errores:**
- `401 Unauthorized`: Token faltante, inválido o expirado

#### Obtener Usuario por ID
```
GET /v1/users/:id
Authorization: Bearer <access_token>
```

**Respuesta exitosa (200):**
```json
{
  "id": "user-id",
  "email": "user@example.com",
  "roles": ["user"]
}
```

**Errores:**
- `401 Unauthorized`: Token faltante, inválido o expirado
- `404 Not Found`: Usuario no encontrado

### OpenID Connect (Certificados)

#### Obtener Certificados JWK
```
GET /v1/protocol/openid-connect/certs
```

**Respuesta exitosa (200):**
```json
{
  "keys": [
    {
      "kty": "RSA",
      "use": "sig",
      "kid": "unique-key-id",
      "n": "modulus...",
      "e": "exponent...",
      "alg": "RS256"
    }
  ]
}
```

Este endpoint permite a los clientes validar tokens JWT localmente usando las claves públicas.

## Códigos de Estado HTTP

- `200 OK`: Operación exitosa
- `201 Created`: Recurso creado exitosamente
- `400 Bad Request`: Datos inválidos o petición mal formada
- `401 Unauthorized`: Autenticación requerida o credenciales inválidas
- `404 Not Found`: Recurso no encontrado
- `409 Conflict`: Conflicto (usuario ya existe)
- `500 Internal Server Error`: Error interno del servidor

## Autenticación JWT

Los tokens JWT incluyen todos los claims estándar según [RFC 7519](https://tools.ietf.org/html/rfc7519):

### Claims Incluidos
- **`iss` (Issuer)**: Emisor del token (configurable por reino)
- **`sub` (Subject)**: ID del usuario
- **`aud` (Audience)**: Audiencia del token (configurable por reino)
- **`exp` (Expiration Time)**: Tiempo de expiración
- **`iat` (Issued At)**: Tiempo de emisión
- **`nbf` (Not Before)**: Tiempo antes del cual el token no es válido
- **`roles`**: Array de roles del usuario
- **`type`**: Tipo de token (`refresh` para refresh tokens)

### Ejemplo de Payload Decodificado
```json
{
  "iss": "http://localhost:3001",
  "sub": "user-123",
  "aud": "users-api",
  "exp": 1640995200,
  "iat": 1640994300,
  "nbf": 1640994300,
  "roles": ["user"],
  "type": "access"
}
```

Los tokens se firman con algoritmo RS256 usando claves RSA para mayor seguridad.

## Validaciones

La API utiliza `class-validator` para validar los datos de entrada:

### Crear Usuario
- `email`: Debe ser un email válido
- `password`: Mínimo 6 caracteres, no vacío

### Login
- `email`: Debe ser un email válido
- `password`: No vacío

### Refresh Token
- `refresh_token`: No vacío, debe ser un JWT válido

### Validar Token
- `token`: No vacío, debe ser un JWT válido

## Configuración

Las variables de entorno se configuran en el archivo `.env`:

### Base de Datos
- `MONGO_URI`: URI de conexión a MongoDB (default: `mongodb://localhost:27017/users_db`)
- `MONGO_DB`: Nombre de la base de datos (default: `users_db`)

### JWT
- `JWT_SECRET`: Secreto para JWT (solo usado como fallback si no hay claves RSA)
- `JWT_ISSUER`: Emisor del token JWT (default: `http://localhost:3001`)
- `JWT_AUDIENCE`: Audiencia del token JWT (default: `users-api`)
- `JWT_ACCESS_EXPIRES_IN`: Expiración del access token (default: `15m`)
- `JWT_REFRESH_EXPIRES_IN`: Expiración del refresh token (default: `7d`)

### Aplicación
- `PORT`: Puerto del servidor (default: `3001`)
- `BCRYPT_SALT`: Rounds para hash de passwords (default: `10`)

### Archivos de Claves RSA
La API espera encontrar los archivos de claves RSA en la carpeta `keys/`:
- `keys/private.pem`: Clave privada RSA
- `keys/public.pem`: Clave pública RSA

Si estos archivos no existen, la API usa `JWT_SECRET` como fallback con algoritmo HS256.

### Configuración de Reinos
La API soporta múltiples reinos (realms) para multi-tenancy. Cada reino puede tener su propia configuración de JWT:

```typescript
// En src/config/configuration.ts
realms: {
  default: {
    name: 'default',
    issuer: process.env.JWT_ISSUER,
    audience: process.env.JWT_AUDIENCE,
    accessTokenExpiresIn: '15m',
    refreshTokenExpiresIn: '7d',
  },
  admin: {
    name: 'admin',
    issuer: 'http://admin.example.com',
    audience: 'admin-api',
    accessTokenExpiresIn: '5m',
    refreshTokenExpiresIn: '1d',
  }
}
```

Para usar un reino específico en el login:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "realm": "admin"
}
```

### Generar Claves RSA

Para generar las claves RSA necesarias:

```bash
# Crear directorio keys
mkdir -p keys

# Generar clave privada
openssl genrsa -out keys/private.pem 2048

# Extraer clave pública
openssl rsa -in keys/private.pem -pubout -out keys/public.pem
```

## Ejemplos de Uso

### Registro y Login Completo

```bash
# 1. Crear usuario
curl -X POST http://localhost:3001/v1/users \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'

# 2. Login
curl -X POST http://localhost:3001/v1/users/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'

# 3. Usar access token para acceder a endpoint protegido
curl -X GET http://localhost:3001/v1/users/me \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InJzYS1rZXktMSJ9.eyJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjMwMDEiLCJzdWIiOiJlZDEwYmRmZS02OWQxLTRhZWYtOGJkMy05ZTNmM2VhMmRiZWMiLCJhdWQiOiJ1c2Vycy1hcGkiLCJleHAiOjE3NjM2ODYyNzAsImlhdCI6MTc2MzY4NTM3MCwibmJmIjoxNzYzNjg1MzcwLCJqdGkiOiJjMWNjODZkNy1lNTA1LTRkMDItOWQ5Mi1jMmRmZTEyMTljOTQiLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJ1c2Vycy1hcGkiLCJhY3IiOiIxIiwic2NvcGUiOiJvcGVuaWQgcHJvZmlsZSBlbWFpbCIsImNsaWVudF9pZCI6InVzZXJzLWFwaSIsImNsaWVudEhvc3QiOiJsb2NhbGhvc3QiLCJjbGllbnRBZGRyZXNzIjoiMTI3LjAuMC4xIiwicHJlZmVycmVkX3VzZXJuYW1lIjoidXNlci1lZDEwYmRmZS02OWQxLTRhZWYtOGJkMy05ZTNmM2VhMmRiZWMiLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI6WyJ1c2VyIl19LCJyZXNvdXJjZV9hY2Nlc3MiOnsidXNlcnMtYXBpIjp7InJvbGVzIjpbInVzZXIiXX19fQ.Fca0J5z1gBvSMOeNAvayn1DyDJ7li43blkEJvw0Sr8LfgqosvZPq9CoxuuxHkSIU8cFdTruvuaERR2uQith8CvMJOtrcvLTnH1CngdJF07OW8PfGf8hLqkUqbIgjiM_DdwMkGxkxTKywPwH2qb_qRhN__14R2erJLL24AFRg4H1leTpYNMV5Q090Ib6_4kGuW7NZQMHKtT2RjwAvbt9GSUKA7d-rPYDnY69sjvyOVevZjPkrHENKtZ4Y8jaOo2GDfzt3KYRvwNjUYf5T-JsfggcAdcko8vhIIYqftssa8X5cxgErCN0rb9PbupXChUS1mV2qLRAq_qNI6BP3LxWTuQ"

# 4. Refresh token cuando expire
curl -X POST http://localhost:3001/v1/users/refresh \
  -H "Content-Type: application/json" \
  -d '{"refresh_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InJzYS1rZXktMSJ9.eyJzdWIiOiJlZDEwYmRmZS02OWQxLTRhZWYtOGJkMy05ZTNmM2VhMmRiZWMiLCJ0eXBlIjoicmVmcmVzaCIsImlzcyI6Imh0dHA6Ly9sb2NhbGhvc3Q6MzAwMSIsImF1ZCI6InVzZXJzLWFwaSIsImV4cCI6MTc2NDM1MTgwNiwiaWF0IjoxNzYzNzQ3MDA2LCJuYmYiOjE3NjM3NDcwMDZ9.C-bb8HbQcKz8A2hvDamUxi9ZNS4txbq-TYrH32vfRSqUzr3v1oGC19MeZjJMWQeYmF4OcdDzDnN2u6GXeN9J4c53jfSQmrY7d7LM8vmuZ2ohkZmju-38dsaCLTPVV3-CD1ALJfx9Hu-w1yimumXPMSVtkmJrx5P2-CduL00U88re234YcM2HGMaXvN1lBGRl3W-NSfTHKGE8fQIPxQ-WAhWQslifpmJbSiziQDMtVL0I109JcfNpPUmEgsemeYYl8N7GJd1pRDZfGnGdzA4GWc7QKUy2ACXpYy_9erN5Lsw7neg8rkIQUXk7orCqbVqTIS9R5h2KQ-fPHuusGmYBXw"}'
```

### Validación de Tokens

```bash
# Obtener certificados para validación local
curl -X GET http://localhost:3001/v1/protocol/openid-connect/certs

# Validar token en el servidor
curl -X POST http://localhost:3001/v1/users/validate \
  -H "Content-Type: application/json" \
  -d '{"token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InJzYS1rZXktMSJ9.eyJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjMwMDEiLCJzdWIiOiJlZDEwYmRmZS02OWQxLTRhZWYtOGJkMy05ZTNmM2VhMmRiZWMiLCJhdWQiOiJ1c2Vycy1hcGkiLCJleHAiOjE3NjM2ODYyNzAsImlhdCI6MTc2MzY4NTM3MCwibmJmIjoxNzYzNjg1MzcwLCJqdGkiOiJjMWNjODZkNy1lNTA1LTRkMDItOWQ5Mi1jMmRmZTEyMTljOTQiLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJ1c2Vycy1hcGkiLCJhY3IiOiIxIiwic2NvcGUiOiJvcGVuaWQgcHJvZmlsZSBlbWFpbCIsImNsaWVudF9pZCI6InVzZXJzLWFwaSIsImNsaWVudEhvc3QiOiJsb2NhbGhvc3QiLCJjbGllbnRBZGRyZXNzIjoiMTI3LjAuMC4xIiwicHJlZmVycmVkX3VzZXJuYW1lIjoidXNlci1lZDEwYmRmZS02OWQxLTRhZWYtOGJkMy05ZTNmM2VhMmRiZWMiLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI6WyJ1c2VyIl19LCJyZXNvdXJjZV9hY2Nlc3MiOnsidXNlcnMtYXBpIjp7InJvbGVzIjpbInVzZXIiXX19fQ.Fca0J5z1gBvSMOeNAvayn1DyDJ7li43blkEJvw0Sr8LfgqosvZPq9CoxuuxHkSIU8cFdTruvuaERR2uQith8CvMJOtrcvLTnH1CngdJF07OW8PfGf8hLqkUqbIgjiM_DdwMkGxkxTKywPwH2qb_qRhN__14R2erJLL24AFRg4H1leTpYNMV5Q090Ib6_4kGuW7NZQMHKtT2RjwAvbt9GSUKA7d-rPYDnY69sjvyOVevZjPkrHENKtZ4Y8jaOo2GDfzt3KYRvwNjUYf5T-JsfggcAdcko8vhIIYqftssa8X5cxgErCN0rb9PbupXChUS1mV2qLRAq_qNI6BP3LxWTuQ"}'
```

## Troubleshooting

### Errores Comunes

#### "Internal server error" al crear usuario
- **Causa**: Usuario ya existe
- **Solución**: Verificar que el email no esté registrado. La API ahora retorna `409 Conflict` con mensaje claro.

#### "Unauthorized" en endpoints protegidos
- **Causa**: Token faltante, expirado o inválido
- **Solución**: Verificar que el header `Authorization: Bearer <token>` esté presente y el token sea válido

#### Conexión rechazada
- **Causa**: Servidor no está ejecutándose o MongoDB no está disponible
- **Solución**: Verificar que `npm start` esté corriendo y MongoDB esté disponible

#### Error de validación
- **Causa**: Datos de entrada no cumplen con las validaciones
- **Solución**: Revisar los requisitos de cada campo en la sección de validaciones

### Logs Útiles

Para debugging, revisar los logs del servidor que incluyen:
- Conexión a base de datos
- Errores de autenticación
- Validaciones fallidas
- Errores de JWT

## Testing

### Ejecutar Tests
```bash
# Ejecutar todos los tests
npm run test

# Ejecutar tests en modo watch
npm run test:watch

# Ejecutar tests con coverage
npm run test:cov
```

### Tests Disponibles
- **Unit Tests**: Tests de casos de uso, entidades y value objects
- **Integration Tests**: Tests de controladores y adaptadores
- **E2E Tests**: Tests end-to-end de la API completa

## Linting

```bash
npm run lint
```

El proyecto usa ESLint con reglas de TypeScript para mantener la calidad del código.

## Validación de Tokens

La API utiliza JWT firmados con RS256. Los clientes pueden validar tokens localmente usando las claves públicas disponibles en `/v1/protocol/openid-connect/certs`.

### Conceptos Básicos

- **Decodificación**: Obtener información del token sin verificar firma
- **Verificación**: Validar la firma del token usando la clave pública
- **JWK**: JSON Web Key - formato estándar para claves públicas

### JavaScript/Node.js

#### Instalación
```bash
npm install jsonwebtoken jwk-to-pem jwt-decode
```

#### Validación Completa
```javascript
const jwt = require('jsonwebtoken');
const jwkToPem = require('jwk-to-pem');
const jwtDecode = require('jwt-decode');

class TokenValidator {
  constructor(baseUrl = 'http://localhost:3001') {
    this.baseUrl = baseUrl;
    this.publicKey = null;
  }

  // Obtener clave pública del servidor
  async loadPublicKey() {
    if (this.publicKey) return this.publicKey;

    const response = await fetch(`${this.baseUrl}/v1/protocol/openid-connect/certs`);
    const certs = await response.json();
    const jwk = certs.keys[0]; // Primera clave

    this.publicKey = jwkToPem(jwk);
    return this.publicKey;
  }

  // Validar token completamente
  async validateToken(token) {
    try {
      const key = await this.loadPublicKey();
      const decoded = jwt.verify(token, key, { algorithms: ['RS256'] });

      return {
        valid: true,
        payload: decoded,
        user: {
          id: decoded.sub,
          roles: decoded.roles
        }
      };
    } catch (error) {
      return {
        valid: false,
        error: error.message
      };
    }
  }

  // Decodificar token sin verificación (para info básica)
  decodeToken(token) {
    try {
      return jwtDecode(token);
    } catch (error) {
      return null;
    }
  }

  // Verificar si token está expirado
  isTokenExpired(token) {
    const decoded = this.decodeToken(token);
    if (!decoded || !decoded.exp) return true;

    return decoded.exp * 1000 < Date.now();
  }

  // Obtener tiempo restante del token
  getTokenTimeLeft(token) {
    const decoded = this.decodeToken(token);
    if (!decoded || !decoded.exp) return 0;

    return decoded.exp * 1000 - Date.now();
  }
}

// Uso
const validator = new TokenValidator();

async function example() {
  const token = 'eyJhbGciOiJSUzI1NiIs...'; // Token del login

  // Decodificar sin verificar
  const info = validator.decodeToken(token);
  console.log('User ID:', info.sub);
  console.log('Roles:', info.roles);
  console.log('Expires:', new Date(info.exp * 1000));

  // Validar completamente
  const validation = await validator.validateToken(token);
  if (validation.valid) {
    console.log('Token válido para user:', validation.user);
  } else {
    console.log('Token inválido:', validation.error);
  }

  // Verificar expiración
  if (validator.isTokenExpired(token)) {
    console.log('Token expirado');
  } else {
    console.log('Tiempo restante:', validator.getTokenTimeLeft(token), 'ms');
  }
}
```

#### Cliente HTTP con Interceptor
```javascript
class AuthenticatedHttpClient {
  constructor(baseUrl, tokenValidator) {
    this.baseUrl = baseUrl;
    this.validator = tokenValidator;
    this.accessToken = null;
  }

  setToken(token) {
    this.accessToken = token;
  }

  async request(url, options = {}) {
    // Verificar si el token está por expirar
    if (this.accessToken && this.validator.getTokenTimeLeft(this.accessToken) < 300000) { // 5 min
      console.log('Token próximo a expirar, considera refrescarlo');
    }

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const response = await fetch(`${this.baseUrl}${url}`, {
      ...options,
      headers
    });

    if (response.status === 401) {
      // Token inválido, redirigir a login
      throw new Error('Unauthorized');
    }

    return response;
  }
}
```

### Python

#### Instalación
```bash
pip install PyJWT requests cryptography
```

#### Validación Completa
```python
import jwt
import requests
from cryptography.hazmat.primitives import serialization
import json
from datetime import datetime, timezone

class TokenValidator:
    def __init__(self, base_url='http://localhost:3001'):
        self.base_url = base_url
        self.public_key = None

    def load_public_key(self):
        """Cargar clave pública del servidor"""
        if self.public_key:
            return self.public_key

        response = requests.get(f"{self.base_url}/v1/protocol/openid-connect/certs")
        certs = response.json()
        jwk = certs['keys'][0]

        # Convertir JWK a formato PEM
        self.public_key = jwt.algorithms.RSAAlgorithm.from_jwk(json.dumps(jwk))
        return self.public_key

    def validate_token(self, token):
        """Validar token completamente"""
        try:
            key = self.load_public_key()
            payload = jwt.decode(token, key, algorithms=['RS256'])

            return {
                'valid': True,
                'payload': payload,
                'user': {
                    'id': payload['sub'],
                    'roles': payload.get('roles', [])
                }
            }
        except jwt.ExpiredSignatureError:
            return {'valid': False, 'error': 'Token expirado'}
        except jwt.InvalidTokenError as e:
            return {'valid': False, 'error': str(e)}

    def decode_token(self, token):
        """Decodificar sin verificar firma"""
        try:
            # Decodificar sin verificar
            header = jwt.get_unverified_header(token)
            payload = jwt.decode(token, options={"verify_signature": False})
            return payload
        except:
            return None

    def is_token_expired(self, token):
        """Verificar si token está expirado"""
        payload = self.decode_token(token)
        if not payload or 'exp' not in payload:
            return True

        exp_time = datetime.fromtimestamp(payload['exp'], tz=timezone.utc)
        return exp_time < datetime.now(timezone.utc)

    def get_token_time_left(self, token):
        """Obtener tiempo restante en segundos"""
        payload = self.decode_token(token)
        if not payload or 'exp' not in payload:
            return 0

        exp_time = datetime.fromtimestamp(payload['exp'], tz=timezone.utc)
        remaining = exp_time - datetime.now(timezone.utc)
        return max(0, int(remaining.total_seconds()))

# Uso
validator = TokenValidator()

def example():
    token = "eyJhbGciOiJSUzI1NiIs..."  # Token del login

    # Decodificar sin verificar
    info = validator.decode_token(token)
    if info:
        print(f"User ID: {info['sub']}")
        print(f"Roles: {info.get('roles', [])}")
        print(f"Expires: {datetime.fromtimestamp(info['exp'])}")

    # Validar completamente
    validation = validator.validate_token(token)
    if validation['valid']:
        print(f"Token válido para user: {validation['user']}")
    else:
        print(f"Token inválido: {validation['error']}")

    # Verificar expiración
    if validator.is_token_expired(token):
        print("Token expirado")
    else:
        print(f"Tiempo restante: {validator.get_token_time_left(token)} segundos")
```

#### Cliente HTTP con Requests
```python
import requests

class AuthenticatedHttpClient:
    def __init__(self, base_url, token_validator):
        self.base_url = base_url
        self.validator = token_validator
        self.access_token = None
        self.session = requests.Session()

    def set_token(self, token):
        self.access_token = token

    def request(self, method, url, **kwargs):
        # Verificar si el token está por expirar
        if self.access_token and self.validator.get_token_time_left(self.access_token) < 300:  # 5 min
            print("Token próximo a expirar, considera refrescarlo")

        headers = kwargs.get('headers', {})
        headers['Content-Type'] = 'application/json'

        if self.access_token:
            headers['Authorization'] = f'Bearer {self.access_token}'

        kwargs['headers'] = headers

        response = self.session.request(method, f"{self.base_url}{url}", **kwargs)

        if response.status_code == 401:
            raise Exception('Unauthorized')

        return response
```

### Java

#### Dependencias (Maven)
```xml
<dependencies>
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-api</artifactId>
        <version>0.11.5</version>
    </dependency>
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-impl</artifactId>
        <version>0.11.5</version>
    </dependency>
    <dependency>
        <groupId>com.fasterxml.jackson.core</groupId>
        <artifactId>jackson-databind</artifactId>
        <version>2.15.2</version>
    </dependency>
    <dependency>
        <groupId>org.apache.httpcomponents.client5</groupId>
        <artifactId>httpclient5</artifactId>
        <version>5.2.1</version>
    </dependency>
</dependencies>
```

#### Validación Completa
```java
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.URI;
import java.security.KeyFactory;
import java.security.PublicKey;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;
import java.util.Date;
import java.util.Map;

public class TokenValidator {
    private final String baseUrl;
    private PublicKey publicKey;
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    public TokenValidator(String baseUrl) {
        this.baseUrl = baseUrl;
        this.httpClient = HttpClient.newHttpClient();
        this.objectMapper = new ObjectMapper();
    }

    public PublicKey loadPublicKey() throws Exception {
        if (publicKey != null) return publicKey;

        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create(baseUrl + "/v1/protocol/openid-connect/certs"))
            .GET()
            .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        JsonNode certs = objectMapper.readTree(response.body());
        JsonNode jwk = certs.get("keys").get(0);

        // Convertir JWK a PublicKey
        String modulus = jwk.get("n").asText();
        String exponent = jwk.get("e").asText();

        byte[] modulusBytes = Base64.getUrlDecoder().decode(modulus);
        byte[] exponentBytes = Base64.getUrlDecoder().decode(exponent);

        java.security.spec.RSAPublicKeySpec spec = new java.security.spec.RSAPublicKeySpec(
            new java.math.BigInteger(1, modulusBytes),
            new java.math.BigInteger(1, exponentBytes)
        );

        KeyFactory kf = KeyFactory.getInstance("RSA");
        publicKey = kf.generatePublic(spec);
        return publicKey;
    }

    public TokenValidationResult validateToken(String token) {
        try {
            PublicKey key = loadPublicKey();
            var claims = Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();

            return new TokenValidationResult(true, claims, null);
        } catch (Exception e) {
            return new TokenValidationResult(false, null, e.getMessage());
        }
    }

    public Map<String, Object> decodeToken(String token) {
        try {
            var claims = Jwts.parserBuilder()
                .setSigningKeyResolver(ctx -> {
                    // Para decodificar sin verificar, usamos una clave dummy
                    return Keys.hmacShaKeyFor("dummy".getBytes());
                })
                .build()
                .parseClaimsJws(token.replace(".", ".dummy."))
                .getBody();

            return claims;
        } catch (Exception e) {
            return null;
        }
    }

    public boolean isTokenExpired(String token) {
        Map<String, Object> claims = decodeToken(token);
        if (claims == null || !claims.containsKey("exp")) return true;

        long exp = ((Number) claims.get("exp")).longValue() * 1000;
        return exp < System.currentTimeMillis();
    }

    public static class TokenValidationResult {
        public final boolean valid;
        public final Map<String, Object> claims;
        public final String error;

        public TokenValidationResult(boolean valid, Map<String, Object> claims, String error) {
            this.valid = valid;
            this.claims = claims;
            this.error = error;
        }
    }
}
```

### Go

#### Instalación
```bash
go get github.com/golang-jwt/jwt/v5
go get github.com/go-resty/resty/v2
```

#### Validación Completa
```go
package main

import (
    "crypto/rsa"
    "encoding/base64"
    "encoding/json"
    "fmt"
    "math/big"
    "net/http"
    "time"

    "github.com/golang-jwt/jwt/v5"
    "github.com/go-resty/resty/v2"
)

type TokenValidator struct {
    baseURL   string
    publicKey *rsa.PublicKey
    client    *resty.Client
}

type JWK struct {
    Kty string `json:"kty"`
    Use string `json:"use"`
    Kid string `json:"kid"`
    N   string `json:"n"`
    E   string `json:"e"`
    Alg string `json:"alg"`
}

type CertsResponse struct {
    Keys []JWK `json:"keys"`
}

func NewTokenValidator(baseURL string) *TokenValidator {
    return &TokenValidator{
        baseURL: baseURL,
        client:  resty.New(),
    }
}

func (tv *TokenValidator) loadPublicKey() (*rsa.PublicKey, error) {
    if tv.publicKey != nil {
        return tv.publicKey, nil
    }

    resp, err := tv.client.R().
        SetResult(&CertsResponse{}).
        Get(tv.baseURL + "/v1/protocol/openid-connect/certs")

    if err != nil {
        return nil, err
    }

    certs := resp.Result().(*CertsResponse)
    if len(certs.Keys) == 0 {
        return nil, fmt.Errorf("no keys found")
    }

    jwk := certs.Keys[0]

    // Decodificar modulus y exponent
    modulus, err := base64.RawURLEncoding.DecodeString(jwk.N)
    if err != nil {
        return nil, err
    }

    exponent, err := base64.RawURLEncoding.DecodeString(jwk.E)
    if err != nil {
        return nil, err
    }

    // Crear clave pública RSA
    pubKey := &rsa.PublicKey{
        N: new(big.Int).SetBytes(modulus),
        E: int(new(big.Int).SetBytes(exponent).Int64()),
    }

    tv.publicKey = pubKey
    return pubKey, nil
}

func (tv *TokenValidator) ValidateToken(tokenString string) (bool, map[string]interface{}, error) {
    pubKey, err := tv.loadPublicKey()
    if err != nil {
        return false, nil, err
    }

    token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
        if _, ok := token.Method.(*jwt.SigningMethodRSA); !ok {
            return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
        }
        return pubKey, nil
    })

    if err != nil {
        return false, nil, err
    }

    if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
        user := map[string]interface{}{
            "id":   claims["sub"],
            "roles": claims["roles"],
        }
        return true, user, nil
    }

    return false, nil, fmt.Errorf("invalid token")
}

func (tv *TokenValidator) DecodeToken(tokenString string) (map[string]interface{}, error) {
    token, _, err := new(jwt.Parser).ParseUnverified(tokenString, jwt.MapClaims{})
    if err != nil {
        return nil, err
    }

    if claims, ok := token.Claims.(jwt.MapClaims); ok {
        return claims, nil
    }

    return nil, fmt.Errorf("invalid token claims")
}

func (tv *TokenValidator) IsTokenExpired(tokenString string) bool {
    claims, err := tv.DecodeToken(tokenString)
    if err != nil {
        return true
    }

    if exp, ok := claims["exp"].(float64); ok {
        return time.Unix(int64(exp), 0).Before(time.Now())
    }

    return true
}

func (tv *TokenValidator) GetTokenTimeLeft(tokenString string) time.Duration {
    claims, err := tv.DecodeToken(tokenString)
    if err != nil {
        return 0
    }

    if exp, ok := claims["exp"].(float64); ok {
        expTime := time.Unix(int64(exp), 0)
        remaining := expTime.Sub(time.Now())
        if remaining < 0 {
            return 0
        }
        return remaining
    }

    return 0
}

// Uso
func main() {
    validator := NewTokenValidator("http://localhost:3001")
    token := "eyJhbGciOiJSUzI1NiIs..." // Token del login

    // Decodificar sin verificar
    claims, err := validator.DecodeToken(token)
    if err == nil {
        fmt.Printf("User ID: %v\n", claims["sub"])
        fmt.Printf("Roles: %v\n", claims["roles"])
        if exp, ok := claims["exp"].(float64); ok {
            fmt.Printf("Expires: %v\n", time.Unix(int64(exp), 0))
        }
    }

    // Validar completamente
    valid, user, err := validator.ValidateToken(token)
    if valid {
        fmt.Printf("Token válido para user: %v\n", user)
    } else {
        fmt.Printf("Token inválido: %v\n", err)
    }

    // Verificar expiración
    if validator.IsTokenExpired(token) {
        fmt.Println("Token expirado")
    } else {
        fmt.Printf("Tiempo restante: %v\n", validator.GetTokenTimeLeft(token))
    }
}
```

## Arquitectura en Detalle

### Domain Layer
Contiene las reglas de negocio puras. Las entidades y value objects encapsulan la lógica del dominio.

### Application Layer
Orquesta los casos de uso. Los use-cases usan los ports para acceder a dependencias externas sin conocer la implementación.

### Infrastructure Layer
Implementa los ports definidos en el dominio. Aquí viven los detalles técnicos como bases de datos, APIs externas, etc.

Esta separación permite:
- Cambiar la base de datos sin afectar el dominio
- Reutilizar lógica de negocio en diferentes interfaces (REST, GraphQL, CLI)
- Testing unitario del dominio sin dependencias externas

## 🚀 Despliegue en Producción

### Prerrequisitos

- VPS con Ubuntu/Debian/CentOS
- Docker y Docker Compose instalados
- Traefik corriendo en una red compartida llamada `traefik-net`
- Puerto 80/443 abierto (manejado por Traefik)
- Dominio apuntando a tu VPS (requerido para SSL automático)

### Paso 1: Preparar el Servidor

```bash
# Actualizar el sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker si no está instalado
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Reiniciar sesión para aplicar cambios de grupo
newgrp docker
```

### Paso 2: Clonar y Configurar el Proyecto

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/users-api.git
cd users-api

# Copiar archivo de configuración
cp .env.example .env

# Editar variables de entorno
nano .env
```

### Paso 3: Configurar Variables de Entorno

Edita el archivo `.env` con valores seguros para producción:

```bash
# Puerto de la aplicación (interno, no expuesto)
PORT=3001

# Dominio para Traefik (requerido)
DOMAIN=api.tu-dominio.com

# Base de datos MongoDB
MONGO_URI=mongodb://users-mongo:27017/users_db
MONGO_DB=users_db
MONGO_ROOT_USERNAME=tu_usuario_mongo_seguro
MONGO_ROOT_PASSWORD=tu_password_mongo_muy_seguro

# JWT - Genera una clave segura
JWT_SECRET=tu_clave_jwt_muy_segura_de_al_menos_32_caracteres
JWT_EXPIRES=12h
BCRYPT_SALT=12
```

### Paso 4: Verificar Traefik

Antes de desplegar, asegúrate de que Traefik esté corriendo y tenga la red `traefik-net`:

```bash
# Verificar que Traefik esté corriendo
docker ps | grep traefik

# Verificar que la red traefik-net existe
docker network ls | grep traefik-net

# Si no existe, créala (o configúrala en tu docker-compose principal)
docker network create traefik-net
```

### Paso 5: Desplegar con Docker

```bash
# Hacer ejecutable el script de despliegue
chmod +x deploy.sh

# Ejecutar despliegue
./deploy.sh
```

### Paso 6: Verificar el Despliegue

```bash
# Verificar que los contenedores estén corriendo
docker-compose -f docker-compose.prod.yml ps

# Ver logs de la aplicación
docker-compose -f docker-compose.prod.yml logs -f users-api

# Verificar health check a través de Traefik
curl https://api.tu-dominio.com/health
```

### Paso 7: SSL Automático con Traefik

Traefik automáticamente:
- Obtiene certificados SSL de Let's Encrypt
- Renueva certificados automáticamente
- Maneja redirección HTTP → HTTPS

Verifica que tu configuración de Traefik incluya:
- `certificatesResolvers.letsencrypt.acme.email=tu-email@dominio.com`
- `certificatesResolvers.letsencrypt.acme.storage=/letsencrypt/acme.json`
- `certificatesResolvers.letsencrypt.acme.httpChallenge.entryPoint=http`

## 📊 Monitoreo y Mantenimiento

### Comandos Útiles

```bash
# Ver logs en tiempo real de la aplicación
docker-compose -f docker-compose.prod.yml logs -f users-api

# Ver logs de Traefik (desde tu docker-compose principal)
docker-compose logs -f traefik

# Reiniciar servicios
docker-compose -f docker-compose.prod.yml restart

# Actualizar aplicación
git pull origin main
docker-compose -f docker-compose.prod.yml up -d --build

# Backup de base de datos
docker-compose -f docker-compose.prod.yml exec mongo mongodump --db users_db --out /backup

# Verificar estado de Traefik
curl -H "Authorization: Bearer your-traefik-token" http://localhost:8080/api/http/routers
```

### Health Checks

- **API Health**: `GET https://tu-dominio.com/health`
- **Swagger Docs**: `https://tu-dominio.com/api`
- **MongoDB**: Puerto 27017 (solo local)
- **Traefik Dashboard**: `http://tu-vps-ip:8080` (si está expuesto)

## 🔧 Solución de Problemas

### Error: traefik-net network not found
```bash
# Crear la red si no existe
docker network create traefik-net

# O verificar que esté definida en tu docker-compose principal
docker network ls | grep traefik-net
```

### Error: Port already in use
```bash
# Liberar puerto (si aplicable)
sudo lsof -ti:3001 | xargs kill -9
```

### Error: MongoDB connection failed
```bash
# Verificar que MongoDB esté corriendo
docker-compose -f docker-compose.prod.yml ps

# Ver logs de MongoDB
docker-compose -f docker-compose.prod.yml logs mongo
```

### Error: Permission denied
```bash
# Asegurarse de que el usuario esté en el grupo docker
sudo usermod -aG docker $USER
newgrp docker
```

### Error: Traefik no puede resolver el dominio
```bash
# Verificar que el dominio apunta correctamente a tu VPS
nslookup tu-dominio.com

# Verificar configuración DNS
dig tu-dominio.com
```