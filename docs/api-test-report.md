# Reporte de Pruebas de la API & Colección Postman / Apidog - DigitalArs

Este documento certifica la documentación Swagger/OpenAPI y el conjunto de pruebas ejecutadas sobre los flujos principales de la API **DigitalArs Wallet (.NET 10)**.

---

## 1. Documentación Swagger / OpenAPI

* **URL de Swagger UI:** `http://localhost:5016/swagger` (o `http://localhost:5016/swagger/index.html`)
* **Especificación OpenAPI v1:** `http://localhost:5016/openapi/v1.json`
* **Esquema de Seguridad:** Bearer JWT (`Authorization: Bearer <token>`) configurado en OpenAPI Document Transformer con soporte interactivo en Swagger UI para probar endpoints autenticados.

---

## 2. Archivos de la Colección y Entorno

En la carpeta [`docs/`](file:///c:/Users/jjvazquez/Desktop/alkemy-alpha-squad/docs/) se encuentran los archivos listos para importar en **Postman** o **Apidog**:

1. **Colección:** [`DigitalArs_API.postman_collection.json`](file:///c:/Users/jjvazquez/Desktop/alkemy-alpha-squad/docs/DigitalArs_API.postman_collection.json)
2. **Entorno (Variables):** [`DigitalArs_Environment.postman_environment.json`](file:///c:/Users/jjvazquez/Desktop/alkemy-alpha-squad/docs/DigitalArs_Environment.postman_environment.json)

### Variables Configuradas en el Entorno:
| Variable | Descripción | Valor Inicial / Ejemplo |
|---|---|---|
| `baseUrl` | URL base del backend | `http://localhost:5016` |
| `token` | Token JWT del usuario autenticado | *(Se autocompleta al hacer login)* |
| `adminToken` | Token JWT del Administrador | *(Se autocompleta al hacer login admin)* |
| `userEmail` | Correo de prueba de usuario | `juan.perez@test.com` |
| `userPassword` | Contraseña de usuario | `ClaveSegura123!` |
| `adminEmail` | Correo de prueba de admin | `admin@test.com` |
| `adminPassword` | Contraseña de admin | `AdminPassword123!` |
| `destinationAlias` | Alias destino para pruebas de transferencia | `sol.luna.rio` |

> **Nota:** Las peticiones de Login incluyen un script de prueba Post-response (`pm.environment.set("token", pm.response.json().token);`) que guarda el token JWT automáticamente en el entorno, por lo que no es necesario copiar y pegar tokens manualmente entre peticiones.

---

## 3. Matriz de Ejecución de Pruebas Manuales

A continuación se detallan los casos de prueba ejecutados sobre cada módulo con sus resultados:

### Módulo 1: Autenticación (Auth)
| ID | Caso de Prueba | Método & Endpoint | Payload / Params | Status Esperado | Status Obtenido | Resultado |
|---|---|---|---|---|---|---|
| TC-01 | Consultar tipos de documento | `GET /api/Auth/document-types` | N/A | `200 OK` | `200 OK` | **PASSED** ✅ |
| TC-02 | Registro de nuevo usuario | `POST /api/Auth/register` | Datos válidos (DNI, Nombre, Email, Password) | `201 Created` | `201 Created` | **PASSED** ✅ |
| TC-03 | Login de usuario estándar | `POST /api/Auth/login` | `email`, `password` correctos | `200 OK` + Token | `200 OK` | **PASSED** ✅ |
| TC-04 | Login de administrador | `POST /api/Auth/login` | `admin@test.com`, `AdminPassword123!` | `200 OK` + Roles | `200 OK` | **PASSED** ✅ |
| TC-05 | Verificar elegibilidad primer ingreso | `POST /api/Auth/first-login/verify` | `email` de usuario creado por admin | `200 OK` | `200 OK` | **PASSED** ✅ |
| TC-06 | Establecer contraseña primer ingreso | `POST /api/Auth/first-login/set-password` | `email`, `documentNumber`, `newPassword` | `200 OK` | `200 OK` | **PASSED** ✅ |
| TC-07 | Cerrar sesión (Logout) | `POST /api/Auth/logout` | Header `Bearer <token>` | `200 OK` | `200 OK` | **PASSED** ✅ |

---

### Módulo 2: Cuentas y Saldo (Account)
| ID | Caso de Prueba | Método & Endpoint | Payload / Params | Status Esperado | Status Obtenido | Resultado |
|---|---|---|---|---|---|---|
| TC-08 | Consultar saldo y cuenta propia | `GET /api/Account/balance` | Header `Bearer <token>` | `200 OK` (Balance, Alias, CVU) | `200 OK` | **PASSED** ✅ |
| TC-09 | Obtener datos de cuenta (/me) | `GET /api/Account/me` | Header `Bearer <token>` | `200 OK` | `200 OK` | **PASSED** ✅ |
| TC-10 | Realizar depósito de fondos | `POST /api/Account/deposit` | `{ "amount": 15000.00 }` | `200 OK` + Nuevo Saldo | `200 OK` | **PASSED** ✅ |

---

### Módulo 3: Transferencias y Movimientos (Transactions)
| ID | Caso de Prueba | Método & Endpoint | Payload / Params | Status Esperado | Status Obtenido | Resultado |
|---|---|---|---|---|---|---|
| TC-11 | Búsqueda de destinatario por Alias/CVU | `GET /api/Transactions/lookup?destination=...` | `destination=sol.luna.rio` | `200 OK` + Nombre Destinatario | `200 OK` | **PASSED** ✅ |
| TC-12 | Realizar transferencia atómica | `POST /api/Transactions/transfer` | `{ "destination": "sol.luna.rio", "amount": 2500 }` | `200 OK` + Comprobante | `200 OK` | **PASSED** ✅ |
| TC-13 | Historial de transacciones paginado | `GET /api/Transactions?pagina=1&porPagina=10` | Header `Bearer <token>` | `200 OK` + Lista paginada | `200 OK` | **PASSED** ✅ |
| TC-14 | Historial filtrado por débito | `GET /api/Transactions?tipo=debit` | Header `Bearer <token>` | `200 OK` (solo envíos) | `200 OK` | **PASSED** ✅ |
| TC-15 | Historial filtrado por crédito | `GET /api/Transactions?tipo=credit` | Header `Bearer <token>` | `200 OK` (recibidos y depósitos) | `200 OK` | **PASSED** ✅ |
| TC-16 | Historial filtrado por rango de fechas | `GET /api/Transactions?fechaDesde=...&fechaHasta=...` | Fechas ISO 8601 | `200 OK` | `200 OK` | **PASSED** ✅ |

---

### Módulo 4: Notificaciones (Notifications)
| ID | Caso de Prueba | Método & Endpoint | Payload / Params | Status Esperado | Status Obtenido | Resultado |
|---|---|---|---|---|---|---|
| TC-17 | Listar notificaciones del usuario | `GET /api/Notifications?page=1&pageSize=20` | Header `Bearer <token>` | `200 OK` (Orden DESC) | `200 OK` | **PASSED** ✅ |
| TC-18 | Conteo de no leídas para badge | `GET /api/Notifications/unread-count` | Header `Bearer <token>` | `200 OK` (`{ unreadCount: N }`) | `200 OK` | **PASSED** ✅ |
| TC-19 | Marcar notificación individual como leída | `PATCH /api/Notifications/1/read` | Header `Bearer <token>` | `200 OK` | `200 OK` | **PASSED** ✅ |
| TC-20 | Marcar todas como leídas | `PATCH /api/Notifications/read-all` | Header `Bearer <token>` | `200 OK` | `200 OK` | **PASSED** ✅ |
| TC-21 | Eliminar notificación individual | `DELETE /api/Notifications/1` | Header `Bearer <token>` | `200 OK` | `200 OK` | **PASSED** ✅ |
| TC-22 | Vaciar todas las notificaciones | `DELETE /api/Notifications` | Header `Bearer <token>` | `200 OK` | `200 OK` | **PASSED** ✅ |

---

### Módulo 5: Administración de Usuarios (Admin)
| ID | Caso de Prueba | Método & Endpoint | Payload / Params | Status Esperado | Status Obtenido | Resultado |
|---|---|---|---|---|---|---|
| TC-23 | Listar usuarios (Admin) | `GET /api/User?pagina=1&porPagina=10` | Header `Bearer <adminToken>` | `200 OK` (Paginación completa) | `200 OK` | **PASSED** ✅ |
| TC-24 | Obtener detalle de usuario por ID | `GET /api/User/1` | Header `Bearer <adminToken>` | `200 OK` (Datos + Cuenta) | `200 OK` | **PASSED** ✅ |
| TC-25 | Crear usuario por Administrador | `POST /api/User` | DTO con rol y datos | `201 Created` | `201 Created` | **PASSED** ✅ |
| TC-26 | Actualizar datos de usuario | `PUT /api/User/1` | DTO actualizado | `200 OK` | `200 OK` | **PASSED** ✅ |
| TC-27 | Cambiar estado (Activar/Bloquear) | `PATCH /api/User/1/status` | `{ "isActive": false }` | `200 OK` | `200 OK` | **PASSED** ✅ |

---

### Módulo 6: Manejo de Errores Estandarizado (RFC 7807)
| ID | Caso de Prueba | Método & Endpoint | Condición Probada | Código Devuelto | Estructura | Resultado |
|---|---|---|---|---|---|---|
| TC-28 | Error de validación de modelo | `POST /api/Auth/login` | Body `{}` vacío | `400 Bad Request` | `ValidationProblemDetails` (`errorCode: "VALIDATION_ERROR"`) | **PASSED** ✅ |
| TC-29 | Error de saldo insuficiente | `POST /api/Transactions/transfer` | Monto superior al disponible | `400 Bad Request` | `ProblemDetails` (`errorCode: "INSUFFICIENT_FUNDS"`) | **PASSED** ✅ |
| TC-30 | Acceso anónimo a ruta protegida | `GET /api/Account/balance` | Sin Header Authorization | `401 Unauthorized` | `401 Unauthorized` | **PASSED** ✅ |
| TC-31 | Usuario común accediendo a admin | `GET /api/User` | Token de rol Usuario | `403 Forbidden` | `403 Forbidden` | **PASSED** ✅ |
| TC-32 | Destino no encontrado | `GET /api/Transactions/lookup?destination=alias.inexistente` | Alias no registrado | `404 Not Found` | `ProblemDetails` (`errorCode: "NOT_FOUND"`) | **PASSED** ✅ |

---

## 4. Instrucciones para Importar en Postman / Apidog

1. Abrir **Postman** o **Apidog**.
2. Hacer clic en **Import** (en la esquina superior izquierda).
3. Seleccionar los dos archivos JSON ubicados en `docs/`:
   * `DigitalArs_API.postman_collection.json`
   * `DigitalArs_Environment.postman_environment.json`
4. En el selector de entornos de Postman (arriba a la derecha), elegir el entorno **`DigitalArs Local Environment`**.
5. Ejecutar primero la petición **`01. Autenticación > 03. Login Usuario Estándar`** o **`04. Login Administrador`** para poblar el token automáticamente y luego ejecutar cualquier endpoint del resto de la colección.
