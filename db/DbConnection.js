
const mysql = require('mysql2/promise');
const { resolve } = require('path');
const nodemailer = require("nodemailer");

require('dotenv').config();


const conexion = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
});

async function notificarAceptacion(cita, destinatario) {
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: destinatario,
    subject: "Cita aceptada",
    text: `Hola, tu cita para el día ${cita.fecha} a las ${cita.hora} ha sido aceptada.`
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Correo enviado correctamente");
  } catch (error) {
    console.error("Error al enviar correo:", error);
  }
}



async function insertarUsuario(datos) {

  const sql_paciente = `
    INSERT INTO paciente (rut_paciente, nombres, primer_apellido, 
    segundo_apellido, correo, telefono, direccion, fecha_nacimiento, rol, plan_salud_nombre, plan_salud_tipo) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?);
  `;
  const valores_paciente = [datos.rut, datos.nombre, datos.apellido1, datos.apellido2, 
    datos.correo, datos.telefono, datos.direccion, datos.nacimiento, datos.plan_n, datos.plan_t];
  await conexion.execute(sql_paciente, valores_paciente);

  const usuario_paciente ='INSERT INTO usuario(usuario, contraseña, rol) VALUES(?, ?, 1)'
  const valores_usuario = [datos.correo, datos.password]
  await conexion.execute(usuario_paciente, valores_usuario);
}

async function validar(credenciales) {

  const [resultado_correo] = await conexion.execute(
    'SELECT COUNT(*) AS total FROM usuario WHERE usuario = ?', 
    [credenciales.user]
  );

  const existe = resultado_correo[0].total > 0;

  if (existe) {
    const [rows] = await conexion.execute(
      'SELECT contraseña, rol FROM usuario WHERE usuario = ?',
      [credenciales.user]
    );

    const hashGuardado = rows[0].contraseña;
    const rol = rows[0].rol;

    return { hashGuardado, rol }; // Devuelve ambos valores
  } 
  else {
    console.log("Correo no encontrado.");
    return null;
  }


}


async function Correo_p(r) {
  const [c] = await conexion.query('SELECT correo FROM paciente WHERE rut_paciente = ?',[r]);
  const correo = c[0]
  return correo
}



async function medicos() {
  const [rows] = await conexion.query(
    'SELECT nombres, rut_empleado FROM empleado WHERE especialidad = ?',
    ['medico']
  );
  return rows;
}

async function datosCorreo(c) {
  const [rows] = await conexion.query(
    'SELECT rut_paciente, nombres, primer_apellido, segundo_apellido,  correo, telefono, direccion, fecha_nacimiento, plan_salud_nombre, plan_salud_tipo FROM paciente WHERE correo = ?',
    [c]
  );
  return rows;
  
}


async function cita_temporal(datos) {

  const sql = 'INSERT INTO cita_temporal(estado_cita, rut_paciente, rut_medico) VALUES (?, ?, ?)';
  const valores = ['EN PROCESO', datos.rut, datos.doctor];

  await conexion.execute(sql, valores);
}




async function card_t(c_user) {


  try {
    // 1. Obtener rut del empleado
    const [resultado_rut] = await conexion.execute(
      'SELECT rut_empleado FROM empleado WHERE correo = ?',
      [c_user]
    );

    if (resultado_rut.length === 0) {
      console.log('No se encontró ningún empleado con ese correo');
      return null;
    }

    const rut = resultado_rut[0].rut_empleado;

    // 2. Obtener citas temporales asociadas al rut
    const [citas] = await conexion.execute(
      'SELECT * FROM cita_temporal WHERE rut_medico = ?',
      [rut]
    );

    return citas; // Devuelve directamente el array de citas
  } catch (error) {
    console.error('Error en card_t:', error);
    return null;
  }
}


async function consulta_card(id_card) {
  
  const [rows] = await conexion.execute('SELECT estado_cita, rut_paciente, rut_medico FROM cita_temporal WHERE id_cita = ?',[id_card])

  return rows;
}

async function ingresar_cita(datosFront, datosBack) {
  
  const sql = 'INSERT INTO cita(fecha_hora, estado_cita, tipo_cita, rut_paciente, rut_medico, lugar_atencion) VALUES(?, ?, ? ,? ,? ,?)';
  const valores = [datosFront.fecha_cita, "Aceptada", datosFront.tipo_cita, datosBack.rut_paciente, datosBack.rut_medico, datosFront.lugar_atencion]

  const sql_del = 'DELETE FROM cita_temporal WHERE id_cita = ?';

  try {
    await conexion.execute(sql, valores);
    console.log("Cita insertada correctamente");

    await conexion.execute(sql_del, [datosFront.id_cita])
  } 
  catch (err) {
    console.error("Error al insertar cita:", err.message);
  }


}


async function citas_aceptadas(correo) {
  
  const sql = 'SELECT rut_empleado FROM empleado WHERE correo = ?'
  const [resultado] = await conexion.execute(sql, [correo])

  const rut = resultado[0].rut_empleado

  const [sql_citas] = await conexion.execute('SELECT * FROM cita WHERE rut_medico = ?', [rut])

  return sql_citas;
}





async function dashboard_count(correo_d) {
  const [sql_empleado] = await conexion.execute(
    'SELECT rut_empleado FROM empleado WHERE correo = ?',
    [correo_d]
  );

  if (!sql_empleado || sql_empleado.length === 0) return null;

  const rut_doc = sql_empleado[0].rut_empleado;

  const [sql_fecha] = await conexion.execute(
    'SELECT fecha_hora FROM cita WHERE rut_medico = ?',
    [rut_doc]
  );

  const citasPorMes = {};

  sql_fecha.forEach((registro) => {
    const fecha = new Date(registro.fecha_hora);
    const mes = fecha.toLocaleString('es-CL', { month: 'long' });

    if (!citasPorMes[mes]) {
      citasPorMes[mes] = 0;
    }

    citasPorMes[mes]++;
  });

  return citasPorMes; // retornamos el objeto, no console.log
}



module.exports = { insertarUsuario, 
  validar, medicos, datosCorreo, cita_temporal, 
  card_t, consulta_card, ingresar_cita, 
  citas_aceptadas, dashboard_count, notificarAceptacion, Correo_p};

