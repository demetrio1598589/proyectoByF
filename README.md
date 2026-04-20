# 🥖 API Panadería - Backend

API RESTful para la gestión de una panadería, desarrollada con Node.js, Express y MySQL. Permite administrar productos, usuarios, ventas y producción diaria.

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Tecnologías](#-tecnologías)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Endpoints de la API](#-endpoints-de-la-api)
- [Base de Datos](#-base-de-datos)
- [Pruebas](#-pruebas)
- [Despliegue en Clever Cloud](#-despliegue-en-clever-cloud)
- [Contribución](#-contribución)
- [Licencia](#-licencia)

## 🚀 Características

- ✅ **CRUD completo** de productos, usuarios y ventas
- ✅ **Autenticación** con JWT (en desarrollo)
- ✅ **Encriptación** de contraseñas con bcrypt
- ✅ **Manejo de stock** automático al vender
- ✅ **CORS habilitado** para conexión con frontend
- ✅ **Variables de entorno** para configuración segura
- ✅ **Base de datos** MySQL en Clever Cloud

## 🛠 Tecnologías

- **Node.js** - Entorno de ejecución
- **Express.js** - Framework web
- **MySQL** - Base de datos relacional
- **mysql2** - Driver de MySQL para Node.js
- **bcryptjs** - Encriptación de contraseñas
- **jsonwebtoken** - Autenticación JWT
- **cors** - Manejo de CORS
- **dotenv** - Variables de entorno
- **nodemon** - Reinicio automático en desarrollo

## 📦 Requisitos Previos

- Node.js (v14 o superior)
- npm o yarn
- MySQL (local o remoto)
- Cuenta en Clever Cloud (para producción)

## 🔧 Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/demetrio1598589/proyectoByF.git
cd backend