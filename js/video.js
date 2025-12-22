
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
let ytReady = false;
function onYouTubeIframeAPIReady() {
    iniciarReproduccionVideoYoutube();
}

const PLAYLIST_ID = 'PLy0Q2cGnTqFu0FolcBCIeQI9aJK3EFVeT'; // ID REAL
let videoExpandido = false;
var tiempoParaExpandirVideo = 300000; // 1 hora
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
            playsinline: 1,

            // 🔁 LOOP INFINITO REAL
            listType: 'playlist',
            list: PLAYLIST_ID,
            //playlist: PLAYLIST_ID,
            loop: 1

        },
        events: {
            onReady: onPlayerReady,
            onStateChange: onPlayerStateChange
        }
    });
}


function onPlayerReady() {
    ytReady = true;

    video.mute();
    video.playVideo();

    console.log('▶️ Playlist iniciada');
}

function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.ENDED) {

        const index = video.getPlaylistIndex();
        const total = video.getPlaylist().length;

        console.log('🎬 Video terminado', index + 1, '/', total);

        // Si terminó el último video → reiniciar playlist
        if (index === total - 1) {
            console.log('🔁 Reiniciando playlist completa');

            video.loadPlaylist({
                list: PLAYLIST_ID,
                index: 0,
                startSeconds: 0
            });
        }
    }
}



function expandirVideo() {
    if (videoExpandido) return;
    if (!ytReady || !video) return;


    if (!video) {
        console.warn('⚠️ Video no inicializado todavía');
        return;
    }

    document.body.classList.add('video-expand-active');

    if (video) {
        video.unMute();
        video.setVolume(15);
        video.playVideo();
    }
    videoExpandido = true;

    setTimeout(() => {
        // Después de 1 minuto, volvemos a contraer
        console.log('⏲️ Contraer video después de expansión automática');
        contraerVideo();
    }, 54321);

}
function contraerVideo() {
    if (!videoExpandido) return;
    if (!ytReady || !video) return;

    document.body.classList.remove('video-expand-active');

    if (video) {
        video.mute();
    }

    videoExpandido = false;
    tiempoSinTurnos = 0;

    console.log('📺 Video contraído por actividad de turnos');
}




function controlTiempoVideoExpandido() {
    setInterval(() => {
        //console.log('⏲️ Expandiendo .....  ' + tiempoSinTurnos + ' ms; ' + tiempoParaExpandirVideo + ' ms.');
        if (!ytReady) return;

        if (turnosParaSerLlamados.length === 0) {
            if (!videoExpandido) {
                tiempoSinTurnos += 1000;
                if (tiempoSinTurnos >= tiempoParaExpandirVideo) {
                    console.log('⏲️ Expandiendo por inactividad de turnos ' + tiempoSinTurnos);
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

document.addEventListener('keydown', (event) => {
    if (event.key === "Escape") {
        tiempoSinTurnos = 0;
        contraerVideo();
    }
});

document.addEventListener('keyup', (event) => {
    if (event.key === "Escape") {
        tiempoSinTurnos = 0;
        contraerVideo();
    }
});


setInterval(() => {
    if (!ytReady || !video) return;

    const state = video.getPlayerState();
    if (state === YT.PlayerState.UNSTARTED) {
        console.warn('⚠️ Video detenido, retomando');
        video.playVideo();
    }
}, 15000);
