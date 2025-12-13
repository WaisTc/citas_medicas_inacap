const pool = require('../config/db');

async function getAllMedicos() {
    const [rows] = await pool.query(
        'SELECT nombres, rut_persona AS rut_empleado FROM persona WHERE especialidad = ?',
        ['medico']
    );
    return rows;
}

async function findEmpleadoByCorreo(correo) {
    const [rows] = await pool.execute(
        'SELECT rut_persona AS rut_empleado, correo FROM persona WHERE correo = ?',
        [correo]
    );
    return rows[0];
}

async function findEmpleadoByRut(rut) {
    const [rows] = await pool.execute(
        'SELECT correo FROM persona WHERE rut_persona = ?',
        [rut]
    );
    return rows[0];
}

module.exports = { getAllMedicos, findEmpleadoByCorreo, findEmpleadoByRut };
