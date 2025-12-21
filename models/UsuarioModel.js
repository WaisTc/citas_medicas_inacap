const pool = require('../config/db');

async function insertarUsuario(datos) {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const [rowsRol] = await connection.query('SELECT especialidad FROM rol_especialidad WHERE rol = ?', [1]);
        const especialidad = rowsRol.length > 0 ? rowsRol[0].especialidad : 'paciente';

        const sql_persona = `
            INSERT INTO persona (rut_persona, nombres, primer_apellido, 
            segundo_apellido, correo, telefono, direccion, fecha_nacimiento, rol, especialidad, plan_salud_nombre, plan_salud_tipo) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?);
        `;
        const valores_persona = [datos.rut, datos.nombre, datos.apellido1, datos.apellido2,
        datos.correo, datos.telefono, datos.direccion, datos.nacimiento, especialidad, datos.plan_n, datos.plan_t];
        await connection.execute(sql_persona, valores_persona);

        const usuario_login = 'INSERT INTO usuario(usuario, contraseña, rol) VALUES(?, ?, 1)';
        const valores_login = [datos.correo, datos.password];
        await connection.execute(usuario_login, valores_login);

        await connection.commit();
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

async function validar(user) {
    const [rows] = await pool.execute(
        'SELECT contraseña, rol FROM usuario WHERE usuario = ?',
        [user]
    );

    if (rows.length > 0) {
        return {
            hashGuardado: rows[0].contraseña,
            rol: rows[0].rol
        };
    }
    return null;
}

async function findEmailByRut(rut) {
    const [c] = await pool.query('SELECT correo FROM persona WHERE rut_persona = ?', [rut]);
    return c[0];
}

async function datosCorreo(correo) {
    const [rows] = await pool.query(
        'SELECT rut_persona, nombres, primer_apellido, segundo_apellido,  correo, telefono, direccion, fecha_nacimiento, plan_salud_nombre, plan_salud_tipo FROM persona WHERE correo = ?',
        [correo]
    );
    return rows;
}


async function getAllUsuarios() {
    const [rows] = await pool.query('SELECT usuario, rol FROM usuario');
    return rows;
}

async function updateUsuarioRol(correo, nuevoRol) {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        await connection.execute('UPDATE usuario SET rol = ? WHERE usuario = ?', [nuevoRol, correo]);

        const [rowsRol] = await connection.query('SELECT especialidad FROM rol_especialidad WHERE rol = ?', [nuevoRol]);
        if (rowsRol.length === 0) throw new Error('Rol no encontrado');

        const especialidad = rowsRol[0].especialidad;
        await connection.execute('UPDATE persona SET rol = ?, especialidad = ? WHERE correo = ?', [nuevoRol, especialidad, correo]);

        await connection.commit();
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

async function deleteUsuario(correo) {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        await connection.execute('DELETE FROM persona WHERE correo = ?', [correo]);
        await connection.execute('DELETE FROM usuario WHERE usuario = ?', [correo]);

        await connection.commit();
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

async function getAllRoles() {
    const [rows] = await pool.query('SELECT rol, especialidad FROM rol_especialidad');
    return rows;
}

async function updateUsuarioInfo(datos) {
    const sql = `
        UPDATE persona 
        SET rut_persona = ?, nombres = ?, primer_apellido = ?, segundo_apellido = ?, telefono = ?, direccion = ?
        WHERE correo = ?
    `;
    // Note: ensure params order matches SQL ? placeholders
    const params = [datos.rut, datos.nombres, datos.primer_apellido, datos.segundo_apellido, datos.telefono, datos.direccion, datos.correo];
    await pool.execute(sql, params);
}

module.exports = { insertarUsuario, validar, findEmailByRut, datosCorreo, getAllUsuarios, updateUsuarioRol, deleteUsuario, getAllRoles, updateUsuarioInfo };

