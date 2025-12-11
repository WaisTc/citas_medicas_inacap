const pool = require('../config/db');

async function insertarUsuario(datos) {
    const sql_paciente = `
    INSERT INTO paciente (rut_paciente, nombres, primer_apellido, 
    segundo_apellido, correo, telefono, direccion, fecha_nacimiento, rol, plan_salud_nombre, plan_salud_tipo) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?);
  `;
    const valores_paciente = [datos.rut, datos.nombre, datos.apellido1, datos.apellido2,
    datos.correo, datos.telefono, datos.direccion, datos.nacimiento, datos.plan_n, datos.plan_t];
    await pool.execute(sql_paciente, valores_paciente);

    const usuario_paciente = 'INSERT INTO usuario(usuario, contraseña, rol) VALUES(?, ?, 1)'
    const valores_usuario = [datos.correo, datos.password]
    await pool.execute(usuario_paciente, valores_usuario);
}

async function validar(user) {
    const [resultado_correo] = await pool.execute(
        'SELECT COUNT(*) AS total FROM usuario WHERE usuario = ?',
        [user]
    );

    const existe = resultado_correo[0].total > 0;

    if (existe) {
        const [rows] = await pool.execute(
            'SELECT contraseña, rol FROM usuario WHERE usuario = ?',
            [user]
        );

        const hashGuardado = rows[0].contraseña;
        const rol = rows[0].rol;

        return { hashGuardado, rol };
    }
    else {
        return null;
    }
}

async function findEmailByRut(rut) {
    const [c] = await pool.query('SELECT correo FROM paciente WHERE rut_paciente = ?', [rut]);
    return c[0];
}

async function datosCorreo(correo) {
    const [rows] = await pool.query(
        'SELECT rut_paciente, nombres, primer_apellido, segundo_apellido,  correo, telefono, direccion, fecha_nacimiento, plan_salud_nombre, plan_salud_tipo FROM paciente WHERE correo = ?',
        [correo]
    );
    return rows;
}

module.exports = { insertarUsuario, validar, findEmailByRut, datosCorreo };
