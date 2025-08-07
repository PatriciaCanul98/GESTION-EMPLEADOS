const express = require('express');
//const mysql = require('mysql2');
const { Pool } = require('pg');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// // Conexión MySQL
// const db = mysql.createPool({
//   host: 'localhost',
//   user: 'root',       
//   password: 'root',      
//   database: 'empleados'
// });

//CONEXION BD A SUPERBASE (NUBE)
const db = new Pool({
  host: process.env.PGHOST,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  port: process.env.PGPORT,
  ssl: { rejectUnauthorized: false }
});


db.connect()
  .then(() => console.log('✅ Conexión exitosa a Supabase'))
  .catch(err => console.error('❌ Error conectando a Supabase:', err));

// RUTAS CRUD para empleados

app.get('/empleados', async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT e.id_empleado, e.nombre, e.apellido, e.telefono, e.correo, e.estatus,
             p.nombre_pto, d.nombre_dep
      FROM empleado e
      LEFT JOIN puesto p ON e.id_puesto = p.id_puesto
      LEFT JOIN departamento d ON e.id_departamento = d.id_departamento
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json(error);
  }
});

// Crear un nuevo empleado
app.post('/empleados', async (req, res) => {
  try {
    const { nombre, apellido, telefono, correo, id_puesto, id_departamento, estatus } = req.body;
    const query = `
      INSERT INTO empleado (nombre, apellido, telefono, correo, id_puesto, id_departamento, estatus)
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id_empleado
    `;
    const values = [nombre, apellido, telefono, correo, id_puesto, id_departamento, estatus || 'Activo'];
    const { rows } = await db.query(query, values);
    res.json({ message: 'Empleado creado', id: rows[0].id_empleado });
  } catch (error) {
    res.status(500).json(error);
  }
});

// Actualizar un empleado por id
app.put('/empleados/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, apellido, telefono, correo, id_puesto, id_departamento, estatus } = req.body;
    const query = `
      UPDATE empleado
      SET nombre = $1, apellido = $2, telefono = $3, correo = $4, id_puesto = $5, id_departamento = $6, estatus = $7
      WHERE id_empleado = $8
    `;
    const values = [nombre, apellido, telefono, correo, id_puesto, id_departamento, estatus, id];
    await db.query(query, values);
    res.json({ message: 'Empleado actualizado' });
  } catch (error) {
    res.status(500).json(error);
  }
});

// Eliminar un empleado por id
app.delete('/empleados/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const query = 'DELETE FROM empleado WHERE id_empleado = $1';
    await db.query(query, [id]);
    res.json({ message: 'Empleado eliminado' });
  } catch (error) {
    res.status(500).json(error);
  }
});

// Obtener todos los puestos
app.get('/puestos', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM puesto');
    res.json(rows);
  } catch (error) {
    res.status(500).json(error);
  }
});

// Obtener todos los departamentos
app.get('/departamentos', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM departamento');
    res.json(rows);
  } catch (error) {
    res.status(500).json(error);
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});