const pool = require('../config/db');

async function createCitaTemporal(datos) {
    const sql = 'INSERT INTO cita_temporal(estado_cita, rut_paciente, rut_medico) VALUES (?, ?, ?)';
    const valores = ['EN PROCESO', datos.rut, datos.doctor];
    await pool.execute(sql, valores);
}

async function findCitasTemporalesByMedico(rutMedico) {
    const [citas] = await pool.execute(
        'SELECT * FROM cita_temporal WHERE rut_medico = ?',
        [rutMedico]
    );
    return citas;
}

async function findCitaTemporalById(idCita) {
    const [rows] = await pool.execute('SELECT estado_cita, rut_paciente, rut_medico FROM cita_temporal WHERE id_cita = ?', [idCita]);
    return rows[0];
}

async function createCita(datosFront, datosBack) {
    const sql = 'INSERT INTO cita(fecha_hora, estado_cita, tipo_cita, rut_paciente, rut_medico, lugar_atencion) VALUES(?, ?, ? ,? ,? ,?)';
    const valores = [datosFront.fecha_cita, "Aceptada", datosFront.tipo_cita, datosBack.rut_paciente, datosBack.rut_medico, datosFront.lugar_atencion];
    await pool.execute(sql, valores);
}

async function deleteCitaTemporal(idCita) {
    await pool.execute('DELETE FROM cita_temporal WHERE id_cita = ?', [idCita]);
}

async function findCitasAceptadasByMedico(rutMedico) {
    const [rows] = await pool.execute('SELECT * FROM cita WHERE rut_medico = ?', [rutMedico]);
    return rows;
}

async function findAllCitasByMedico(rutMedico) {
    const [rows] = await pool.execute(
        'SELECT fecha_hora FROM cita WHERE rut_medico = ?',
        [rutMedico]
    );
    return rows;
}

async function findCitasTemporalesByPaciente(rutPaciente) {
    const [rows] = await pool.execute("SELECT * FROM cita_temporal WHERE rut_paciente = ?", [rutPaciente]);
    return rows;
}

async function findCitasAceptadasByPaciente(rutPaciente) {
    const [rows] = await pool.execute("SELECT * FROM cita WHERE rut_paciente = ?", [rutPaciente]);
    return rows;
}

async function deleteCita(idCita) {
    await pool.execute("DELETE FROM cita WHERE id_cita = ?", [idCita]);
}

module.exports = {
    createCitaTemporal,
    findCitasTemporalesByMedico,
    findCitaTemporalById,
    createCita,
    deleteCitaTemporal,
    findCitasAceptadasByMedico,
    findAllCitasByMedico,
    findCitasTemporalesByPaciente,
    findCitasAceptadasByPaciente,
    deleteCita
};
