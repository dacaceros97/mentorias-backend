require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const appointmentRoutes = require('./routes/appointments');

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

app.get('/', (req, res) => {
    res.send('Backend de Mentorías de Inglés funcionando!');
});

app.use('/api/appointments', appointmentRoutes);

app.listen(port, () => {
    console.log(`Servidor backend escuchando en http://localhost:${port}`);
    pool.connect((err, client, done) => {
        if (err) {
            console.error('Error conectando a la base de datos:', err.stack);
        } else {
            console.log('Conexión a PostgreSQL establecida.');
            done();
        }
    });
});