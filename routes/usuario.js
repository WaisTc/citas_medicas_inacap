const express = require('express');
const router = express.Router();

const verifyToken = require('../middleware/authMiddleware');
const { crearUsuario, loginUser, logoutUser, myself, obtenerMedicos, obtenerDatosPorCorreo,
    cita_t_solicitud, cita_t_empleado, aceptar_solicitud,
    cita_aceptadas_empleado, citasDel_usuario, cancelar_citaU,
    pelao, obtenerUsuarios, actualizarRol, borrarUsuario, obtenerRoles, actualizarInfoUser

} = require('../controllers/usuarioController');




router.post('/register', crearUsuario);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get('/me', verifyToken, myself);
router.get('/medicos', obtenerMedicos); // Public for carousel
router.post('/cita_t', verifyToken, cita_t_solicitud);
router.get('/paciente_datos', verifyToken, obtenerDatosPorCorreo);
router.post('/empleado_temporal', verifyToken, cita_t_empleado)
router.post('/aceptar', verifyToken, aceptar_solicitud)
router.post('/empleado_c_aceptadas', verifyToken, cita_aceptadas_empleado)
router.post('/citasD_usuario', verifyToken, citasDel_usuario)
router.post('/cancelar_cita', verifyToken, cancelar_citaU)
router.get('/pelao', verifyToken, pelao) // Removed param
router.get('/lista_usuarios', verifyToken, obtenerUsuarios);
router.post('/actualizar_rol', verifyToken, actualizarRol);
router.post('/eliminar_usuario', verifyToken, borrarUsuario);
router.get('/roles', verifyToken, obtenerRoles);
router.post('/actualizar_info', verifyToken, actualizarInfoUser);






module.exports = router;
