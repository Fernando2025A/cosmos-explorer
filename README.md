# 🌌 Cosmos Explorer Backend

[![NestJS](https://img.shields.io/badge/framework-NestJS-E0234E?style=flat&logo=nestjs)](https://nestjs.com/)
[![Prisma](https://img.shields.io/badge/ORM-Prisma-2D3748?style=flat&logo=prisma)](https://prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/database-PostgreSQL-336791?style=flat&logo=postgresql)](https://www.postgresql.org/)
[![TypeScript](https://img.shields.io/badge/language-TypeScript-007ACC?style=flat&logo=typescript)](https://www.typescriptlang.org/)

Bienvenido al motor central de **Cosmos Explorer**, una API REST profesional y robusta diseñada para los entusiastas de la astronomía. Esta aplicación centraliza y expone información detallada sobre cuerpos celestes, gestiona comunidades mediante publicaciones y gamifica la experiencia a través de trivias y rankings globales.

---

## 🚀 Características Principales

* **Explorador Astronómico:** Endpoints optimizados para consultar información enciclopédica y científica sobre estrellas, planetas, exoplanetas, galaxias y nebulosas.
* **Gamificación (Pregunta Diaria y Rankings):** Sistema de trivias astrofísicas con actualización diaria y cálculo de puntajes para un ranking global de usuarios.
* **Comunidad Interactiva (Posts):** Módulo completo de microblogging donde los usuarios pueden debatir y compartir descubrimientos del cosmos.
* **Relaciones Avanzadas:** Algoritmos de búsqueda para sugerir contenido relacionado (ej. exoplanetas pertenecientes a un sistema estelar específico).
* **Seguridad:** Autenticación robusta con hashing de contraseñas mediante `bcrypt` y validación estricta de datos entrantes con `class-validator`.

---

## 🛠️ Stack Tecnológico y Arquitectura

* **Framework:** NestJS (Arquitectura modular y escalable).
* **Base de Datos:** PostgreSQL (IDs basados en formato `UUID`).
* **ORM:** Prisma v5+ (Implementando *Driver Adapters* nativos mediante `@prisma/adapter-pg` para la optimización del pool de conexiones).
* **Validación:** `class-validator` y `class-transformer` a nivel global.

---

## 📋 Requisitos Previos

Antes de encender los motores, asegúrate de tener instalado:
* [Node.js](https://nodejs.org/) (Versión LTS recomendada)
* [PostgreSQL](https://www.postgresql.org/) (Instalación local o mediante Docker)

---

## ⚙️ Configuración del Proyecto

### 1. Clonar el repositorio e instalar dependencias
```bash
git clone [https://github.com/Fernando2025A/cosmos-explorer.git](https://github.com/Fernando2025A/cosmos-explorer.git)
cd cosmos-explorer
npm install