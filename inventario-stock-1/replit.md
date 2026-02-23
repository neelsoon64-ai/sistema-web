# Sistema de Gestión Chubut

## Overview
Sistema de gestión de inventario para la Secretaría de Trabajo de la Provincia del Chubut. Utiliza React, TypeScript, Vite, Express y PostgreSQL.

## Recent Changes
- 2026-02-21: Migración a PostgreSQL y backend Express para soporte multiusuario y actualizaciones en tiempo real.
- 2026-02-21: Añadido botón "Nuevo Producto" y formulario de alta en la sección de inventario.

## Project Architecture
- **Frontend**: React 19 + TypeScript + Vite 6
- **Backend**: Express.js (Node.js)
- **Database**: PostgreSQL (Replit Managed)
- **Auth**: localStorage con usuarios predefinidos (ADMIN/USER)

## Development
- `npm run dev`: Solo frontend (Vite)
- `node server.js`: Servidor Express (Backend + Frontend estático)

## Deployment
- **Replit**: Autoscale deployment con `node server.js`
- **Vercel**: Configurado vía `vercel.json`. Requiere configurar `DATABASE_URL` en las variables de entorno de Vercel.
