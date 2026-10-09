# SnailBet v2 — Ruta de desarrollo

Oct 7, 2026 · @leonardoigz

## Objetivo

En la v2, el backend es la fuente de verdad: autentica, guarda el saldo y procesa los pagos. El frontend solo valida la entrada y presenta lo que el API responde. La meta es una pieza de portafolio que muestre criterio de backend, no solo una app que funciona.

Con 1 a 2 horas diarias, la ruta completa toma de 8 a 10 semanas. Las fases 0 a 5 ya forman un proyecto presentable; las 6 a 8 lo elevan.

| Tema | v1 (prueba técnica) | v2 |
| --- | --- | --- |
| Autenticación | Simulada en el navegador, hash PBKDF2 en el cliente | En el API: hash argon2id y sesión en cookie httpOnly |
| Persistencia | localStorage | PostgreSQL con migraciones versionadas |
| Saldo | Número en el perfil que el frontend modifica | Libro de movimientos en centavos; solo el backend lo cambia |
| Pagos | Tarjeta y CVV guardados en localStorage | Solo los últimos 4 dígitos; idempotencia; SnailPay como servicio aparte |
| Carreras | Simuladas en el navegador en cada recarga | Simuladas en el servidor una vez por día y guardadas |
| Contratos | Tipos solo en el frontend | Schemas zod compartidos entre API y web |

## Qué vive en cada lado

La regla: si algo afecta al dinero o a la identidad, lo decide el backend. El frontend puede repetir una validación para dar una mejor experiencia, nunca como medida de seguridad, porque cualquiera puede saltarse el navegador y llamar al API directamente.

| Responsabilidad | Backend (decide)                                               | Frontend (presenta)                                                          |
| --------------- | -------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Contraseñas     | Hashea con argon2id y verifica                                 | Envía las credenciales por HTTPS; nunca las guarda                           |
| Sesión          | Crea, valida y revoca la cookie httpOnly                       | No puede leer la cookie; pregunta a `/me` quién es el usuario                |
| Validación      | Valida cada request; es la autoridad                           | Valida con los mismos schemas para mostrar errores al instante               |
| Saldo           | Lo calcula y modifica dentro de transacciones de base de datos | Muestra el saldo que devuelve el API                                         |
| Pagos           | Llama a SnailPay, aplica idempotencia y registra el movimiento | Captura la tarjeta, envía la clave de idempotencia, maneja estados y timeout |
| Carreras        | Simula, guarda y agrega las estadísticas                       | Dibuja las gráficas                                                          |
| Errores         | Responde códigos estables con un formato uniforme              | Traduce cada código a un mensaje para el usuario                             |
| Acceso          | Protege cada endpoint (401 sin sesión)                         | Guardias de ruta solo para la navegación                                     |
| Caché de datos  | Pone los encabezados de caché adecuados                        | TanStack Query cachea e invalida después de cada cambio                      |

## Arquitectura y stack

Tres aplicaciones y un paquete compartido en un monorepo con pnpm. El API concentra toda la lógica, SnailPay es un servicio independiente que el API llama por HTTP, y la web solo habla con el API.

&#91;embedded content: arquitectura · 3 aplicaciones, 1 paquete compartido\]

La web nunca llama a SnailPay ni a la base de datos: todo pasa por el API. Las líneas punteadas indican que web y API importan los mismos schemas de `contracts`.

```
snailbet/
├── apps/
│   ├── api/          Express + TypeScript
│   ├── snailpay/     Express + TypeScript (pasarela simulada)
│   └── web/          React + Vite
├── packages/
│   └── contracts/    schemas zod y tipos compartidos
├── docs/adr/         registros de decisiones
└── docker-compose.yml
```

El API se organiza en capas: las rutas reciben, los controladores traducen HTTP, los servicios aplican las reglas de negocio y los repositorios hablan con la base de datos. Un controlador nunca toca SQL y un servicio nunca conoce `req` ni `res`.

| Capa | Herramienta | Por qué |
| --- | --- | --- |
| Base de datos | PostgreSQL | Ya la dominas; transacciones y restricciones `CHECK` protegen el saldo |
| Acceso a datos | Drizzle ORM | SQL tipado y cercano al SQL que ya escribes; migraciones versionadas |
| Contraseñas | argon2id | Recomendación actual de OWASP para servidores |
| Validación | zod 4 en `packages/contracts` | Un mismo schema valida en el API y en los formularios |
| Logs | pino | Logs estructurados en JSON con un id por petición |
| Web | React, React Router, TanStack Query, react-hook-form, Tailwind | Estado del servidor separado del estado de la interfaz |
| Pruebas | Vitest, Supertest, Testcontainers, MSW, Playwright | Una herramienta por capa (ver Estrategia de pruebas) |
| Infraestructura | Docker Compose, GitHub Actions, VPS con Nginx | Entorno reproducible, CI en cada push, despliegue con HTTPS |

