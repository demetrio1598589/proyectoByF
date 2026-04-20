CREATE DATABASE IF NOT EXISTS db_panaderia CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE db_panaderia;



-- Usuarios del sistema
CREATE TABLE usuario (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100),
    apellido VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    dni VARCHAR(8) UNIQUE,
    password VARCHAR(255),
    rol ENUM('admin','cajero','panadero') DEFAULT 'cajero',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Productos (tipos de pan)
CREATE TABLE producto (
    id_producto INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150),
    descripcion TEXT,
    precio DECIMAL(10,2),
    stock INT,
    tipo ENUM('pan','pastel','bebida','otros') DEFAULT 'pan',
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Detalles del producto (más simple que tecnología)
CREATE TABLE detalle_producto (
    id_detalle_producto INT AUTO_INCREMENT PRIMARY KEY,
    producto_id INT,
    ingredientes TEXT,
    peso VARCHAR(50),
    calorias INT,
    fecha_vencimiento DATE,
    FOREIGN KEY (producto_id) REFERENCES producto(id_producto) ON DELETE CASCADE
);

-- Ventas
CREATE TABLE venta (
    id_venta INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total DECIMAL(10,2),
    FOREIGN KEY (usuario_id) REFERENCES usuario(id_usuario)
);

-- Detalle de cada venta
CREATE TABLE detalle_venta (
    id_detalle_venta INT AUTO_INCREMENT PRIMARY KEY,
    venta_id INT,
    producto_id INT,
    cantidad INT,
    precio_unitario DECIMAL(10,2),
    subtotal DECIMAL(10,2),
    FOREIGN KEY (venta_id) REFERENCES venta(id_venta) ON DELETE CASCADE,
    FOREIGN KEY (producto_id) REFERENCES producto(id_producto)
);

-- Producción diaria (clave en panadería)
CREATE TABLE produccion (
    id_produccion INT AUTO_INCREMENT PRIMARY KEY,
    producto_id INT,
    cantidad_producida INT,
    fecha DATE,
    FOREIGN KEY (producto_id) REFERENCES producto(id_producto)
);

-- 👤 Usuarios
INSERT INTO usuario (nombre, apellido, email, dni, password, rol) VALUES
('Juan','Perez','juan@gmail.com','12345678','123456','admin'),
('Maria','Lopez','maria@gmail.com','87654321','123456','cajero'),
('Carlos','Quispe','carlos@gmail.com','11223344','123456','panadero');

-- 🥖 Productos
INSERT INTO producto (nombre, descripcion, precio, stock, tipo) VALUES
('Pan Francés','Pan clásico crujiente',0.30,200,'pan'),
('Pan Integral','Pan saludable con fibra',0.50,150,'pan'),
('Croissant','Pan dulce hojaldrado',1.20,80,'pastel'),
('Torta Chocolate','Porción de torta',3.50,20,'pastel'),
('Café','Bebida caliente',2.00,50,'bebida');

-- 📋 Detalles de producto
INSERT INTO detalle_producto (producto_id, ingredientes, peso, calorias, fecha_vencimiento) VALUES
(1,'Harina, agua, sal, levadura','50g',120,'2026-04-22'),
(2,'Harina integral, agua, sal','60g',140,'2026-04-22'),
(3,'Harina, mantequilla, azúcar','80g',300,'2026-04-23'),
(4,'Harina, cacao, azúcar, huevo','150g',450,'2026-04-25'),
(5,'Café, agua, azúcar','250ml',50,'2026-04-21');

-- 🏭 Producción diaria
INSERT INTO produccion (producto_id, cantidad_producida, fecha) VALUES
(1,200,'2026-04-20'),
(2,150,'2026-04-20'),
(3,80,'2026-04-20'),
(4,20,'2026-04-20'),
(5,50,'2026-04-20');

-- 🧾 Ventas
INSERT INTO venta (usuario_id, total) VALUES
(2,5.00),
(2,3.50);

-- 🧾 Detalle de ventas
INSERT INTO detalle_venta (venta_id, producto_id, cantidad, precio_unitario, subtotal) VALUES
(1,1,10,0.30,3.00),
(1,5,1,2.00,2.00),
(2,4,1,3.50,3.50);

