# Especificación de API Backend y Base de Datos para "Tu Plan Saludable"

Este documento describe la API RESTful y el esquema de base de datos necesarios para que el frontend de "Tu Plan Saludable" funcione sin datos mock.

## 1. Principios Generales

### 1.1. Autenticación
- **Método:** Se utilizará autenticación basada en JSON Web Tokens (JWT).
- **Flujo:**
  1. El usuario envía credenciales (`email`, `password`) al endpoint `POST /api/auth/login`.
  2. El servidor valida las credenciales, y si son correctas, genera un JWT que contiene el `userId` y el `role` del usuario.
  3. El servidor devuelve el token al cliente.
  4. El cliente almacenará este token de forma segura (e.g., `localStorage`) y lo enviará en la cabecera `Authorization` de cada petición a endpoints protegidos, con el formato `Bearer <token>`.
- **Protección de Rutas:** Todos los endpoints, excepto `/api/auth/login`, estarán protegidos y requerirán un token válido.

### 1.2. Formato de Respuestas

- **Éxito (`2xx`):**
  ```json
  {
    "data": { ... } // El recurso solicitado
  }
  ```
- **Error (`4xx`, `5xx`):**
  ```json
  {
    "error": "Mensaje descriptivo y claro del error."
  }
  ```

## 2. Endpoints de la API

---

### Módulo de Autenticación (`/api/auth`)

#### `POST /api/auth/login`
- **Descripción:** Autentica a un usuario y devuelve un token JWT.
- **Request Body:**
  ```json
  {
    "email": "carlota@email.com",
    "password": "password123"
  }
  ```
- **Success Response (`200 OK`):**
  ```json
  {
    "data": {
      "token": "ey...",
      "user": {
        "id": "user-carlota",
        "name": "Carlota Rodriguez",
        "email": "carlota@email.com",
        "role": "USER"
      }
    }
  }
  ```
- **Error Responses:**
  - `401 Unauthorized`: Credenciales incorrectas.

#### `GET /api/auth/me`
- **Descripción:** Devuelve los datos del usuario autenticado actualmente a partir de su token. Útil para verificar la sesión al cargar la app.
- **Headers:** `Authorization: Bearer <token>`
- **Success Response (`200 OK`):**
  ```json
  {
    "data": {
        "id": "user-carlota",
        "name": "Carlota Rodriguez",
        "email": "carlota@email.com",
        "role": "USER",
        "trainerId": "trainer-juan"
    }
  }
  ```
- **Error Responses:**
  - `401 Unauthorized`: Token no válido o expirado.

---

### Módulo de Clientes (Vista Entrenador) (`/api/clients`)

#### `GET /api/clients`
- **Descripción:** (Solo para entrenadores) Devuelve la lista de todos los clientes asignados al entrenador autenticado.
- **Headers:** `Authorization: Bearer <token>`
- **Success Response (`200 OK`):**
  ```json
  {
    "data": [
      {
        "id": "user-carlota",
        "name": "Carlota Rodriguez",
        "email": "carlota@email.com"
      },
      {
        "id": "user-pedro",
        "name": "Pedro Martinez",
        "email": "pedro@email.com"
      }
    ]
  }
  ```
- **Error Responses:**
  - `403 Forbidden`: Si un usuario con rol `USER` intenta acceder.

---

### Módulo de Planes (`/api/plans`)

#### `GET /api/plans/:userId/diet`
- **Descripción:** Obtiene el plan de alimentación de un usuario específico. Un entrenador puede obtener el de sus clientes.
- **Headers:** `Authorization: Bearer <token>`
- **Success Response (`200 OK`):**
  ```json
  {
    "data": { /* ... objeto DietPlan ... */ }
  }
  ```
- **Error Responses:**
  - `404 Not Found`: No se encontró plan para el usuario.
  - `403 Forbidden`: Si un entrenador intenta acceder a un plan de alguien que no es su cliente.

