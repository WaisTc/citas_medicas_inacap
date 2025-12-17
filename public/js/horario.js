// ==================== LISTA DE CITAS ACEPTADAS ====================
const citasAceptadas = [];

function normalizarFechaHora(fechaHoraStr) {
  const d = new Date(fechaHoraStr);
  const pad = (n) => String(n).padStart(2, "0");
  const fecha = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const hora = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  return `${fecha} ${hora}`;
}

function obtenerHorasOcupadas() {
  return citasAceptadas.map(c => normalizarFechaHora(c.fecha_hora));
}

// ==================== CREAR CARD DE CITA TEMPORAL ====================
function crearCard(cita) {
  const ahora = new Date();
  const mañana = new Date(ahora.getTime() + 24 * 60 * 60 * 1000);
  const isoMañana = new Date(mañana.getTime() - mañana.getTimezoneOffset() * 60000)
    .toISOString().slice(0, 10);

  const fechaBase = cita.fecha_hora
    ? cita.fecha_hora.slice(0, 10)
    : isoMañana;

  return `
    <div class="card m-1 shadow-sm card-top-border">
      <div class="card-body col">
        <h5 class="card-title id_cita">Cita #${cita.id_cita}</h5>
        <p class="card-text"><strong>Estado:</strong> ${cita.estado_cita}</p>
        
        <p class="card-text rut_paciente">
          <strong>Paciente:</strong> <span>${cita.rut_paciente}</span>
        </p>

        <p class="card-text rut_medico">
          <strong>Medico:</strong> <span>${cita.rut_medico}</span>
        </p>

        <p class="card-text tipo"><strong>Tipo:</strong> ${cita.tipo_cita || 'General'}</p>

        <div class="mb-2">
          <label class="form-label"><strong>Fecha:</strong></label>
          <input type="date"
                 class="form-control form-control-sm fecha_cita"
                 id="fecha-${cita.id_cita}"
                 min="${isoMañana}"
                 value="${fechaBase}"
                 onchange="actualizarHoras(${cita.id_cita})">
        </div>

        <div class="mb-2">
          <label class="form-label"><strong>Hora:</strong></label>
          <select class="form-select form-select-sm hora_cita" id="hora-${cita.id_cita}">
            ${generarOpcionesHora(fechaBase)}
          </select>
        </div>

        <div class="mb-2">
          <label class="form-label"><strong>Lugar:</strong></label>
          <input type="text"
                 class="form-control form-control-sm lugar_cita"
                 id="lugar-${cita.id_cita}"
                 value="${cita.lugar_atencion || ''}">
        </div>

        <div class="mt-3 d-flex justify-content-end gap-2">
          <button class="btn btn-success" onclick="aceptarCita(this)">Aceptar</button>
          <button class="btn btn-danger btn-sm" onclick="rechazarCita(${cita.id_cita})">Rechazar</button>
        </div>
      </div>
    </div>
  `;
}

// ==================== GENERAR OPCIONES DE HORAS (filtrando ocupadas) ====================
function generarOpcionesHora(fechaSeleccionada) {
  let opciones = "";
  const horasOcupadas = obtenerHorasOcupadas();

  for (let h = 8; h < 16; h++) { // limite de horario x dia
    for (let m = 0; m < 60; m += 30) {
      const hora = String(h).padStart(2, "0");
      const minuto = String(m).padStart(2, "0");
      const fechaHora = `${fechaSeleccionada} ${hora}:${minuto}`;

      if (!horasOcupadas.includes(fechaHora)) {
        opciones += `<option value="${hora}:${minuto}">${hora}:${minuto}</option>`;
      }
    }
  }
  return opciones;
}

// ==================== ACTUALIZAR HORAS AL CAMBIAR FECHA ====================
function actualizarHoras(id_cita) {
  const fecha = document.getElementById(`fecha-${id_cita}`).value;
  const select = document.getElementById(`hora-${id_cita}`);
  select.innerHTML = generarOpcionesHora(fecha);
}

