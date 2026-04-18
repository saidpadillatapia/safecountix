# Plan de Implementación: SafeCountix

## Resumen

Sistema web SaaS en tiempo real para control de presencia de personal en plantas industriales. La implementación sigue un orden incremental: configuración del servidor y base de datos, autenticación, lógica de registro (el endpoint más crítico), comunicación en tiempo real, dashboard, frontend completo, generación de PDF, cierre automático de turnos, y testing final.

## Tareas

- [x] 1. Configurar servidor Express, conexión MySQL con Prisma y estructura del proyecto
  - [x] 1.1 Configurar `backend/server.js` con Express, CORS (usando `CLIENT_URL`), middleware JSON y rate limiting global
    - Instalar dependencias: `express`, `cors`, `dotenv`, `express-rate-limit`, `helmet`
    - Crear archivo `.env.example` con variables: `DATABASE_URL`, `JWT_SECRET`, `CLIENT_URL`, `PORT`, `SENDGRID_API_KEY`
    - Configurar CORS permitiendo solo `CLIENT_URL`
    - _Requisitos: 9.1, 9.2_

  - [x] 1.2 Crear esquema Prisma con modelos Empresa, Usuario, Empleado y Registro
    - Instalar `prisma` y `@prisma/client`
    - Crear `backend/prisma/schema.prisma` con los 4 modelos según el diseño (incluyendo relaciones, campos únicos y defaults)
    - Ejecutar `npx prisma migrate dev` para generar la migración inicial
    - _Requisitos: 10.1, 10.4_

  - [x] 1.3 Crear script de seed con datos de prueba
    - Crear `backend/prisma/seed.js` con: 1 Empresa "BorgWarner Guadalajara", 1 Usuario admin (email: admin@safecountix.com, password: "Admin123" cifrada con bcrypt salt 10), 10 Empleados (mezcla de turnos, tipos y departamentos, incluyendo 3 brigadistas con especialidades diferentes y 2 proveedores), 20 Registros distribuidos en los últimos 2 días
    - Configurar el script de seed en `package.json` bajo `prisma.seed`
    - _Requisitos: 11.1, 11.2, 11.3, 11.4_

  - [x] 1.4 Configurar `backend/db.js` con instancia singleton de Prisma Client
    - Exportar instancia de `PrismaClient` para uso en controllers y services
    - _Requisitos: 9.4_

- [x] 2. Checkpoint — Verificar configuración base
  - Asegurar que las migraciones se ejecutan correctamente, el seed carga datos y el servidor arranca sin errores. Preguntar al usuario si hay dudas.

- [x] 3. Implementar autenticación JWT
  - [x] 3.1 Crear `backend/controllers/authController.js` con funciones login y logout
    - Instalar `bcrypt` y `jsonwebtoken`
    - Implementar `login`: buscar usuario por email, verificar contraseña con `bcrypt.compare`, generar JWT con `{ id, nombre, email, rol, empresaId }`, retornar token y datos del usuario
    - Implementar `logout`: retornar mensaje de confirmación
    - Manejar errores: 401 para credenciales inválidas con código `INVALID_CREDENTIALS`
    - _Requisitos: 1.1, 1.2, 1.3, 1.4_

  - [x] 3.2 Crear `backend/middleware/auth.js` con middleware de verificación JWT
    - Verificar presencia del header `Authorization: Bearer <token>`
    - Decodificar y validar el token JWT
    - Adjuntar datos del usuario decodificado a `req.user`
    - Retornar 401 con códigos `TOKEN_EXPIRED` o `TOKEN_INVALID` según corresponda
    - _Requisitos: 1.5, 9.1, 9.5_

  - [x] 3.3 Crear `backend/routes/auth.js` con rutas POST /api/auth/login y POST /api/auth/logout
    - Login es ruta pública (sin middleware auth)
    - Logout requiere middleware auth
    - _Requisitos: 1.1, 1.3_

  - [ ]* 3.4 Escribir property tests para autenticación — `backend/__tests__/properties/auth.property.test.js`
    - **Property 1: Verificación de contraseña round-trip** — Para cualquier par (contraseña, hash_bcrypt), login retorna JWT correcto cuando bcrypt.compare es true, y rechaza con 401 cuando es false
    - **Valida: Requisitos 1.1, 1.2**
    - **Property 2: Middleware JWT rechaza tokens inválidos** — Para cualquier token expirado, malformado o ausente, el middleware retorna 401
    - **Valida: Requisitos 1.5, 9.1, 9.5**

