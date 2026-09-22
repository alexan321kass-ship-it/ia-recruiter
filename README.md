# 🤖 IA Recruiter - Plataforma Inteligente de Reclutamiento con Inteligencia Artificial

**IA Recruiter** es un ecosistema integral de reclutamiento y selección impulsado por Inteligencia Artificial (LLMs). Permite a las empresas evaluar candidatos automáticamente mediante coincidencia (_matching_) de CVs con vacantes laborales, análisis de personalidad laboral y agendamiento de entrevistas, mientras que ofrece a los candidatos una experiencia de postulación inteligente y práctica de entrevistas.

---

## 📐 1. Arquitectura del Sistema

El proyecto sigue una arquitectura de **microservicios desacoplados**, permitiendo alta escalabilidad e independencia de tecnologías:

```
                  ┌────────────────────────┐
                  │    Frontend (Next.js)   │
                  │     Puerto: 3000       │
                  └───────────┬────────────┘
                              │ REST API
                              ▼
                  ┌────────────────────────┐
                  │   Backend (NestJS)     │
                  │     Puerto: 3001       │
                  └─────┬──────────────┬───┘
     Prisma ORM         │              │ HTTP Proxy / REST
                        ▼              ▼
       ┌──────────────────┐  ┌───────────────────────┐
       │ PostgreSQL (DB)  │  │ Servicio IA (FastAPI) │
       │   Puerto: 5432   │  │     Puerto: 8000      │
       └──────────────────┘  └───────────────────────┘
```

### Tecnologías Utilizadas

- **Frontend**: Next.js 15, React 19, TypeScript, TailwindCSS, Zustand, Lucide Icons, jsPDF.
- **Backend**: NestJS, TypeScript, Prisma ORM, JWT, Passport, Nodemailer.
- **Servicio de IA (Python)**: FastAPI, Python 3.10+, Groq Cloud API (**Llama 3**), PyPDF2.
- **Base de Datos & Infraestructura**: PostgreSQL 15, Docker & Docker Compose.

---

## 👥 2. Roles de Usuario y Funcionalidades

### 🏢 Empresa (`COMPANY`)

- **Gestión de Vacantes**: Creación, edición y publicación de ofertas de empleo especificando requerimientos, experiencia mínima y habilidades.
- **Evaluación Automatizada**: Filtro inteligente de CVs postulados con puntuación de compatibilidad (Score 0-100%).
- **Análisis Detallado por IA**: Visualización de fortalezas, brechas/debilidades y recomendaciones clave del candidato frente a la vacante.
- **Agendamiento de Entrevistas**: Programación de entrevistas presenciales o remotas (Google Meet/Teams) con notas y notificaciones por correo.

### 👨‍💼 Candidato (`CANDIDATE`)

- **Gestión de CV**: Carga de hoja de vida en PDF con extracción y parseo automático de texto mediante IA.
- **Prueba de Personalidad**: Evaluación de rasgos laborales basándose en el modelo Big Five para determinar el arquetipo profesional del candidato.
- **Postulación Inteligente**: Análisis de coincidencia inmediata al postular a una vacante.
- **Simulador de Entrevistas**: Módulo interactivo de práctica de entrevista técnica/conductual adaptado a la vacante.
- **Reporte Descargable**: Exportación del reporte de análisis y perfil en PDF.

---

## 🗄️ 3. Modelo de Datos (Prisma Schema)

Las principales entidades de la base de datos PostgreSQL son:

| Entidad           | Descripción                                                       | Relaciones Clave                              |
| :---------------- | :---------------------------------------------------------------- | :-------------------------------------------- |
| `User`            | Usuarios del sistema (Candidato, Empresa, Admin)                  | `jobs`, `cvs`, `personalityTest`              |
| `Job`             | Ofertas de empleo publicadas por las empresas                     | Pertenece a `User`, relaciona con `Analysis`  |
| `Cv`              | Hojas de vida en PDF procesadas                                   | Pertenece a `User`, relaciona con `Analysis`  |
| `Analysis`        | Resultado del análisis comparativo entre CV y Job generado por IA | Relaciona `Cv` + `Job`, contiene `interviews` |
| `Interview`       | Entrevistas programadas para un candidato analizado               | Pertenece a `Analysis`                        |
| `PersonalityTest` | Resultados y puntajes del test de personalidad                    | Pertenece a `User`                            |

---

## 🔌 4. Endpoints Principales de la API

### Backend NestJS (`http://localhost:3001`)

#### Autenticación (`/auth`)

- `POST /auth/register` - Registro de usuario (Candidato / Empresa).
- `POST /auth/login` - Inicio de sesión con retorno de token JWT.
- `GET /auth/me` - Perfil del usuario autenticado.

