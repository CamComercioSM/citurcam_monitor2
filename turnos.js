let turnosEnColasDeAtencion = [],
    turnosEnAtencion = [],
    turnosParaSerLlamados = [],
    llamadosExcedidos = [],
    modalLLamado = null,
    idxTurno = 0,
    turnoEnLlamado = [];

function realizarLlamado() {

    if (turnosParaSerLlamados.length === 0) {
        idxTurno = 0;
        reproductoresVOZ = [];
        modalLLamado.hide();
        return setTimeout(realizarLlamado, 1000);
    }
    if (idxTurno > turnosEnColasDeAtencion.length) {
        idxTurno = 0;
        setTimeout(realizarLlamado, 1000);
    }

    turnoEnLlamado = turnosParaSerLlamados[idxTurno];
    if (!turnoEnLlamado) {
        idxTurno = 0;
        return setTimeout(realizarLlamado, 1000);
    }

    renderLlamadosActivos(turnosParaSerLlamados);
    decirDatosTurnoLlamando(turnoEnLlamado);

    modalLLamado.show();

    setTimeout(() => {
        renderLlamadosActivos([]);
        idxTurno += 1;
        setTimeout(realizarLlamado, 4000);
    }, 5000);
}

// Renderiza slider de colas
let splideColas = null;
let splideRenderizado = false;
function renderSliderColasDeAtencion() {
    const slider = document.getElementById('sliderColas');

    if (!splideRenderizado) {
        slider.innerHTML = '';
        turnosEnColasDeAtencion.forEach((cola) => {
            const li = document.createElement('li');
            li.className = 'splide__slide d-flex';
            li.innerHTML = `
        <div class="card card-slider shadow p-3 mb-2 text-center mx-auto w-100">
          <div class="slider-title">${cola.nombre}</div>
          <div class="slider-qty">${cola.cantidad}</div>
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

    } else {
        const slidesOriginales = slider.querySelectorAll(
            '.splide__slide:not(.splide__slide--clone)'
        );

        slidesOriginales.forEach((slide, i) => {
            const datos = turnosEnColasDeAtencion[i];
            if (!datos) return;

            const titulo = slide.querySelector('.slider-title');
            const cantidad = slide.querySelector('.slider-qty');

            // Actualizar solo el contenido de texto
            if (titulo && cantidad) {
                titulo.textContent = datos.nombre;
                cantidad.textContent = datos.cantidad;
            }
        });
    }


    //     // Obtener cantidad por slide desde CSS
    //     const estilos = getComputedStyle(document.documentElement);
    //     const porSlide = parseInt(estilos.getPropertyValue('--colas-por-slide')) || 2;

    //     // Agrupar colas en slides
    //     for (let i = 0; i < turnosEnColasDeAtencion.length; i += porSlide) {
    //         const grupo = turnosEnColasDeAtencion.slice(i, i + porSlide);

    //         // Generar tarjetas dentro del slide
    //         const tarjetasHTML = grupo.map(cola => `
    //     <div class="card card-slider shadow p-2 mb-2 text-center col-10 col-md-6 col-lg-4 col-xl-3">
    //         <div class="slider-title mb-1">${cola.nombre}</div>
    //         <div class="slider-qty fw-bold text-primary">${cola.cantidad}</div>
    //         <small>pendientes</small>
    //     </div>
    // `).join('');

    //         // Agregar slide
    //         slider.innerHTML += `
    //       <div class="carousel-item${i === 0 ? ' active' : ''}">
    //         <div class="d-flex justify-content-center gap-1">
    //           ${tarjetasHTML}
    //         </div>
    //       </div>
    //     `;
    //     }
}

// Renderiza tabla de turnos en atención
function renderTablaTurnosEnAtencion() {
    const tbody = document.getElementById('tablaAtencion');
    tbody.innerHTML = '';

    // Obtener número de filas visibles desde CSS
    const estilos = getComputedStyle(document.documentElement);
    const maxFilas = parseInt(estilos.getPropertyValue('--filas-visibles')) || 5;

    // Si el array excede lo visible → rotar el array
    if (turnosEnAtencion.length > maxFilas) {
        // MOVER EL PRIMERO AL FINAL (rotación simple)
        const primero = turnosEnAtencion.shift();
        turnosEnAtencion.push(primero);
    }

    // Tomar solo las filas visibles
    const visibles = turnosEnAtencion.slice(0, maxFilas);

    // Render normal
    visibles.forEach(turno => {
        tbody.innerHTML += `
        <tr>
            <td>${turno.modulo}</td>
            <td>${turno.codigo}</td>
            <td>${turno.nombre}</td>
        </tr>
        `;
    });
}

// Renderiza llamados activos en el modal
function renderLlamadosActivos(llamadosActivosPorRenderizar) {
    if (llamadosActivosPorRenderizar !== turnosParaSerLlamados) return;
    const cont = document.getElementById('llamadosActivos');
    cont.innerHTML = '';

    // Definimos los colores por tipo
    const colores = {
        Prioritario: 'bg-danger',
        Afiliado: 'bg-success',
        General: 'bg-primary'
    };
    llamadosActivosPorRenderizar.forEach(llamado => {
        // Elegimos el color; si no existe tipo, usamos general
        const color = colores[llamado.tipo] || 'bg-primary';

        cont.innerHTML += `
      <div class="p-4 rounded-4 ${color} shadow text-white" style="min-width: 220px;">
        <h2>${llamado.modulo}</h2>
        <h3 class="display-4">${llamado.codigo}</h3>
        <p class="fs-2 mb-0">${llamado.nombre}</p>
      </div>
    `;
    });
}

window.conectarseEndPoint = async function (operacion, params = {}) {
    const api = 'data.php?';
    const searchParams = new URLSearchParams({
        operacion: operacion || '',
        ...params
    });
    const response = await fetch(api + searchParams.toString());
    if (!response.ok) {
        throw new Error('Error en la petición: ' + response.status);
    }
    const data = await response.json();
    return data;
}
//actualiza la cola de turnos que generan el llamado de modal
window.actualizarColaTurnosParaSerLlamandos = async function () {
    const turnosParaLlamar = await conectarseEndPoint('turnosParaSerLlamados');
    if (turnosParaLlamar === turnosParaSerLlamados) return;
    turnosParaSerLlamados = turnosParaLlamar.turnosParaSerLlamados || [];
    llamadosExcedidos = turnosParaSerLlamados;
}
// Actualiza el slider de colas de turnos
window.actualizarTurnosEnColaDeAtencion = async function () {
    const colasDeAtencion = await conectarseEndPoint('turnosEnColasDeAtencion');
    if (colasDeAtencion === turnosEnColasDeAtencion) return;
    turnosEnColasDeAtencion = colasDeAtencion.turnosEnColasDeAtencion || [];
    renderSliderColasDeAtencion();
}
// Actualiza la tabla de turnos que estan siendo atendidos
window.actualizarColaTurnosEnAtencion = async function () {
    const turnosParaTablaDeAtencion = await conectarseEndPoint('turnosEnAtencion');
    if (turnosParaTablaDeAtencion === turnosEnAtencion) return;
    turnosEnAtencion = turnosParaTablaDeAtencion.turnosEnAtencion || [];
    renderTablaTurnosEnAtencion();
}

// function registroAccionesConsola(TXT = "") {
//     let fecha = new Date();
//     document.getElementById('consola').innerHTML += ((fecha.toLocaleTimeString() + '; ' + TXT) + " <br /> ");
//     console.log(TXT);
// }
var reproduciendo = false;
window.idAleatorio = function () {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < 5; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}
window.hablar = function (textoParaDecir, idPersona = idAleatorio()) {
    if (textoParaDecir != "") {
        solicitarTextoAVoz(textoParaDecir, idPersona);
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

        reproducirRespuestaAPI(respuesta);
        console.log(reproductoresVOZ);

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
            $textoHablar = "Llamando al turno " + turnoEnLlamado.codigo;
            hablar($textoHablar, turnoEnLlamado.codigo);
            if (reproductoresVOZ[turnoEnLlamado.codigo]) {
                //reproducirVOZ(turnoEnLlamado.codigo);
                audio = reproductoresVOZ[turnoEnLlamado.codigo];
                audio.volume = 1;
                audio.muted = false;
                audio.load();
                audio.play().catch(err => {
                    console.warn('No se pudo reproducir audio:', err);
                });
            }

        }
    }
    setTimeout(decirDatosTurnoLlamando, (audio.duration * 1000) + 500);
    ////console.log("hablar "+ diciendo );
}
var reproductoresVOZ = [];
window.reproducirRespuestaAPI = function (respuesta) {
    if (respuesta) {
        var datos = JSON.parse(respuesta);
        if (reproductoresVOZ.length) {
            var reproductor = reproductoresVOZ[datos.id];
        } else {
            reproductoresVOZ[datos.id] = document.createElement('audio');
            reproductoresVOZ[datos.id].setAttribute('id', "sonidoEspanola" + datos.id);
            reproductoresVOZ[datos.id].setAttribute('src', datos.audio);
            reproductoresVOZ[datos.id].autoplay = true;
            reproductoresVOZ[datos.id].muted = true;
            reproductoresVOZ[datos.id].addEventListener("loadeddata", (event) => {
                console.log('va hablar primera vez ' + datos.id);
            });
        }
    }
}

function reproducirVOZ(idGenerado) {
    var media = reproductoresVOZ[idGenerado];
    //    console.log("objeto reproductor generado");
    if (media) {
        media.volume = 1;
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
                        }, 1234);
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
function abrirPantallaCompletaVideoYoutube() {
    let video;
    let temporizador = 50000; // 50 segundos
    let tiempoSinTurnos = 0;  // acumulador en ms

    video = new YT.Player('videoPlayList', {
        events: {
            'onReady': onPlayerReady
        }
    });

    function onPlayerReady() {
        video.mute();
        video.playVideo();

        // Revisar periódicamente si hay o no turnos
        setInterval(() => {
            if (turnosParaSerLlamados.length === 0) {
                // No hay turnos: acumulo tiempo "vacío"
                tiempoSinTurnos += 1000; // sumo 1 segundo

                if (tiempoSinTurnos >= temporizador && !document.fullscreenElement) {
                    fullscreenVideo();
                }
            } else {
                // Hay turnos: reseteo contador y salgo de fullscreen
                tiempoSinTurnos = 0;
                exitFullscreenVideo();
            }
            // Si el usuario sale con ESC, reiniciamos el contador
            document.addEventListener('fullscreenchange', () => {
                if (!document.fullscreenElement) {
                    tiempoSinTurnos = 0;
                }
            });
        }, 1000);

        function fullscreenVideo() {
            const iframe = document.getElementById('videoPlayList');
            if (iframe && iframe.requestFullscreen) {
                iframe.requestFullscreen();
            }
        }

        function exitFullscreenVideo() {
            if (document.fullscreenElement) {
                document.exitFullscreen();
            }
            tiempoSinTurnos = 0;
        }
    }
}

// Inicializa todo
document.addEventListener('DOMContentLoaded', () => {
    modalEle = document.getElementById('llamadoModal');
    modalLLamado = new bootstrap.Modal(modalEle);


    //Llamado periodico que verifica los turnos para llamar
    setInterval(() => {
        actualizarColaTurnosParaSerLlamandos();
    }, 1000);
    realizarLlamado();
    // Llanado periordico que verifica las colas de atencion y las actualiza el slider si es necesario
    setInterval(() => {
        actualizarTurnosEnColaDeAtencion();
    }, 3000);
    // Llamado periodico que actualiza la tabla de turnos que estan siendo atendidos
    setInterval(() => {
        actualizarColaTurnosEnAtencion();
    }, 2000);
    setTimeout(() => {
        decirDatosTurnoLlamando(turnoEnLlamado);
    }, 5000);


    setTimeout(abrirPantallaCompletaVideoYoutube, 7000);

});