<!DOCTYPE html>
<html lang="es">

<head>
  <meta charset="UTF-8">
  <title>Monitor de Turnos - SICAM</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <!-- Bootstrap 5 CDN -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="style.css" rel="stylesheet">
</head>

<body>
  <div class="container-fluid vh-100 bg-light">
    <!-- HEADER -->
    <div class="row m-0 px-2 py-2 align-items-center" style="height: 45vh; min-height: 150px;">
      <!-- Slider colas (izquierda) -->
      <div class="col-12 col-md-7 d-flex justify-content-start align-items-center">
        <div id="colasSlider" class="carousel slide w-100 h-100" data-bs-ride="carousel">
          <div class="carousel-inner h-100" id="sliderColas">
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
      <div class="col-12 col-md-4 d-flex justify-content-end align-items-center pe-0">
        <div class="ratio ratio-16x9 w-100" style=" min-width: 220px;">
          <iframe src="https://www.youtube.com/embed/watch?v=brZEANdIKMU&list=PLy0Q2cGnTqFu0FolcBCIeQI9aJK3EFVeT&index=3"
            allowfullscreen></iframe>
        </div>
      </div>
    </div>
    <!-- TABLA TURNOS EN ATENCIÓN -->
    <div class="row m-0 p-3" style="height: 50vh; min-height: 300px;">
      <div class="col-12">
        <div class="card shadow-lg rounded-4 h-100 d-flex flex-column">
          <div class="card-header bg-primary text-white">
            <h4 class="mb-0">Turnos en Atención</h4>
          </div>
          <div class="card-body p-0 flex-grow-1">
            <div id="tablaAtencionWrapper" class="h-100">
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
  <script src="turnos.js"></script>
</body>

</html>