#### Gestión de Vacantes (`/jobs`)

- `POST /jobs` - Crear nueva vacante (Empresa).
- `GET /jobs` - Listar ofertas laborales disponibles.
- `GET /jobs/:id` - Obtener detalle de una vacante específica.

#### Hojas de Vida (`/cvs`)

- `POST /cvs/upload` - Cargar archivo PDF de hoja de vida y parsear contenido.
- `GET /cvs/my-cv` - Obtener el CV procesado del candidato.

#### Análisis e IA (`/analysis`)

- `POST /analysis/analyze` - Ejecutar análisis de match entre CV y Vacante.
- `GET /analysis/job/:jobId` - Listar análisis y rankings de postulantes a una vacante.

#### Personalidad (`/personality`)

- `POST /personality/submit` - Enviar respuestas del test y generar perfil de arquetipo con IA.
- `GET /personality/me` - Consultar el test de personalidad actual del usuario.

#### Entrevistas (`/interviews`)

- `POST /interviews` - Programar una entrevista para un candidato.
- `GET /interviews` - Consultar entrevistas agendadas.

---

### Microservicio de IA Python FastAPI (`http://localhost:8000`)

- `POST /cv/parse` - Extrae texto estructurado desde un archivo PDF.
- `POST /cv/analyze` - Evalúa el CV contra la descripción del empleo con **Llama 3** en Groq.
- `POST /personality/analyze` - Genera el resumen y arquetipo conductual basándose en el test.
- `POST /interview/generate` - Genera preguntas personalizadas para práctica o entrevista.

---

## 🛠️ 5. Guía de Instalación y Ejecución

### Requisitos Previos

- Node.js v18+
- Python 3.10+
- Docker Desktop
- Cuenta en Groq Cloud (para la `GROQ_API_KEY`)

---

### Configuración de Variables de Entorno

#### 1. Backend (`/backend/.env`)

```env
DATABASE_URL="postgresql://admin:password123@localhost:5432/recruitment_db?schema=public"
JWT_SECRET="super_secret_jwt_key_ia_recruiter"
AI_SERVICE_URL="http://localhost:8000"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="tu_correo@gmail.com"
SMTP_PASS="tu_contraseña_de_aplicacion"
```

#### 2. Microservicio IA (`/ai_service_python/.env`)

```env
GROQ_API_KEY="gsk_tu_api_key_de_groq_aqui"
```

---

### Ejecución de la Aplicación

#### Opción A: Mediante Docker Compose (Recomendado)

```bash
docker-compose up --build -d
```

#### Opción B: Ejecución Servicio por Servicio

1. **Base de Datos PostgreSQL**:

   ```bash
   docker run -d --name recruitment-db -e POSTGRES_USER=admin -e POSTGRES_PASSWORD=password123 -e POSTGRES_DB=recruitment_db -p 5432:5432 postgres:15
   ```

2. **Microservicio de IA (Python)**:

   ```bash
   cd ai_service_python
   .\run_ai.bat
   # O manualmente:
   # python -m venv venv
   # .\venv\Scripts\activate
   # pip install -r requirements.txt
   # uvicorn main:app --reload --port 8000
   ```

3. **Backend (NestJS)**:

   ```bash
   cd backend
   npm install
   npx prisma db push
   npm run start:dev
   ```

4. **Frontend (Next.js)**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

---

## 🌐 6. URLs de Acceso Local

| Servicio                          | URL                                                                  |
| :-------------------------------- | :------------------------------------------------------------------- |
| **Frontend Web**                  | [http://localhost:3000](http://localhost:3000)                       |
| **Backend API**                   | [http://localhost:3001](http://localhost:3001)                       |
| **Documentación Swagger / API**   | [http://localhost:3001/api](http://localhost:3001/api)               |
| **Servicio de IA (FastAPI)**      | [http://localhost:8000](http://localhost:8000)                       |
| **Documentación IA (Swagger)**    | [http://localhost:8000/docs](http://localhost:8000/docs)             |
| **Prisma Studio (Base de Datos)** | `npx prisma studio` ([http://localhost:5555](http://localhost:5555)) |

---

## 🛡️ 7. Seguridad y Buenas Prácticas

- **Protección de Secretos**: Exclusión de archivos `.env`, tokens JWT y claves de API del control de versiones (`.gitignore`).
- **Autenticación en Capas**: Guards de NestJS (`JwtAuthGuard` y `RolesGuard`) para restricción de endpoints según el rol del usuario (`COMPANY` / `CANDIDATE`).
- **Validación de Datos**: DTOs validados con `class-validator` en backend y esquemas `Pydantic` en FastAPI.
