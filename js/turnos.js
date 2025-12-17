let turnosEnAtencion = [],
    turnosEnColasDeAtencion = [],
    turnosParaSerLlamados = [],
    llamadosExcedidos = [],
    modalLlamado = null,
    modalConfiguraciones = null,
    idxTurno = 0,
    turnoEnLlamado = [];
let ultimoEstadoTablaTurnos = null;
let ultimoEstadoColaParaLlamar = null;
var tiempoTurnosParaSerLlamados,
    tiempoTurnosLlamadoVoz,
    tiempoRefrescarTablaAtencion,
    tiempoRefrescarSliderColas,
    identificadorSede,
    identificadorZonaAtencion;


var reproductoresVOZ = [];

var controlLLamadoModal, controlLlamadoVoz;

// Renderiza slider de colas
let splideColas = null;
let splideRenderizado = false;
const slider = document.getElementById('sliderColas');


function realizarLlamadoModal() {
    if (turnosParaSerLlamados.length === 0) {
        modalLlamado.hide();
    }
    renderLlamadosActivos();
    return setTimeout(realizarLlamadoModal, tiempoTurnosParaSerLlamados || 1000);
}


var reproduciendo = false;
window.idAleatorio = function () {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < 5; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}



// Renderiza tabla de turnos en atención
function renderTarjetasTurnosEnColaDeAtencion() {
    const contenedor = document.getElementById('tarjetasAtencion');
    contenedor.innerHTML = '';

    turnosEnColasDeAtencion.forEach(turno => {
        const titulo = turno.turnoTipoServicioTITULO ?? '-';
        const pendientes = turno.turnosPENDIENTES ?? '-';

        contenedor.innerHTML += `
        <div class="col-12 col-sm-6 col-md-4 col-lg-2">
          <div class="card h-100 shadow rounded-4 border-0 tarjeta-turno">
            <div class="card-body d-flex flex-column justify-content-between text-center p-3">
              
              <div>
                <div class="text-uppercase fw-semibold text-muted small mb-1">
                  Módulo
                </div>
                <div class="fw-bold fs-5">
                  ${titulo}
                </div>
              </div>

              <div class="mt-3">
                <div class="text-muted small">
                  Turnos pendientes
                </div>
                <div class="fw-bold display-6 text-primary">
                  ${pendientes}
                </div>
              </div>

            </div>
          </div>
        </div>
        `;
    });
}

// Renderiza llamados activos en el modal
function renderLlamadosActivos() {
    if (turnosParaSerLlamados.length === 0) return;
    const cont = document.getElementById('llamadosActivos');
    cont.innerHTML = '';


    // console.log('antes de abrir el modal');
    // console.log(turnoEnLlamado);
    // console.log(turnosParaSerLlamados);
    // console.log('_________________');

    // Definimos los colores por tipo
    const colores = {
        Prioritario: 'bg-danger',
        Afiliado: 'bg-success',
        General: 'bg-primary',
        Cita: 'bg-success'
    };
    turnosParaSerLlamados.forEach(llamado => {
        // Elegimos el color; si no existe tipo, usamos general
        const color = colores[llamado.tipo] || 'bg-primary';

        cont.innerHTML += `
      <div class="p-4 rounded-4 ${color} shadow text-white" style="min-width: 220px;">
        <h2>${llamado.moduloAtencionTITULO}</h2>
        <h3 class="display-4">${llamado.turnoCODIGOCORTO}</h3>
        <p class="fs-2 mb-0">${llamado.personaNOMBRES}</p>
      </div>
    `;
    });
    modalLlamado.show();
}

//actualiza la cola de turnos que generan el llamado de modal
// actualiza la cola de turnos que generan el llamado de modal
window.actualizarColaTurnosParaSerLlamandos = async function () {
    const resp = await conectarseEndPoint('mostrarTurnosLlamandoZonasAtencion', identificadorZonaAtencion);
    // const res = await fetch('data.php?operacion=turnosParaSerLlamados');
    // const resp = await res.json();

    const datos = resp.DATOS || [];
    const turnos = datos[0] || [];
    const citas = datos[1] || [];

    let nuevoTurnosParaSerLlamados = [];
    // Armamos las citas (si hay)
    const armadosCitas = citas.map(cita => {
        const ident = cita.personaIDENTIFICACION || "";
        const ultimos3 = ident.toString().slice(-3);
        return {
            tipo: "Cita",
            moduloAtencionTITULO: cita.moduloAtencionTITULO || cita.modulo || "",
            turnoCODIGOCORTO: ultimos3,
            personaNOMBRES: cita.personaNOMBRES || cita.nombre || "",
            turnoCODIGOATENCION: cita.citaHASH || ""
        };
    });

    // Mezcla: primero citas, luego turnos normales
    nuevoTurnosParaSerLlamados = [
        ...armadosCitas,
        ...turnos
    ];

    // console.log('antes de comparar');
    // console.log(nuevoTurnosParaSerLlamados);
    // console.log(turnosParaSerLlamados);
    // console.log(ultimoEstadoColaParaLlamar);
    // console.log('_________________');

    const jsonNuevo = JSON.stringify(nuevoTurnosParaSerLlamados);

    if (jsonNuevo !== ultimoEstadoColaParaLlamar) {
        turnosParaSerLlamados = nuevoTurnosParaSerLlamados;
        ultimoEstadoColaParaLlamar = jsonNuevo;
    }


    // console.log('despues de comparar');
    // console.log(nuevoTurnosParaSerLlamados);
    // console.log(turnosParaSerLlamados);
    // console.log('_________________');

};



