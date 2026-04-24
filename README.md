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

- ✅ **Autenticación JWT** con sistema de intentos y bloqueo
- ✅ **CRUD completo** de productos, usuarios, ventas y producción
- ✅ **Roles de usuario**: Admin, Cajero, Panadero
- ✅ **Control de acceso RBAC** basado en roles
- ✅ **Encriptación** de contraseñas con bcrypt
- ✅ **Manejo automático de stock** al vender y producir
- ✅ **Registro de actividad** por usuario
- ✅ **CORS habilitado** para conexión con frontend

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