**Decisiones a tomar en la fase 0**, cada una registrada como un ADR corto en `docs/adr/`:

1. **Sesión:** cookie httpOnly con id de sesión guardado en la base (recomendada: se revoca al instante y es simple), o JWT de acceso con refresh rotativo (más piezas; útil si quieres practicar JWT).
2. **ORM:** Drizzle (recomendado) o Prisma (más popular, más abstracción sobre el SQL).
3. **Despliegue:** tu propio VPS con Nginx (aprovecha tu experiencia) o una plataforma administrada como Render o Railway.
4. **Dinero:** centavos enteros en toda la aplicación. Esta ya queda cerrada desde la v1.

## Fases de desarrollo

Nueve fases en orden: cada una termina con algo que funciona, está probado y queda integrado a `main`. Las sesiones son de 1.5 horas aproximadamente; marca cada tarea al terminarla.

&#91;embedded content: ruta · 9 fases en 3 etapas\]

Al cerrar la fase 5 ya tienes autenticación, saldo y pagos funcionando de punta a punta; las fases 6 a 8 lo convierten en un proyecto de nivel profesional.

### Fase 0 · Fundamentos (3 a 4 sesiones)

Objetivo: un monorepo donde todo arranca, se prueba y pasa CI antes de escribir lógica de negocio.

- [ ] Workspace con `apps/api`, `apps/web`, `apps/snailpay` y `packages/contracts`
- [ ] `tsconfig` base compartido, ESLint y Prettier
- [ ] Vitest configurado en cada paquete
- [ ] `docker-compose.yml` con PostgreSQL
- [ ] GitHub Actions: lint, typecheck y tests en cada push
- [ ] `GET /health` en el API y en SnailPay
- [ ] ADRs de las cuatro decisiones iniciales

Terminada cuando: un push corre CI en verde y un solo comando levanta todo el entorno.

### Fase 1 · Núcleo del API (4 a 5 sesiones)

Objetivo: la infraestructura que todos los endpoints van a reutilizar.

- [ ] Variables de entorno validadas con zod al arrancar: si falta una, el proceso no inicia
- [ ] Logger pino con un id por petición
- [ ] Middleware de errores con un formato único: `{ error: { code, message, details } }`
- [ ] Middleware de validación que recibe un schema de `contracts`
- [ ] Drizzle conectado, primera migración (tabla `users`)
- [ ] Pruebas de integración contra un PostgreSQL real con Testcontainers

Terminada cuando: un request inválido responde 400 con el formato único y las pruebas contra la base corren en CI.

### Fase 2 · Autenticación en el API (5 a 6 sesiones)

Objetivo: identidad y sesión resueltas por completo en el servidor.

- [ ] Tablas `users` y `sessions`
- [ ] `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`
- [ ] Hash con argon2id
- [ ] Cookie `httpOnly`, `Secure` y `SameSite=Lax`
- [ ] Mismo error para correo inexistente y contraseña incorrecta
- [ ] Límite de intentos en el login
- [ ] Pruebas con Supertest de cada endpoint

Terminada cuando: el flujo completo funciona solo con Supertest, el logout revoca la sesión y la contraseña nunca aparece en logs ni en respuestas.

### Fase 3 · Web y sesión (5 a 6 sesiones)

Objetivo: la interfaz de autenticación conectada al API real, sin datos sensibles en el navegador.

- [ ] Vite, React Router, TanStack Query y Tailwind
- [ ] Cliente HTTP con `credentials: 'include'` que traduce los códigos de error
- [ ] Formularios con react-hook-form y los schemas de `contracts`
- [ ] Una query `useMe()` como única fuente de "quién está conectado"
- [ ] Guardias de ruta basadas en esa query
- [ ] Pruebas de componentes con Testing Library y MSW

Terminada cuando: registro, login, logout y recarga funcionan contra el API, y localStorage está vacío.

### Fase 4 · Billetera y movimientos (4 a 5 sesiones)

Objetivo: un saldo que no puede quedar inconsistente.

- [ ] Tabla `accounts` con `balance_cents` y una restricción `CHECK (balance_cents >= 0)`
- [ ] Tabla `ledger_entries`: cada cambio de saldo es un movimiento
- [ ] Servicio que inserta el movimiento y actualiza el saldo en una misma transacción
- [ ] `GET /wallet` y `GET /wallet/transactions` paginado
- [ ] Dashboard con saldo e historial

Terminada cuando: una prueba confirma que el saldo siempre es igual a la suma de sus movimientos, también con operaciones simultáneas.

