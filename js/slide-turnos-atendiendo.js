
async function renderSliderTurnosEnAtencion() {
    const respuesta = await conectarseEndPoint('atendiendoPorModulosPorZonasAtencion', identificadorZonaAtencion);
    turnosEnAtencion = respuesta.DATOS || [];
    if (!splideRenderizado) {
        slider.innerHTML = '';
        turnosEnAtencion.forEach((cola) => {
            if (!cola.turnoCODIGOCORTO) {
                cola.turnoCODIGOCORTO = '-';
            }
            const li = document.createElement('li');
            li.className = 'splide__slide d-flex';
            li.innerHTML = `
        <div class="card card-slider shadow p-3 mb-2 text-center mx-auto w-100">
          <div class="cola_${cola.turnoTipoServicioID} slider-title">${cola.moduloAtencionTITULO}</div>
          <div class="cola_${cola.turnoTipoServicioID} slider-qty">${cola.turnoCODIGOCORTO}</div>
        </div>
      `;
            slider.appendChild(li);
        });

        // Montar Splide una sola vez
        splideColas = new Splide('#colasSlider', {
            type: 'loop',
            perPage: 5,
            perMove: 1,
            autoplay: true,
            interval: 1000,
            pauseOnHover: false,
        }).mount();

        splideRenderizado = true;

    }
}



// Actualiza el slider de colas de turnos
window.actualizarTurnosEnAtencion = async function () {
    const respuesta = await conectarseEndPoint('mostrarTotalTurnosPendientesPorZonasPorTiposServicios', identificadorZonaAtencion);
    turnosEnAtencion = respuesta.DATOS || [];
    turnosEnAtencion.forEach((turno) => {
        const cantidades = slider.querySelectorAll(`.cola_${turno.turnoTipoServicioID}.slider-qty`);

        cantidades.forEach((nodo) => {
            nodo.textContent = turno.turnosPENDIENTES;
        });
    });
};



async function actualizarTablaTurnosEnAtencion() {
    const turnosParaTablaDeAtencion = await conectarseEndPoint('mostrarTotalTurnosPendientesPorZonasPorTiposServicios', identificadorZonaAtencion);
    const nuevosTurnos = turnosParaTablaDeAtencion.DATOS || [];

    const jsonNuevo = JSON.stringify(nuevosTurnos);
    if (jsonNuevo !== ultimoEstadoTablaTurnos) {
        turnosEnColasDeAtencion = nuevosTurnos;
        ultimoEstadoTablaTurnos = jsonNuevo;
    }

}