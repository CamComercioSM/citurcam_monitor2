let colasAtencion = [];                 // Catálogo fijo
let pendientesPorCola = {};            // { turnoTipoServicioID: total }
let tarjetasInicializadas = false;


async function cargarColasAtencionParaTarjetasTurnosPendientes() {
    const respuesta = await conectarseEndPoint('mostrarColasAtencionActivas');
    colasAtencion = respuesta.DATOS || [];

    // Inicializar pendientes en 0
    colasAtencion.forEach(cola => {
        pendientesPorCola[cola.turnoTipoServicioID] = 0;
    });

    renderTarjetasTurnosEnColaDeAtencion();
    tarjetasInicializadas = true;
}


async function actualizarTablaTurnosEnColaDeAtencion() {
    if (!tarjetasInicializadas) return;

    const respuesta = await conectarseEndPoint(
        'mostrarTotalTurnosPendientesPorZonasPorTiposServicios',
        identificadorZonaAtencion
    );

    const nuevosTurnos = respuesta.DATOS || [];

    // Reiniciamos conteos
    Object.keys(pendientesPorCola).forEach(id => {
        pendientesPorCola[id] = 0;
    });

    // Actualizamos solo los que vienen en la consulta
    nuevosTurnos.forEach(turno => {
        if (turno.turnoTipoServicioID !== undefined) {
            pendientesPorCola[turno.turnoTipoServicioID] =
                Number(turno.turnosPENDIENTES ?? 0);
        }
    });

    actualizarSoloNumerosTarjetas();
}

function actualizarSoloNumerosTarjetas() {
    Object.entries(pendientesPorCola).forEach(([id, total]) => {
        const elemento = document.getElementById(`pendientes-cola-${id}`);
        if (elemento && elemento.textContent !== String(total)) {
            elemento.textContent = total;
        }
    });
}



function renderTarjetasTurnosEnColaDeAtencion() {
    const contenedor = document.getElementById('tarjetasAtencion');
    contenedor.innerHTML = '';

    colasAtencion.forEach(cola => {
        const id = cola.turnoTipoServicioID;

        contenedor.innerHTML += `
        <div class="col-12 col-sm-6 col-md-4 col-lg-2">
          <div class="card h-100 shadow rounded-4 border-0 tarjeta-turno">
            <div class="card-body d-flex flex-column justify-content-between text-center p-3">

              <div class="fw-bold fs-2">
                ${cola.turnoTipoServicioTITULO ?? '-'}
              </div>

              <div class="mt-3 fs-1">                
                <div class="fw-bold display-6 text-primary pendientes-cola"
                  id="pendientes-cola-${id}">
                  0
                </div>
              </div>

              <div class="text-muted small">${cola.turnoTipoServicioSUBTITULO ?? '-'}</div>
            </div>
          </div>
        </div>`;
    });
}
