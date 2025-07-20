# Mentorías de Inglés - Backend

Este es el repositorio del backend de la aplicación "Mentorías de Inglés", que gestiona la lógica de negocio, la interacción con la base de datos y el envío de correos electrónicos. Está construido con Node.js y Express.

---

## 🛠️ Tecnologías Clave Utilizadas

- **Node.js:** Entorno de ejecución de JavaScript del lado del servidor.
- **Express.js:** Framework web minimalista y flexible para Node.js, utilizado para construir la API REST.
- **PostgreSQL:** Sistema de gestión de bases de datos relacionales utilizado para almacenar información de citas y mentores.
- **`pg` (Node.js PostgreSQL driver):** Cliente para conectar y interactuar con la base de datos PostgreSQL desde Node.js.
- **Nodemailer:** Módulo para el envío de correos electrónicos de confirmación.
- **`dotenv`:** Para la gestión de variables de entorno, manteniendo la configuración sensible fuera del código fuente.
- **`cors`:** Middleware de Express para habilitar el Cross-Origin Resource Sharing, permitiendo que el frontend (que se ejecuta en un dominio diferente) se comunique con el backend.

---

## 🚀 Cómo Empezar (Desarrollo Local)

Sigue estos pasos para poner en marcha el servidor backend en tu máquina local.

### Prerrequisitos

- **Node.js** (versión 18.x o superior recomendada)
- **npm** o **Yarn** o **pnpm** o **Bun**
- Una instancia de **PostgreSQL** corriendo y accesible.

### 1. Configuración de la Base de Datos

Primero, necesitas configurar tu base de datos PostgreSQL.

1.  **Conéctate a tu base de datos PostgreSQL.** Puedes usar `psql` desde la terminal, pgAdmin, DBeaver o cualquier otra herramienta de tu preferencia.
2.  **Crea el esquema y las tablas** necesarias ejecutando las siguientes sentencias SQL:

    ```sql
    CREATE SCHEMA IF NOT EXISTS mentorias_schema;

    CREATE TABLE IF NOT EXISTS mentorias_schema.appointments (
        id SERIAL PRIMARY KEY,
        student_name VARCHAR(255) NOT NULL,
        student_email VARCHAR(255) NOT NULL,
        mentor_id INTEGER,
        appointment_date DATE NOT NULL,
        appointment_time TIME NOT NULL,
        duration_minutes INTEGER DEFAULT 60,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS mentorias_schema.mentors (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        specialty VARCHAR(255)
    );

    -- Opcional: Inserta un mentor de ejemplo para pruebas
    INSERT INTO mentorias_schema.mentors (name, email, specialty)
    VALUES ('Dr. Phil English', 'phil.english@example.com', 'General English');
    ```

### 2. Instalación y Ejecución del Backend

1.  **Clona el repositorio:**

    ```bash
    git clone https://github.com/dacaceros97/mentorias-backend
    cd mentorias-backend
    ```

2.  **Instala las dependencias de Node.js:**

    ```bash
    npm install
    # o
    yarn install
    # o
    pnpm install
    # o
    bun install
    ```

3.  **Configura las variables de entorno:**
    Crea un archivo `.env` en la raíz de tu proyecto backend con la siguiente información. Asegúrate de reemplazar los valores de ejemplo con tus credenciales reales y configuraciones.

    ```env
    PORT=5000

    # PostgreSQL Database Credentials
    DB_USER=tu_usuario_pg
    DB_HOST=localhost
    DB_DATABASE=tu_base_de_datos
    DB_PASSWORD=tu_contraseña_pg
    DB_PORT=5432

    # Nodemailer (Email Service) Configuration
    EMAIL_SERVICE=gmail # o tu servicio de correo (e.g., Outlook, SendGrid)
    EMAIL_USER=tu_correo@gmail.com
    EMAIL_PASS=tu_contraseña_o_app_password
    ```

    _Para `EMAIL_PASS` con Gmail, necesitarás generar una [Contraseña de Aplicación](https://support.google.com/accounts/answer/185833) si tienes la verificación en dos pasos activada._

4.  **Inicia el servidor backend:**

    ```bash
    npm start
    # o si usas nodemon para desarrollo
    # npm run dev
    ```

5.  **Verifica el servidor:**
    Abre tu navegador y visita `http://localhost:5000`. Deberías ver el mensaje: "Backend de Mentorías de Inglés funcionando!".

---

## 📂 Estructura del Proyecto

- `server.js`: Archivo principal del servidor Express, donde se configuran los middlewares y se montan las rutas.
- `routes/`: Contiene los archivos de definición de rutas para la API (ej., `appointments.js`).
  - `routes/appointments.js`: Maneja las rutas relacionadas con el agendamiento y consulta de citas.
- `.env`: Archivo para variables de entorno (no versionado).
- `.gitignore`: Define los archivos y directorios que Git debe ignorar.

---

## 💡 Endpoints de la API

El backend expone los siguientes endpoints (montados bajo `/api/appointments`):

- **`POST /api/appointments`**:

  - **Descripción:** Agenda una nueva cita de mentoría.
  - **Cuerpo de la Solicitud (JSON):**
    ```json
    {
      "studentName": "Juan Pérez",
      "studentEmail": "juan.perez@example.com",
      "appointmentDate": "2024-07-25",
      "appointmentTime": "10:00",
      "durationMinutes": 60
    }
    ```
  - **Respuesta Exitosa:** `201 Created` con los detalles de la cita agendada.
  - **Notas:** Asigna automáticamente un `mentor_id` (actualmente el primer mentor disponible en la base de datos) y envía un correo de confirmación.

- **`GET /api/appointments`**:
  - **Descripción:** Obtiene una lista de todas las citas agendadas.
  - **Respuesta Exitosa:** `200 OK` con un arreglo de objetos de citas.