#### `PUT /api/plans/:userId/diet`
- **Descripción:** (Solo para entrenadores) Actualiza o crea el plan de alimentación de un cliente.
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:** El objeto `DietPlan` completo.
- **Success Response (`200 OK`):**
  ```json
  {
    "data": { /* ... objeto DietPlan actualizado ... */ }
  }
  ```
- **Error Responses:**
  - `400 Bad Request`: Datos del plan inválidos.

#### `GET /api/plans/:userId/workout`
- **Descripción:** Obtiene el plan de entrenamiento de un usuario específico.
- **Headers:** `Authorization: Bearer <token>`
- **Success Response (`200 OK`):**
  ```json
  {
    "data": { /* ... objeto WorkoutPlan ... */ }
  }
  ```
- **Error Responses:**
  - `404 Not Found`: No se encontró plan para el usuario.

#### `PUT /api/plans/:userId/workout`
- **Descripción:** (Solo para entrenadores) Actualiza o crea el plan de entrenamiento de un cliente.
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:** El objeto `WorkoutPlan` completo.
- **Success Response (`200 OK`):**
  ```json
  {
    "data": { /* ... objeto WorkoutPlan actualizado ... */ }
  }
  ```

---

### Módulo de Seguimiento (`/api/progress`)

#### `GET /api/progress/:userId`
- **Descripción:** Obtiene todos los registros de progreso de un usuario.
- **Headers:** `Authorization: Bearer <token>`
- **Success Response (`200 OK`):**
  ```json
  {
    "data": [ /* ... array de objetos ProgressLog ... */ ]
  }
  ```

#### `POST /api/progress/:userId`
- **Descripción:** (Solo para usuarios) Añade un nuevo registro de progreso. El backend debería gestionar la subida de imágenes a un servicio de almacenamiento (e.g., S3, Cloud Storage) y guardar las URLs.
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:** `multipart/form-data` con los campos del `ProgressLog` y las 3 imágenes.
- **Success Response (`201 Created`):**
  ```json
  {
    "data": { /* ... objeto ProgressLog creado, con las URLs de las fotos ... */ }
  }
  ```

---

### Módulo de Chat (`/api/chat`)

#### `GET /api/chat/:partnerId`
- **Descripción:** Obtiene el historial de mensajes entre el usuario autenticado y el `partnerId`.
- **Headers:** `Authorization: Bearer <token>`
- **Success Response (`200 OK`):**
  ```json
  {
    "data": [ /* ... array de objetos ChatMessage ... */ ]
  }
  ```

#### `POST /api/chat/:partnerId`
- **Descripción:** Envía un mensaje al `partnerId`. El backend podría usar WebSockets para notificaciones en tiempo real.
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
  ```json
  {
    "text": "Hola! ¿Todo bien con el entreno de hoy?"
  }
  ```
- **Success Response (`201 Created`):**
  ```json
  {
    "data": { /* ... objeto ChatMessage creado ... */ }
  }
  ```

## 3. Esquema de Base de Datos (Ejemplo NoSQL)

Se propone un esquema tipo NoSQL (MongoDB) por su flexibilidad.

### Colección: `users`
Almacena la información de todos los usuarios, tanto clientes como entrenadores.

```js
{
  "_id": ObjectId("60d5f3c777e5c9a7b8f9e8a1"),
  "name": "Carlota Rodriguez",
  "email": "carlota@email.com",
  "password": "hashed_password_goes_here", // Usar bcrypt
  "role": "USER",
  "trainerId": ObjectId("60d5f3c777e5c9a7b8f9e8a2"), // Ref a 'users'
  "createdAt": ISODate("2024-01-10T10:00:00Z")
}

{
  "_id": ObjectId("60d5f3c777e5c9a7b8f9e8a2"),
  "name": "Juan Entrenador",
  "email": "entrenador@email.com",
  "password": "hashed_password_goes_here",
  "role": "TRAINER",
  "clients": [
    ObjectId("60d5f3c777e5c9a7b8f9e8a1"), // Ref a Carlota
    ObjectId("60d5f3c777e5c9a7b8f9e8b3")  // Ref a Pedro
  ],
  "createdAt": ISODate("2024-01-09T09:00:00Z")
}
```