// ==================== CREAR CARD DE CITA ACEPTADA ====================
function crearCardAceptada(aceptada) {
  citasAceptadas.push({
    id_cita: aceptada.id_cita,
    fecha_hora: aceptada.fecha_hora
  });

  const fechaLocal = new Date(aceptada.fecha_hora);
  const opciones = {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
    hour12: false, timeZone: 'America/Santiago'
  };
  const fechaFormateada = fechaLocal.toLocaleString('es-CL', opciones);

  return `
    <div class="card text-white bg-success m-1 shadow-sm">
      <div class="card-body">
        <h5 class="card-title text-white">Cita #${aceptada.id_cita}</h5>
        <p><strong>Fecha:</strong> ${fechaFormateada}</p>
        <p><strong>Lugar:</strong> ${aceptada.lugar_atencion}</p>
        <p><strong>Tipo:</strong> ${aceptada.tipo_cita}</p>
        <p><strong>Paciente:</strong> ${aceptada.rut_paciente}</p>
        <p><strong>Médico:</strong> ${aceptada.rut_medico}</p>
      </div>
    </div>
  `;
}

// ==================== VERIFICAR CONFLICTO ====================
function hayConflicto(fechaNueva) {
  const normalNueva = normalizarFechaHora(fechaNueva);
  for (const cita of citasAceptadas) {
    const normalExistente = normalizarFechaHora(cita.fecha_hora);
    if (normalExistente === normalNueva) {
      return true;
    }
  }
  return false;
}

// ==================== ACEPTAR CITA ====================
async function aceptarCita(boton) {
  const card = boton.closest('.card');

  const idTexto = card.querySelector('.id_cita')?.textContent?.trim();
  const id_cita = idTexto?.replace("Cita #", "");

  const tipo_c = card.querySelector('.tipo')?.textContent?.trim();
  const tipo_cita = tipo_c?.replace("Tipo: ", "");

  const fecha = card.querySelector('.fecha_cita')?.value?.trim();
  const hora = card.querySelector('.hora_cita')?.value?.trim();
  const lugar_atencion = card.querySelector('.lugar_cita')?.value?.trim();

  const rut = card.querySelector('.rut_paciente span')?.textContent?.trim();

  if (!id_cita || !fecha || !hora || !lugar_atencion) {
    alert('Todos los campos son obligatorios');
    return;
  }

  const fecha_cita = `${fecha}T${hora}:00`;

  if (hayConflicto(fecha_cita)) {
    alert('Ya existe una cita agendada en esa fecha y hora.');
    return;
  }

  const cita = { id_cita, fecha_cita, lugar_atencion, tipo_cita, rut, fecha, hora };

  try {
    const res = await fetch('/api/usuario/aceptar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cita)
    });

    const result = await res.json();
    if (res.ok) {
      alert('Cita aceptada');
      citasAceptadas.push({ id_cita, fecha_hora: fecha_cita });
      window.location.href = 'horario.html';
    } else {
      alert('Error al guardar la cita');
      console.error(result.error);
    }
  } catch (err) {
    alert('Error de conexión');
    console.error(err);
  }
}

// ==================== CARGAR CITAS ACEPTADAS ====================
async function cargarCitasAceptadas() {
  const correo = sessionStorage.getItem('correo_user');
  try {
    const res = await fetch('/api/usuario/empleado_c_aceptadas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ correo })
    });
    const data = await res.json();

    const contenedor_aceptado = document.getElementById('contenedor-citas-aceptadas');
    contenedor_aceptado.innerHTML = '';

    if (data.aceptadas) {
      const ahora = new Date();

      const futuras = data.aceptadas.filter(cita => {
        const fechaCita = new Date(cita.fecha_hora);
        return fechaCita >= ahora;
      });

      if (futuras.length > 0) {
        futuras.forEach(aceptada => {
          contenedor_aceptado.innerHTML += crearCardAceptada(aceptada);
        });
      } else {
        contenedor_aceptado.innerHTML = '<p>No hay citas próximas.</p>';
      }
    } else {
      contenedor_aceptado.innerHTML = '<p>No hay citas asignadas.</p>';
    }

    grafico_p();
  } catch (error) {
    console.error('Error al obtener citas aceptadas:', error);
  }
}

