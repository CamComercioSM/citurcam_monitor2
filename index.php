<!DOCTYPE html>
<html lang="es">

<head>
  <meta charset="UTF-8">
  <title>Monitor de Turnos - SICAM</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <!-- Bootstrap 5 CDN -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@splidejs/splide@4.1.4/dist/css/splide.min.css">
  <link type="text/css" rel="stylesheet" href="css/style.css" >
  <link type="text/css" rel="stylesheet" href="css/flipclock.css">

  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
  <script src="js/splide-4.1.3/dist/js/splide.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/@splidejs/splide-extension-auto-scroll@0.5.3/dist/js/splide-extension-auto-scroll.min.js"></script>
  <script src="https://www.youtube.com/iframe_api"></script>

  <script src="js/helper.js"></script>
  <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
  <script src="js/flipclock.js"></script>
</head>

<body class="monitor-layout">


  <?php include 'vistas/modal-turnos-llamando.php'; ?>

  <section class="zona-superior">    
    <div class="row h-100 m-0">
      <div class="col-8 d-flex flex-column h-100 justify-content-center">        
        <?php include 'vistas/slide-turnos-atendiendo.php'; ?>
      </div>
      <div class="col-4 h-100 align-items-center justify-content-center">
        <?php include 'vistas/cabecera.php'; ?>
        <?php include 'vistas/youtube-player.php'; ?>
      </div>
    </div>
  </section>

  <section class="zona-inferior">
    <div class="contenedor-tarjetas">
      <?php include 'vistas/tarjetas-turnos-pendientes.php'; ?>
    </div>
  </section>

  <footer class="zona-pie">
    <?php include 'vistas/piecera.php'; ?>
  </footer>

  <?php include 'vistas/modal-configuracion.php'; ?>



  <script src="js/audios.js"></script>
  <script src="js/video.js"></script>
  <script src="js/slide-turnos-atendiendo.js"></script>
  <script src="js/tarjetas-turnos-colas.js"></script>
  <script src="js/turnos.js"></script>

  <script type="text/javascript">
    document.addEventListener("DOMContentLoaded", function() {
      cargarColasAtencionParaTarjetasTurnosPendientes();

      iniciarSonidoAmbiente();
      controlMonitoreoInternet();
      controlTiempoVideoExpandido();

      var clock = $('#reloj').FlipClock({
        clockFace: 'TwentyFourHourClock',
        language: 'es',
        showSeconds: true
      });

    });
  </script>

</body>


</html>