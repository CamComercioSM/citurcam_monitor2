    <!-- BARRA INFERIOR DE INFORMACIÓN DE SEDE / ZONA -->
    <div class="row m-0 px-2 pt-2 pb-1" style="height: 1vh;">
        <div class="col-12 d-flex justify-content-between align-items-center">
            <button id="btnConfigMonitor"
                onclick="completarFormularioDeConfiguraciones()"
                data-bs-toggle="modal"
                data-bs-target="#configModal">
                <!-- Aquí va tu icono -->
                <img src="https://cdnsicam.net/img/logo.png" alt="Configurar" style="width: 30px; height: 30px;">
            </button>
            <div>
                <strong>Sede:</strong> <span id="infoSede"></span> |
                <strong>Zona de atención:</strong> <span id="infoZona"></span>
            </div>
        </div>
    </div>