# Documento de Requisitos — SafeCountix

## Introducción

SafeCountix es un sistema web SaaS en tiempo real para el control de presencia de personal orientado a seguridad industrial. El sistema se integra con lectores biométricos Grupotress (huella dactilar + tarjeta RFID) para mantener un conteo exacto de cuántas personas se encuentran dentro de una planta en todo momento. Su función principal es dar soporte a evacuaciones de emergencia, resolviendo el problema de conteos inexactos causados por la mezcla de empleados, brigadistas y proveedores, así como registros de personal que ya abandonó las instalaciones.

## Glosario

- **Sistema**: La aplicación web SafeCountix en su conjunto (backend, frontend y servicios asociados).
- **API**: La capa de servicios REST del backend de SafeCountix construida con Node.js y Express.
- **Dashboard**: La página principal del frontend que muestra conteos en tiempo real, movimientos recientes y lista de personal en planta.
- **Empleado**: Cualquier persona registrada en el sistema, incluyendo tipos: empleado, brigadista o proveedor.
- **Brigadista**: Un empleado con rol de brigada de emergencia, con una especialidad asignada (primeros_auxilios, evacuacion, comunicacion, busqueda).
- **Proveedor**: Personal externo registrado en el sistema con tipo "proveedor".
- **Registro**: Un evento de entrada o salida asociado a un empleado, con tipo (entrada/salida/salida_automatica), puerta y fecha/hora.
- **Conteo_Neto**: El número total de personas con estadoActual = "dentro" en un momento dado, desglosado por tipo.
- **Modo_Evacuacion**: Estado especial del frontend activado manualmente que muestra información crítica para gestionar una evacuación de emergencia.
- **Socket_Service**: El servicio de Socket.io que emite eventos en tiempo real a todos los clientes conectados.
- **Cron_Service**: El servicio de tareas programadas que ejecuta el cierre automático de turnos.
- **Auth_Service**: El servicio de autenticación basado en JWT y bcrypt.
- **Numero_Tarjeta**: Identificador único de la tarjeta RFID asignada a cada empleado.
- **Puerta**: Punto de acceso por donde se registra entrada o salida (peatonal o vehicular).
- **Turno**: Período de trabajo asignado a un empleado (manana, tarde, noche), con cambios a las 06:00, 14:00 y 22:00.
- **Empresa**: Organización cliente del sistema, identificada por un subdominio único.
- **Usuario**: Persona con acceso al sistema web, con rol admin, seguridad o rh.

## Requisitos

### Requisito 1: Autenticación de usuarios

**User Story:** Como usuario del sistema, quiero iniciar sesión con mi correo electrónico y contraseña, para acceder a las funcionalidades según mi rol asignado.

#### Acceptance Criteria

1. WHEN un Usuario envía credenciales válidas (email y password) al endpoint POST /api/auth/login, THE Auth_Service SHALL verificar la contraseña contra el hash almacenado con bcrypt y retornar un token JWT junto con los datos del Usuario.
2. WHEN un Usuario envía credenciales inválidas al endpoint POST /api/auth/login, THE Auth_Service SHALL retornar un código de estado HTTP 401 con un mensaje de error descriptivo.
3. WHEN un Usuario envía una solicitud al endpoint POST /api/auth/logout con un token JWT válido, THE Auth_Service SHALL invalidar la sesión del Usuario.
4. THE Auth_Service SHALL cifrar todas las contraseñas con bcrypt utilizando un factor de sal de 10 rondas antes de almacenarlas en la base de datos.
5. WHEN una solicitud llega a cualquier endpoint protegido sin un token JWT válido, THE API SHALL retornar un código de estado HTTP 401 y rechazar la solicitud.
6. WHEN un Usuario inicia sesión exitosamente, THE Sistema SHALL almacenar el token JWT en localStorage del navegador y redirigir al Usuario según su rol (admin, seguridad, rh).

### Requisito 2: Registro automático de entrada y salida

**User Story:** Como operador de seguridad, quiero que el sistema registre automáticamente entradas y salidas al pasar una tarjeta RFID, para mantener un conteo preciso sin intervención manual.

#### Acceptance Criteria

