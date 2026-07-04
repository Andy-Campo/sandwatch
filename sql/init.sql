-- Active: 1783133433440@@dpg-d946o7hkh4rs73ek3md0-a.oregon-postgres.render.com@5432@sandwatch
-- =========================================================================
-- 1. ELIMINACIÓN SECUENCIAL DE TABLAS (Evita el uso de CASCADE conflictivo)
-- =========================================================================
-- Primero eliminamos la tabla hijo para romper la restricción de clave foránea
DROP TABLE IF EXISTS hijos;
DROP TABLE IF EXISTS padres;

-- =========================================================================
-- 2. CREACIÓN DE TABLAS (DDL Compatible y Optimizado)
-- =========================================================================

-- Tabla de Padres (Administradores del sistema)
CREATE TABLE padres (
    id_padre SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(150) UNIQUE NOT NULL,
    contrasena VARCHAR(255) NOT NULL,
    fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexar el correo para garantizar búsquedas veloces en el login
CREATE INDEX idx_padres_correo ON padres(correo);


-- Tabla de Hijos (Usuarios del entorno lúdico de SandWatch)
CREATE TABLE hijos (
    id_hijo SERIAL PRIMARY KEY,
    id_padre INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    codigo_acceso VARCHAR(10) NOT NULL,
    avatar VARCHAR(100) DEFAULT 'default_avatar.png',
    puntos_acumulados INT DEFAULT 0 CHECK (puntos_acumulados >= 0),
    fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_padre FOREIGN KEY (id_padre) REFERENCES padres(id_padre) ON DELETE CASCADE
);

-- Indexar la clave foránea para optimizar los JOINs del Dashboard
CREATE INDEX idx_hijos_padre ON hijos(id_padre);


-- =========================================================================
-- 3. INYECCIÓN DE DATOS DE PRUEBA (Mock Data)
-- =========================================================================

-- Insertamos un Padre de simulación
INSERT INTO padres (nombre, correo, contrasena) 
VALUES ('Marcelo Campo', 'marcelo@sandwatch.com', '$2b$10$MockHashForDevPurposes123456789');

-- Insertamos los hijos vinculados automáticamente al padre id: 1
INSERT INTO hijos (id_padre, nombre, codigo_acceso, avatar, puntos_acumulados)
VALUES 
(1, 'Mateo', '1234', 'avatar_guerrero.png', 150),
(1, 'Sofía', '5678', 'avatar_maga.png', 320);

-- =========================================================================
-- 4. CONSULTA DE VERIFICACIÓN
-- =========================================================================
SELECT * FROM hijos;

select * from padres;