### Fase 5 · SnailPay e integración (6 a 8 sesiones)

Objetivo: un flujo de pago que nunca cobra dos veces ni abona un cobro fallido.

- [ ] Servicio SnailPay con escenarios documentados: aprobado, rechazos con `status_detail`, error interno y respuesta lenta
- [ ] Tabla `payments` con estados: pendiente, aprobado, rechazado, fallido
- [ ] Encabezado `Idempotency-Key` con restricción única en la base
- [ ] Cliente hacia SnailPay con timeout (`AbortSignal.timeout`)
- [ ] Abono al saldo solo si el pago se aprueba, en la misma transacción que cambia su estado
- [ ] Solo se guardan los últimos 4 dígitos de la tarjeta
- [ ] Formulario de recarga con estados claros, incluido el timeout
- [ ] Pruebas de cada escenario y de un doble envío con la misma clave

Terminada cuando: cada escenario se reproduce desde la tabla del README y un doble clic produce un solo cobro.

### Fase 6 · Carreras y estadísticas (4 a 5 sesiones)

Objetivo: datos de carreras generados y guardados en el servidor.

- [ ] Tablas `snails`, `races` y `race_results`
- [ ] Simulación del día idempotente por fecha: si ya existe, no se repite
- [ ] `GET /stats/today` con victorias por caracol y apuestas
- [ ] Gráficas que consumen el API
- [ ] Opcional: apuestas reales que descuentan saldo y se liquidan al correr la carrera

Terminada cuando: las gráficas son las mismas en cada recarga y una prueba confirma su congruencia.

### Fase 7 · Producción (5 a 6 sesiones)

Objetivo: la aplicación en línea, con las protecciones que se esperan de un servicio real.

- [ ] Prueba E2E con Playwright del flujo crítico: registro, recarga y saldo actualizado
- [ ] helmet, CORS restringido al dominio de la web y límite de tamaño del body
- [ ] Dockerfiles del API, SnailPay y la web
- [ ] Despliegue con Nginx y HTTPS
- [ ] Usuario de demostración creado por un seed

Terminada cuando: hay una URL pública con HTTPS y CI corre la prueba E2E.

### Fase 8 · Pieza de portafolio (2 a 3 sesiones)

Objetivo: que alguien sin contexto entienda el proyecto en cinco minutos.

- [ ] README con el diagrama de arquitectura, cómo correrlo y la tabla de escenarios de SnailPay
- [ ] ADRs completos, uno por decisión importante
- [ ] Sección "qué haría distinto"
- [ ] Repositorio fijado en tu perfil de GitHub

Terminada cuando: el repo explica sus decisiones sin que tú estés presente.

## Estrategia de pruebas

El peso va en las pruebas de integración del API contra un PostgreSQL real: ahí viven los errores que importan (transacciones, restricciones, concurrencia), y un mock de la base los escondería. Las demás capas cubren lo que la integración no ve.

| Capa | Herramienta | Qué se prueba | Ejemplo |
| --- | --- | --- | --- |
| Lógica pura | Vitest | Reglas sin base ni HTTP | La simulación del día siempre suma 6 victorias |
| Contratos | Vitest | Schemas compartidos | La contraseña nunca se recorta |
| API con base de datos | Supertest y Testcontainers | Endpoints de punta a punta contra PostgreSQL | Un correo duplicado responde 409 y no crea filas |
| Integración con SnailPay | Supertest y un servidor falso | Cada escenario de la pasarela | Un timeout deja el pago como fallido y no abona saldo |
| Componentes web | Testing Library y MSW | Lo que el usuario ve ante cada respuesta | Un correo duplicado muestra el error bajo el campo correcto |
| Flujo completo | Playwright | El camino crítico en un navegador real | Registro, recarga y saldo actualizado |

Dos hábitos de la v1 que se mantienen: escribir la prueba junto con el código y verla fallar antes de confiar en ella.

## Cómo trabajar

Un repositorio nuevo con nombre descriptivo, separado del que entregaste en la prueba. Las reglas que te funcionaron en la v1, ahora desde el primer día:

- **Git:** una rama por tarea, Pull Request hacia `main` con CI en verde antes de integrar, Conventional Commits y borrado automático de ramas activado en GitHub.
- **Cada sesión:** empieza con `git status` y tu lista de pendientes; termina con un commit y una nota del siguiente paso.
- **IA:** la lógica de dominio la escribes tú (autenticación, movimientos, pagos); la IA te apoya con la estructura inicial, la interfaz, las revisiones y la explicación de conceptos nuevos. Si no puedes explicar una línea, no la integras.
- **Decisiones:** un ADR corto en el momento de tomar cada decisión importante (contexto, opciones, elección, consecuencias). Al final, el README se arma a partir de ellos.
