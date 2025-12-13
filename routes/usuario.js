const express = require('express');
const router = express.Router();

const { crearUsuario, loginUser, obtenerMedicos, obtenerDatosPorCorreo,
    cita_t_solicitud, cita_t_empleado, aceptar_solicitud,
    cita_aceptadas_empleado, citasDel_usuario, cancelar_citaU,
    pelao, obtenerUsuarios, actualizarRol, borrarUsuario, obtenerRoles, actualizarInfoUser

} = require('../controllers/usuarioController');




router.post('/register', crearUsuario);
router.post('/login', loginUser);
router.get('/medicos', obtenerMedicos);
router.post('/cita_t', cita_t_solicitud);
router.get('/paciente_datos/:correo_user', obtenerDatosPorCorreo);
router.post('/empleado_temporal', cita_t_empleado)
router.post('/aceptar', aceptar_solicitud)
router.post('/empleado_c_aceptadas', cita_aceptadas_empleado)
router.post('/citasD_usuario', citasDel_usuario)
router.post('/cancelar_cita', cancelar_citaU)
router.get('/pelao/:correo_user', pelao)
router.get('/lista_usuarios', obtenerUsuarios);
router.post('/actualizar_rol', actualizarRol);
router.post('/eliminar_usuario', borrarUsuario);
router.get('/roles', obtenerRoles);
router.post('/actualizar_info', actualizarInfoUser);






module.exports = router;
