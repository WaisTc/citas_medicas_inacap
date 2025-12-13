let allUsuarios = [];
let availableRoles = [];

document.addEventListener('DOMContentLoaded', () => {
    // Chain execution: Roles -> Users
    loadRoles().then(() => {
        loadUsuarios();
    });

    const editForm = document.getElementById('editarRolForm');
    editForm.addEventListener('submit', handleEditFormSubmit);

    document.getElementById('searchInput').addEventListener('input', applyFilters);
    document.getElementById('filterRol').addEventListener('change', applyFilters);
});

async function loadRoles() {
    try {
        const response = await fetch('http://localhost:3000/api/usuario/roles');
        if (!response.ok) throw new Error('Error al cargar roles');
        availableRoles = await response.json();

        const filterSelect = document.getElementById('filterRol');

        availableRoles.forEach(r => {
            const option = document.createElement('option');
            option.value = r.rol;
            option.textContent = r.especialidad.charAt(0).toUpperCase() + r.especialidad.slice(1); // Capitalize
            filterSelect.appendChild(option);
        });

        const modalSelect = document.getElementById('selectRol');
        availableRoles.forEach(r => {
            const option = document.createElement('option');
            option.value = r.rol;
            option.textContent = r.especialidad.charAt(0).toUpperCase() + r.especialidad.slice(1);
            modalSelect.appendChild(option);
        });

    } catch (error) {
        console.error("Error loading roles:", error);
    }
}

async function loadUsuarios() {
    try {
        const response = await fetch('http://localhost:3000/api/usuario/lista_usuarios');
        if (!response.ok) throw new Error('Error al cargar usuarios');
        const usuarios = await response.json();

        allUsuarios = usuarios.sort((a, b) => b.rol - a.rol);

        applyFilters();
    } catch (error) {
        console.error(error);
        alert('No se pudieron cargar los usuarios.');
    }
}

function applyFilters() {
    const searchText = document.getElementById('searchInput').value.toLowerCase();
    const filterRol = document.getElementById('filterRol').value;

    const filtered = allUsuarios.filter(user => {
        const matchesSearch = user.usuario.toLowerCase().includes(searchText);
        const matchesRol = filterRol === "" || user.rol == filterRol;
        return matchesSearch && matchesRol;
    });

    renderTable(filtered);
}

function renderTable(usuarios) {
    const tbody = document.getElementById('usuariosTableBody');
    tbody.innerHTML = '';

    usuarios.forEach(user => {
        const tr = document.createElement('tr');

        const roleObj = availableRoles.find(r => r.rol == user.rol);
        let roleName = roleObj ? roleObj.especialidad : 'Desconocido';

        roleName = roleName.charAt(0).toUpperCase() + roleName.slice(1);

        tr.innerHTML = `
            <td>${user.usuario}</td>
            <td><span class="badge bg-secondary">${roleName} (ID: ${user.rol})</span></td>
            <td>
                <button class="btn btn-sm btn-info me-2 text-white" onclick="openDetalleModal('${user.usuario}')">
                    <i class="bi bi-eye"></i> Ver Detalles
                </button>
                <button class="btn btn-sm btn-primary me-2" onclick="openEditModal('${user.usuario}', ${user.rol})">
                    <i class="bi bi-pencil-square"></i> Editar Rol
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteUser('${user.usuario}')">
                    <i class="bi bi-trash"></i> Eliminar
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function openEditModal(correo, currentRol) {
    document.getElementById('editCorreo').value = correo;
    document.getElementById('selectRol').value = currentRol;

    const modal = new bootstrap.Modal(document.getElementById('editarRolModal'));
    modal.show();
}

async function handleEditFormSubmit(e) {
    e.preventDefault();
    const correo = document.getElementById('editCorreo').value;
    const nuevoRol = document.getElementById('selectRol').value;

    try {
        const response = await fetch('http://localhost:3000/api/usuario/actualizar_rol', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ correo, nuevoRol })
        });

        const result = await response.json();
        if (response.ok) {
            alert(result.message);

            const modalEl = document.getElementById('editarRolModal');
            const modal = bootstrap.Modal.getInstance(modalEl);
            modal.hide();

            loadUsuarios();
        } else {
            alert('Error: ' + result.error);
        }
    } catch (error) {
        console.error(error);
        alert('Error al actualizar el rol.');
    }
}

async function deleteUser(correo) {
    if (!confirm(`¿Estás seguro de que deseas eliminar al usuario ${correo}? Esta acción no se puede deshacer.`)) {
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/api/usuario/eliminar_usuario', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ correo })
        });

        const result = await response.json();
        if (response.ok) {
            alert(result.message);
            loadUsuarios();
        } else {
            alert('Error: ' + result.error);
        }
    } catch (error) {
        console.error(error);
        alert('Error al eliminar usuario.');
    }
}

// --- User Detail & History Logic ---
let currentDetailEmail = '';
let currentHistory = [];

async function openDetalleModal(correo) {
    currentDetailEmail = correo;

    // 1. Fetch User Data
    try {
        const response = await fetch(`http://localhost:3000/api/usuario/paciente_datos/${correo}`);
        if (!response.ok) throw new Error("Error al obtener datos usuario");
        const data = await response.json();

        // Populate Personal Info Tab
        document.getElementById('det_rut').value = data.rut_persona || '';
        document.getElementById('det_nombres').value = data.nombres || '';
        document.getElementById('det_apellidos').value = (data.primer_apellido || '') + ' ' + (data.segundo_apellido || '');
        document.getElementById('det_correo').value = data.correo || '';
        document.getElementById('det_telefono').value = data.telefono || '';
        document.getElementById('det_direccion').value = data.direccion || '';

        // Show Modal
        const modal = new bootstrap.Modal(document.getElementById('detalleUsuarioModal'));
        modal.show();

        // 2. Fetch History
        loadUserHistory(correo);

    } catch (e) {
        console.error(e);
        alert("No se pudo cargar la información del usuario.");
    }
}

async function loadUserHistory(correo) {
    try {
        const response = await fetch('http://localhost:3000/api/usuario/citasD_usuario', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ correo: correo })
        });

        if (response.ok) {
            const data = await response.json();

            // The API returns a flat array of all appointments (mixed temp and accepted)
            // We need to normalize them.
            // Assumption: 'cita' table has fecha_hora, 'cita_temporal' likely doesn't or it's different.
            // Check properties to distinguish or trust 'estado_cita'.

            currentHistory = data.map(c => {
                let tipo = 'Desconocido';
                let fecha = c.fecha_hora || 'Pendiente';
                let estado = c.estado_cita || 'Desconocido';

                // Determine type based on state or presence of date
                if (estado === 'EN PROCESO' || !c.fecha_hora) {
                    tipo = 'Temporal';
                    estado = 'En Proceso';
                } else {
                    tipo = 'Confirmada';
                }

                return {
                    ...c,
                    estado: estado,
                    tipo: tipo,
                    fecha: fecha
                };
            });

            renderHistory(currentHistory);
        }

    } catch (e) {
        console.error(e);
    }
}