### Colección: `diet_plans`
Cada documento representa el plan de dieta completo para un único usuario.

```js
{
  "_id": ObjectId("60d5f4f777e5c9a7b8f9e8c4"),
  "userId": ObjectId("60d5f3c777e5c9a7b8f9e8a1"), // Relación 1-a-1 con users
  "name": "FASE A",
  "dailyActivity": "12.000 PASOS + 4 DIAS GIMNASIO",
  "supplementation": [
    { "name": "CREATINA", "dose": "6g (1g por cada 10kg de peso)" },
    { "name": "CAFEINA", "dose": "200MG en la mañana" }
  ],
  "totals": { "calories": 1530, "protein": 123, "carbs": 155, "fat": 53 },
  "meals": [
    {
      "name": "DESAYUNO",
      "time": "09:00",
      "foods": [
        "30g de Avena sin gluten / o maiz olas de canela y manzana / 40g de pan",
        "40g de arandanos congelados",
        "2 huevos enteros + 100ml de claras de huevo"
      ]
    }
    // ... más comidas
  ],
  "updatedAt": ISODate("2024-05-20T11:00:00Z")
}
```

### Colección: `workout_plans`
Cada documento representa el plan de entrenamiento completo para un único usuario.

```js
{
  "_id": ObjectId("60d5f5f777e5c9a7b8f9e8d5"),
  "userId": ObjectId("60d5f3c777e5c9a7b8f9e8a1"), // Relación 1-a-1 con users
  "workouts": [
    {
      "day": "Monday",
      "name": "Tren Superior (Fuerza)",
      "exercises": [
        { "name": "Press de banca", "type": "Fuerza", "sets": 4, "reps": "8-10", "rest": "60s" },
        // ... más ejercicios
      ],
      "completed": false // El frontend puede manejar esto localmente o se puede añadir un endpoint para actualizarlo.
    }
    // ... más días de entrenamiento
  ],
  "updatedAt": ISODate("2024-05-18T15:00:00Z")
}
```

### Colección: `progress_logs`
Almacena una serie de registros de progreso para cada usuario.

```js
{
  "_id": ObjectId("60d5f6f777e5c9a7b8f9e8e6"),
  "userId": ObjectId("60d5f3c777e5c9a7b8f9e8a1"),
  "date": ISODate("2024-05-22T00:00:00Z"),
  "weight": 63.8,
  "measurements": {
    "waist": 72.5,
    "hip": 96,
    "thigh": 53.5,
    "biceps": 29
  },
  "sensations": "Semana de mucho trabajo, costó seguir el plan al 100%.",
  "dietCompliance": 6,
  "photos": {
    "front": "https://<bucket-name>.s3.amazonaws.com/user-carlota/front-20240522.jpg",
    "side": "https://<bucket-name>.s3.amazonaws.com/user-carlota/side-20240522.jpg",
    "back": "https://<bucket-name>.s3.amazonaws.com/user-carlota/back-20240522.jpg"
  },
  "createdAt": ISODate("2024-05-22T08:30:00Z")
}
```

### Colección: `chat_messages`
Almacena todos los mensajes de la aplicación.

```js
{
  "_id": ObjectId("60d5f7f777e5c9a7b8f9e8f7"),
  "senderId": ObjectId("60d5f3c777e5c9a7b8f9e8a1"), // Carlota
  "receiverId": ObjectId("60d5f3c777e5c9a7b8f9e8a2"), // Juan
  "text": "Hola Juan! ¿Puedo cambiar el salmón por merluza en la cena del lunes?",
  "timestamp": ISODate("2024-05-20T10:00:00Z"),
  "read": false // Opcional, para marcar mensajes como leídos.
}
```

