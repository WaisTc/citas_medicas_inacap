window.addEventListener('DOMContentLoaded', () => {
  const correo = sessionStorage.getItem('correo_user');

  fetch('http://localhost:3000/api/usuario/empleado_temporal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ correo })
  })
  .then(res => res.json())
  .then(data => {
    const contenedor = document.getElementById('contenedor-citas-temporal');
    contenedor.innerHTML = '';

    if (data.existe) {
      data.citas.forEach(cita => {
        contenedor.innerHTML += crearCard(cita);
      });
    } else {
      contenedor.innerHTML = '<p>No hay citas asignadas.</p>';
    }
  })
  .catch(error => {
    console.error('Error al obtener citas:', error);
  });
});

function crearCard(cita) {
  return `
    <div class="card m-1 shadow-sm card-top-border">
      <div class="card-body col">
        <h5 class="card-title id_cita">Cita #${cita.id_cita}</h5>
        <p class="card-text" ><strong>Estado:</strong> ${cita.estado_cita}</p>
        <p class="card-text"><strong>Paciente:</strong> ${cita.rut_paciente}</p>
        <p class="card-text tipo"><strong>Tipo:</strong> ${cita.tipo_cita || 'General'}</p>

        <div class="mb-2">
          <label class="form-label"><strong>Fecha:</strong></label>
          <input type="datetime-local" class="form-control form-control-sm fecha_cita" id="fecha-${cita.id_cita}" value="${cita.fecha_hora || ''}">
        </div>

        <div class="mb-2">
          <label class="form-label"><strong>Lugar:</strong></label>
          <input type="text" class="form-control form-control-sm lugar_cita" id="lugar-${cita.id_cita}" value="${cita.lugar_atencion || ''}">
        </div>

        <div class="mt-3 d-flex justify-content-end gap-2">
          <button class="btn btn-success" onclick="aceptarCita(this, ${cita.id_cita})">Aceptar</button>
          <button class="btn btn-danger btn-sm" onclick="rechazarCita(${cita.id_cita})">Rechazar</button>
        </div>
      </div>
    </div>
  `;
}



function crearCardAceptada(aceptada) {
  return `
    <div class="card text-white bg-success m-1 shadow-sm">
      <div class="card-body">
        <h5 class="card-title text-white">Cita #${aceptada.id_cita}</h5>
        <p><strong>fecha:</strong> ${(aceptada.fecha_hora)}</p>
        <p><strong>Lugar:</strong> ${aceptada.lugar_atencion}</p>
        <p><strong>Tipo:</strong> ${aceptada.tipo_cita}</p>
        <p><strong>Paciente:</strong> ${aceptada.rut_paciente}</p>
        <p><strong>Médico:</strong> ${aceptada.rut_medico}</p>
      </div>
    </div>
  `;
}




async function aceptarCita(boton) {
  const card = boton.closest('.card');

  const idTexto = card.querySelector('.id_cita')?.textContent?.trim();
  const id_cita = idTexto?.replace("Cita #", ""); 

  const tipo_c = card.querySelector('.tipo')?.textContent?.trim();
  const tipo_cita = tipo_c?.replace("Tipo: ", "")

  const fecha_cita = card.querySelector('.fecha_cita')?.value?.trim();
  const lugar_atencion = card.querySelector('.lugar_cita')?.value?.trim();


  if (!id_cita || !fecha_cita || !lugar_atencion) {
    alert('Todos los campos son obligatorios');
    return;
  }

  const cita = { id_cita, fecha_cita, lugar_atencion, tipo_cita };

  try {
    const res = await fetch('http://localhost:3000/api/usuario/aceptar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cita)
    });

    const result = await res.json();
    if (res.ok) {
      alert('Cita aceptada');
      window.location.href = 'horario.html'
    } else {
      alert('Error al guardar la cita');
      console.error(result.error);
    }
  } catch (err) {
    alert('Error de conexión');
    console.error(err);
  }
}









window.addEventListener('DOMContentLoaded', () => {
  const correo = sessionStorage.getItem('correo_user');

  fetch('http://localhost:3000/api/usuario/empleado_c_aceptadas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ correo })
  })
  .then(res => res.json())
  .then(data => {
    const contenedor_aceptado = document.getElementById('contenedor-citas-aceptadas');
    contenedor_aceptado.innerHTML = '';
    if (data.aceptadas) {
      data.aceptadas.forEach(aceptadas => {
        
        contenedor_aceptado.innerHTML += crearCardAceptada(aceptadas);

      });
    } else {
      contenedor_aceptado.innerHTML = '<p>No hay citas asignadas.</p>';
    }
  })
  .catch(error => {
    console.error('Error al obtener citas:', error);
  });


});