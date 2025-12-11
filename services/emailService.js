const nodemailer = require("nodemailer");
require('dotenv').config();

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

module.exports = { notificarAceptacion, notificarCancelacion };
