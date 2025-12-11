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

async function getDashboardData(correo) {
    const empleado = await EmpleadoModel.findEmpleadoByCorreo(correo);
    if (!empleado) return null;

    const citas = await CitaModel.findAllCitasByMedico(empleado.rut_empleado);

    const citasPorMes = {};
    citas.forEach((registro) => {
        const fecha = new Date(registro.fecha_hora);
        const mes = fecha.toLocaleString('es-CL', { month: 'long' });
        citasPorMes[mes] = (citasPorMes[mes] || 0) + 1;
    });

    return citasPorMes;
}

async function getCitasUsuario(correo) {
    const datosPaciente = await UsuarioModel.datosCorreo(correo);
    if (!datosPaciente || datosPaciente.length === 0) return { temporales: [], aceptadas: [] };

    const rutPaciente = datosPaciente[0].rut_paciente;

    const temporales = await CitaModel.findCitasTemporalesByPaciente(rutPaciente);
    const aceptadas = await CitaModel.findCitasAceptadasByPaciente(rutPaciente);

    return { temporales, aceptadas };
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
    cancelarCita
};
