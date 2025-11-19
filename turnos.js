let colas = [];
let turnosAtencion = [];
let llamadosActivos = [];
let llamadosExcedidos = [];
let modalLLamado = null;
let lastColasJson = '';
let lastTurnosAtencionJson = '';

async function cargarDatos() {
    const response = await fetch('data.php');
    const data = await response.json();

    // Turnos del servidor
    const remotos = data.turnosEspera;

    // 1) Convertir en sets para facilitar
    const codigosRemotos = new Set(remotos.map(t => t.codigo));
    const codigosExcedidos = new Set(
        llamadosExcedidos
            .filter(t => t.llamados >= 2)
            .map(t => t.codigo)
    );

    // 2) Limpiar la cola LOCAL sin perder el orden
    const nuevaCola = [];
    const codigosEnNuevaCola = new Set();

    for (const t of llamadosActivos) {
        if (!codigosRemotos.has(t.codigo)) continue;
        if (codigosExcedidos.has(t.codigo)) continue;
        if (codigosEnNuevaCola.has(t.codigo)) continue;
        nuevaCola.push(t);
        codigosEnNuevaCola.add(t.codigo);
    }

    // 3) Agregar turnos NUEVOS al final
    for (const t of remotos) {
        if (!codigosEnNuevaCola.has(t.codigo) && !codigosExcedidos.has(t.codigo)) {
            nuevaCola.push(t);
            codigosEnNuevaCola.add(t.codigo);
        }
    }

    // 4) Ahora sí, actualizar la cola REAL
    llamadosActivos = nuevaCola;

    const nuevasColasJson = JSON.stringify(data.colas || []);
    const nuevosTurnosAtencionJson = JSON.stringify(data.turnosAtencion || []);

    let debeRenderizarColas = false;
    let debeRenderizarTurnos = false;

    if (nuevasColasJson !== lastColasJson) {
        colas = data.colas || [];
        lastColasJson = nuevasColasJson;
        debeRenderizarColas = true;
    }

    if (nuevosTurnosAtencionJson !== lastTurnosAtencionJson) {
        turnosAtencion = data.turnosAtencion || [];
        lastTurnosAtencionJson = nuevosTurnosAtencionJson;
        debeRenderizarTurnos = true;
    }

    // Renderizar SOLO si hay cambios
    if (debeRenderizarColas) {
        renderSliderColas(colas);
    }

    if (debeRenderizarTurnos) {
        renderTurnosAtencion(turnosAtencion);
    }
}


// Renderiza slider de colas
function renderSliderColas(colas) {
    const slider = document.getElementById('sliderColas');
    slider.innerHTML = '';

    // Obtener cantidad por slide desde CSS
    const estilos = getComputedStyle(document.documentElement);
    const porSlide = parseInt(estilos.getPropertyValue('--colas-por-slide')) || 2;

    // Agrupar colas en slides
    for (let i = 0; i < colas.length; i += porSlide) {
        const grupo = colas.slice(i, i + porSlide);

        // Generar tarjetas dentro del slide
        const tarjetasHTML = grupo.map(cola => `
      <div class="card card-slider shadow p-3 mb-2 text-center mx-auto">
        <div class="slider-title mb-1">${cola.nombre}</div>
        <div class="slider-qty fw-bold text-primary">${cola.cantidad}</div>
        <small>pendientes</small>
      </div>
    `).join('');

        // Agregar slide
        slider.innerHTML += `
      <div class="carousel-item${i === 0 ? ' active' : ''}">
        <div class="d-flex justify-content-center gap-3">
          ${tarjetasHTML}
        </div>
      </div>
    `;
    }
}



// Renderiza tabla de turnos en atención
function renderTurnosAtencion(turnosAtencion) {
    const tbody = document.getElementById('tablaAtencion');
    tbody.innerHTML = '';

    // Obtener número de filas visibles desde CSS
    const estilos = getComputedStyle(document.documentElement);
    const maxFilas = parseInt(estilos.getPropertyValue('--filas-visibles')) || 5;

    // Si el array excede lo visible → rotar el array
    if (turnosAtencion.length > maxFilas) {
        // MOVER EL PRIMERO AL FINAL (rotación simple)
        const primero = turnosAtencion.shift();
        turnosAtencion.push(primero);
    }

    // Tomar solo las filas visibles
    const visibles = turnosAtencion.slice(0, maxFilas);

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
function renderLlamadosActivos(llamadosActivos) {
    const cont = document.getElementById('llamadosActivos');
    cont.innerHTML = '';

    // Definimos los colores por tipo
    const colores = {
        prioritario: 'bg-danger',
        afiliado: 'bg-success',
        general: 'bg-primary'
    };
    llamadosActivos.forEach(llamado => {
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


function realizarLlamado() {
    if (llamadosActivos.length === 0) {
        return setTimeout(realizarLlamado, 2000);
    }

    const turno = llamadosActivos.shift();
    if (!turno) {
        return setTimeout(realizarLlamado, 3000);
    }

    let llamadoExistente = llamadosExcedidos.find(t => t.codigo === turno.codigo);

    if (llamadoExistente && llamadoExistente.llamados >= 2) {
        // ya excedido, no se reencola
        return setTimeout(realizarLlamado, 5000);
    }

    if (llamadoExistente) {
        llamadoExistente.llamados += 1;
    } else {
        llamadosExcedidos.push({
            ...turno,
            llamados: 1
        });
    }

    renderLlamadosActivos([turno]);
    modalLLamado.show();

    setTimeout(() => {
        renderLlamadosActivos([]);
        modalLLamado.hide();

        // solo lo reinsertamos si aún no está excedido
        const exedido = llamadosExcedidos.find(t => t.codigo === turno.codigo);
        if (!(exedido && exedido.llamados >= 2)) {
            llamadosActivos.splice(1, 0, turno);
        }

        setTimeout(realizarLlamado, 4000);
    }, 5000);
}


// Inicializa todo
document.addEventListener('DOMContentLoaded', () => {
    modalEle = document.getElementById('llamadoModal');
    modalLLamado = new bootstrap.Modal(modalEle);

    realizarLlamado();
    setInterval(cargarDatos, 3000); // Actualiza cada 3 segundos 
    setInterval(() => {renderTurnosAtencion(turnosAtencion)}, 7000);
});