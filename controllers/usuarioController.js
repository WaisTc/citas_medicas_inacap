const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { insertarUsuario, validar, medicos, datosCorreo, cita_temporal, card_t, consulta_card, ingresar_cita, citas_aceptadas, dashboard_count } = require('../db/DbConnection');
const conexion = require('../db/DbConnection'); // conexión a la base de datos

const crearUsuario = async (req, res) => {
  try {
    const datos = req.body;
    // Hash de la contraseña
    const hash = await bcrypt.hash(datos.password, 10);


    // Inserción en la base de datos
    await insertarUsuario({ 
        rut: datos.rut,
        nombre: datos.nombre,
        apellido1: datos.apellido1,
        apellido2: datos.apellido2,
        correo: datos.correo,
        telefono: datos.telefono,
        direccion: datos.direccion,
        nacimiento: datos.nacimiento,
        plan_n: datos.plan_n,
        plan_t: datos.plan_t,
        password: hash
     });
    res.status(201).json({ mensaje: 'Usuario creado correctamente' });
  } 
  catch (err) {
    console.error('Error al crear usuario:', err);
    res.status(500).json({ error: 'no puede ser' });
  }
};


const loginUser = async (req, res) => {
  const credenciales = req.body;

  try {
    const datos_us = await validar({ user: credenciales.user });
    if (!datos_us) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const esValida = await bcrypt.compare(credenciales.pass, datos_us.hashGuardado);

    if (!esValida) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    // Generar token con el usuario como payload
    const token = jwt.sign(
      { correo: credenciales.user,
        rol: datos_us.rol
       }, // puedes incluir también el id si lo tienes
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    // Devuelve el token al frontend
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
    const rows = await medicos();
    /*
    const nombres = rows.map(row => row.nombres);
    const rut_medico = rows.map(row => row.rut_empleado);
    
    
    res.json({ medicos: nombres, rut_m: rut_medico });
    */
    res.json({ medic: rows });

  } catch (error) {
    console.error('Error al obtener médicos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const obtenerDatosPorCorreo = async (req, res) => {
    const c = req.params.correo_user;

    try {
        const rows = await datosCorreo(c); // Espera la promesa

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json(rows[0]); // Devuelve JSON válido
    } catch (error) {
        console.error('Error al obtener datos por correo:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

const cita_t_solicitud = async (req, res) =>{
  const datos = req.body;
  try{
    const resultado = cita_temporal(datos)
    return res.status(201).json({ mensaje: 'Solicitud procesada correctamente' });
  }
  catch(err){
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}

const cita_t_empleado = async (req, res) => {
  const { correo } = req.body;

  try {
    const citas = await card_t(correo);

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

  
  try{
   const citas = await citas_aceptadas(correo)
    
   if(citas.length == 0){
    return res.json({ aceptadas: false });
   }
   else{
    return res.json({ aceptadas: citas });
   }
  }
  catch(err){
    console.error('Error al obtener citas aceptadas:', err.message);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }

};


const aceptar_solicitud = async (req, res) => {
  const data = req.body

  const consulta = await consulta_card(data.id_cita)

  if (consulta.length === 0) {
    return res.status(404).json({ error: 'Cita no encontrada' });
  }

  const resultado = consulta[0]

  try{
    await ingresar_cita(data, resultado)
    return res.status(200).json({message: 'Cita ingresada correctamente'})
  }
  catch(err){
    console.error('Error al ingresar cita:', err);
    return res.status(500).json({ error: 'Error al guardar la cita' });
  }
}



const pelao = async (req, res) => {

  const c = req.params.correo_user;

  try {
    const resultado = await dashboard_count(c);
    return res.json(resultado); // Envia data al frontend
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error en el servidor" });
  }
}



module.exports = { crearUsuario, loginUser, obtenerMedicos, 
  obtenerDatosPorCorreo, cita_t_empleado, cita_t_solicitud, aceptar_solicitud, 
  cita_aceptadas_empleado, pelao} ;
