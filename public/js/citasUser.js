async function obtenerCitasPorCorreo() {

  try {
    const response = await fetch("/api/usuario/citasD_usuario", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // Body not needed as user is inferred from token
    });

    if (!response.ok) {
      throw new Error("Error en la petición al servidor");
    }

    const citas = await response.json();


    const container = document.getElementById("citas-container");
    container.innerHTML = "";

    citas.forEach(cita => {
      let fecha = "";
      let hora = "";
      let tipoCita = "";
      let lugarAtencion = "";

      if (cita.fecha_hora) {
        const fechaObj = new Date(cita.fecha_hora);
        fecha = fechaObj.toLocaleDateString("es-CL", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit"
        });
        hora = fechaObj.toLocaleTimeString("es-CL", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false
        });
      }

      if (cita.estado_cita === "EN PROCESO" && !cita.fecha_hora) {
        fecha = "sin fecha definida";
        hora = "sin hora definida";
        tipoCita = "Sin definir";
        lugarAtencion = "Sin definir";
      } else if (cita.estado_cita === "ACEPTADA") {
        tipoCita = cita.tipo_cita;
        lugarAtencion = cita.lugar_atencion;
      } else {
        tipoCita = cita.tipo_cita || "";
        lugarAtencion = cita.lugar_atencion || "";
      }

      const card = document.createElement("div");
      card.className = "card mb-3 shadow-sm";


      const citaData = encodeURIComponent(JSON.stringify(cita));

      card.innerHTML = `
            <div class="card-header bg-primary text-white">
            <h5 class="mb-0">Cita #${cita.id_cita}</h5>
            </div>
            <div class="card-body">
            <p class="mb-1"><strong>Estado:</strong> ${cita.estado_cita}</p>
            <p class="mb-1"><strong>Paciente (RUT):</strong> ${cita.rut_paciente}</p>
            <p class="mb-1"><strong>Médico (RUT):</strong> ${cita.rut_medico}</p>
            ${fecha ? `<p class="mb-1"><strong>Fecha:</strong> ${fecha}</p>` : ""}
            ${hora ? `<p class="mb-1"><strong>Hora:</strong> ${hora}</p>` : ""}
            ${tipoCita ? `<p class="mb-1"><strong>Tipo de cita:</strong> ${tipoCita}</p>` : ""}
            ${lugarAtencion ? `<p class="mb-3"><strong>Lugar de atención:</strong> ${lugarAtencion}</p>` : ""}
            <button class="btn btn-danger btn-sm" 
                    onclick="cancelarCita('${citaData}')">
                Cancelar cita
            </button>
            </div>
        `;

      container.appendChild(card);
    });
  } catch (error) {
    console.error("Error al obtener citas:", error);
  }
}

async function cancelarCita(citaJson) {
  const cita = JSON.parse(decodeURIComponent(citaJson));

  if (cita.fecha_hora) {
    const fechaObj = new Date(cita.fecha_hora);
    cita.fecha = fechaObj.toLocaleDateString("es-CL", { year: "numeric", month: "2-digit", day: "2-digit" });
    cita.hora = fechaObj.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit", hour12: false });
  } else {
    cita.fecha = "Sin definir";
    cita.hora = "Sin definir";
  }

  if (!confirm(`¿Seguro que deseas cancelar la cita #${cita.id_cita}?`)) return;

  try {
    const response = await fetch("/api/usuario/cancelar_cita", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cita)
    });

    const data = await response.json();

    if (response.ok && data.success) {
      alert(data.message);
      obtenerCitasPorCorreo();
    } else {
      alert(data.message || "No se pudo cancelar la cita");
    }
  } catch (error) {
    console.error("Error al cancelar cita:", error);
    alert("Error de conexión con el servidor");
  }
}



document.addEventListener("DOMContentLoaded", obtenerCitasPorCorreo);
