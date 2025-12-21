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

async function countCitasByMedicoGroupedByMonth(rutMedico, anio) {
    const sql = `
        SELECT 
            MONTH(fecha_hora) as mes_num, 
            COUNT(*) as total 
        FROM cita 
        WHERE rut_medico = ? AND YEAR(fecha_hora) = ?
        GROUP BY MONTH(fecha_hora)
        ORDER BY MONTH(fecha_hora)
    `;
    const [rows] = await pool.execute(sql, [rutMedico, anio]);
    return rows;
}

async function findAvailableYearsByMedico(rutMedico) {
    const sql = `
        SELECT DISTINCT YEAR(fecha_hora) as anio 
        FROM cita 
        WHERE rut_medico = ?
        ORDER BY anio DESC
    `;
    const [rows] = await pool.execute(sql, [rutMedico]);
    return rows.map(r => r.anio);
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

async function findFullHistoryByRut(rut) {
    // Combine appointments where user is either patient or doctor, across both tables
    const sql = `
        SELECT id_cita, fecha_hora, estado_cita, tipo_cita, rut_paciente, rut_medico, lugar_atencion, 'aceptada' as fuente, 
               CASE WHEN rut_paciente = ? THEN 'paciente' ELSE 'medico' END as rol_relacionado
        FROM cita 
        WHERE rut_paciente = ? OR rut_medico = ?
        UNION ALL
        SELECT id_cita, NULL as fecha_hora, estado_cita, 'General' as tipo_cita, rut_paciente, rut_medico, NULL as lugar_atencion, 'temporal' as fuente,
               CASE WHEN rut_paciente = ? THEN 'paciente' ELSE 'medico' END as rol_relacionado
        FROM cita_temporal
        WHERE rut_paciente = ? OR rut_medico = ?
        ORDER BY fecha_hora DESC
    `;
    const [rows] = await pool.execute(sql, [rut, rut, rut, rut, rut, rut]);
    return rows;
}

module.exports = {
    createCitaTemporal,
    findCitasTemporalesByMedico,
    findCitaTemporalById,
    createCita,
    deleteCitaTemporal,
    findCitasAceptadasByMedico,
    countCitasByMedicoGroupedByMonth,
    findCitasTemporalesByPaciente,
    findCitasAceptadasByPaciente,
    deleteCita,
    findFullHistoryByRut,
    findAvailableYearsByMedico
};