- [x] 4. Implementar endpoint POST /api/registro (toggle entrada/salida)
  - [x] 4.1 Crear `backend/controllers/registrosController.js` con función `crearRegistro`
    - Recibir `{ numeroTarjeta, puerta }` del body
    - Validar que `puerta` sea "peatonal" o "vehicular"
    - Buscar empleado activo por `numeroTarjeta` (filtrado por `empresaId` si hay usuario autenticado, o sin filtro para lectores RFID)
    - Retornar 404 con código `EMPLOYEE_NOT_FOUND` si no existe
    - Implementar lógica toggle: si `estadoActual === "fuera"` → crear registro tipo "entrada" y cambiar a "dentro"; si `estadoActual === "dentro"` → crear registro tipo "salida" y cambiar a "fuera"
    - Calcular y retornar conteo neto actualizado (totalEnPlanta, brigadistas, proveedores)
    - Emitir evento Socket.io `conteo_actualizado` vía socketService
    - _Requisitos: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [x] 4.2 Crear `backend/routes/registros.js` con ruta POST /api/registro y rate limiting específico (10 req/s por IP)
    - Configurar `express-rate-limit` con windowMs: 1000, max: 10
    - _Requisitos: 2.6_

  - [ ]* 4.3 Escribir property test para toggle — `backend/__tests__/properties/registro-toggle.property.test.js`
    - **Property 3: Toggle entrada/salida como máquina de estados** — Para cualquier empleado activo, el estado final es siempre el opuesto al estado inicial, y el tipo de registro corresponde a la transición
    - **Valida: Requisitos 2.2, 2.3**

  - [ ]* 4.4 Escribir property tests para conteo — `backend/__tests__/properties/conteo.property.test.js`
    - **Property 4: Cálculo correcto del conteo neto** — totalEnPlanta = empleados con estadoActual="dentro", brigadistas = dentro AND tipo="brigadista", proveedores = dentro AND tipo="proveedor"
    - **Valida: Requisitos 3.1**

- [x] 5. Configurar Socket.io para eventos en tiempo real
  - [x] 5.1 Crear `backend/services/socketService.js` con gestión de conexiones y emisión de eventos
    - Inicializar Socket.io en el servidor HTTP
    - Implementar función `emitConteoActualizado(data)` que emita evento `conteo_actualizado` con `{ totalEnPlanta, brigadistas, proveedores, ultimoMovimiento }`
    - Implementar función `emitEvacuacionActivada(data)` que emita evento `evacuacion_activada` con `{ timestamp, listaEnPlanta }`
    - Manejar errores de emisión con logging sin interrumpir el flujo principal
    - _Requisitos: 2.5, 8.1, 8.2_

  - [x] 5.2 Integrar socketService en `backend/server.js` y en `registrosController.js`
    - Pasar instancia de `io` al socketService al iniciar el servidor
    - Inyectar socketService en el controller de registros para emitir eventos tras cada registro
    - _Requisitos: 8.1_

- [x] 6. Crear endpoints GET del dashboard
  - [x] 6.1 Crear `backend/controllers/dashboardController.js` con funciones para conteo, en-planta y movimientos
    - `getConteo`: contar empleados con `estadoActual="dentro"` filtrados por `empresaId`, desglosar por tipo
    - `getEnPlanta`: listar empleados con `estadoActual="dentro"` filtrados por `empresaId`
    - `getMovimientos`: obtener últimos 20 registros ordenados por `fechaHora` desc, filtrados por `empresaId`, incluyendo datos del empleado
    - _Requisitos: 3.1, 3.2, 3.3, 10.2_

  - [x] 6.2 Crear `backend/routes/dashboard.js` con rutas GET protegidas por middleware auth
    - GET /api/dashboard/conteo
    - GET /api/dashboard/en-planta
    - GET /api/dashboard/movimientos
    - _Requisitos: 3.1, 3.2, 3.3_

  - [ ]* 6.3 Escribir property tests para filtros del dashboard — `backend/__tests__/properties/filters.property.test.js`
    - **Property 5: Filtro de personal en planta** — Retorna exactamente los empleados con estadoActual="dentro", sin omisiones ni inclusiones incorrectas
    - **Valida: Requisitos 3.2, 4.5**
    - **Property 6: Movimientos ordenados y limitados** — Máximo 20 registros, ordenados por fechaHora descendente
    - **Valida: Requisitos 3.3**
    - **Property 7: Filtro de brigadistas con especialidad** — Solo empleados tipo="brigadista" AND estadoActual="dentro", cada uno con especialidadBrigada
    - **Valida: Requisitos 4.6**

  - [ ]* 6.4 Escribir property test para multi-tenancy — `backend/__tests__/properties/multitenancy.property.test.js`
    - **Property 17: Aislamiento de datos multi-empresa** — Toda consulta de un usuario de empresa A retorna exclusivamente datos de empresa A
    - **Valida: Requisitos 10.2**