function guardarVariablesCofiguracion() {
    var sede = document.getElementById('sedesCCSM').value;
    var zona = document.getElementById('zonasAtencion').value;
    var tiempoLlamadosSlider = document.getElementById('tiempoLlamadosSlider').value || null;
    var tiempoLlamadosTurnosAtencion = document.getElementById('tiempoLlamadosTurnosAtencion').value;
    var tiempoTurnosParaLlamar = document.getElementById('tiempoTurnosParaLlamar').value;
    var tiempoTurnosLlamadoVoz = document.getElementById('tiempoTurnosLlamadoVoz').value;
    var tiempoParaExpandirVideo = document.getElementById('tiempoParaExpandirVideo').value;
    // ✅ Validación: si no hay sede o zona, NO guarda y NO avanza
    if (!sede || !zona) {
        alert('Debes seleccionar una sede y una zona de atención antes de continuar.');
        return false;
    }
    localStorage.setItem('sedeCCSM', sede);
    localStorage.setItem('zonaAtencion', zona);
    localStorage.setItem('tiempoLlamadosSlider', tiempoLlamadosSlider * 1000);
    localStorage.setItem('tiempoLlamadosTurnosAtencion', tiempoLlamadosTurnosAtencion * 1000);
    localStorage.setItem('tiempoTurnosParaLlamar', tiempoTurnosParaLlamar * 1000);
    localStorage.setItem('tiempoTurnosLlamadoVoz', tiempoTurnosLlamadoVoz * 1000);
    localStorage.setItem('tiempoParaExpandirVideo', tiempoParaExpandirVideo * 1000);

    window.location.reload();
}

async function cargarInformacionSedesZonasAtencion() {
    const respuesta = await conectarseEndPoint('datosSedesConZonasAtencion');
    const sedesZonas = respuesta.DATOS || [];

    const selectSedes = document.getElementById('sedesCCSM');
    const selectZonas = document.getElementById('zonasAtencion');

    selectSedes.innerHTML = '<option value="">Selecciona una sede...</option>';
    selectZonas.innerHTML = '<option value="">Selecciona una zona...</option>';

    sedesZonas.forEach(sede => {
        if (!sede.ZonasAtencion || sede.ZonasAtencion.length === 0) return;

        const opt = document.createElement('option');
        opt.value = sede.sedeID;
        opt.textContent = sede.sedeTITULO;
        selectSedes.appendChild(opt);
    });

    selectSedes.addEventListener('change', () => {
        const sedeIdSeleccionada = parseInt(selectSedes.value, 10);

        // limpiar zonas
        selectZonas.innerHTML = '<option value="">Selecciona una zona...</option>';

        const sede = sedesZonas.find(s => s.sedeID === sedeIdSeleccionada);
        if (!sede || !sede.ZonasAtencion) return;

        sede.ZonasAtencion.forEach(zona => {
            const optZona = document.createElement('option');
            optZona.value = zona.puestoTrabajoID;
            optZona.textContent = zona.puestoTrabajoTITULO;
            selectZonas.appendChild(optZona);
        });
    });
}
function completarFormularioDeConfiguraciones() {
    document.getElementById('tiempoLlamadosSlider').value = localStorage.getItem('tiempoLlamadosSlider') / 1000 || '';
    document.getElementById('tiempoLlamadosTurnosAtencion').value = localStorage.getItem('tiempoLlamadosTurnosAtencion') / 1000 || '';
    document.getElementById('tiempoTurnosParaLlamar').value = localStorage.getItem('tiempoTurnosParaLlamar') / 1000 || '';
    document.getElementById('tiempoTurnosLlamadoVoz').value = localStorage.getItem('tiempoTurnosLlamadoVoz') / 1000 || '';
    document.getElementById('tiempoParaExpandirVideo').value = localStorage.getItem('tiempoParaExpandirVideo') / 1000 || '';
}


// window.hablar = function (textoParaDecir, idPersona = idAleatorio()) {
//     if (textoParaDecir != "") {
//         console.log("Solicitando voz para: " + textoParaDecir);
//         solicitarTextoAVoz(textoParaDecir, idPersona);
//     }
// }
// window.crearReproductorRespuestaAPI = function (respuesta) {
//     var reproductorActivo;
//     if (respuesta) {
//         var datos = JSON.parse(respuesta);

//         reproductoresVOZ[datos.id] = document.createElement('audio');
//         reproductoresVOZ[datos.id].setAttribute('id', "sonidoEspanola" + datos.id);
//         reproductoresVOZ[datos.id].setAttribute('src', datos.audio);
//         reproductoresVOZ[datos.id].autoplay = true;
//         reproductoresVOZ[datos.id].muted = true;
//         reproductoresVOZ[datos.id].addEventListener("loadeddata", (event) => {

