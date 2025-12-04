window.conectarseEndPoint = async function (operacion, params = {}) {
    const api = 'https://api.citurcam.com/' + operacion;
    if (typeof params !== 'object') {
        params = { datos: params.toString() };
    }
    const response = await fetch(api, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: JSON.stringify(params)
    });

    if (!response.ok) {
        throw new Error('Error en la petición: ' + response.status);
    }

    return await response.json();
}
window.sonarTimbreGeneral = function () {
    const audio = document.getElementById("timbreTurnoGeneral");
    if (!audio) return;
    audio.currentTime = 0;
    audio.play();
}

window.sonarTimbreAfiliados = function () {
    const audio = document.getElementById("timbreTurnoAfiliados");
    if (!audio) return;
    audio.currentTime = 0;
    audio.play();
}

window.reproducirSonidoAmbiente = function () {
    const audio = document.getElementById("sonidoAmbiente");
    if (!audio) return;
    audio.loop = true;
    audio.volume = 0.05;
    audio.play();
}

window.pausarSonidoAmbiente = function () {
    const audio = document.getElementById("sonidoAmbiente");
    if (!audio) return;
    audio.volume = 0.0;
    audio.pause();
}