- [x] 7. Checkpoint — Verificar backend completo
  - Asegurar que todos los endpoints responden correctamente, el toggle funciona, Socket.io emite eventos y los filtros por empresa funcionan. Preguntar al usuario si hay dudas.

- [x] 8. Implementar CRUD de empleados
  - [x] 8.1 Crear `backend/controllers/empleadosController.js` con funciones CRUD
    - `listarEmpleados`: retornar empleados con `activo=true` filtrados por `empresaId`
    - `crearEmpleado`: validar datos, verificar unicidad de `numeroTarjeta`, asignar defaults (`estadoActual="fuera"`, `activo=true`), validar que brigadistas tengan `especialidadBrigada`
    - `actualizarEmpleado`: actualizar solo campos proporcionados, preservar campos no modificados, validar especialidad si tipo es brigadista
    - `eliminarEmpleado`: soft delete estableciendo `activo=false`
    - Manejar error 409 con código `DUPLICATE_CARD` para tarjeta duplicada
    - _Requisitos: 6.1, 6.2, 6.3, 6.4, 6.5, 6.8_

  - [x] 8.2 Crear `backend/routes/empleados.js` con rutas CRUD protegidas por middleware auth
    - GET /api/empleados, POST /api/empleados, PUT /api/empleados/:id, DELETE /api/empleados/:id
    - _Requisitos: 6.1, 6.2, 6.3, 6.4_

  - [ ]* 8.3 Escribir property tests para empleados — `backend/__tests__/properties/empleados.property.test.js`
    - **Property 10: Filtro de empleados activos** — Retorna exactamente empleados con activo=true
    - **Valida: Requisitos 6.1**
    - **Property 11: Creación de empleado con defaults correctos** — estadoActual="fuera" y activo=true siempre
    - **Valida: Requisitos 6.2**
    - **Property 12: Actualización preserva campos no modificados** — Solo cambian los campos especificados
    - **Valida: Requisitos 6.3**
    - **Property 13: Soft delete establece activo=false** — El registro sigue existiendo con datos intactos
    - **Valida: Requisitos 6.4**
    - **Property 15: Validación de brigadista requiere especialidad** — Rechaza brigadista sin especialidad, acepta null para otros tipos
    - **Valida: Requisitos 6.8**

- [x] 9. Implementar endpoints de evacuación y generación de PDF
  - [x] 9.1 Crear `backend/controllers/evacuacionController.js` con funciones para evacuación
    - `getEnPlanta`: listar empleados con `estadoActual="dentro"` filtrados por `empresaId`
    - `getBrigadistas`: listar empleados tipo "brigadista" con `estadoActual="dentro"`, incluyendo `especialidadBrigada`
    - `generarPdf`: generar PDF con pdfkit conteniendo fecha/hora, nombre de empresa, conteo total y lista de empleados (nombre, tipo, departamento, turno)
    - _Requisitos: 4.5, 4.6, 5.1, 5.2_

  - [x] 9.2 Crear `backend/services/pdfService.js` con función de generación de PDF
    - Instalar `pdfkit`
    - Implementar función que reciba lista de empleados y datos de empresa, y retorne un buffer PDF
    - Incluir encabezado con fecha/hora, nombre de empresa y conteo total
    - Listar cada empleado con nombre, tipo, departamento y turno
    - _Requisitos: 5.1, 5.2_

  - [x] 9.3 Crear `backend/routes/evacuacion.js` con rutas GET protegidas por middleware auth
    - GET /api/evacuacion/en-planta
    - GET /api/evacuacion/brigadistas
    - GET /api/evacuacion/pdf (responde con `Content-Type: application/pdf`)
    - _Requisitos: 4.5, 4.6, 5.1_

  - [ ]* 9.4 Escribir property test para PDF — `backend/__tests__/properties/conteo.property.test.js` (agregar al archivo existente)
    - **Property 9: Generación de PDF con contenido correcto** — Produce buffer PDF válido (no vacío) con fecha/hora, nombre de empresa, conteo total y datos de cada empleado
    - **Valida: Requisitos 5.1, 5.2**

