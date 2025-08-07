const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Conexión MySQL
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',       
  password: 'root',      
  database: 'empleados'
});

// RUTAS CRUD para empleados

app.get('/empleados', (req, res) => {
  const query = `
    SELECT e.id_empleado, e.nombre, e.apellido, e.telefono, e.correo, e.estatus,
           p.nombre_pto, d.nombre_dep
    FROM empleado e
    LEFT JOIN puesto p ON e.id_puesto = p.id_puesto
    LEFT JOIN departamento d ON e.id_departamento = d.id_departamento
  `;
  db.query(query, (err, results) => {
    if(err) return res.status(500).json(err);
    res.json(results);
  });
});

// Crear empleado
app.post('/empleados', (req, res) => {
  const { nombre, apellido, telefono, correo, id_puesto, id_departamento, estatus } = req.body;
  const query = `INSERT INTO empleado (nombre, apellido, telefono, correo, id_puesto, id_departamento, estatus)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;
  db.query(query, [nombre, apellido, telefono, correo, id_puesto, id_departamento, estatus || 'Activo'], (err, result) => {
    if(err) return res.status(500).json(err);
    res.json({ message: 'Empleado creado', id: result.insertId });
  });
});

// Actualizar empleado
app.put('/empleados/:id', (req, res) => {
  const { id } = req.params;
  const { nombre, apellido, telefono, correo, id_puesto, id_departamento, estatus } = req.body;
  const query = `
    UPDATE empleado SET nombre=?, apellido=?, telefono=?, correo=?, id_puesto=?, id_departamento=?, estatus=?
    WHERE id_empleado=?
  `;
  db.query(query, [nombre, apellido, telefono, correo, id_puesto, id_departamento, estatus, id], (err) => {
    if(err) return res.status(500).json(err);
    res.json({ message: 'Empleado actualizado' });
  });
});

// Eliminar empleado
app.delete('/empleados/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM empleado WHERE id_empleado = ?', [id], (err) => {
    if(err) return res.status(500).json(err);
    res.json({ message: 'Empleado eliminado' });
  });
});

// Aquí eliges el puesto
app.get('/puestos', (req, res) => {
  db.query('SELECT * FROM puesto', (err, results) => {
    if(err) return res.status(500).json(err);
    res.json(results);
  });
});

// Aquí se elige el departamento
app.get('/departamentos', (req, res) => {
  db.query('SELECT * FROM departamento', (err, results) => {
    if(err) return res.status(500).json(err);
    res.json(results);
  });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto 3001`);
});
