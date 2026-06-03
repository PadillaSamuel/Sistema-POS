# AGENTS.md

Instrucciones para agentes que trabajen en este repositorio.

## Vista general

Monorepo con **dos paquetes independientes** (sin workspace tooling, el pegamento es `docker-compose.yml`):

- `sistema_pedidos/` — backend Spring Boot 3.4.1, Java 21, Maven (`./mvnw`).
- `frontend/` — frontend React 19 + Vite 7, npm.
- `docker-compose.yml` — mysql:8.4 + backend + frontend en la red `artesanos-net`.
- Raíz `.env` — variables que consume Docker Compose (mysql + build args del frontend).
- `sistema_pedidos/.env` — variables que carga Spring Boot en arranque (vía `spring-dotenv`).
- `frontend/.env` — variables que carga Vite al hacer `npm run dev` local.

Entry points:
- Backend: `sistema_pedidos/src/main/java/com/artesanos/sistema_pedidos/SistemaPedidosApplication.java`.
- Frontend: `frontend/src/main.jsx` (monta `App.jsx`, que tiene todas las rutas).

## Comandos clave

### Toda la pila (Windows)
- `artesanos.bat` → `docker-compose up -d` (levanta mysql + backend + frontend).
- `cerrar_artesanos.bat` → `docker-compose down` (apaga los contenedores).

### Backend (`sistema_pedidos/`)
- `./mvnw spring-boot:run` — corre el backend (puerto 8080).
- `./mvnw test` — corre la suite (hoy solo `SistemaPedidosApplicationTests.contextLoads`).
- `./mvnw clean package -DskipTests` — empaqueta el JAR (lo usa el Dockerfile multi-stage).
- Swagger UI: `http://localhost:8080/swagger-ui.html`.

### Frontend (`frontend/`)
- `npm install` (primera vez).
- `npm run dev` — Vite dev server (puerto 5173).
- `npm run build` — build de producción a `dist/`.
- `npm run lint` — ESLint 9 (flat config en `eslint.config.js`).
- `npm run preview` — sirve el build de producción localmente.

## Gotchas importantes

### 1. `docker-compose.yml` tiene un merge conflict sin resolver
Líneas 42-48 de `docker-compose.yml` aún contienen los marcadores `<<<<<<< HEAD` / `=======` / `>>>>>>> ad854fa4bc7df26fb180284da68733ba247469c9` en los build args del servicio `frontend`. `docker-compose up` fallará hasta que se resuelva. La rama de `=======` (variables de entorno) es la consistente con el resto del archivo.

### 2. Hay tres archivos `.env` con propósitos distintos
No los confundas:
- **Raíz `.env`** → lo lee docker-compose para mysql-db y para pasar como `build args` al frontend (`VITE_API_URL`, `VITE_IMPRESORA_COCINA`, `VITE_IMPRESORA_FACTURA`).
- **`sistema_pedidos/.env`** → lo carga Spring Boot automáticamente por la dependencia `spring-dotenv` (variables `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET`, `JWT_EXPIRATION_MS`, `CORS_ORIGINS`, `PRINTER_DEFAULT_PORT`, `PRINTER_CHAR_WIDTH`, `IMPRESORA_COCINA_IP`, `IMPRESORA_FACTURA_IP`).
- **`frontend/.env`** → lo lee Vite al hacer `npm run dev` local (mismas `VITE_*` que el root, pero con valores para LAN).

`.gitignore` permite commitear `.env.example` pero **no existe ninguno**; los `.env` reales sí están versionados.

### 3. VSCode `launch.json` apunta al `.env` equivocado
`.vscode/launch.json` define `envFile: ${workspaceFolder}/.env` (el de la raíz), pero Spring Boot espera las variables en `sistema_pedidos/.env`. Al depurar con F5 en VSCode, las propiedades como `JWT_SECRET`, `DB_URL`, etc. no se resolverán y la app fallará al arrancar. Si vas a depurar, cambia el `envFile` a `${workspaceFolder}/sistema_pedidos/.env` o duplica las variables en el root.