- [x] 10. Implementar cierre automático de turno (Cron)
  - [x] 10.1 Crear `backend/services/cronService.js` con tareas programadas de cierre de turno
    - Instalar `node-cron`
    - Programar ejecución a las 06:00 (cierre turno noche), 14:00 (cierre turno mañana) y 22:00 (cierre turno tarde)
    - Buscar empleados del turno que finaliza con `estadoActual="dentro"`
    - Crear registro tipo `salida_automatica` para cada uno y actualizar `estadoActual` a "fuera"
    - Emitir evento `conteo_actualizado` vía socketService tras el cierre
    - Continuar procesando si un empleado individual falla
    - _Requisitos: 7.1, 7.2, 7.4_

  - [x] 10.2 Crear `backend/services/emailService.js` con función de envío de correos
    - Instalar `nodemailer` (o `@sendgrid/mail`)
    - Implementar función `enviarResumenCierre` que envíe email al admin con: número de salidas automáticas, lista de empleados afectados, errores si los hubo
    - Manejar fallos de envío con logging sin revertir el cierre
    - _Requisitos: 7.3_

  - [x] 10.3 Integrar cronService en `backend/server.js`
    - Iniciar las tareas cron al arrancar el servidor
    - Inyectar dependencias (prisma, socketService, emailService)
    - _Requisitos: 7.1_

  - [ ]* 10.4 Escribir property test para cierre de turno — `backend/__tests__/properties/cron.property.test.js`
    - **Property 16: Cierre automático de turno** — Solo genera salida_automatica para empleados del turno que finaliza y que están "dentro"; empleados de otros turnos no se modifican
    - **Valida: Requisitos 7.1, 7.2**

- [x] 11. Checkpoint — Verificar backend completo con todos los servicios
  - Asegurar que todos los endpoints, Socket.io, cron y email funcionan correctamente. Ejecutar todos los tests. Preguntar al usuario si hay dudas.

- [x] 12. Construir frontend — Configuración base y Login
  - [x] 12.1 Configurar proyecto React con Vite y Tailwind CSS en `frontend/`
    - Instalar React, React DOM, React Router, Vite, Tailwind CSS, PostCSS, Autoprefixer
    - Configurar `vite.config.js` con proxy al backend para desarrollo
    - Configurar Tailwind con colores personalizados: primario `#1D9E75`, fondo `#0D1F1A`, paneles `#122B23`
    - Crear `frontend/src/main.jsx` y `frontend/src/App.jsx` con React Router
    - _Requisitos: 12.1, 12.2, 12.3_

  - [x] 12.2 Crear `frontend/src/pages/Login.jsx` con formulario de autenticación
    - Formulario con campos email y contraseña, estilo oscuro industrial
    - Llamada a POST /api/auth/login, almacenamiento de JWT en localStorage
    - Redirección al Dashboard tras login exitoso
    - Manejo de errores (credenciales inválidas)
    - _Requisitos: 1.1, 1.6, 12.3_

- [x] 13. Construir frontend — Dashboard en tiempo real
  - [x] 13.1 Crear `frontend/src/pages/Dashboard.jsx` como vista principal
    - Instalar `socket.io-client`
    - Cargar datos iniciales desde GET /api/dashboard/conteo, /en-planta y /movimientos
    - Suscribirse al evento Socket.io `conteo_actualizado` para actualizaciones en tiempo real
    - Incluir botón rojo de evacuación que navega a la vista de evacuación
    - Layout responsivo con Tailwind CSS
    - _Requisitos: 3.4, 3.5, 3.6, 4.1, 8.3_

  - [x] 13.2 Crear `frontend/src/components/Contador.jsx` con número grande de personas en planta
    - Mostrar el total de personas en planta con tipografía grande y prominente
    - Actualizar en tiempo real al recibir eventos Socket.io
    - _Requisitos: 3.4_

  - [x] 13.3 Crear `frontend/src/components/MovimientosRecientes.jsx` con lista de últimos movimientos
    - Mostrar últimos 20 movimientos con nombre, tipo de registro, puerta y fecha/hora
    - Actualizar en tiempo real al recibir nuevos movimientos
    - _Requisitos: 3.3, 3.4, 3.5_

  - [x] 13.4 Crear `frontend/src/components/ListaEnPlanta.jsx` con lista lateral de personas dentro
    - Mostrar lista de empleados actualmente dentro de la planta
    - Distinguir visualmente por tipo (empleado, brigadista, proveedor) con colores diferentes
    - _Requisitos: 3.2, 3.4, 4.8_