1. WHEN el endpoint POST /api/registro recibe un Numero_Tarjeta y una Puerta, THE API SHALL buscar al Empleado asociado a ese Numero_Tarjeta en la base de datos.
2. WHEN el Empleado asociado al Numero_Tarjeta tiene estadoActual igual a "fuera", THE API SHALL crear un Registro de tipo "entrada", actualizar el estadoActual del Empleado a "dentro" y retornar la acción realizada, los datos del Empleado y el Conteo_Neto actualizado.
3. WHEN el Empleado asociado al Numero_Tarjeta tiene estadoActual igual a "dentro", THE API SHALL crear un Registro de tipo "salida", actualizar el estadoActual del Empleado a "fuera" y retornar la acción realizada, los datos del Empleado y el Conteo_Neto actualizado.
4. IF el Numero_Tarjeta enviado no corresponde a ningún Empleado activo, THEN THE API SHALL retornar un código de estado HTTP 404 con un mensaje indicando que el Empleado no fue encontrado.
5. WHEN un Registro de entrada o salida se crea exitosamente, THE Socket_Service SHALL emitir el evento "conteo_actualizado" a todos los clientes conectados con el totalEnPlanta, brigadistas, proveedores y el último movimiento.
6. THE API SHALL aplicar rate limiting de máximo 10 solicitudes por segundo por dirección IP en el endpoint POST /api/registro.

### Requisito 3: Dashboard en tiempo real

**User Story:** Como responsable de seguridad, quiero ver en un dashboard el conteo en tiempo real de personas en planta, para tener visibilidad inmediata del estado de ocupación.

#### Acceptance Criteria

1. WHEN el endpoint GET /api/dashboard/conteo es consultado, THE API SHALL retornar el total de personas en planta, el número de brigadistas en planta y el número de proveedores en planta, calculados a partir de los Empleados con estadoActual igual a "dentro".
2. WHEN el endpoint GET /api/dashboard/en-planta es consultado, THE API SHALL retornar la lista completa de Empleados con estadoActual igual a "dentro", incluyendo nombre, tipo, departamento y turno.
3. WHEN el endpoint GET /api/dashboard/movimientos es consultado, THE API SHALL retornar los últimos 20 Registros ordenados por fechaHora descendente, incluyendo nombre del Empleado, tipo de registro, puerta y fecha/hora.
4. WHEN el Dashboard se carga en el navegador, THE Sistema SHALL mostrar un contador grande con el número total de personas en planta, tres tarjetas con totales (en planta, brigadistas activos, proveedores), la lista de los últimos 20 movimientos y una lista lateral de quién está dentro.
5. WHEN el Socket_Service emite el evento "conteo_actualizado", THE Dashboard SHALL actualizar el contador, las tarjetas y la lista de movimientos sin recargar la página.
6. THE Dashboard SHALL ser responsivo y funcionar correctamente en dispositivos móviles, tabletas y computadoras de escritorio.

### Requisito 4: Modo de evacuación

**User Story:** Como coordinador de emergencias, quiero activar un modo de evacuación que muestre en tiempo real quién sigue dentro de la planta, para gestionar la evacuación de forma segura y eficiente.

#### Acceptance Criteria

1. WHEN el Usuario presiona el botón rojo de evacuación en el Dashboard, THE Sistema SHALL activar el Modo_Evacuacion y el Socket_Service SHALL emitir el evento "evacuacion_activada" con el timestamp de activación y la lista completa de personas en planta.
2. WHILE el Modo_Evacuacion está activo, THE Sistema SHALL mostrar un contador grande con el número de personas que aún permanecen en planta, actualizado en tiempo real.
3. WHILE el Modo_Evacuacion está activo, THE Sistema SHALL mostrar tres pestañas: "En planta", "Evacuados" y "Brigadistas", cada una con la lista correspondiente de Empleados.
4. WHILE el Modo_Evacuacion está activo, THE Sistema SHALL mostrar un reloj en tiempo real con el tiempo transcurrido desde la activación de la evacuación.
5. WHEN el endpoint GET /api/evacuacion/en-planta es consultado, THE API SHALL retornar la lista completa de Empleados con estadoActual igual a "dentro" para el modo de emergencia.
6. WHEN el endpoint GET /api/evacuacion/brigadistas es consultado, THE API SHALL retornar la lista de Empleados de tipo "brigadista" con estadoActual igual a "dentro", incluyendo su especialidadBrigada.
7. WHILE el Modo_Evacuacion está activo, THE Sistema SHALL permitir buscar por nombre dentro de cada pestaña de la lista de personal.
8. THE Sistema SHALL distinguir visualmente a empleados, brigadistas y proveedores con colores diferentes en las listas del Modo_Evacuacion.

