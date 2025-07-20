const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

async function getMentorId() {
    try {
        const result = await pool.query('SELECT id FROM mentorias_schema.mentors LIMIT 1');
        if (result.rows.length > 0) {
            return result.rows[0].id;
        }
        return null;
    } catch (error) {
        console.error('Error fetching mentor ID:', error.message);
        return null;
    }
}


router.post('/', async (req, res) => {
    const { studentName, studentEmail, appointmentDate, appointmentTime, durationMinutes } = req.body;

    if (!studentName || !studentEmail || !appointmentDate || !appointmentTime) {
        return res.status(400).json({ error: 'Faltan campos requeridos.' });
    }

    try {
        const mentorId = await getMentorId();

        if (mentorId === null) {
            return res.status(500).json({ error: 'No se pudo asignar un mentor. Por favor, asegúrese de tener mentores registrados.' });
        }

        const result = await pool.query(
            'INSERT INTO mentorias_schema.appointments (student_name, student_email, mentor_id, appointment_date, appointment_time, duration_minutes, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [studentName, studentEmail, mentorId, appointmentDate, appointmentTime, durationMinutes || 60, 'pending']
        );

        const newAppointment = result.rows[0];

        let mentorName = 'Nuestro equipo';
        try {
            const mentorResult = await pool.query('SELECT name FROM mentorias_schema.mentors WHERE id = $1', [mentorId]);
            if (mentorResult.rows.length > 0) {
                mentorName = mentorResult.rows[0].name;
            }
        } catch (mentorErr) {
            console.warn('Could not fetch mentor name for email:', mentorErr.message);
        }

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: studentEmail,
            subject: 'Confirmación de Agendamiento de Mentoría de Inglés',
            html: `
            <h1>¡Hola ${studentName}!</h1>
            <p>Tu sesión de mentoría de inglés ha sido agendada con éxito.</p>
            <p><strong>Fecha:</strong> ${newAppointment.appointment_date.toDateString()}</p>
            <p><strong>Hora:</strong> ${newAppointment.appointment_time}</p>
            <p><strong>Duración:</strong> ${newAppointment.duration_minutes} minutos</p>
            <p>Tu mentor asignado es: <strong>${mentorName}</strong></p>
            <p>Pronto nos pondremos en contacto contigo para los detalles de la videollamada.</p>
            <p>Gracias por confiar en nuestros servicios.</p>
            <p>Atentamente,<br>El Equipo de Mentorías de Inglés</p>
          `,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error enviando correo de confirmación:', error);
            } else {
                console.log('Correo de confirmación enviado:', info.response);
            }
        });

        res.status(201).json({ message: 'Cita agendada exitosamente', appointment: newAppointment });

    } catch (err) {
        console.error('Error al agendar la cita:', err.message);
        res.status(500).json({ error: 'Error interno del servidor al agendar la cita.' });
    }
});

router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM mentorias_schema.appointments ORDER BY appointment_date ASC, appointment_time ASC');
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Error al obtener las citas:', err.message);
        res.status(500).json({ error: 'Error interno del servidor al obtener las citas.' });
    }
});

module.exports = router;