window.conectarseEndPoint = async function (operacion, params = {}) {
    const api = 'data.php?';
    const searchParams = new URLSearchParams({
        operacion: operacion || '',
        ...params
    });
    const response = await fetch(api + searchParams.toString());
    if (!response.ok) {
        throw new Error('Error en la petición: ' + response.status);
    }
    const data = await response.json();
    return data;
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