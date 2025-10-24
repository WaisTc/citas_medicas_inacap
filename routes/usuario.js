const express = require('express');
const router = express.Router();

const { crearUsuario, loginUser, obtenerMedicos, obtenerDatosPorCorreo, 
    cita_t_solicitud, cita_t_empleado, aceptar_solicitud, 
    cita_aceptadas_empleado,
    pelao

} = require('../controllers/usuarioController');


router.post('/register', crearUsuario);
router.post('/login', loginUser);
router.get('/medicos', obtenerMedicos);
router.post('/cita_t', cita_t_solicitud);
router.get('/paciente_datos/:correo_user', obtenerDatosPorCorreo);
router.post('/empleado_temporal', cita_t_empleado)
router.post('/aceptar', aceptar_solicitud)
router.post('/empleado_c_aceptadas', cita_aceptadas_empleado)
router.get('/pelao/:correo_user', pelao)





module.exports = router;
