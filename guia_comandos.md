# Guía de Comandos del Proyecto 🚀

Esta guía contiene todos los comandos necesarios para iniciar y mantener el ecosistema del proyecto (Frontend, Backend, IA y Base de Datos).

## 1. Base de Datos (Docker)
Asegúrate de que Docker Desktop esté abierto.
```powershell
# Iniciar el contenedor de PostgreSQL
docker start recruitment-db
```

## 2. Microservicio de IA (Python)
Este servicio maneja el análisis de CVs con Llama 3 vía Groq.
```powershell
# Navegar a la carpeta
cd ai_service_python

# Ejecutar usando el script automático (configura el entorno solo)
.\run_ai.bat
```
*Si prefieres el comando manual:*
`"C:\Program Files\PostgreSQL\18\pgAdmin 4\python\python.exe" main.py`

## 3. Backend (NestJS)
El corazón de la lógica y conexión con la DB.
```powershell
# Navegar a la carpeta
cd backend

# Iniciar en modo desarrollo (con auto-recarga)
npm run start:dev
```

## 4. Frontend (Next.js)
La interfaz de usuario moderna.
```powershell
# Navegar a la carpeta
cd frontend

# Iniciar el servidor de desarrollo
npm run dev
```

## 5. Herramientas de Datos (Prisma)
Para ver o modificar la base de datos visualmente.
```powershell
# Dentro de la carpeta /backend
npx prisma studio
```

---

### URLs de Acceso Rápido:
- **Aplicación (Frontend)**: [http://localhost:3000](http://localhost:3000)
- **API (Backend)**: [http://localhost:3001](http://localhost:3001)
- **Servicio IA**: [http://localhost:8000](http://localhost:8000)
- **Prisma Studio**: [http://localhost:51212](http://localhost:51212)