## 4. Tipos de Datos y Esquemas (TypeScript)

Esta sección define las interfaces de TypeScript para los modelos de la base de datos. Sirve como un contrato claro para el desarrollo del backend.

```typescript
import { ObjectId } from 'mongodb';

// --- Users Collection ---
export enum UserRole {
  USER = 'USER',
  TRAINER = 'TRAINER',
}

export interface User {
  _id: ObjectId;
  name: string;
  email: string;
  passwordHash: string; // Contraseña hasheada
  role: UserRole;
  trainerId?: ObjectId; // Ref to 'users'
  clients?: ObjectId[]; // Ref to 'users', only for trainers
  createdAt: Date;
}


// --- Diet Plans Collection ---
export interface Supplement {
  name: string;
  dose: string;
}

export interface Meal {
  name: string;
  time: string; // Formato "HH:mm"
  foods: string[]; // Array de strings, cada uno puede contener opciones (ej: "Pollo / Pavo")
}

export interface DietPlan {
  _id: ObjectId;
  userId: ObjectId; // Ref to 'users'
  name: string;
  dailyActivity: string;
  supplementation: Supplement[];
  totals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  meals: Meal[];
  updatedAt: Date;
}


// --- Workout Plans Collection ---
export interface Exercise {
  name:string;
  type: string;
  sets?: number;
  reps?: string;
  duration?: string;
  rest?: string;
}

export interface Workout {
  day: string; // e.g., "Monday", "Wednesday"
  name: string;
  exercises: Exercise[];
}

export interface WorkoutPlan {
  _id: ObjectId;
  userId: ObjectId; // Ref to 'users'
  workouts: Workout[];
  updatedAt: Date;
}


// --- Progress Logs Collection ---
export interface ProgressPhotos {
  front: string; // URL a la imagen
  side: string;  // URL a la imagen
  back: string;  // URL a la imagen
}

export interface ProgressLog {
  _id: ObjectId;
  userId: ObjectId; // Ref to 'users'
  date: Date;
  weight?: number;
  measurements?: {
    waist?: number;
    hip?: number;
    thigh?: number;
    biceps?: number;
  };
  sensations: string;
  dietCompliance: number; // Rango de 1 a 10
  photos?: ProgressPhotos;
  createdAt: Date;
}


// --- Chat Messages Collection ---
export interface ChatMessage {
  _id: ObjectId;
  senderId: ObjectId;   // Ref to 'users'
  receiverId: ObjectId; // Ref to 'users'
  text: string;
  timestamp: Date;
  read?: boolean;
}
```

## 5. Plan de Acción para la Creación del Backend

Esta sección desglosa el proceso de desarrollo en fases lógicas para guiar al equipo de backend.

### Fase 1: Configuración del Proyecto y Entorno (Sprint 1)
- **Objetivo:** Establecer las bases del proyecto.
- **Tareas:**
  1.  **Inicializar proyecto Node.js:** Usar un stack moderno como `Node.js + Express + TypeScript`.
  2.  **Instalar dependencias clave:** `express`, `mongoose` (para MongoDB), `typescript`, `ts-node`, `nodemon`, `bcryptjs` (para hashear contraseñas), `jsonwebtoken` (para JWT), `cors`, `dotenv`.
  3.  **Configurar TypeScript:** Crear `tsconfig.json` para compilar a JavaScript.
  4.  **Definir estructura de carpetas:** Crear una estructura organizada (ej: `/src`, `/models`, `/controllers`, `/routes`, `/middleware`).
  5.  **Conexión a Base de Datos:** Implementar la lógica de conexión a MongoDB y cargar las variables de entorno (`.env`) para la URI de conexión.

