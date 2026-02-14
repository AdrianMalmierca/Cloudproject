# **MIMO Movies**

## Descripción de la práctica

Se deberá implementar una API REST para la gestión de películas, valoraciones y lista de películas por ver siguiendo la especificación OpenAPI proporcionada.

Objetivos

- Implementar una API REST siguiendo una especificación OpenAPI
- Manejar autenticación mediante API Key
- Implementar operaciones CRUD
- Gestionar relaciones entre entidades
- Aplicar validaciones de datos
- Manejar códigos de estado HTTP apropiadamente

Requisitos técnicos

### Autenticación (20 puntos)

- Implementar autenticación mediante header `x-api-key`
- Validar API keys contra la base de datos de usuarios
- Proteger las rutas que requieren autenticación
- Manejar correctamente los errores de autenticación (401)
- Manejar correctamente los errores de autorización (403) cuando un usuario intenta acceder a recursos de otro usuario

### Recurso películas (20 puntos)

- Implementar los endpoints:
  - `GET /movies` - Listar películas con paginación
  - `GET /movies/{movieId}` - Obtener detalles de una película
- Incluir todos los campos requeridos (id, title, genre, duration, rating)
- Implementar paginación de resultados con parámetros `page` y `limit`
- Responder con estructura `{ data: [], pagination: {} }`
- Manejar errores apropiadamente (404, 500)

### Recurso valoraciones (30 puntos)

- Implementar CRUD completo de valoraciones:
  - `GET /movies/{movieId}/ratings` - Listar valoraciones con paginación
  - `GET /movies/{movieId}/ratings/{ratingId}` - Obtener valoración específica
  - `POST /movies/{movieId}/ratings` - Crear valoración (autenticado)
  - `PATCH /movies/{movieId}/ratings/{ratingId}` - Modificar valoración (autenticado, solo autor)
  - `DELETE /movies/{movieId}/ratings/{ratingId}` - Eliminar valoración (autenticado, solo autor)
- Aplicar las validaciones especificadas:
  - Rating entre 0 y 5
  - Comentarios máximo 500 caracteres
- Incluir campo `createdAt` en las respuestas
- Manejar códigos de estado correctamente:
  - 201 para creación (con header `Location`)
  - 409 si el usuario ya valoró la película
  - 422 para errores de validación
  - 401 para errores de autenticación
  - 403 si intenta modificar/eliminar valoración de otro usuario
  - 404 si película o valoración no existe

### Recurso lista de películas por ver (30 puntos)

- Implementar la gestión completa del watchlist:
  - `GET /watchlist/{userId}` - Obtener watchlist con paginación (autenticado, solo propietario)
  - `POST /watchlist/{userId}/items` - Añadir película (autenticado, solo propietario)
  - `PATCH /watchlist/{userId}/items/{itemId}` - Actualizar estado watched (autenticado, solo propietario)
  - `DELETE /watchlist/{userId}/items/{itemId}` - Eliminar del watchlist (autenticado, solo propietario)
- Validar IDs de películas
- Manejar estados de películas vistas/no vistas (`watched: boolean`)
- Incluir campo `createdAt` en las respuestas
- Implementar correctamente los códigos de estado:
  - 201 para creación (con header `Location`)
  - 409 para películas duplicadas
  - 422 para datos inválidos
  - 404 para películas/usuarios/items no encontrados
  - 403 si intenta acceder al watchlist de otro usuario

## Criterios de Evaluación

### Funcionalidad (60%)

- Todos los endpoints funcionan según la especificación
- Las validaciones se aplican correctamente
- Los códigos de estado HTTP son apropiados
- Paginación implementada correctamente
- Headers `Location` incluidos en respuestas 201

### Seguridad (20%)

- Implementación correcta de autenticación por API Key
- Implementación correcta de autorización (usuarios solo acceden a sus recursos)
- Protección adecuada de rutas
- Validación de datos de entrada

### Calidad del Código (10%)

- Código bien organizado y estructurado
- Uso de patrones de diseño apropiados
- Manejo de errores robusto
- Comentarios y documentación del código

### Extras (10%)

- Tests unitarios y/o de integración
- Documentación adicional
- Implementación de características opcionales (filtros por género, búsqueda por título, etc.)

## Entregables

- Código fuente del proyecto
- README con instrucciones de instalación y ejecución
- Documentación de decisiones de diseño (opcional)

## Notas Adicionales

- Se aconseja el uso de herramientas IA para la generación del código fuente
- La persistencia debe realizarse usando el motor de base de datos SQLite
- Se valorará el uso de Docker para la configuración del entorno
- Se recomienda el uso de Git durante el desarrollo
