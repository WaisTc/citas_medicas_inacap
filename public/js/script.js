function agendar(servicio, fecha, hora) {
  const mensaje = `Cita para <strong>${servicio}</strong> agendada el <strong>${fecha}</strong> a las <strong>${hora}</strong>.`;
  const confirmacion = document.getElementById('confirmacion');
  confirmacion.innerHTML = mensaje;
  confirmacion.classList.remove('d-none');
}


function botonQ() {
  const loginModalEl = document.getElementById('loginModal');

  if (window.bootstrap) {
    const loginModal = bootstrap.Modal.getOrCreateInstance(loginModalEl);
    if (loginModalEl.classList.contains('show')) {
      loginModal.hide();
    } else {
      loginModal.show();
    }
  } else {
    if (loginModalEl.style.display === 'block') {
      loginModalEl.style.display = 'none';
      loginModalEl.classList.remove('show');
    } else {
      loginModalEl.style.display = 'block';
      loginModalEl.classList.add('show');
    }
  }
}



// Global Logout Modal
// Global Logout Modal
console.log("script.js loaded");
window.mostrarLogoutModal = function () {
  let modalHtml = document.getElementById('logoutModal');
  if (!modalHtml) {
    const modalDiv = document.createElement('div');
    modalDiv.innerHTML = `
      <div class="modal fade" id="logoutModal" tabindex="-1" aria-labelledby="logoutModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header bg-danger text-white">
              <h5 class="modal-title" id="logoutModalLabel">Cerrar Sesión</h5>
              <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              ¿Estás seguro que deseas cerrar sesión?
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
              <button type="button" class="btn btn-danger" id="confirmLogoutBtn">Cerrar Sesión</button>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modalDiv);
    modalHtml = document.getElementById('logoutModal');

    document.getElementById('confirmLogoutBtn').addEventListener('click', async () => {
      try {
        await fetch('/api/usuario/logout', { method: 'POST' });
      } catch (e) { console.error('Error logout', e); }
      sessionStorage.removeItem('isLoggedIn');
      window.location.href = 'index.html';
    });
  }

  const modal = new bootstrap.Modal(modalHtml);
  modal.show();
}

document.getElementById("Login").addEventListener("submit", async function (e) {
  e.preventDefault();
  const form = e.target;
  const credenciales = {
    user: form.login_user.value,
    pass: form.login_password.value
  };

  try {
    const res = await fetch('/api/usuario/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credenciales)
    });

    const data = await res.json();

    if (res.ok && data.success) {
      // Token is now in HttpOnly cookie
      // Security: Do NOT store sensitive roles/email in sessionStorage
      sessionStorage.setItem('isLoggedIn', 'true');

      window.location.href = 'index.html';
    } else {
      alert(data.error || 'Login fallido');
    }
  } catch (err) {
    console.error('Error en login:', err);
    alert('Error de conexión con el servidor');
  }

});
