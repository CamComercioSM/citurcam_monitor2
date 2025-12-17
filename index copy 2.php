<!DOCTYPE html>
<html lang="es">

<head>
  <meta charset="UTF-8">
  <title>Monitor de Turnos - SICAM</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <!-- Bootstrap 5 CDN -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
  <link rel="stylesheet" href="js/splide-4.1.3/dist/css/splide.min.css">
  <link href="style.css" rel="stylesheet">

  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
  <script src="js/splide-4.1.3/dist/js/splide.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/@splidejs/splide-extension-auto-scroll@0.5.3/dist/js/splide-extension-auto-scroll.min.js"></script>

  <script src="https://www.youtube.com/iframe_api"></script>

  <script src="js/helper.js"></script>
</head>

<body class="monitor-layout">


<section class="splide" aria-label="Splide Basic HTML Example">
  <div class="splide__track">
		<ul class="splide__list">
			<li class="splide__slide">Slide 01</li>
			<li class="splide__slide">Slide 02</li>
			<li class="splide__slide">Slide 03</li>
		</ul>
  </div>
</section>



  <script src="js/audios.js"></script>
  <script src="js/video.js"></script>
  <script src="js/slide-turnos-atendiendo.js"></script>
  <script src="js/tarjetas-turnos-colas.js"></script>
  


  <script>
  document.addEventListener( 'DOMContentLoaded', function() {
    new Splide( '.splide' ).mount( window.splide.Extensions );
  } );
</script>


</body>


</html>