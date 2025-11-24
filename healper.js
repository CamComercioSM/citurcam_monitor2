let colas = [],
    turnosAtencion = [],
    llamadosActivos = [],
    llamadosExcedidos = [],
    modalLLamado = null;




window.cargarDatos = async function () {
    const data = await window.conectarseEndPoint('turnosEnLlamado');
    // Turnos por llamar  del servidor
    const llamadosActivos = data.turnosPorLlamar || [];    
    // Limpiar estructuras con base en los turnos remotos
    const codigosRemotos = new Set(remotos.map(t => t.codigo));
    // Si un código ya no existe en turnosEspera, sácalo de llamadosExcedidos
    llamadosExcedidos = llamadosExcedidos.filter(t => codigosRemotos.has(t.codigo));
    
    for (const t of llamadosActivos) {
        if (!codigosRemotos.has(t.codigo)) continue;       // ya no existe en el servidor
        if (codigosExcedidos.has(t.codigo)) continue;      // excedido
        if (codigosEnNuevaCola.has(t.codigo)) continue;    // evitar duplicados
        nuevaCola.push(t);
        codigosEnNuevaCola.add(t.codigo);
    }























    const data = await window.conectarseEndPoint('mock');
    const data = await window.conectarseEndPoint('mock');

  
    
    // Convertir en sets para facilitar
    const codigosExcedidos = new Set(
        llamadosExcedidos
            .filter(t => t.llamados >= 2)
            .map(t => t.codigo)
    );
    // Limpiar la cola LOCAL sin perder el orden
    const nuevaCola = [];
    const codigosEnNuevaCola = new Set();

    for (const t of llamadosActivos) {
        if (!codigosRemotos.has(t.codigo)) continue;       // ya no existe en el servidor
        if (codigosExcedidos.has(t.codigo)) continue;      // excedido
        if (codigosEnNuevaCola.has(t.codigo)) continue;    // evitar duplicados
        nuevaCola.push(t);
        codigosEnNuevaCola.add(t.codigo);
    }
    llamadosActivos = data;
    colas = data.colas || [];
    turnosAtencion = data.turnosAtencion || [];
};

window.conectarseEndPoint = async function(operacion, params = {}) {
    const api = 'data.php?';
     const searchParams = new URLSearchParams({
        operacion: operacion || '',
        ...params
    });
    const response = await fetch( api + searchParams.toString());
    if (!response.ok) {
        throw new Error('Error en la petición: ' + response.status);
    }
    return await response.json();   
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