### 4. `JWT_SECRET` es obligatorio
`application.properties` usa `${JWT_SECRET}` sin default. Si la variable no está definida, Spring Boot falla al arrancar con `IllegalArgumentException: Could not resolve placeholder 'JWT_SECRET'`.

### 5. Schema de BD auto-gestionado
`spring.jpa.hibernate.ddl-auto=update` — Hibernate crea/actualiza tablas solo. **No hay migraciones Flyway/Liquibase.** Si cambias una entidad, no escribas SQL a mano; deja que arranque una vez y verifica.

### 6. Lombok
El backend usa Lombok. El IDE (VScode/Eclipse/IntelliJ) necesita **annotation processing** habilitado o verás errores de compilación falsos. En VSCode, instalar la extensión `Project Lombok` y aceptar el popup de habilitar AP.

### 7. Configuración de impresoras (hardware)
- Backend habla con impresoras térmicas por red (puerto 9100) usando `escpos-coffee`.
- IPs configurables vía `IMPRESORA_COCINA_IP` y `IMPRESORA_FACTURA_IP` (defaults 192.168.1.200 y 192.168.1.100). El frontend recibe esas mismas IPs como `VITE_IMPRESORA_COCINA` y `VITE_IMPRESORA_FACTURA`.
- Si corres sin impresoras en la red, los endpoints de impresión (controlador `ImpresoraController`) van a fallar; el resto de la app funciona normal.

### 8. El proxy de Vite parece sin uso
`vite.config.js` define un proxy para `/api` y `/auth` hacia `VITE_API_URL`, pero `src/services/api.js` hace `fetch` contra `BASE_URL = import.meta.env.VITE_API_URL` (URL absoluta). **Las llamadas en `api.js` no pasan por el proxy de Vite.** Solo sirve si algún servicio futuro usa rutas relativas.

## Convenciones del repo

- **Idioma**: UI, README y comentarios de código están en español. Los identificadores y mensajes técnicos, en inglés.
- **Frontend `src/pages/`**: los archivos usan `snake_case` (`home_caja.jsx`, `tomar_pedido.jsx`, `gestion_productos.jsx`, etc.) — **no** migrar a `PascalCase` ni a `kebab-case` sin coordinarlo; rompes los imports de `App.jsx`.
- **Frontend `src/components/`**: igual, `snake_case` (`fila_producto.jsx`, `boton_pedido.jsx`, etc.).
- **Backend `src/main/java/com/artesanos/sistema_pedidos/`**: paquetes por capa (`controllers/`, `services/`, `repositories/`, `entities/`, `dtos/`, `enums/`, `exceptions/`, `jwt/`, `auth/`, `configurations/`). Mantener el agrupamiento.
- **DTOs y entidades** van en sus paquetes dedicados; los controllers no deben manejar lógica de negocio, solo delegar a `services/`.
- **Rutas del frontend** están centralizadas en `App.jsx` (no hay un archivo `routes.jsx` separado).

## Pruebas

- **Backend**: suite mínima — solo `SistemaPedidosApplicationTests.contextLoads`. No hay tests de integración ni de controllers. `application.properties` apunta a la BD real (`jdbc:mysql://localhost:3306/artesanos`), por lo que `./mvnw test` puede fallar si MySQL no está corriendo, a menos que uses Testcontainers o H2 (no configurado).
- **Frontend**: sin scripts de test. No hay Vitest ni Jest instalados. Si necesitas tests, instala y configura desde cero.
- **CI**: no hay workflows en `.github/` (solo `modernize/` con hooks de Java upgrade, no CI).

## Archivos que conviene leer antes de cambiar

- `docker-compose.yml` — entender el wiring de los tres servicios y el `.env` que cada uno lee.
- `sistema_pedidos/src/main/resources/application.properties` — todas las propiedades externas del backend y sus defaults.
- `frontend/vite.config.js` — entender el proxy y cómo se carga el `.env`.
- `frontend/src/App.jsx` — mapa completo de rutas.
- `frontend/src/services/api.js` — cómo se hacen las llamadas HTTP y se manejan tokens/401.
