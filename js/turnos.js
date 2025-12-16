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
            perPage: 5,
            perMove: 5,
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
        if (turno.turnoCODIGOCORTO === null) {
            turno.turnoCODIGOCORTO = '-';
            turno.personaNOMBRES = '-';
        }
        tbody.innerHTML += `
        <tr>
            <td>${turno.moduloAtencionTITULO}</td>
            <td>${turno.turnoCODIGOCORTO}</td>
            <td>${turno.personaNOMBRES}</td>
        </tr>
        `;
    });
}
// actualizarTablaTurnosEnAtencion().then(() => {
//     renderTablaTurnosEnAtencion();
// });


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
    }

}

window.reproducirTimbreTipoDeTurno = function () {
    let tiembreGeneral = document.getElementById('timbreTurnoGeneral');
    let tiembre = document.getElementById('timbreTurnoGeneral');
}





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








//de la voz


let colaVoz = [];
let audioEnReproduccion = false;
let audioActual = null;
function realizarLlamadoVoz() {
    if (audioEnReproduccion) {
        return setTimeout(realizarLlamadoVoz, tiempoTurnosLlamadoVoz || 1000);
    }

    if (turnosParaSerLlamados.length === 0) {
        idxTurno = 0;
        colaVoz = [];
        return setTimeout(realizarLlamadoVoz, tiempoTurnosLlamadoVoz || 1000);
    }

    turnoEnLlamado = turnosParaSerLlamados[idxTurno];
    if (turnoEnLlamado) {
        decirDatosTurnoLlamando();
    }

    return setTimeout(realizarLlamadoVoz, tiempoTurnosLlamadoVoz || 1000);
}
function decirDatosTurnoLlamando() {
    let audio = {};
    let $textoHablar = "";
    if ((turnosParaSerLlamados.length) === 0) return;
    if (turnosParaSerLlamados.length > 0) {
        if (turnoEnLlamado) {
            if (turnoEnLlamado.tipo === "Cita") {
                $textoHablar = "Llamando a la cita " + turnoEnLlamado.turnoCODIGOCORTO + " " + turnoEnLlamado.personaNOMBRES + ";" + turnoEnLlamado.moduloAtencionTITULO;
                sonarTimbreAfiliados();
            } else {
                $textoHablar = "Llamando a " + turnoEnLlamado.personaNOMBRES + " con el turno " + turnoEnLlamado.turnoCODIGOCORTO + "; Modulo " + turnoEnLlamado.moduloAtencionTITULO + ".";
                sonarTimbreGeneral();
            }
            hablar($textoHablar, turnoEnLlamado.turnoCODIGOATENCION);
        }
    }
    console.log("Llamando al turno: ");
    console.log(turnoEnLlamado);
    console.log(idxTurno);
}
function hablar(textoParaDecir, idTurno) {
    if (!textoParaDecir) return;

    // Evitar duplicados en cola
    const existe = colaVoz.some(item => item.idTurno === idTurno);
    if (existe) return;

    colaVoz.push({
        texto: textoParaDecir,
        idTurno: idTurno
    });

    procesarColaVoz();
}
async function procesarColaVoz() {
    if (audioEnReproduccion) return;
    if (colaVoz.length === 0) return;

    audioEnReproduccion = true;
    const item = colaVoz.shift();

    try {
        const audioURL = await solicitarTextoAVoz(item.texto, item.idTurno);
        reproducirAudioSecuencial(audioURL);
    } catch (e) {
        console.error('Error en TTS:', e);
        audioEnReproduccion = false;
        procesarColaVoz();
    }
}
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
        // Retornar si se necesita la respuesta para otros usos        
        const datos = JSON.parse(respuesta);
        return datos.audio;
    } catch (error) {
        // Manejo de errores de red o de servidor
        console.error('Error al solicitar texto a voz:', error);
    }
}
function reproducirAudioSecuencial(src) {
    if (audioActual) {
        audioActual.pause();
        audioActual = null;
    }

    audioActual = new Audio(src);
    audioActual.volume = 1;

    audioActual.onended = () => {
        audioEnReproduccion = false;
        audioActual = null;

        idxTurno++;
        if (idxTurno >= turnosParaSerLlamados.length) {
            idxTurno = 0;
        }

        procesarColaVoz();
    };

    audioActual.onerror = () => {
        console.error('Error reproduciendo audio');
        audioEnReproduccion = false;
        procesarColaVoz();
    };

    audioActual.play();
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
            actualizarTurnosEnColaDeAtencion();
        }, tiempoRefrescarSliderColas || 3000);
        // Llamado periodico que actualiza la tabla de turnos que estan siendo atendidos
        setInterval(() => {
            actualizarTablaTurnosEnAtencion();
        }, tiempoRefrescarTablaAtencion || 2000);
        setInterval(() => {
            renderTablaTurnosEnAtencion();
        }, 5000);

        renderSliderColasDeAtencion();        
        decirDatosTurnoLlamando();
    } else {
        hablar("Por favor, configura la sede y zona de atención para continuar.");
        modalConfiguraciones.show();
    }
});