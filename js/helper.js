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

let internetActivo = true;
let reproduciendoCaidaInternet = false;
async function verificarInternet() {
    try {
        const response = await fetch('/?_=' + Date.now(), {
            method: 'HEAD',
            cache: 'no-store'
        });
        return response.ok;
    } catch (e) {
        return false;
    }
}
async function monitorInternet() {
    const estado = await verificarInternet();

    if (!estado && internetActivo) {
        // Se acaba de caer
        internetActivo = false;
        manejarCaidaInternet();
    }

    if (estado && !internetActivo) {
        // Se acaba de recuperar
        internetActivo = true;
        manejarRecuperacionInternet();
    }
}
function manejarCaidaInternet() {
    if (reproduciendoCaidaInternet) return;

    console.warn('⚠️ Caída de conexión detectada');

    // Pausar audio normal
    if (audioActual) {
        audioActual.pause();
        audioActual = null;
    }

    // Vaciar cola de voz (opcional, recomendado)
    //colaVoz = [];
    audioEnReproduccion = false;

    reproduciendoCaidaInternet = true;

    audioCaidaInternet.currentTime = 0;
    audioCaidaInternet.volume = 1;

    audioCaidaInternet.onended = () => {
        reproduciendoCaidaInternet = false;

        // Si sigue sin internet, vuelve a avisar
        if (!internetActivo) {
            setTimeout(manejarCaidaInternet, 15000); // cada 15s
        }
    };

    audioCaidaInternet.play().catch(err => {
        console.error('Error reproduciendo audio de caída:', err);
        reproduciendoCaidaInternet = false;
    });
}
function manejarRecuperacionInternet() {
    console.info('✅ Conexión restablecida');

    // Detener aviso si estaba sonando
    if (audioCaidaInternet && !audioCaidaInternet.paused) {
        audioCaidaInternet.pause();
        audioCaidaInternet.currentTime = 0;
    }

    reproduciendoCaidaInternet = false;

    // Reanudar cola normal
    procesarColaVoz();
}

function controlMonitoreoInternet() {
    setInterval(monitorInternet, 30000); // cada 30 segundos
}   