function renderHistory(lista) {
    const tbody = document.getElementById('historialTableBody');
    tbody.innerHTML = '';

    lista.forEach(cita => {
        const tr = document.createElement('tr');
        // Format date if exists
        let dateStr = cita.fecha;
        if (dateStr && dateStr !== 'Pendiente') {
            dateStr = new Date(dateStr).toLocaleString();
        }

        tr.innerHTML = `
            <td>${dateStr}</td>
            <td>${cita.rut_paciente || 'N/A'}</td>
            <td>${cita.rut_medico || 'N/A'}</td>
            <td><span class="badge ${cita.estado === 'Aceptada' || cita.estado === 'Confirmada' ? 'bg-success' : 'bg-warning'}">${cita.estado}</span></td>
            <td>${cita.tipo}</td>
        `;
        tbody.appendChild(tr);
    });
}

function applyHistoryFilters() {
    const fDate = document.getElementById('histFilterDate').value;
    const fRut = document.getElementById('histFilterRut').value.toLowerCase();

    const filtered = currentHistory.filter(c => {
        // Date match (simple substring check for YYYY-MM-DD)
        let matchDate = true;
        if (fDate && c.fecha !== 'Pendiente') {
            matchDate = c.fecha.startsWith(fDate);
        }

        // Rut match
        let matchRut = true;
        if (fRut) {
            matchRut = (c.rut_paciente || '').toLowerCase().includes(fRut);
        }

        return matchDate && matchRut;
    });

    renderHistory(filtered);
}

// Handle User Edit Submit
document.getElementById('formEditarUsuario').addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
        rut: document.getElementById('det_rut').value,
        nombres: document.getElementById('det_nombres').value,
        // Splitting apellidos simply for now
        primer_apellido: document.getElementById('det_apellidos').value.split(' ')[0] || '',
        segundo_apellido: document.getElementById('det_apellidos').value.split(' ')[1] || '',
        telefono: document.getElementById('det_telefono').value,
        direccion: document.getElementById('det_direccion').value,
        correo: currentDetailEmail
    };

    try {
        const response = await fetch('http://localhost:3000/api/usuario/actualizar_info', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            alert("Información actualizada correctamente");
        } else {
            alert("Error al actualizar");
        }
    } catch (err) {
        alert("Error de conexión");
    }
});
