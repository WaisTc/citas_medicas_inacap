function validarRUT(rutCompleto) {
  
  rutCompleto = rutCompleto.replace(/\./g, '').replace(/-/g, '').toUpperCase();

  const cuerpo = rutCompleto.slice(0, -1);
  const dvIngresado = rutCompleto.slice(-1);

  if (cuerpo.length < 7 || !/^\d+$/.test(cuerpo)) return false;

  let suma = 0;
  let multiplo = 2;

  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo.charAt(i)) * multiplo;
    multiplo = multiplo < 7 ? multiplo + 1 : 2;
  }

  const resto = suma % 11;
  let dvCalculado = 11 - resto;

  if (dvCalculado === 11) dvCalculado = '0';
  else if (dvCalculado === 10) dvCalculado = 'K';
  else dvCalculado = dvCalculado.toString();

  return dvCalculado === dvIngresado;
}


document.getElementById('formulario-user').addEventListener('submit', async function(e) {
  e.preventDefault();
  const form = e.target;
  const datos = {
    nombre: form.nombre.value.charAt(0).toUpperCase() + form.nombre.value.slice(1),
    apellido1: form.apellido1.value.charAt(0).toUpperCase() + form.apellido1.value.slice(1),
    apellido2: form.apellido2.value.charAt(0).toUpperCase() + form.apellido2.value.slice(1),
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
  
  if (!validarRUT(datos.rut)) {
    alert("El RUT ingresado no es válido.");
    return;
  }

  if(datos.password !== datos.confirmar){
    return alert("Las contraseñas no coinciden.")
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