### Fase 2: Módulo de Usuarios y Autenticación (Sprint 1)
- **Objetivo:** Implementar el registro, login y la protección de rutas.
- **Tareas:**
  1.  **Crear Modelo `User`:** Definir el esquema de Mongoose basado en la interfaz `User` de TypeScript.
  2.  **Implementar Hashing de Contraseña:** Usar `bcryptjs` para hashear las contraseñas antes de guardarlas.
  3.  **Endpoint `POST /api/auth/login`:** Crear el controlador y la ruta. Debe validar credenciales, comparar hashes de contraseña y generar un JWT si son válidas.
  4.  **Middleware de Autenticación:** Crear un middleware (`auth.middleware.ts`) que verifique el token JWT de la cabecera `Authorization`. Si es válido, decodificarlo y adjuntar los datos del usuario (ej. `userId`, `role`) al objeto `request` para usarlo en los siguientes controladores.
  5.  **Endpoint `GET /api/auth/me`:** Implementar esta ruta protegida para verificar la sesión del usuario.
  6.  **Endpoint `GET /api/clients`:** Implementar la lógica para que solo los entrenadores puedan acceder y devuelvan su lista de clientes.

### Fase 3: Módulos de Planes y Seguimiento (Sprint 2)
- **Objetivo:** Desarrollar las funcionalidades principales de la aplicación.
- **Tareas:**
  1.  **Crear Modelos:** Definir los esquemas de Mongoose para `DietPlan`, `WorkoutPlan`, y `ProgressLog`.
  2.  **Endpoints para Planes (`/api/plans`):**
      - Crear los controladores y rutas para `GET` y `PUT` de los planes de dieta y entrenamiento.
      - Asegurar que los entrenadores solo puedan modificar los planes de sus propios clientes.
  3.  **Endpoints para Seguimiento (`/api/progress`):**
      - Implementar `GET /api/progress/:userId`.
      - Implementar `POST /api/progress/:userId`. Esta tarea es más compleja:
          - Usar un middleware como `multer` para gestionar la subida de ficheros (`multipart/form-data`).
          - Integrar un SDK (ej. `aws-sdk`) para subir las imágenes a un servicio de almacenamiento en la nube (como AWS S3).
          - Guardar las URLs de las imágenes devueltas por el servicio de almacenamiento en el documento `ProgressLog`.

### Fase 4: Módulo de Chat (Sprint 3)
- **Objetivo:** Implementar la comunicación en tiempo real.
- **Tareas:**
  1.  **Crear Modelo `ChatMessage`:** Definir el esquema de Mongoose.
  2.  **Endpoints REST para Chat:**
      - Implementar `GET /api/chat/:partnerId` para cargar el historial de mensajes.
      - Implementar `POST /api/chat/:partnerId` para guardar un nuevo mensaje.
  3.  **(Recomendado) Integración con WebSockets:**
      - Añadir `socket.io` al servidor.
      - Al enviar un mensaje, además de guardarlo en la DB, emitir un evento WebSocket (ej. `'new_message'`) al `receiverId`.
      - El frontend deberá escuchar este evento para actualizar la interfaz de chat en tiempo real sin necesidad de recargar la página.

### Fase 5: Pruebas, Documentación y Despliegue (Sprint 4)
- **Objetivo:** Asegurar la calidad y preparar para producción.
- **Tareas:**
  1.  **Pruebas (Testing):** Escribir pruebas unitarias e de integración para los endpoints (ej. con `Jest` y `supertest`).
  2.  **Validación de Datos:** Añadir validación a todos los datos de entrada de la API para prevenir errores e inyecciones (ej. con `express-validator` o `zod`).
  3.  **Seguridad:** Revisar la configuración de CORS, añadir `helmet` para cabeceras de seguridad y considerar la implementación de "rate limiting" para prevenir ataques de fuerza bruta.
  4.  **Documentación de API:** Refinar y completar este documento. Se puede usar una herramienta como Swagger/OpenAPI para generar una documentación interactiva.
  5.  **Despliegue:**
      - Crear un `Dockerfile` para contenerizar la aplicación.
      - Configurar un pipeline de CI/CD.
      - Desplegar en una plataforma como Heroku, AWS Elastic Beanstalk, o Vercel (para funciones serverless).