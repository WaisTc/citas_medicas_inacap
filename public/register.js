document.getElementById('formulario-user').addEventListener('submit', async function(e) {
  e.preventDefault();
  const form = e.target;
  const datos = {
    nombre: form.nombre.value.trim(),
    apellido1: form.apellido1.value.trim(),
    apellido2: form.apellido2.value.trim(),
    rut: form.rut.value.trim(),
    correo: form.correo.value.trim(),
    telefono: form.telefono.value,
    direccion: form.direccion.value,
    nacimiento: form.nacimiento.value,
    plan_n: form.plan_n.value,
    plan_t: form.plan_t.value,
    password: form.contraseña.value,
    confirmar: form.confirmarContraseña.value
  };

  if(datos.password !== datos.confirmar){
    alert("Las contraseñas no coinciden.")
  }
  else {
    const res = await fetch('http://localhost:3000/api/usuario/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos)
    });

    const resultado = await res.json();
    console.log(resultado);
  }
});