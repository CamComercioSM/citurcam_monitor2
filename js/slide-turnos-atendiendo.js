
async function renderSliderTurnosEnAtencion() {
    const respuesta = await conectarseEndPoint('atendiendoPorModulosPorZonasAtencion', identificadorZonaAtencion);
    turnosEnAtencion = respuesta.DATOS || [];
    if (!splideRenderizado) {
        slider.innerHTML = '';
        turnosEnAtencion.forEach((cola) => {

            if (cola.turnoCODIGOCORTO === null || cola.turnoCODIGOCORTO === '') {
                cola.turnoCODIGOCORTO = '-';
            }
            const li = document.createElement('li');
            li.className = 'splide__slide d-flex';
            li.innerHTML = `
        <div class="card card-slider shadow p-3 mb-2 text-center mx-auto w-100">
          <div class="cola_${cola.moduloAtencionID} slider-title">${cola.moduloAtencionTITULO}</div>
          <div class="cola_${cola.moduloAtencionID} slider-qty">${cola.turnoCODIGOCORTO || '-'}</div>
          <div class="cola_${cola.moduloAtencionID} slider-nombre">${cola.personaNOMBRES || '-'}</div>
        </div>
      `;
            slider.appendChild(li);
        });

        // Montar Splide una sola vez
        console.log('Slides:', turnosEnAtencion.length);
        const totalSlides = turnosEnAtencion.length;
        splideColas = new Splide('#colasSlider', {
            type: 'loop',
            perPage: Math.min(5, totalSlides),
            perMove: 1,
            //autoplay: true,

            interval: 2500,   // tiempo entre movimientos
            speed: 5000,       // duración del desplazamiento 👈 CLAVE
            // pauseOnHover: false,
            // pauseOnFocus: false,
            arrows: false,
            pagination: false,
            gap: '1rem',      // ayuda a percibir movimiento
            
            drag: 'free',
            focus: 'center',
            
            autoScroll: {
                speed: -1,
                autoStart: true,
                rewind: true,                
                pauseOnHover: false,
            },

        }).mount(window.splide.Extensions);
        splideRenderizado = true;
    }
}



// Actualiza el slider de colas de turnos
window.actualizarTurnosEnAtencion = async function () {
    const respuesta = await conectarseEndPoint('atendiendoPorModulosPorZonasAtencion', identificadorZonaAtencion);
    turnosEnAtencion = respuesta.DATOS || [];
    turnosEnAtencion.forEach((turno) => {
        if (turno.turnoCODIGOCORTO === null || turno.turnoCODIGOCORTO === '') {
            turno.turnoCODIGOCORTO = '-';
            turno.personaNOMBRES = '-';
        }

        const cantidades = slider.querySelectorAll(`.cola_${turno.moduloAtencionID}.slider-qty`);        
        cantidades.forEach((nodo) => {
            nodo.textContent = turno.turnoCODIGOCORTO;
        });
        const nombre = slider.querySelectorAll(`.cola_${turno.moduloAtencionID}.slider-nombre`);        
        nombre.forEach((nodo) => {
            nodo.textContent = turno.personaNOMBRES;
        });
    });
};

