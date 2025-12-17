  <!-- MODAL CONFIGURACIÓN SEDE / ZONA -->
  <div class="modal fade" id="configModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
          <div class="modal-content">

              <form id="formConfigPantalla">

                  <div class="modal-header">
                      <h5 class="modal-title text-white">Configuración de pantalla</h5>
                      <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                  </div>
                  <!-- Aquí tu JS va a inyectar todo -->
                  <div class="modal-body-config" id="configModalBody">
                      <div class="modal-body">
                          <div class="mb-3">
                              <label for="sedesCCSM" class="form-label">Sedes</label>
                              <select class="form-select" id="sedesCCSM" required>
                              </select>
                          </div>

                          <div class="mb-3">
                              <label for="zonasAtencion" class="form-label">Zonas de Atención</label>
                              <select class="form-select" id="zonasAtencion" required>
                              </select>
                          </div>
                          <div class="mb-3">
                              <label for="tiempoLlamadosSlider" class="form-label">Tiempo de refrescar Slider de colas (Seg)</label>
                              <input type="number" class="form-control" id="tiempoLlamadosSlider" min="5">
                          </div>
                          <div class="mb-3">
                              <label for="tiempoLlamadosTurnosAtencion" class="form-label">Tiempo de refrescar tabla de atención (Seg)</label>
                              <input type="number" class="form-control" id="tiempoLlamadosTurnosAtencion" min="5">
                          </div>
                          <div class="mb-3">
                              <label for="tiempoTurnosParaLlamar" class="form-label">Tiempo de consulta de turnos para llamar (Seg)</label>
                              <input type="number" default="1" class="form-control" id="tiempoTurnosParaLlamar" min="1">
                          </div>
                          <div class="mb-3">
                              <label for="tiempoTurnosLlamadoVoz" class="form-label">Tiempo de llamados de voz (Seg)</label>
                              <input type="number" default="1" class="form-control" id="tiempoTurnosLlamadoVoz" min="5">
                          </div>
                          <div class="mb-3">
                              <label for="tiempoParaExpandirVideo" class="form-label">Tiempo para expandir video (Seg)</label>
                              <input type="number" default="120" class="form-control" id="tiempoParaExpandirVideo" min="15">
                          </div>
                      </div>
                      <div class="modal-footer">
                          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                          <button type="button" id="boton-guardar" onclick="guardarVariablesCofiguracion()" class="btn btn-primary">Guardar</button>
                      </div>
              </form>
          </div>
      </div>
  </div>