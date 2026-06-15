# 🌌 Cosmos Explorer Backend

[![NestJS](https://img.shields.io/badge/framework-NestJS-E0234E?style=flat&logo=nestjs)](https://nestjs.com/)
[![Prisma](https://img.shields.io/badge/ORM-Prisma-2D3748?style=flat&logo=prisma)](https://prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/database-PostgreSQL-336791?style=flat&logo=postgresql)](https://www.postgresql.org/)
[![TypeScript](https://img.shields.io/badge/language-TypeScript-007ACC?style=flat&logo=typescript)](https://www.typescriptlang.org/)

Welcome to the core engine of **Cosmos Explorer**, a professional and robust REST API built for astronomy enthusiasts. This application centralizes and exposes detailed information about celestial bodies, manages community interaction through posts, and gamifies the user experience via trivias and global rankings.

---

## 🚀 Key Features

* **Astronomical Explorer:** Optimized endpoints to query encyclopedic and scientific data about stars, planets, exoplanets, galaxies, and nebulae.
* **Gamification (Daily Question & Rankings):** An astrophysics trivia system featuring daily updates and real-time score calculations for a global user leaderboard.
* **Interactive Community (Posts):** A complete microblogging module where users can discuss, comment, and share latest cosmic discoveries.
* **Advanced Relations:** Search algorithms to suggest related content (e.g., matching exoplanets belonging to a specific stellar system).
* **Security:** Robust authentication featuring password hashing via `bcrypt` and strict inbound data validation using `class-validator`.

---

## 🛠️ Tech Stack & Architecture

* **Framework:** NestJS (Modular and scalable architecture).
* **Database:** PostgreSQL (IDs driven by `UUID` format).
* **ORM:** Prisma v5+ (Leveraging native *Driver Adapters* via `@prisma/adapter-pg` for optimal database connection pooling).
* **Validation:** Global execution of `class-validator` and `class-transformer`.

---

## 📋 Prerequisites

Before igniting the engines, make sure you have installed:
* [Node.js](https://nodejs.org/) (LTS version recommended)
* [PostgreSQL](https://www.postgresql.org/) (Local installation or running via Docker)

---

## ⚙️ Project Setup

### 1. Clone the repository and install dependencies
```bash
git clone [https://github.com/Fernando2025A/cosmos-explorer.git](https://github.com/Fernando2025A/cosmos-explorer.git)
cd cosmos-explorer
npm install