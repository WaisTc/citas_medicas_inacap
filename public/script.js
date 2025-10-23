function agendar(servicio, fecha, hora) {
  const mensaje = `✅ Cita para <strong>${servicio}</strong> agendada el <strong>${fecha}</strong> a las <strong>${hora}</strong>.`;
  const confirmacion = document.getElementById('confirmacion');
  confirmacion.innerHTML = mensaje;
  confirmacion.classList.remove('d-none');
}


function botonQ() {
  const userButton = document.querySelector(".user-button")
  const userToggle = document.querySelector(".form_style")

  userButton.classList.toggle("user-button_invisible")
  userToggle.classList.toggle("form_visible")
}



document.getElementById("Login").addEventListener("submit", async function(e) {
  e.preventDefault();
  const form = e.target;
  const credenciales = {
    user: form.login_user.value,
    pass: form.login_password.value
  };

  try {
    const res = await fetch('http://localhost:3000/api/usuario/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credenciales)
    });

    const data = await res.json();

    if (res.ok && data.token) {
      // Guardar el token en localStorage
      sessionStorage.setItem('token', data.token);
      sessionStorage.setItem("correo_user", data.correo);
      sessionStorage.setItem("rol", data.rol);

      // Redirigir al usuario a su perfil o dashboard
      window.location.href = 'index.html';
    } else {
      alert(data.error || 'Login fallido');
    }
  } catch (err) {
    console.error('Error en login:', err);
    alert('Error de conexión con el servidor');
  }

});
