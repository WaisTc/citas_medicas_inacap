const pool = require('../config/db');

async function getAllMedicos() {
    const [rows] = await pool.query(
        'SELECT nombres, rut_empleado FROM empleado WHERE especialidad = ?',
        ['medico']
    );
    return rows;
}

async function findEmpleadoByCorreo(correo) {
    const [rows] = await pool.execute(
        'SELECT rut_empleado, correo FROM empleado WHERE correo = ?',
        [correo]
    );
    return rows[0];
}

async function findEmpleadoByRut(rut) {
    const [rows] = await pool.execute(
        'SELECT correo FROM empleado WHERE rut_empleado = ?',
        [rut]
    );
    return rows[0];
}

module.exports = { getAllMedicos, findEmpleadoByCorreo, findEmpleadoByRut };
