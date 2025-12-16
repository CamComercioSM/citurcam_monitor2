
let audioDesbloqueado = false;
function desbloquearAudioYoutube() {
    if (!video || audioDesbloqueado) return;

    // Truco válido: play + mute = gesto aceptado
    video.playVideo();
    video.mute();

    audioDesbloqueado = true;
    console.log('🔓 Audio de YouTube desbloqueado');
}



// del video
let video = null;
function onYouTubeIframeAPIReady() {
    iniciarReproduccionVideoYoutube();
}

let videoExpandido = false;
var tiempoParaExpandirVideo = 30000; // 1 hora
var tiempoSinTurnos = 0;
function iniciarReproduccionVideoYoutube() {
    if (!window.YT || !YT.Player) {
        console.log('YT.Player aún no está disponible');
        return;
    }
    video = new YT.Player('videoPlayList', {
        playerVars: {
            autoplay: 1,
            controls: 0,
            rel: 0,
            modestbranding: 1,
            playsinline: 1
        },
        events: {
            onReady: onPlayerReady
        }
    });
}


function onPlayerReady() {
    video.mute();
    video.playVideo();
}
function expandirVideo() {
    if (videoExpandido) return;

    document.body.classList.add('video-expand-active');
    video.unMute();
    videoExpandido = true;
}
function contraerVideo() {
    if (!videoExpandido) return;
    document.body.classList.remove('video-expand-active');
    video.mute();
    videoExpandido = false;
    tiempoSinTurnos = 0;
}



function controlTiempoVideoExpandido() {
    setInterval(() => {
        if (turnosParaSerLlamados.length === 0) {
            if (!videoExpandido) {
                tiempoSinTurnos += 1000;
                if (tiempoSinTurnos >= tiempoParaExpandirVideo) {
                    console.log('⏲️ Expandiendo video por inactividad de turnos ' + tiempoSinTurnos );
                    expandirVideo();
                }
            }
        } else {
            // Hay turnos: reseteo contador y salgo de fullscreen
            tiempoSinTurnos = 0;
            contraerVideo();
        }
    }, 1000);
}





// Si el usuario sale con ESC, reiniciamos el contador
document.addEventListener('keydown', (event) => {
    if (event.key === "Escape") {
        tiempoSinTurnos = 0;
        contraerVideo();
    }
});