//         });

//         reproductorActivo = reproductoresVOZ[datos.id];
//     }

//     console.log("listado de resproductos creados");
//     console.log(reproductoresVOZ);
//     //console.log("el repdocutor para darle play");
//     //console.log(reproductorActivo);
//     reproducirVOZ(datos.id);
// }

// function reproducirVOZ(idGenerado) {
//     var media = reproductoresVOZ[idGenerado];
//     console.log("objeto reproductor generado");
//     if (media) {
//         media.volume = 1;
//         media.load();
//         media.muted = false;
//         const playPromise = media.play();
//         //        // console.log(playPromise);
//         const promise2 = playPromise.then(
//             function () {
//                 if (!reproduciendo) {
//                     reproduciendo = true;
//                     console.log("REPRODUCIENDO MP3 de la española nuevamente " + idGenerado + "");
//                     reproduciendo = false;
//                 }
//                 idxTurno++;
//                 if (idxTurno >= turnosParaSerLlamados.length) {
//                     idxTurno = 0;
//                 }
//             },
//             function () {
//                 playPromise.catch((error) => {
//                     if (error) {
//                         console.log("intentando cargar MP3 de la española nuevamente " + idGenerado);
//                         setTimeout(function () {
//                             reproducirVOZ(idGenerado);
//                         }, (media.duration * 1000));
//                     }
//                 });
//             }
//         );
//         //        if (playPromise !== null) {
//         //            playPromise.catch((error) => {
//         //                if (error) {
//         //                    registroAccionesConsola("intentando cargar MP3 de la española nuevamente " + idGenerado);
//         //                    setTimeout(function () {
//         //                        reproducirVOZ(idGenerado);
//         //                    }, 1234);
//         //                }
//         //            });
//         //        } else {
//         ////            if (!reproduciendo) {
//         //            registroAccionesConsola("REPRODUCIENDO MP3 de la española nuevamente " + idGenerado + "");
//         //            reproduciendo = true;
//         //            media.volume = 1;
//         //            media.muted = false;
//         //            media.play();
//         //            reproduciendo = false;
//         ////            }
//         //        }
//     }
// }















// Inicializa todo
document.addEventListener('DOMContentLoaded', () => {
    modalConfiguraciones = new bootstrap.Modal(document.getElementById('configModal'));
    cargarInformacionSedesZonasAtencion();
    if (localStorage.getItem('tiempoTurnosParaLlamar') && localStorage.getItem('tiempoTurnosLlamadoVoz') && localStorage.getItem('tiempoLlamadosTurnosAtencion') && localStorage.getItem('tiempoLlamadosSlider') && localStorage.getItem('sedeCCSM') && localStorage.getItem('zonaAtencion')) {
        hablar("Configuraciones cargadas correctamente. Iniciando monitor de turnos.");
        tiempoTurnosParaSerLlamados = localStorage.getItem('tiempoTurnosParaLlamar');
        tiempoTurnosLlamadoVoz = localStorage.getItem('tiempoTurnosLlamadoVoz');
        tiempoRefrescarTablaAtencion = localStorage.getItem('tiempoLlamadosTurnosAtencion');
        tiempoRefrescarSliderColas = localStorage.getItem('tiempoLlamadosSlider');
        tiempoParaExpandirVideo = localStorage.getItem('tiempoParaExpandirVideo') || 3600000; // 1 hora
        identificadorSede = localStorage.getItem('sedeCCSM');
        identificadorZonaAtencion = localStorage.getItem('zonaAtencion');
        document.getElementById('infoSede').textContent = identificadorSede;
        document.getElementById('infoZona').textContent = identificadorZonaAtencion;
        modalEle = document.getElementById('llamadoModal');
        modalLlamado = new bootstrap.Modal(modalEle);
        document.getElementById('formConfigPantalla').addEventListener("submit", guardarVariablesCofiguracion);

        // //Llamado periodico que verifica los turnos para llamar
        setInterval(() => {
            actualizarColaTurnosParaSerLlamandos();
        }, tiempoTurnosParaSerLlamados || 1000);
        controlLLamadoModal = realizarLlamadoModal();
        controlLlamadoVoz = realizarLlamadoVoz();
        // Llanado periordico que verifica las colas de atencion y las actualiza el slider si es necesario
        setInterval(() => {
            actualizarTurnosEnAtencion();
        }, tiempoRefrescarSliderColas || 3000);
        // Llamado periodico que actualiza la tabla de turnos que estan siendo atendidos
        setInterval(() => {
            actualizarTablaTurnosEnAtencion();
        }, tiempoRefrescarTablaAtencion || 2000);
        setInterval(() => {
            renderTarjetasTurnosEnColaDeAtencion();
        }, 5000);

        renderSliderTurnosEnAtencion();
        decirDatosTurnoLlamando();
    } else {
        hablar("Por favor, configura la sede y zona de atención para continuar.");
        modalConfiguraciones.show();
    }
});