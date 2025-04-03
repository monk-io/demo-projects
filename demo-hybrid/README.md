# Monk Vercel example

Example of deploying static website to Vercel with a backend and a database using Monk runnable.

## Structure

- `frontend/` - Frontend code, can be deployed to Vercel
  - depends on the backend domain at build-time, see `VITE_BASE_URL`
- `go-backend/` - Backend code, can be containerized and deployed to a cloud instance
  - requires a PostgreSQL database

## Architecture

```
┌──────────┐     HTTP      ┌─────────────┐     SQL      ┌────────────┐
│ Frontend │ - - - - - - > │   Backend   │ ──────────►  │ PostgreSQL │
│          │               │ (API Server)│              │ Database   │
└──────────┘               └─────────────┘              └────────────┘
     :                            :                           :
     :                            :                           :
   Vercel                       Cloud                       Cloud
```
