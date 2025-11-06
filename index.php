<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Monitor de Turnos - SICAM</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <!-- Bootstrap 5 CDN -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
  <style>
    body { background: #f7f7fc; }
    .carousel-item { min-height: 120px; }
    .slider-title { font-size: 1.15rem; }
    .slider-qty { font-size: 2.5rem; }
    .card-slider { min-width: 200px; }
    .modal-content { background: #1a233a !important; }
    .modal-body { color: #fff !important; }
    @media (max-width: 768px) {
      .slider-qty { font-size: 2rem; }
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
  <script>
    // Mock de datos simulados

    // Colas/Servicios pendientes
    const colas = [
      { nombre: "Caja General", cantidad: 15 },
      { nombre: "Certificados", cantidad: 8 },
      { nombre: "Asesoría", cantidad: 5 },
      { nombre: "PQR", cantidad: 2 }
    ];

    // Turnos en atención
    const turnosAtencion = [
      { modulo: "Modulo 1", codigo: "C012", nombre: "Carlos" },
      { modulo: "Modulo 2", codigo: "B113", nombre: "Luisa" },
      { modulo: "Modulo 3", codigo: "A301", nombre: "Javier" },
      { modulo: "Modulo 4", codigo: "F145", nombre: "Juan" },
    ];

    // Llamados activos (simulado, cambiará con el tiempo)
    let llamadosActivos = [];

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
    function renderLlamadosActivos() {
      const cont = document.getElementById('llamadosActivos');
      cont.innerHTML = '';
      llamadosActivos.forEach(llamado => {
        cont.innerHTML += `
          <div class="p-4 rounded-4 bg-primary shadow" style="min-width: 220px;">
            <h2>${llamado.modulo}</h2>
            <h3 class="display-4">${llamado.codigo}</h3>
            <p class="fs-2 mb-0">${llamado.nombre}</p>
          </div>
        `;
      });
    }

    // Lógica para simular llamados periódicos
    function simularLlamado() {
      // Ejemplo: cada 10s aparece un llamado por 5s
      setInterval(() => {
        // Simula un llamado aleatorio de los turnos en atención
        const idx = Math.floor(Math.random() * turnosAtencion.length);
        llamadosActivos = [turnosAtencion[idx]];
        renderLlamadosActivos();
        // Muestra modal
        const modal = new bootstrap.Modal(document.getElementById('llamadoModal'));
        modal.show();
        // Oculta modal después de 5 segundos
        setTimeout(() => {
          llamadosActivos = [];
          renderLlamadosActivos();
          modal.hide();
        }, 5000);
      }, 10000);
    }

    // Inicializa todo
    document.addEventListener('DOMContentLoaded', () => {
      renderSliderColas();
      renderTurnosAtencion();
      renderLlamadosActivos();
      simularLlamado();
    });
  </script>
</body>
</html>
