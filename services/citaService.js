const CitaModel = require('../models/CitaModel');
const EmpleadoModel = require('../models/EmpleadoModel');
const UsuarioModel = require('../models/UsuarioModel');
const EmailService = require('./emailService');

async function getCitasTemporalesForEmpleado(correo) {
    const empleado = await EmpleadoModel.findEmpleadoByCorreo(correo);
    if (!empleado) return null;
    return await CitaModel.findCitasTemporalesByMedico(empleado.rut_empleado);
}

async function getCitasAceptadasForEmpleado(correo) {
    const empleado = await EmpleadoModel.findEmpleadoByCorreo(correo);
    if (!empleado) return [];
    return await CitaModel.findCitasAceptadasByMedico(empleado.rut_empleado);
}

async function procesarAceptacionCita(data) {
    const correoPaciente = await UsuarioModel.findEmailByRut(data.rut);
    const citaTemporal = await CitaModel.findCitaTemporalById(data.id_cita);

    if (!citaTemporal) throw new Error('Cita no encontrada');

    await CitaModel.createCita(data, citaTemporal);
    await CitaModel.deleteCitaTemporal(data.id_cita);

    if (correoPaciente) {
        await EmailService.notificarAceptacion(data, correoPaciente.correo);
    }
}

async function getDashboardData(correo, anio) {
    const empleado = await EmpleadoModel.findEmpleadoByCorreo(correo);
    if (!empleado) return null;

    const currentYear = anio || new Date().getFullYear();
    const stats = await CitaModel.countCitasByMedicoGroupedByMonth(empleado.rut_empleado, currentYear);

    const meses = [
        "enero", "febrero", "marzo", "abril", "mayo", "junio",
        "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
    ];

    const citasPorMes = {};
    stats.forEach(row => {
        const nombreMes = meses[row.mes_num - 1];
        citasPorMes[nombreMes] = row.total;
    });

    return citasPorMes;
}

async function getAniosDisponibles(correo) {
    const empleado = await EmpleadoModel.findEmpleadoByCorreo(correo);
    if (!empleado) return [];
    return await CitaModel.findAvailableYearsByMedico(empleado.rut_empleado);
}

async function getCitasUsuario(correo) {
    const datosPersona = await UsuarioModel.datosCorreo(correo);
    if (!datosPersona || datosPersona.length === 0) return { temporales: [], aceptadas: [] };

    const rutPersona = datosPersona[0].rut_persona;
    const history = await CitaModel.findFullHistoryByRut(rutPersona);

    // Split back into the structure expected by the controller if needed, 
    // or just return the flat list if the controller supports it.
    // The current controller does: const todas = [...citas.temporales, ...citas.aceptadas];

    return {
        temporales: history.filter(h => h.fuente === 'temporal').map(h => ({ ...h, rol_usuario: h.rol_relacionado })),
        aceptadas: history.filter(h => h.fuente === 'aceptada').map(h => ({ ...h, rol_usuario: h.rol_relacionado }))
    };
}

async function cancelarCita(datos) {
    const correoPaciente = await UsuarioModel.findEmailByRut(datos.rut_paciente);

    if (datos.estado_cita === "EN PROCESO") {
        await CitaModel.deleteCitaTemporal(datos.id_cita);
    } else if (datos.estado_cita === "Aceptada" || datos.estado_cita === "ACEPTADA") {
        await CitaModel.deleteCita(datos.id_cita);
    } else {
        return false;
    }

    if (correoPaciente) {
        await EmailService.notificarCancelacion(datos, correoPaciente.correo);
    }
    return true;
}

module.exports = {
    getCitasTemporalesForEmpleado,
    getCitasAceptadasForEmpleado,
    procesarAceptacionCita,
    getDashboardData,
    getCitasUsuario,
    cancelarCita,
    getAniosDisponibles
};
