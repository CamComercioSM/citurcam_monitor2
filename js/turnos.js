let turnosEnColasDeAtencion = [],
    turnosEnAtencion = [],
    turnosParaSerLlamados = [],
    llamadosExcedidos = [],
    modalLlamado = null,
    modalConfiguraciones = null,
    idxTurno = 0,
    turnoEnLlamado = [];
let ultimoEstadoTablaTurnos = null;
let ultimoEstadoColaParaLlamar = null;
var tiempoTurnosParaSerLlamados,
    tiempoRefrescarTablaAtencion,
    tiempoRefrescarSliderColas,
    identificadorSede,
    identificadorZonaAtencion;
var reproductoresVOZ = [];

// Renderiza slider de colas
let splideColas = null;
let splideRenderizado = false;
const slider = document.getElementById('sliderColas');

function realizarLlamado() {
    console.log(turnosParaSerLlamados);

    if (turnosParaSerLlamados.length === 0) {
        idxTurno = 0;
        reproductoresVOZ = [];
        modalLlamado.hide();
        return setTimeout(realizarLlamado, tiempoTurnosParaSerLlamados || 1000);
    }
    if (idxTurno > turnosEnColasDeAtencion.length) {
        idxTurno = 0;
        setTimeout(realizarLlamado, tiempoTurnosParaSerLlamados || 1000);
    }

    turnoEnLlamado = turnosParaSerLlamados[idxTurno];
    if (!turnoEnLlamado) {
        idxTurno = 0;
        return setTimeout(realizarLlamado, tiempoTurnosParaSerLlamados || 1000);
    }
    decirDatosTurnoLlamando(turnoEnLlamado);
    renderLlamadosActivos(turnosParaSerLlamados);
    modalLlamado.show();

    setTimeout(() => {
        renderLlamadosActivos([]);
        idxTurno += 1;
        setTimeout(realizarLlamado, 4000);
    }, 5000);
}

async function renderSliderColasDeAtencion() {
    const respuesta = await conectarseEndPoint('mostrarTotalTurnosPendientesPorZonasPorTiposServicios', identificadorZonaAtencion);
    turnosEnColasDeAtencion = respuesta.DATOS || [];
    if (!splideRenderizado) {
        slider.innerHTML = '';
        turnosEnColasDeAtencion.forEach((cola) => {
            const li = document.createElement('li');
            li.className = 'splide__slide d-flex';
            li.innerHTML = `
        <div class="card card-slider shadow p-3 mb-2 text-center mx-auto w-100">
          <div class="cola_${cola.turnoTipoServicioID} slider-title">${cola.turnoTipoServicioTITULO}</div>
          <div class="cola_${cola.turnoTipoServicioID} slider-qty">${cola.turnosPENDIENTES}</div>
          <small>pendientes</small>
        </div>
      `;
            slider.appendChild(li);
        });

        // Montar Splide una sola vez
        splideColas = new Splide('#colasSlider', {
            type: 'loop',
            perPage: 3,
            perMove: 1,
            autoplay: true,
            interval: 3000,
            pauseOnHover: false,
        }).mount();

        splideRenderizado = true;

    }
}

// Renderiza tabla de turnos en atención
function renderTablaTurnosEnAtencion() {
    const tbody = document.getElementById('tablaAtencion');
    tbody.innerHTML = '';

    const estilos = getComputedStyle(document.documentElement);
    const maxFilas = parseInt(estilos.getPropertyValue('--filas-visibles')) || 5;

    // rotación del arreglo que ya tenemos en memoria
    if (turnosEnAtencion.length > maxFilas) {
        const primero = turnosEnAtencion.shift();
        turnosEnAtencion.push(primero);
    }

    const visibles = turnosEnAtencion.slice(0, maxFilas);

    visibles.forEach(turno => {
        tbody.innerHTML += `
        <tr>
            <td>${turno.moduloAtencionTITULO}</td>
            <td>${turno.turnoCODIGOCORTO}</td>
            <td>${turno.personaNOMBRES}</td>
        </tr>
        `;
    });
}
actualizarTablaTurnosEnAtencion().then(() => {
    renderTablaTurnosEnAtencion();
});


