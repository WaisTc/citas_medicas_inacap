document.getElementById('paciente-form').addEventListener('submit', async function(e) {
  e.preventDefault();
  const form = e.target;
  
  const datos = {
    nombres: form.nombres.value,
    apellido1: form.primer_apellido.value.trim(),
    apellido2: form.segundo_apellido.value.trim(),
    rut: form.rut.value.trim(),
    correo: form.correo.value.trim(),
    telefono: form.telefono.value,
    direccion: form.direccion.value,
    nacimiento: form.fecha_nacimiento.value,
    plan_n: form.plan_salud_nombre.value,
    plan_t: form.plan_salud_tipo.value,
    doctor: form.doctor_select.value
  };

  fetch('http://localhost:3000/api/usuario/cita_t', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(datos)
  })
  .then(res => {
    if (!res.ok) throw new Error(`Error: ${res.status}`);
    return res.json();
  })
  .then(resultado => {
    
    console.log('Respuesta del servidor:', resultado);
    alert("Procesado correctamente");
    window.location.href = 'index.html';
  })
  .catch(error => {
    console.error('Error en el fetch:', error.message);
  });

});

// RECORDAR HACER EL FORMULARIO MAS ESTETICO