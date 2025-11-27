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

var reproduciendo = false;
window.idAleatorio = function () {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < 5; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}
window.hablar = function (textoParaDecir, idPersona = idAleatorio()) {
    if (textoParaDecir != "") {
        solicitarTextoAVoz(textoParaDecir, idPersona);
    }
}

window.reproducirTimbreTipoDeTurno = function () {
    let tiembreGeneral = document.getElementById('timbreTurnoGeneral');
    let tiembre = document.getElementById('timbreTurnoGeneral');
}

window.reproducirRespuestaAPI = function (respuesta) {
    if (respuesta) {
        var datos = JSON.parse(respuesta);
        if (reproductoresVOZ.length) {
            var reproductor = reproductoresVOZ[datos.id];
        } else {
            reproductoresVOZ[datos.id] = document.createElement('audio');
            reproductoresVOZ[datos.id].setAttribute('id', "sonidoEspanola" + datos.id);
            reproductoresVOZ[datos.id].setAttribute('src', datos.audio);
            reproductoresVOZ[datos.id].autoplay = true;
            reproductoresVOZ[datos.id].muted = true;
            reproductoresVOZ[datos.id].addEventListener("loadeddata", (event) => {
            });
        }
    }
}