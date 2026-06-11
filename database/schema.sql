-- Estructura de la tabla
CREATE TABLE empleados (
    id INT PRIMARY KEY,
    nombre VARCHAR(255),
    email VARCHAR(255),
    departamento VARCHAR(100),
    puesto VARCHAR(100),
    fecha_ingreso DATE,
    saldo_vacaciones INT,
    banco_horas DECIMAL(5, 1),
    modalidad VARCHAR(50)
);

-- Inserción de datos
INSERT INTO empleados (id, nombre, email, departamento, puesto, fecha_ingreso, saldo_vacaciones, banco_horas, modalidad) VALUES
(1, 'Juan Silva', 'juan.silva@empresa.com', 'Ingeniería', 'Ingeniero de Software', '2022-03-10', 20, 0.0, 'hibrido'),
(2, 'María Gonzalez', 'maria.gonzalez@empresa.com', 'Recursos Humanos', 'Analista de RR. HH.', '2021-05-15', 5, 12.5, 'hibrido'),
(3, 'Carlos Olivera', 'carlos.olivera@empresa.com', 'Finanzas', 'Analista Financiero', '2023-01-20', 0, 0.0, 'presencial'),
(4, 'Ana Lima', 'ana.lima@empresa.com', 'Marketing', 'Especialista en Marketing', '2020-11-05', 15, -4.0, 'remoto'),
(5, 'Pedro Santos', 'pedro.santos@empresa.com', 'Ventas', 'Ejecutivo de Ventas', '2022-08-01', 10, 8.0, 'hibrido'),
(6, 'Fernanda Costa', 'fernanda.costa@empresa.com', 'Operaciones', 'Gerente de Operaciones', '2019-02-12', 30, 0.0, 'presencial'),
(7, 'Rafael Mendez', 'rafael.mendez@empresa.com', 'TI', 'Analista de Soporte', '2023-06-10', 0, 15.5, 'hibrido'),
(8, 'Juliana García', 'juliana.garcia@empresa.com', 'Ingeniería', 'Desarrolladora Front-end', '2021-09-25', 12, 0.0, 'remoto'),
(9, 'Bruno Alvarez', 'bruno.alvarez@empresa.com', 'Diseño', 'Diseñador UX/UI', '2022-04-18', 8, 3.5, 'hibrido'),
(10, 'Camila Herrera', 'camila.herrera@empresa.com', 'Atención al Cliente', 'Analista de Atención al Cliente', '2024-01-05', 0, 0.0, 'hibrido'),
(11, 'Eric Monné', 'eric.monne@chocalatech.com', 'Producto', 'Instructor de Cursos', '2024-01-15', 25, 8.0, 'hibrido');
