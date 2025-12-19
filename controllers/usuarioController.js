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

    // Set HTTP-Only Cookie
    const isProduction = process.env.NODE_ENV === 'production';

    res.cookie('token', token, {
      httpOnly: true,
      // If we are in production but don't have SSL yet (common on AWS test phase), 
      // secure: true will prevent the browser from saving the cookie.
      // Better to check if req is secure or stay false during initial AWS deploy.
      secure: isProduction && req.secure,
      maxAge: 2 * 60 * 60 * 1000, // 2 hours
      sameSite: 'lax' // 'strict' can sometimes cause issues with redirects from other domains
    });

    res.json({
      success: true,
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
  // Try to use parameter first (for admin/medico viewing others), fallback to token correo (self)
  let c = req.params.correo || req.query.correo || req.user.correo;

  try {
    // Permission check: if looking at someone else, must be admin or medico
    if (c !== req.user.correo && req.user.rol != 3 && req.user.rol != 2) {
      return res.status(403).json({ error: 'No tienes permiso para ver estos datos.' });
    }

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
  // Security: Ensure the appointment is made for the logged-in user if not specified or override?
  // For now we assume the form data is correct, but users can tamper.
  // Ideally: datos.correo = req.user.correo;
  datos.correo = req.user.correo;

  try {
    await CitaModel.createCitaTemporal(datos);
    return res.status(201).json({ mensaje: 'Solicitud procesada correctamente' });
  } catch (err) {
    console.error('Error en solicitud cita:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const cita_t_empleado = async (req, res) => {
  const correo = req.user.correo; // From token
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
  const correo = req.user.correo; // From token
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
  const c = req.user.correo; // From token
  try {
    const resultado = await CitaService.getDashboardData(c);
    return res.json(resultado);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error en el servidor" });
  }
};

const citasDel_usuario = async (req, res) => {
  // Use correo from body if provided (admin/medico looking at others), fallback to token (self)
  let correo = req.body.correo || req.user.correo;

  try {
    // Permission check
    if (correo !== req.user.correo && req.user.rol != 3 && req.user.rol != 2) {
      return res.status(403).json({ error: 'No tienes permiso para ver este historial.' });
    }

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

const logoutUser = (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Sesión cerrada correctamente' });
};

const myself = (req, res) => {
  // req.user is populated by verifyToken middleware
  res.json({
    success: true,
    user: {
      correo: req.user.correo,
      rol: req.user.rol
    }
  });
};

module.exports = {
  crearUsuario,
  loginUser,
  logoutUser,
  myself,
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

