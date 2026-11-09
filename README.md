# 🏛️ Asistente Virtual ITCA-FEPADE (Centro Regional Santa Ana)

Proyecto web institucional que implementa un agente conversacional para guiar a aspirantes y estudiantes de **ITCA-FEPADE Centro Regional Santa Ana** en temas de carreras técnicas, procesos de nuevo ingreso/reingreso, becas y aranceles.

---

## 📂 Estructura del Repositorio

- **`ChatBot-Becas/`**: Frontend desarrollado en **React 19 + TypeScript + Vite + TailwindCSS 4**.
  - Login interactivo con validación institucional.
  - Interfaz de chat en tiempo real con chips de sugerencias rápidas, avatares y diseño responsivo.
  - `ErrorBoundary` para prevención de caídas de la interfaz.

- **`demo/`**: Backend desarrollado en **Spring Boot (Java 17) + Spring Data JPA**.
  - Endpoints REST para autenticación (`/api/auth/login`) y chat (`/api/chat`).
  - Integración con Google Gemini API (`gemini-3.1-flash-lite` con failover automático a `gemini-3.6-flash`).
  - Configuración CORS para conexión fluida con el frontend.

- **`database/`**:
  - `init.sql`: Script de creación de la base de datos `chatbot` y la tabla `usuarios` en MySQL.

---

## 🚀 Requisitos Previos

1. **Node.js** (v18+ recomendado) y `npm`
2. **Java JDK 17+**
3. **MySQL Server 8.0+**
4. Clave de API de Google Gemini (AI Studio)

---

## ⚙️ Instrucciones de Ejecución

### 1. Base de Datos
Ejecuta el script SQL en MySQL Workbench o terminal:
```sql
SOURCE database/init.sql;
```

### 2. Backend (Spring Boot)
1. Configura tu API Key de Gemini y credenciales MySQL en `demo/src/main/resources/application.properties`.
2. Inicia el servidor:
```bash
cd demo
./mvnw spring-boot:run
```
El backend estará disponible en `http://localhost:8080`.

### 3. Frontend (React + Vite)
```bash
cd ChatBot-Becas
npm install
npm run dev
```
El frontend estará disponible en `http://localhost:5173`.
