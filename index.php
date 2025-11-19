<!DOCTYPE html>
<html lang="es">

<head>
  <meta charset="UTF-8">
  <title>Monitor de Turnos - SICAM</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <!-- Bootstrap 5 CDN -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
  <style>
    body {
      background: #f7f7fc;
    }

    .carousel-item {
      min-height: 120px;
    }

    .slider-title {
      font-size: 1.15rem;
    }

    .slider-qty {
      font-size: 2.5rem;
    }

    .card-slider {
      min-width: 200px;
    }

    .modal-content {
      background: #1a233a !important;
    }

    .modal-body {
      color: #fff !important;
    }

    @media (max-width: 768px) {
      .slider-qty {
        font-size: 2rem;
      }
    }
  </style>
</head>

<body>
  <div class="container-fluid p-0 vh-100 bg-light">
    <!-- HEADER -->
    <div class="row m-0 p-2 align-items-start" style="height: 25vh; min-height: 150px;">
      <!-- Slider colas (izquierda) -->
      <div class="col-8 col-md-6 d-flex align-items-center">
        <div id="colasSlider" class="carousel slide w-100" data-bs-ride="carousel">
          <div class="carousel-inner" id="sliderColas">
            <!-- Renderizado por JS -->
          </div>
          <button class="carousel-control-prev" type="button" data-bs-target="#colasSlider" data-bs-slide="prev">
            <span class="carousel-control-prev-icon"></span>
          </button>
          <button class="carousel-control-next" type="button" data-bs-target="#colasSlider" data-bs-slide="next">
            <span class="carousel-control-next-icon"></span>
          </button>
        </div>
      </div>
      <!-- YouTube player (derecha) -->
      <div class="col-4 col-md-6 d-flex justify-content-end">
        <div class="ratio ratio-16x9" style="max-width: 380px; min-width: 220px;">
          <iframe src="https://www.youtube.com/embed/videoseries?list=PLbpi6ZahtOH6Blw3rgZ08mCw5S0kWMQkE"
            allowfullscreen></iframe>
        </div>
      </div>
    </div>
    <!-- TABLA TURNOS EN ATENCIÓN -->
    <div class="row m-0 p-3" style="height: 50vh; min-height: 300px;">
      <div class="col-12">
        <div class="card shadow-lg rounded-4">
          <div class="card-header bg-primary text-white">
            <h4 class="mb-0">Turnos en Atención</h4>
          </div>
          <div class="card-body p-0">
            <table class="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th>Módulo</th>
                  <th>Código Turno</th>
                  <th>Nombre</th>
                </tr>
              </thead>
              <tbody id="tablaAtencion">
                <!-- Renderizado por JS -->
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    <!-- MODAL LLAMADO -->
    <div class="modal fade" id="llamadoModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-fullscreen">
        <div class="modal-content bg-dark text-white text-center">
          <div class="modal-body d-flex flex-column justify-content-center align-items-center" style="height: 90vh;">
            <h1 class="display-1 fw-bold mb-4">¡Turno en Llamado!</h1>
            <div id="llamadosActivos" class="w-100 d-flex flex-wrap justify-content-center gap-4">
              <!-- Renderizado por JS -->
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Bootstrap Bundle + Popper -->
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
  <script>
    let colas = [];
    let turnosAtencion = [];
    let llamadosActivos = [];
    let llamadosExcedidos = [];
    let modalLLamado = null;

    async function cargarDatos() {
      const response = await fetch('data.php');
      const data = await response.json();

      colas = data.colas;
      turnosAtencion = data.turnosAtencion;

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

      renderSliderColas();
      renderTurnosAtencion();
    }


    // Renderiza slider de colas
    function renderSliderColas() {
      const slider = document.getElementById('sliderColas');
      slider.innerHTML = '';
      colas.forEach((cola, idx) => {
        slider.innerHTML += `
          <div class="carousel-item${idx === 0 ? ' active' : ''}">
            <div class="card card-slider shadow p-3 mb-2 text-center mx-auto">
              <div class="slider-title mb-1">${cola.nombre}</div>
              <div class="slider-qty fw-bold text-primary">${cola.cantidad}</div>
              <small>pendientes</small>
            </div>
          </div>
        `;
      });
    }

    // Renderiza tabla de turnos en atención
    function renderTurnosAtencion() {
      const tbody = document.getElementById('tablaAtencion');
      tbody.innerHTML = '';
      turnosAtencion.forEach(turno => {
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
      setInterval(cargarDatos, 3000); // Actualiza cada 5 segundos 
    });
  </script>
</body>

</html>