### Requisito 5: Generación de PDF de emergencia

**User Story:** Como coordinador de emergencias, quiero descargar un PDF con la lista de personas en planta durante una evacuación, para tener un registro físico de respaldo.

#### Acceptance Criteria

1. WHEN el endpoint GET /api/evacuacion/pdf es consultado, THE API SHALL generar un documento PDF utilizando pdfkit con la lista completa de Empleados con estadoActual igual a "dentro", incluyendo nombre, tipo, departamento y turno.
2. WHEN el PDF es generado, THE API SHALL incluir la fecha y hora de generación, el nombre de la Empresa y el Conteo_Neto total en el encabezado del documento.
3. WHILE el Modo_Evacuacion está activo, THE Sistema SHALL mostrar un botón para descargar el PDF de emergencia.

### Requisito 6: Gestión de empleados

**User Story:** Como administrador de recursos humanos, quiero gestionar el catálogo de empleados (crear, editar, consultar y dar de baja), para mantener actualizada la información del personal.

#### Acceptance Criteria

1. WHEN el endpoint GET /api/empleados es consultado, THE API SHALL retornar la lista de todos los Empleados con campo activo igual a true, incluyendo nombre, Numero_Tarjeta, turno, departamento, tipo y estadoActual.
2. WHEN el endpoint POST /api/empleados recibe datos válidos de un nuevo Empleado, THE API SHALL crear el Empleado en la base de datos con estadoActual por defecto "fuera" y activo por defecto true, y retornar los datos del Empleado creado.
3. WHEN el endpoint PUT /api/empleados/:id recibe datos actualizados, THE API SHALL modificar los campos del Empleado correspondiente y retornar los datos actualizados.
4. WHEN el endpoint DELETE /api/empleados/:id es invocado, THE API SHALL realizar una eliminación lógica estableciendo el campo activo del Empleado a false, sin eliminar el registro de la base de datos.
5. IF el endpoint POST /api/empleados recibe un Numero_Tarjeta que ya existe en la base de datos, THEN THE API SHALL retornar un código de estado HTTP 409 con un mensaje indicando que el Numero_Tarjeta ya está registrado.
6. THE Sistema SHALL mostrar una tabla con todos los Empleados activos, con filtros por turno, departamento y tipo.
7. THE Sistema SHALL solicitar confirmación al Usuario antes de ejecutar la eliminación lógica de un Empleado.
8. WHEN se crea o edita un Empleado de tipo "brigadista", THE Sistema SHALL requerir la selección de una especialidadBrigada (primeros_auxilios, evacuacion, comunicacion o busqueda).

### Requisito 7: Cierre automático de turno

**User Story:** Como administrador del sistema, quiero que al finalizar cada turno se registre automáticamente la salida del personal que no marcó, para evitar conteos fantasma que distorsionen la presencia real.

#### Acceptance Criteria

1. WHEN el reloj del servidor alcanza las 06:00, 14:00 o 22:00 horas, THE Cron_Service SHALL identificar a todos los Empleados del turno que finaliza con estadoActual igual a "dentro".
2. WHEN el Cron_Service identifica Empleados del turno finalizado con estadoActual "dentro", THE Cron_Service SHALL crear un Registro de tipo "salida_automatica" para cada uno de esos Empleados y actualizar su estadoActual a "fuera".
3. WHEN el Cron_Service completa el cierre de turno, THE Cron_Service SHALL enviar un correo electrónico al Usuario con rol admin con un resumen que incluya el número de salidas automáticas generadas y la lista de Empleados afectados.
4. WHEN el Cron_Service genera salidas automáticas, THE Socket_Service SHALL emitir el evento "conteo_actualizado" con el Conteo_Neto recalculado.

### Requisito 8: Comunicación en tiempo real via Socket.io

**User Story:** Como usuario del sistema, quiero que la información del dashboard se actualice automáticamente sin necesidad de recargar la página, para tener siempre datos actualizados.

