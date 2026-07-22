let cuadrosData = [];
let filtroPiezasActual = "todas";
let filtroEtiquetaActual = "todas";
let busquedaTextoActual = "";

// 1. Cargar datos al iniciar
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

// 2. Renderizar tarjetas en pantalla
function renderizarCatalogo() {
  const container = document.getElementById("catalog-grid");
  if (!container) return;
  container.innerHTML = "";

  // Filtrar productos por piezas, etiquetas y texto de búsqueda
  const filtrados = cuadrosData.filter(item => {
    const coincidePiezas = filtroPiezasActual === "todas" || item.piezas.toString() === filtroPiezasActual;
    const coincideEtiqueta = filtroEtiquetaActual === "todas" || (item.etiquetas && item.etiquetas.includes(filtroEtiquetaActual));
    
    // Búsqueda por texto (Título o Etiquetas)
    const texto = busquedaTextoActual.toLowerCase();
    const coincideTexto = item.titulo.toLowerCase().includes(texto) || 
                          (item.etiquetas && item.etiquetas.some(tag => tag.toLowerCase().includes(texto)));

    return coincidePiezas && coincideEtiqueta && coincideTexto;
  });

  if (filtrados.length === 0) {
    container.innerHTML = `<p style="color:var(--text-muted); grid-column: 1/-1; text-align:center; padding: 3rem 0;">No se encontraron cuadros con estos filtros o búsqueda.</p>`;
    return;
  }

  // Generar HTML de cada tarjeta
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
        <!-- Imagen y Badge -->
        <div class="card-img">
          <img src="${cuadro.imagen}" alt="${cuadro.titulo}">
          <span class="badge-piezas">${cuadro.piezas} ${cuadro.piezas === 1 ? 'Pieza' : 'Piezas'}</span>
        </div>

        <div class="card-body">
          <h3 class="card-title">${cuadro.titulo}</h3>
          <div class="card-tags">${tagsHTML}</div>

          <!-- Ventajas técnicas estilo Cuadrofilia -->
          <div class="product-highlights">
            <span><i class="fas fa-layer-group"></i> Retablo MDF 9mm</span>
            <span><i class="fas fa-tools"></i> Listo para colgar</span>
            <span><i class="fas fa-sparkles"></i> Impresión HD</span>
          </div>

          <!-- Selector de Acabado -->
          <!-- <div class="option-selector">
            <label>Elige el acabado:</label>
            <select class="finish-select" id="finish-${cuadro.id}">
              <option value="Mate Estándar">Acabado Mate Estándar</option>
              <option value="Mate con Textura en Relieve">Mate + Textura con Relieve (+ Textos)</option>
            </select>
          </div> -->

          <!-- Selector de Medidas -->
          <div class="size-selector">
            <label>Selecciona la medida:</label>
            <select class="size-select" onchange="cambiarMedida('${cuadro.id}', this.value)">
              ${opcionesHTML}
            </select>
          </div>

          <!-- Acordeón de Especificaciones -->
          <details class="specs-accordion">
            <summary><i class="fas fa-info-circle"></i> Ficha Técnica y Materiales</summary>
            <p id="specs-${cuadro.id}">${medidaInicial.especificaciones}</p>
          </details>

          <details class="specs-accordion">
            <summary><i class="fas fa-truck"></i> Envíos y Pagos</summary>
            <p>Envíos garantizados a todo Colombia. Paga al recibir o financia con Addi / Sistecrédito.</p>
          </details>

          <!-- Footer con Precio y Botón de Compra -->
          <div class="card-footer">
            <div class="price-container">
              <span class="price-label">Precio</span>
              <span class="price-value" id="price-${cuadro.id}">$${medidaInicial.precio.toLocaleString()}</span>
            </div>
            <button class="btn-buy" onclick="pedirPorWhatsapp('${cuadro.titulo}', '${cuadro.id}')">
              <i class="fab fa-whatsapp"></i> Comprar
            </button>
          </div>
        </div>
      </div>
    `;
    container.innerHTML += cardHTML;
  });
}

// 3. Función dinámica para actualizar precio y especificaciones
function cambiarMedida(cuadroId, indexMedida) {
  const cuadro = cuadrosData.find(c => c.id === cuadroId);
  const seleccion = cuadro.medidas[indexMedida];

  document.getElementById(`price-${cuadroId}`).innerText = `$${seleccion.precio.toLocaleString()}`;
  document.getElementById(`specs-${cuadroId}`).innerText = seleccion.especificaciones;
}

// 4. Escuchar eventos de Filtros y Buscador
function setupEventListeners() {
  // Clic en botones o enlaces de Filtros (Categorías y Piezas)
  document.querySelectorAll('[data-filter]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const tipo = btn.dataset.filter;
      const valor = btn.dataset.value;

      // Gestionar clase active si aplica
      if (btn.classList.contains('btn-filter') || btn.classList.contains('btn-tag')) {
        const parent = btn.parentElement;
        if (parent) {
          parent.querySelectorAll('.btn-filter, .btn-tag').forEach(b => b.classList.remove('active'));
        }
        btn.classList.add('active');
      }

      if (tipo === 'piezas') filtroPiezasActual = valor;
      if (tipo === 'etiqueta') filtroEtiquetaActual = valor;

      renderizarCatalogo();
    });
  });

  // Evento para el buscador central en tiempo real
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      busquedaTextoActual = e.target.value.trim();
      renderizarCatalogo();
    });
  }
}

// 5. Enviar pedido estructurado por WhatsApp
function pedirPorWhatsapp(titulo, cuadroId) {
  const selectMedida = document.querySelector(`#card-${cuadroId} .size-select`);
  const medidaText = selectMedida.options[selectMedida.selectedIndex].text;
  
  const selectAcabado = document.getElementById(`finish-${cuadroId}`);
  const acabadoText = selectAcabado ? selectAcabado.value : "Mate Estándar";
  
  const precioText = document.getElementById(`price-${cuadroId}`).innerText;

  const mensaje = `¡Hola *360 Digital*! 🖼️\nQuiero pedir el cuadro: *${titulo}*\n\n📐 *Medida:* ${medidaText}\n✨ *Acabado:* ${acabadoText}\n💰 *Precio:* ${precioText}\n\n¿Me indican los pasos para realizar el envío?`;

  window.open(`https://wa.me/573187752351?text=${encodeURIComponent(mensaje)}`, '_blank');
}