// Renderiza llamados activos en el modal
function renderLlamadosActivos(llamadosActivosPorRenderizar) {
    if (llamadosActivosPorRenderizar !== turnosParaSerLlamados) return;
    const cont = document.getElementById('llamadosActivos');
    cont.innerHTML = '';

    // Definimos los colores por tipo
    const colores = {
        Prioritario: 'bg-danger',
        Afiliado: 'bg-success',
        General: 'bg-primary',
        Cita: 'bg-success'
    };
    llamadosActivosPorRenderizar.forEach(llamado => {
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
}

//actualiza la cola de turnos que generan el llamado de modal
window.actualizarColaTurnosParaSerLlamandos = async function () {
    //const resp = await conectarseEndPoint('mostrarTurnosLlamandoZonasAtencion',identificadorZonaAtencion);
    const res = await fetch('data.php?operacion=turnosParaSerLlamados');
    const resp = await res.json();

    const datos = resp.DATOS || [];
    const turnos = datos[0] || [];
    const citas = datos[1] || [];

    // Si vienen citas → armamos los elementos a partir de ellas
    if (citas.length > 0) {
        const armados = citas.map(cita => {
            const ident = cita.personaIDENTIFICACION || "";
            const ultimos3 = ident.toString().slice(-3);  
            return {
                tipo: "Cita",
                moduloAtencionTITULO: cita.moduloAtencionTITULO || cita.modulo || "",
                turnoCODIGOCORTO: ultimos3,
                personaNOMBRES: cita.personaNOMBRES || cita.nombre || ""
            };
        });

        const jsonNuevo = JSON.stringify(armados);

        if (jsonNuevo !== ultimoEstadoColaParaLlamar) {
            turnosParaSerLlamados = armados;
            ultimoEstadoColaParaLlamar = jsonNuevo;
        }
    }

    if (turnos.length > 0) {
        const jsonNuevo = JSON.stringify(turnos);
        if (jsonNuevo !== ultimoEstadoColaParaLlamar) {
            turnosParaSerLlamados = turnos;
            ultimoEstadoColaParaLlamar = jsonNuevo;
        }
    }
};

// Actualiza el slider de colas de turnos
window.actualizarTurnosEnColaDeAtencion = async function () {
    const respuesta = await conectarseEndPoint('mostrarTotalTurnosPendientesPorZonasPorTiposServicios', identificadorZonaAtencion);
    turnosEnColasDeAtencion = respuesta.DATOS || [];
    turnosEnColasDeAtencion.forEach((turno) => {
        const cantidades = slider.querySelectorAll(`.cola_${turno.turnoTipoServicioID}.slider-qty`);

        cantidades.forEach((nodo) => {
            nodo.textContent = turno.turnosPENDIENTES;
        });
    });
};

async function actualizarTablaTurnosEnAtencion() {
    const turnosParaTablaDeAtencion = await conectarseEndPoint('atendiendoPorModulosPorZonasAtencion', identificadorZonaAtencion);
    const nuevosTurnos = turnosParaTablaDeAtencion.DATOS || [];

    const jsonNuevo = JSON.stringify(nuevosTurnos);
    if (jsonNuevo !== ultimoEstadoTablaTurnos) {
        turnosEnAtencion = nuevosTurnos;
        ultimoEstadoTablaTurnos = jsonNuevo;
        console.log('Tabla de turnos en atención actualizada');
    }

}
// function registroAccionesConsola(TXT = "") {
//     let fecha = new Date();
//     document.getElementById('consola').innerHTML += ((fecha.toLocaleTimeString() + '; ' + TXT) + " <br /> ");
//     console.log(TXT);
// }

// Se recomienda envolver el llamado en una función async para usar await
async function solicitarTextoAVoz(textoParaDecir, idPersona) {
    try {
        // Llamada POST al endpoint usando fetch
        const response = await fetch("https://monitor.citurcam.com/apis/text-to-speech.php", {
            method: "POST",
            headers: {
                // Formato de envío tipo formulario tradicional
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams({
                texto: textoParaDecir,
                persona: idPersona
            }),
            // Los siguientes parámetros de jQuery no aplican en fetch:
            // async: true, cache: true, timeout: 234567
        });

        // Leer la respuesta como texto (puede ser la URL o datos del MP3)
        const respuesta = await response.text();

        reproducirRespuestaAPI(respuesta);
        // Retornar si se necesita la respuesta para otros usos
        return respuesta;

    } catch (error) {
        // Manejo de errores de red o de servidor
        console.error('Error al solicitar texto a voz:', error);
    }
}

function decirDatosTurnoLlamando(turnoEnLlamado) {
    let audio = {};
    if ((turnosParaSerLlamados.length) === 0) return;
    if (turnosParaSerLlamados.length > 0) {
        if (turnoEnLlamado) {
            if (turnoEnLlamado.tipo === "Cita") {
                $textoHablar = "Llamando a la cita de "  + turnoEnLlamado.turnoCODIGOCORTO + " " + turnoEnLlamado.personaNOMBRES;
            } else {
                $textoHablar = "Llamando al turno " + turnoEnLlamado.turnoCODIGOCORTO + " " + turnoEnLlamado.personaNOMBRES;
            }
            hablar($textoHablar, turnoEnLlamado.turnoCODIGOATENCION);

            if (reproductoresVOZ[turnoEnLlamado.turnoCODIGOATENCION]) {
                reproducirVOZ(turnoEnLlamado.turnoCODIGOATENCION);
                // audio = reproductoresVOZ[turnoEnLlamado.turnoCODIGOATENCION];
                // audio.volume = 1;
                // audio.muted = false;
                // audio.load();
                // audio.play().catch(err => {
                //     console.warn('No se pudo reproducir audio:', err);
                // });
            }
        }
    }
    setTimeout(decirDatosTurnoLlamando, (audio.duration * 1000) + 2000);
    ////console.log("hablar "+ diciendo );
}

function reproducirVOZ(idGenerado) {
    var media = reproductoresVOZ[idGenerado];
    //    console.log("objeto reproductor generado");
    if (media) {
        media.volume = 1;
        media.load();
        media.muted = false;
        const playPromise = media.play();
        //        console.log(playPromise);
        const promise2 = playPromise.then(
            function () {
                if (!reproduciendo) {
                    reproduciendo = true;
                    //registroAccionesConsola("REPRODUCIENDO MP3 de la española nuevamente " + idGenerado + "");
                    reproduciendo = false;
                }
            },
            function () {
                playPromise.catch((error) => {
                    if (error) {
                        //registroAccionesConsola("intentando cargar MP3 de la española nuevamente " + idGenerado);
                        setTimeout(function () {
                            reproducirVOZ(idGenerado);
                        }, (media.duration * 1000) + 2000);
                    }
                });
            }
        );


        //        if (playPromise !== null) {
        //            playPromise.catch((error) => {
        //                if (error) {
        //                    registroAccionesConsola("intentando cargar MP3 de la española nuevamente " + idGenerado);
        //                    setTimeout(function () {
        //                        reproducirVOZ(idGenerado);
        //                    }, 1234);
        //                }
        //            });
        //        } else {
        ////            if (!reproduciendo) {
        //            registroAccionesConsola("REPRODUCIENDO MP3 de la española nuevamente " + idGenerado + "");
        //            reproduciendo = true;
        //            media.volume = 1;
        //            media.muted = false;
        //            media.play();
        //            reproduciendo = false;
        ////            }
        //        }
    }
}

var video;
let videoExpandido = false;
var tiempoParaExpandirVideo = 3600000; // 1 hora
var tiempoSinTurnos = 0;
function abrirPantallaCompletaVideoYoutube() {
    video = new YT.Player('videoPlayList', {
        events: {
            'onReady': onPlayerReady
        }
    });

}
function onPlayerReady() {
    video.mute();
    video.playVideo();

    // Revisar periódicamente si hay o no turnos
    setInterval(() => {
        if (turnosParaSerLlamados.length === 0) {
            // No hay turnos: acumulo tiempo "vacío"
            tiempoSinTurnos += 1000; // sumo 1 segundo

            if (tiempoSinTurnos >= tiempoParaExpandirVideo && !document.fullscreenElement) {
                expandirVideo();
            }
        } else {
            // Hay turnos: reseteo contador y salgo de fullscreen
            tiempoSinTurnos = 0;
            contraerVideo();
        }
        // Si el usuario sale con ESC, reiniciamos el contador
        document.addEventListener('keydown', (event) => {
            if (event.key === "Escape") {
                tiempoSinTurnos = 0;
                contraerVideo();
            }
        });
    }, 1000);

}
function expandirVideo() {
    if (videoExpandido) return;
    document.body.classList.add('video-expand-active');
    videoExpandido = true;
}

function contraerVideo() {
    if (!videoExpandido) return;
    document.body.classList.remove('video-expand-active');
    videoExpandido = false;
    tiempoSinTurnos = 0;
}

function guardarVariablesCofiguracion() {

    var sede = document.getElementById('sedesCCSM').value;
    var zona = document.getElementById('zonasAtencion').value;
    var tiempoLlamadosSlider = document.getElementById('tiempoLlamadosSlider').value || null;
    var tiempoLlamadosTurnosAtencion = document.getElementById('tiempoLlamadosTurnosAtencion').value;
    var tiempoTurnosParaLlamar = document.getElementById('tiempoTurnosParaLlamar').value;
    var tiempoParaExpandirVideo = document.getElementById('tiempoParaExpandirVideo').value;

    localStorage.setItem('sedeCCSM', sede);
    localStorage.setItem('zonaAtencion', zona);
    localStorage.setItem('tiempoLlamadosSlider', tiempoLlamadosSlider * 1000);
    localStorage.setItem('tiempoLlamadosTurnosAtencion', tiempoLlamadosTurnosAtencion * 1000);
    localStorage.setItem('tiempoTurnosParaLlamar', tiempoTurnosParaLlamar * 1000);
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


// Inicializa todo
document.addEventListener('DOMContentLoaded', () => {
    modalConfiguraciones = new bootstrap.Modal(document.getElementById('configModal'));
    cargarInformacionSedesZonasAtencion();
    if (localStorage.getItem('tiempoTurnosParaLlamar') && localStorage.getItem('tiempoLlamadosTurnosAtencion') && localStorage.getItem('tiempoLlamadosSlider') && localStorage.getItem('sedeCCSM') && localStorage.getItem('zonaAtencion')) {
        tiempoTurnosParaSerLlamados = localStorage.getItem('tiempoTurnosParaLlamar');
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
        //Llamado periodico que verifica los turnos para llamar
        setInterval(() => {
            actualizarColaTurnosParaSerLlamandos();
        }, tiempoTurnosParaSerLlamados || 1000);
        realizarLlamado();
        // Llanado periordico que verifica las colas de atencion y las actualiza el slider si es necesario
        setInterval(() => {
            actualizarTurnosEnColaDeAtencion();
        }, tiempoRefrescarSliderColas || 3000);
        // Llamado periodico que actualiza la tabla de turnos que estan siendo atendidos
        setInterval(() => {
            actualizarTablaTurnosEnAtencion();
        }, tiempoRefrescarTablaAtencion || 2000);
        setInterval(() => {
            renderTablaTurnosEnAtencion();
        }, 5000);
        setTimeout(() => {
            decirDatosTurnoLlamando(turnoEnLlamado);
        }, 1500);

        renderSliderColasDeAtencion();
        setTimeout(abrirPantallaCompletaVideoYoutube, 7000);
    } else {
        modalConfiguraciones.show();
    }
});