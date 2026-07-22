let cuadrosData = [];
let filtroPiezasActual = "todas";
let filtroEtiquetaActual = "todas";

// Cargar datos al iniciar
document.addEventListener("DOMContentLoaded", () => {
  fetch("cuadros.json")
    .then(res => res.json())
    .then(data => {
      cuadrosData = data.cuadros || data;
      renderizarCatalogo();
      setupEventListeners();
    })
    .catch(err => console.error("Error al cargar cuadros.json:", err));
});

// Renderizar tarjetas en pantalla
function renderizarCatalogo() {
  const container = document.getElementById("catalog-grid");
  container.innerHTML = "";

  // Filtrar productos
  const filtrados = cuadrosData.filter(item => {
    const coincidePiezas = filtroPiezasActual === "todas" || item.piezas.toString() === filtroPiezasActual;
    const coincideEtiqueta = filtroEtiquetaActual === "todas" || item.etiquetas.includes(filtroEtiquetaActual);
    return coincidePiezas && coincideEtiqueta;
  });

  if (filtrados.length === 0) {
    container.innerHTML = `<p style="color:var(--text-muted); grid-column: 1/-1; text-align:center;">No se encontraron cuadros con estos filtros.</p>`;
    return;
  }

  // Generar HTML
  filtrados.forEach(cuadro => {
    const medidaInicial = cuadro.medidas[0];
    
    // Opciones del selector de medidas
    const opcionesHTML = cuadro.medidas.map((m, index) => 
      `<option value="${index}">${m.tamano}</option>`
    ).join("");

    // Tags visuales
    const tagsHTML = cuadro.etiquetas.map(t => `<span class="tag-mini">${t}</span>`).join("");

    const cardHTML = `
      <div class="card" id="card-${cuadro.id}">
        <div class="card-img">
          <img src="${cuadro.imagen}" alt="${cuadro.titulo}">
          <span class="badge-piezas">${cuadro.piezas} ${cuadro.piezas === 1 ? 'Pieza' : 'Piezas'}</span>
        </div>
        <div class="card-body">
          <h3 class="card-title">${cuadro.titulo}</h3>
          <div class="card-tags">${tagsHTML}</div>

          <div class="size-selector">
            <label>Selecciona la medida:</label>
            <select class="size-select" onchange="cambiarMedida('${cuadro.id}', this.value)">
              ${opcionesHTML}
            </select>
          </div>

          <p class="card-specs" id="specs-${cuadro.id}">${medidaInicial.especificaciones}</p>

          <div class="card-footer">
            <div class="price-container">
              <span class="price-label">Precio</span>
              <span class="price-value" id="price-${cuadro.id}">$${medidaInicial.precio.toLocaleString()}</span>
            </div>
            <button class="btn-buy" onclick="pedirPorWhatsapp('${cuadro.titulo}', '${cuadro.id}')">Ordenar</button>
          </div>
        </div>
      </div>
    `;
    container.innerHTML += cardHTML;
  });
}

// Función dinámicia para cambiar precio/specs
function cambiarMedida(cuadroId, indexMedida) {
  const cuadro = cuadrosData.find(c => c.id === cuadroId);
  const seleccion = cuadro.medidas[indexMedida];

  document.getElementById(`price-${cuadroId}`).innerText = `$${seleccion.precio.toLocaleString()}`;
  document.getElementById(`specs-${cuadroId}`).innerText = seleccion.especificaciones;
}

// Escuchar clics en los botones de filtro
function setupEventListeners() {
  document.querySelectorAll('[data-filter]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const tipo = e.target.dataset.filter;
      const valor = e.target.dataset.value;

      // Desactivar botones hermanos
      e.target.parentElement.querySelectorAll('button').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');

      if (tipo === 'piezas') filtroPiezasActual = valor;
      if (tipo === 'etiqueta') filtroEtiquetaActual = valor;

      renderizarCatalogo();
    });
  });
}

// Abrir WhatsApp directo
function pedirPorWhatsapp(titulo, cuadroId) {
  const select = document.querySelector(`#card-${cuadroId} .size-select`);
  const medida = select.options[select.selectedIndex].text;
  const precio = document.getElementById(`price-${cuadroId}`).innerText;

  const mensaje = `¡Hola! Me interesa el cuadro *${titulo}* en medida *${medida}* (${precio}). ¿Me das más información?`;
  window.open(`https://wa.me/573187752351?text=${encodeURIComponent(mensaje)}`, '_blank');
}