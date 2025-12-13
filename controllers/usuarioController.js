const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UsuarioModel = require('../models/UsuarioModel');
const EmpleadoModel = require('../models/EmpleadoModel');
const CitaModel = require('../models/CitaModel');
const CitaService = require('../services/citaService');

const crearUsuario = async (req, res) => {
  try {
    const datos = req.body;

    // --- Validación de Seguridad ---
    // Min 8 caracteres
    if (!datos.password || datos.password.length < 8) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres.' });
    }

    // Bloqueo de caracteres
    const dangerousChars = /[\<\>\"\'\;]/;
    const fieldsToCheck = [datos.nombre, datos.apellido1, datos.apellido2, datos.direccion, datos.plan_n, datos.plan_t];

    for (const field of fieldsToCheck) {
      if (field && dangerousChars.test(field)) {
        return res.status(400).json({ error: 'Se detectaron caracteres no permitidos (<, >, ", \', ;) en los campos.' });
      }
    }

    const hash = await bcrypt.hash(datos.password, 10);

    await UsuarioModel.insertarUsuario({ ...datos, password: hash });
    res.status(201).json({ mensaje: 'Usuario creado correctamente' });
  } catch (err) {
    console.error('Error al crear usuario:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const loginUser = async (req, res) => {
  const credenciales = req.body;
  try {
    const datos_us = await UsuarioModel.validar(credenciales.user);
    if (!datos_us) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const esValida = await bcrypt.compare(credenciales.pass, datos_us.hashGuardado);
    if (!esValida) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    const token = jwt.sign(
      { correo: credenciales.user, rol: datos_us.rol },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.json({
      token,
      correo: credenciales.user,
      rol: datos_us.rol
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const obtenerMedicos = async (req, res) => {
  try {
    const rows = await EmpleadoModel.getAllMedicos();
    res.json({ medic: rows });
  } catch (error) {
    console.error('Error al obtener médicos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const obtenerDatosPorCorreo = async (req, res) => {
  const c = req.params.correo_user;
  try {
    const rows = await UsuarioModel.datosCorreo(c);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error al obtener datos por correo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const cita_t_solicitud = async (req, res) => {
  const datos = req.body;
  try {
    await CitaModel.createCitaTemporal(datos);
    return res.status(201).json({ mensaje: 'Solicitud procesada correctamente' });
  } catch (err) {
    console.error('Error en solicitud cita:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const cita_t_empleado = async (req, res) => {
  const { correo } = req.body;
  try {
    const citas = await CitaService.getCitasTemporalesForEmpleado(correo);
    if (!citas || citas.length === 0) {
      return res.json({ existe: false });
    }
    res.json({ existe: true, citas });
  } catch (error) {
    console.error('Error en cita_t:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const cita_aceptadas_empleado = async (req, res) => {
  const { correo } = req.body;
  try {
    const citas = await CitaService.getCitasAceptadasForEmpleado(correo);
    if (citas.length === 0) {
      return res.json({ aceptadas: false });
    } else {
      return res.json({ aceptadas: citas });
    }
  } catch (err) {
    console.error('Error al obtener citas aceptadas:', err.message);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const aceptar_solicitud = async (req, res) => {
  const data = req.body;
  try {
    await CitaService.procesarAceptacionCita(data);
    return res.status(200).json({ message: 'Cita ingresada correctamente' });
  } catch (err) {
    console.error('Error al ingresar cita:', err);
    return res.status(500).json({ error: 'Error al guardar la cita' });
  }
};

const pelao = async (req, res) => {
  const c = req.params.correo_user;
  try {
    const resultado = await CitaService.getDashboardData(c);
    return res.json(resultado);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error en el servidor" });
  }
};

const citasDel_usuario = async (req, res) => {
  const { correo } = req.body;
  try {
    const citas = await CitaService.getCitasUsuario(correo);
    const todas = [...citas.temporales, ...citas.aceptadas];
    res.json(todas);
  } catch (error) {
    console.error('Error al obtener citas usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const cancelar_citaU = async (req, res) => {
  try {
    const datosCita = req.body;
    const resultado = await CitaService.cancelarCita(datosCita);

    if (resultado) {
      res.status(200).json({ success: true, message: "Cita cancelada correctamente" });
    } else {
      res.status(400).json({ success: false, message: "No se pudo cancelar la cita" });
    }
  } catch (error) {
    console.error("Error en cancelar_citaU:", error);
    res.status(500).json({ success: false, message: "Error interno del servidor" });
  }
};

const obtenerUsuarios = async (req, res) => {
  try {
    const usuarios = await UsuarioModel.getAllUsuarios();
    res.json(usuarios);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const actualizarRol = async (req, res) => {
  const { correo, nuevoRol } = req.body;
  try {
    await UsuarioModel.updateUsuarioRol(correo, nuevoRol);
    res.json({ message: 'Rol actualizado correctamente' });
  } catch (error) {
    console.error('Error al actualizar rol:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const borrarUsuario = async (req, res) => {
  const { correo } = req.body;
  try {
    await UsuarioModel.deleteUsuario(correo);
    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const obtenerRoles = async (req, res) => {
  try {
    const roles = await UsuarioModel.getAllRoles();
    res.json(roles);
  } catch (error) {
    console.error('Error al obtener roles:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const actualizarInfoUser = async (req, res) => {
  const datos = req.body;
  try {
    // Requires new method in UsuarioModel
    await UsuarioModel.updateUsuarioInfo(datos);
    res.json({ message: 'Información actualizada' });
  } catch (error) {
    console.error('Error al actualizar info usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  crearUsuario,
  loginUser,
  obtenerMedicos,
  obtenerDatosPorCorreo,
  cita_t_empleado,
  cita_t_solicitud,
  aceptar_solicitud,
  cita_aceptadas_empleado,
  pelao,
  citasDel_usuario,
  cancelar_citaU,
  obtenerUsuarios,
  actualizarRol,
  borrarUsuario,
  obtenerRoles,
  actualizarInfoUser
};