#### Acceptance Criteria

1. WHEN un Registro de entrada o salida se crea, THE Socket_Service SHALL emitir el evento "conteo_actualizado" con un objeto que contenga totalEnPlanta, brigadistas, proveedores y ultimoMovimiento.
2. WHEN el Modo_Evacuacion se activa, THE Socket_Service SHALL emitir el evento "evacuacion_activada" con un objeto que contenga el timestamp de activación y la listaEnPlanta completa.
3. WHEN el cliente recibe el evento "conteo_actualizado", THE Dashboard SHALL actualizar el contador principal, las tarjetas de resumen y agregar el movimiento a la lista sin recargar la página.
4. WHEN el cliente recibe el evento "evacuacion_activada", THE Sistema SHALL transicionar automáticamente a la vista de Modo_Evacuacion.

### Requisito 9: Seguridad y protección de la API

**User Story:** Como administrador del sistema, quiero que la API esté protegida contra accesos no autorizados y ataques comunes, para garantizar la integridad de los datos de presencia.

#### Acceptance Criteria

1. THE API SHALL requerir un token JWT válido en el encabezado Authorization para todas las rutas excepto POST /api/auth/login.
2. THE API SHALL configurar CORS permitiendo solicitudes únicamente desde el origen definido en la variable de entorno CLIENT_URL.
3. THE API SHALL sanitizar todos los datos de entrada antes de ejecutar consultas a la base de datos para prevenir inyección SQL.
4. THE API SHALL utilizar consultas parametrizadas a través de Prisma ORM para todas las operaciones de base de datos.
5. IF un token JWT expirado o malformado es enviado en una solicitud, THEN THE API SHALL retornar un código de estado HTTP 401 y rechazar la solicitud.

### Requisito 10: Modelo de datos multi-empresa

**User Story:** Como propietario del sistema SaaS, quiero que el sistema soporte múltiples empresas aisladas por subdominio, para ofrecer el servicio a diferentes clientes industriales.

#### Acceptance Criteria

1. THE Sistema SHALL asociar cada Usuario y cada Empleado a una Empresa específica mediante el campo empresaId.
2. THE API SHALL filtrar todas las consultas de datos por la Empresa del Usuario autenticado, garantizando aislamiento de datos entre empresas.
3. WHEN se crea una nueva Empresa, THE Sistema SHALL asignarle un subdominio único y un plan por defecto "basico".
4. THE Sistema SHALL almacenar el campo subdominio de cada Empresa como valor único en la base de datos.

### Requisito 11: Datos iniciales (Seed)

**User Story:** Como desarrollador, quiero contar con datos de prueba precargados, para poder verificar el funcionamiento del sistema durante el desarrollo.

#### Acceptance Criteria

1. WHEN se ejecuta el script de seed, THE Sistema SHALL crear una Empresa con nombre "BorgWarner Guadalajara".
2. WHEN se ejecuta el script de seed, THE Sistema SHALL crear un Usuario administrador con email "admin@safecountix.com" y contraseña cifrada con bcrypt correspondiente a "Admin123".
3. WHEN se ejecuta el script de seed, THE Sistema SHALL crear 10 Empleados con mezcla de turnos (manana, tarde, noche), tipos (empleado, brigadista, proveedor) y departamentos, incluyendo 3 brigadistas con especialidades diferentes y 2 proveedores.
4. WHEN se ejecuta el script de seed, THE Sistema SHALL crear 20 Registros distribuidos en los últimos 2 días con mezcla de entradas y salidas.

### Requisito 12: Identidad visual y estilo

**User Story:** Como usuario del sistema, quiero una interfaz con estilo oscuro, industrial y profesional, para que la experiencia visual sea coherente con el entorno de planta industrial.

#### Acceptance Criteria

1. THE Sistema SHALL utilizar el color verde esmeralda #1D9E75 como color primario en toda la interfaz.
2. THE Sistema SHALL utilizar el color #0D1F1A como fondo oscuro principal y #122B23 como color de paneles.
3. THE Sistema SHALL aplicar un estilo visual oscuro, industrial y profesional de forma consistente en todas las páginas (Login, Dashboard, Evacuación, Empleados).
