
const mysql = require('mysql2/promise');
const { resolve } = require('path');
const nodemailer = require("nodemailer");
const { citasDel_usuario } = require('../controllers/usuarioController');

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
    subject: "Confirmación de cita médica",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; padding: 20px;">
        <h2 style="color: #2c5036ff;">Cita confirmada</h2>
        <p>Estimado/a paciente,</p>
        <p>Tu cita ha sido <strong>aceptada</strong> con los siguientes detalles:</p>

        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Fecha:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${cita.fecha}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Hora:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${cita.hora}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Lugar:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${cita.lugar_atencion}</td>
          </tr>
          <tr>
            <td style="padding: 8px;"><strong>Tipo de cita:</strong></td>
            <td style="padding: 8px;">${cita.tipo_cita}</td>
          </tr>
        </table>

        <p style="margin-top: 20px;">Por favor, asegúrate de llegar con al menos <strong>10 minutos de anticipación</strong>.</p>

        <hr style="margin: 30px 0;">
        <p style="font-size: 12px; color: #888;">Este mensaje fue generado automáticamente por el sistema.</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Correo enviado correctamente");
  } catch (error) {
    console.error("Error al enviar correo:", error);
  }
}

async function notificarCancelacion(cita, destinatarios) {
  let htmlContent = "";

  if (cita.estado_cita === "EN PROCESO") {
    // Mensaje simplificado para solicitudes en proceso
    htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; 
                  border: 1px solid #ddd; border-radius: 8px; padding: 20px;">
        <h2 style="color: #e67e22;">Solicitud cancelada</h2>
        <p>La solicitud fue cancelada con éxito.</p>

        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>RUT Paciente:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${cita.rut_paciente}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>RUT Médico:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${cita.rut_medico}</td>
          </tr>
          <tr>
            <td style="padding: 8px;"><strong>Tipo de cita:</strong></td>
            <td style="padding: 8px;">General</td>
          </tr>
        </table>

        <hr style="margin: 30px 0;">
        <p style="font-size: 12px; color: #888;">Este mensaje fue generado automáticamente por el sistema.</p>
      </div>
    `;
  } else {
    // Mensaje completo para citas aceptadas
    htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; 
                  border: 1px solid #ddd; border-radius: 8px; padding: 20px;">
        <h2 style="color: #e67e22;">La cita fue cancelada</h2>
        <p>Se informa que la siguiente cita ha sido <strong>cancelada</strong>:</p>

        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>ID Cita:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${cita.id_cita}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>RUT Paciente:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${cita.rut_paciente}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>RUT Médico:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${cita.rut_medico}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Fecha:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${cita.fecha || "Sin definir"}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Hora:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${cita.hora || "Sin definir"}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Lugar:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${cita.lugar_atencion || "Sin definir"}</td>
          </tr>
          <tr>
            <td style="padding: 8px;"><strong>Tipo de cita:</strong></td>
            <td style="padding: 8px;">${cita.tipo_cita || "Sin definir"}</td>
          </tr>
        </table>

        <hr style="margin: 30px 0;">
        <p style="font-size: 12px; color: #888;">Este mensaje fue generado automáticamente por el sistema.</p>
      </div>
    `;
  }

  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: destinatarios,
    subject: "Notificación de cancelación de cita médica",
    html: htmlContent
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Correo de cancelación enviado correctamente");
  } catch (error) {
    console.error("Error al enviar correo de cancelación:", error);
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

  const usuario_paciente = 'INSERT INTO usuario(usuario, contraseña, rol) VALUES(?, ?, 1)'
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
  const [c] = await conexion.query('SELECT correo FROM paciente WHERE rut_paciente = ?', [r]);
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
    const [resultado_rut] = await conexion.execute(
      'SELECT rut_empleado FROM empleado WHERE correo = ?',
      [c_user]
    );

    if (resultado_rut.length === 0) {
      console.log('No se encontró ningún empleado con ese correo');
      return null;
    }

    const rut = resultado_rut[0].rut_empleado;

    const [citas] = await conexion.execute(
      'SELECT * FROM cita_temporal WHERE rut_medico = ?',
      [rut]
    );

    return citas;
  } catch (error) {
    console.error('Error en card_t:', error);
    return null;
  }
}


async function consulta_card(id_card) {

  const [rows] = await conexion.execute('SELECT estado_cita, rut_paciente, rut_medico FROM cita_temporal WHERE id_cita = ?', [id_card])

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

  return citasPorMes;
}



async function Citasdel_usuario(c) {

  const [rut_P] = await conexion.execute("SELECT rut_paciente FROM paciente WHERE correo = ?", [c.correo]);
  const rut_limpio = rut_P[0].rut_paciente;


  const [resultado_temporal] = await conexion.execute("SELECT * FROM cita_temporal WHERE rut_paciente = ?", [rut_limpio]);
  const [resultado_aceptadas] = await conexion.execute("SELECT * FROM cita WHERE rut_paciente = ? AND fecha_hora >= NOW()", [rut_limpio])

  return {
    temporales: resultado_temporal,
    aceptadas: resultado_aceptadas
  };

}


async function cancelar_cita_notificacion(datos) {

  const [correo_medico] = await conexion.execute("SELECT correo FROM empleado WHERE rut_empleado = ?", [datos.rut_medico]);
  const correo_medico_limpio = correo_medico[0].correo;

  const [correo_paciente] = await conexion.execute("SELECT correo FROM paciente WHERE rut_paciente = ?", [datos.rut_paciente]);
  const correo_paciente_limpio = correo_paciente[0].correo;

  if (datos.estado_cita == "EN PROCESO") {
    await conexion.execute("DELETE FROM cita_temporal WHERE id_cita = ?", [datos.id_cita]);
    notificarCancelacion(datos, correo_paciente_limpio)
    const resultado = true;
    return resultado;
  }
  else if (datos.estado_cita == "Aceptada") {
    await conexion.execute("DELETE FROM cita WHERE id_cita = ?", [datos.id_cita]);
    notificarCancelacion(datos, correo_paciente_limpio)
    //notificarCancelacion(datos, correo_medico_limpio)
    const resultado = true;
    return resultado;
  }
  else {
    return false;
  }

}



module.exports = {
  insertarUsuario,
  validar, medicos, datosCorreo, cita_temporal,
  card_t, consulta_card, ingresar_cita,
  citas_aceptadas, dashboard_count, notificarAceptacion, Correo_p,
  Citasdel_usuario, cancelar_cita_notificacion
};