- [x] 14. Construir frontend — Modo Evacuación
  - [x] 14.1 Crear `frontend/src/pages/Evacuacion.jsx` con vista de evacuación de emergencia
    - Contador grande de personas que aún permanecen en planta
    - Tres pestañas: "En planta", "Evacuados", "Brigadistas"
    - Reloj en tiempo real con tiempo transcurrido desde activación
    - Botón de descarga de PDF (llamada a GET /api/evacuacion/pdf)
    - Búsqueda por nombre dentro de cada pestaña
    - Colores diferentes para empleados, brigadistas y proveedores
    - Suscripción a eventos Socket.io para actualización en tiempo real
    - Emitir evento `evacuacion_activada` al activar
    - _Requisitos: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 5.3, 8.2, 8.4_

  - [x] 14.2 Crear `frontend/src/components/BrigadistasList.jsx` con lista de brigadistas y especialidad
    - Mostrar brigadistas en planta con nombre y especialidadBrigada
    - Datos desde GET /api/evacuacion/brigadistas
    - _Requisitos: 4.6_

  - [ ]* 14.3 Escribir property test para búsqueda por nombre — `frontend/__tests__/properties/search-filter.property.test.js`
    - **Property 8: Búsqueda por nombre en listas** — El filtro retorna solo empleados cuyo nombre contiene la cadena de búsqueda (case-insensitive)
    - **Valida: Requisitos 4.7**

- [x] 15. Construir frontend — Gestión de Empleados
  - [x] 15.1 Crear `frontend/src/pages/Empleados.jsx` con CRUD completo de empleados
    - Tabla con todos los empleados activos, con filtros por turno, departamento y tipo
    - Formulario de creación/edición con validación (brigadista requiere especialidad)
    - Botón de eliminación con confirmación antes de ejecutar soft delete
    - Manejo de error 409 para tarjeta duplicada
    - Estilo oscuro industrial consistente
    - _Requisitos: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 12.3_

  - [ ]* 15.2 Escribir property test para filtrado de tabla — `frontend/__tests__/properties/table-filter.property.test.js`
    - **Property 14: Filtrado de tabla de empleados** — La tabla filtrada retorna solo empleados que cumplen todos los criterios de filtro simultáneamente
    - **Valida: Requisitos 6.6**

- [x] 16. Conectar Socket.io en frontend y verificar flujo completo
  - [x] 16.1 Crear módulo de conexión Socket.io en el frontend
    - Crear `frontend/src/services/socket.js` con conexión al servidor Socket.io
    - Implementar reconexión automática con backoff exponencial
    - Exportar funciones para suscribirse a eventos `conteo_actualizado` y `evacuacion_activada`
    - _Requisitos: 8.1, 8.2, 8.3, 8.4_

  - [x] 16.2 Integrar Socket.io en Dashboard y Evacuación
    - Conectar Dashboard.jsx al módulo socket para recibir actualizaciones en tiempo real
    - Conectar Evacuacion.jsx para recibir evento `evacuacion_activada` y transicionar automáticamente
    - _Requisitos: 3.5, 8.3, 8.4_

  - [ ]* 16.3 Escribir tests de integración Socket.io — `backend/__tests__/integration/socket.integration.test.js`
    - Verificar emisión de evento `conteo_actualizado` al crear registro
    - Verificar emisión de evento `evacuacion_activada` al activar evacuación
    - _Requisitos: 2.5, 8.1, 8.2_

- [x] 17. Checkpoint final — Verificar sistema completo
  - Ejecutar todos los tests (unitarios, property-based e integración). Verificar que el flujo completo funciona: login → dashboard → registro → actualización en tiempo real → evacuación → PDF → cierre de turno. Preguntar al usuario si hay dudas.

## Notas

- Las tareas marcadas con `*` son opcionales y pueden omitirse para un MVP más rápido.
- Cada tarea referencia requisitos específicos para trazabilidad.
- Los checkpoints aseguran validación incremental del progreso.
- Los property tests validan las 17 propiedades de correctitud definidas en el diseño.
- Los tests unitarios y de integración complementan los property tests cubriendo edge cases y flujos end-to-end.
- El stack tecnológico es: Node.js + Express, MySQL + Prisma, React + Tailwind CSS, Socket.io, JWT + bcrypt, pdfkit, node-cron, Vitest + fast-check.