// ==================== CARGAR CITAS TEMPORALES ====================
async function cargarCitasTemporales() {
  const correo = sessionStorage.getItem('correo_user');
  try {
    const res = await fetch('/api/usuario/empleado_temporal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ correo })
    });
    const data = await res.json();

    const contenedor = document.getElementById('contenedor-citas-temporal');
    contenedor.innerHTML = '';

    if (data.existe) {
      data.citas.forEach(cita => {
        contenedor.innerHTML += crearCard(cita);
      });
    } else {
      contenedor.innerHTML = '<p>No hay citas asignadas.</p>';
    }
  } catch (error) {
    console.error('Error al obtener citas temporales:', error);
  }
}

// ==================== ORDEN DE CARGA ====================
window.addEventListener('DOMContentLoaded', async () => {
  await cargarCitasAceptadas();
  await cargarCitasTemporales();
});


// ==================== GRAFICO QUE TENGO QUE CAMBIAR ====================
async function grafico_p() {
  const c = sessionStorage.getItem("correo_user");

  const res = await fetch(`/api/usuario/pelao/${c}`);
  const data = await res.json();


  const meses = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
  ];

  const valores = meses.map(m => data[m] || 0);

  if (window.miGrafico) {
    window.miGrafico.destroy();
  }

  const ctx = document.getElementById("graficoCitas").getContext("2d");
  window.miGrafico = new Chart(ctx, {
    type: "bar",
    data: {
      labels: meses,
      datasets: [{
        label: "Cantidad de citas por mes",
        data: valores,
        backgroundColor: [
          "rgba(54, 162, 235, 0.6)",
          "rgba(255, 99, 132, 0.6)",
          "rgba(255, 206, 86, 0.6)",
          "rgba(75, 192, 192, 0.6)",
          "rgba(153, 102, 255, 0.6)",
          "rgba(255, 159, 64, 0.6)",
          "rgba(199, 199, 199, 0.6)",
          "rgba(54, 162, 235, 0.6)",
          "rgba(255, 99, 132, 0.6)",
          "rgba(255, 206, 86, 0.6)",
          "rgba(75, 192, 192, 0.6)",
          "rgba(153, 102, 255, 0.6)"
        ],
        borderColor: "rgba(0, 0, 0, 0.2)",
        borderWidth: 1,
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: true,
          labels: { color: "#333", font: { size: 14, weight: "bold" } }
        },
        title: {
          display: true,
          text: "Citas Médicas por Mes",
          color: "#222",
          font: { size: 18, weight: "bold" }
        }
      },
      scales: {
        x: {
          ticks: {
            color: "#333",
            font: { size: 12 }
          },
          grid: {
            display: false
          }
        },
        y: {
          beginAtZero: true,
          ticks: {
            color: "#333",
            font: { size: 12 }
          },
          grid: {
            color: "rgba(200, 200, 200, 0.2)"
          }
        }
      }
    }
  });
};


// RECORDAR CAMBIAR ESTA COSA D GRAFICO AAAAAAAA



// ==================== RECHAZAR CITA ====================
async function rechazarCita(id_cita) {
  const card = document.querySelector(`#fecha-${id_cita}`)?.closest(".card");
  if (!card) {
    alert("No se encontró la cita en la interfaz.");
    return;
  }

  // Extraer rut
  const rut_p = card.querySelector('.rut_paciente span')?.textContent?.trim();
  const rut_m = card.querySelector('.rut_medico span')?.textContent?.trim();

  if (!id_cita || !rut_p || !rut_m) {
    alert("Datos insuficientes para rechazar la cita.");
    return;
  }

  const cita = {
    id_cita,
    rut_paciente: rut_p,
    rut_medico: rut_m,
    estado_cita: "EN PROCESO"
  };

  // Confirmación
  const confirmar = confirm("¿Seguro que deseas rechazar esta cita?");
  if (!confirmar) return;

  try {
    const res = await fetch("/api/usuario/cancelar_cita", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cita)
    });

    const result = await res.json();

    if (res.ok) {
      alert("Cita rechazada correctamente.");
      // Recargar listas
      await cargarCitasTemporales();
      await cargarCitasAceptadas();
    } else {
      alert("Error al rechazar la cita.");
      console.error(result.error);
    }
  } catch (error) {
    alert("Error de conexión con el servidor.");
    console.error(error);
  }
}