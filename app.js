let cuadrosData = [];
let filtroPiezasActual = "todas";
let filtroEtiquetaActual = "todas";
let busquedaTextoActual = "";

// Texto de especificaciones unificado
const ESPECIFICACIONES_GENERALES = "Todos nuestros cuadros son realizados en impresión digital de alta resolución en vinilo acabado mate sobre MDF 9mm, cuentan con soporte metálico en la parte de atrás ¡Listos para colgar!";

// 1. Catálogo Cuadros CON LUZ LED (1 pieza)
const MEDIDAS_LED = [
  { tamano: "30 x 70 cm", precio: 105000, especificaciones: ESPECIFICACIONES_GENERALES },
  { tamano: "40 x 90 cm", precio: 140000, especificaciones: ESPECIFICACIONES_GENERALES },
  { tamano: "60 x 100 cm", precio: 190000, especificaciones: ESPECIFICACIONES_GENERALES },
  { tamano: "70 x 120 cm", precio: 240000, especificaciones: ESPECIFICACIONES_GENERALES }
];

// 2. Catálogo Cuadros COMPLETOS SIN LUZ (1 pieza)
const MEDIDAS_COMPLETOS = [
  { tamano: "40 x 90 cm", precio: 115000, especificaciones: ESPECIFICACIONES_GENERALES },
  { tamano: "50 x 100 cm", precio: 120000, especificaciones: ESPECIFICACIONES_GENERALES },
  { tamano: "60 x 100 cm", precio: 140000, especificaciones: ESPECIFICACIONES_GENERALES },
  { tamano: "70 x 120 cm", precio: 180000, especificaciones: ESPECIFICACIONES_GENERALES },
  { tamano: "140 x 80 cm", precio: 220000, especificaciones: ESPECIFICACIONES_GENERALES }
];

// 3. Catálogo TRÍPTICOS / POLÍPTICOS (3 o 5 piezas)
const MEDIDAS_TRIPTICOS = [
  { tamano: "80 x 50 cm total", precio: 120000, especificaciones: ESPECIFICACIONES_GENERALES },
  { tamano: "120 x 80 cm total", precio: 180000, especificaciones: ESPECIFICACIONES_GENERALES },
  { tamano: "150 x 90 cm total", precio: 240000, especificaciones: ESPECIFICACIONES_GENERALES }
];

// Cargar datos
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

// Renderizar tarjetas
function renderizarCatalogo() {
  const container = document.getElementById("catalog-grid");
  if (!container) return;
  container.innerHTML = "";

  const filtrados = cuadrosData.filter(item => {
    const coincidePiezas = filtroPiezasActual === "todas" || item.piezas.toString() === filtroPiezasActual;
    const coincideEtiqueta = filtroEtiquetaActual === "todas" || (item.etiquetas && item.etiquetas.includes(filtroEtiquetaActual));
    
    const texto = busquedaTextoActual.toLowerCase();
    const coincideTexto = item.titulo.toLowerCase().includes(texto) || 
                          (item.etiquetas && item.etiquetas.some(tag => tag.toLowerCase().includes(texto)));

    return coincidePiezas && coincideEtiqueta && coincideTexto;
  });

  if (filtrados.length === 0) {
    container.innerHTML = `<p style="color:var(--text-muted); grid-column: 1/-1; text-align:center; padding: 3rem 0;">No se encontraron cuadros con estos filtros o búsqueda.</p>`;
    return;
  }

  filtrados.forEach(cuadro => {
    const esTriptico = cuadro.piezas > 1;
    const esConLuz = cuadro.tipo === "con_luz" || cuadro.tieneLuz === true;

    // Asignar grupo de medidas según la naturaleza del producto cargado
    let medidasDelCuadro = [];
    if (cuadro.medidas && cuadro.medidas.length > 0) {
      medidasDelCuadro = cuadro.medidas;
    } else if (esTriptico) {
      medidasDelCuadro = MEDIDAS_TRIPTICOS;
    } else if (esConLuz) {
      medidasDelCuadro = MEDIDAS_LED;
    } else {
      medidasDelCuadro = MEDIDAS_COMPLETOS;
    }

    cuadro.medidasPobladas = medidasDelCuadro;
    const medidaInicial = medidasDelCuadro[0];

    // Opciones del selector de medidas
    const opcionesMedidasHTML = medidasDelCuadro.map((m, index) => 
      `<option value="${index}">${m.tamano}</option>`
    ).join("");

    // Tags
    const tagsHTML = (cuadro.etiquetas || []).map(t => `<span class="tag-mini">${t}</span>`).join("");

    // Etiqueta destacada
    let badgeTipo = `${cuadro.piezas} ${cuadro.piezas === 1 ? 'Pieza' : 'Piezas'}`;
    if (esConLuz) badgeTipo += ' • Iluminación LED';

    const cardHTML = `
      <div class="card" id="card-${cuadro.id}">
        <div class="card-img">
          <img src="${cuadro.imagen}" alt="${cuadro.titulo}">
          <span class="badge-piezas">${badgeTipo}</span>
        </div>

        <div class="card-body">
          <h3 class="card-title">${cuadro.titulo}</h3>
          <div class="card-tags">${tagsHTML}</div>

          <div class="product-highlights">
            <span><i class="fas fa-layer-group"></i> Retablo MDF 9mm</span>
            <span><i class="fas fa-tools"></i> Listo para colgar</span>
            <span><i class="fas fa-sparkles"></i> Impresión HD</span>
          </div>

          <div class="size-selector">
            <label>Selecciona la medida:</label>
            <select class="size-select" id="size-${cuadro.id}" onchange="cambiarMedida('${cuadro.id}', this.value)">
              ${opcionesMedidasHTML}
            </select>
          </div>

          <details class="specs-accordion" open>
            <summary><i class="fas fa-info-circle"></i> Ficha Técnica y Materiales</summary>
            <p>${ESPECIFICACIONES_GENERALES}</p>
          </details>

          <details class="specs-accordion">
            <summary><i class="fas fa-truck"></i> Envíos y Pagos</summary>
            <p>Envíos garantizados a todo Colombia. Paga al recibir o financia con Addi / Sistecrédito.</p>
          </details>

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

// Cambiar precio según medida seleccionada
function cambiarMedida(cuadroId, indexMedida) {
  const cuadro = cuadrosData.find(c => c.id === cuadroId);
  if (!cuadro) return;

  const medidas = cuadro.medidasPobladas || MEDIDAS_COMPLETOS;
  const seleccion = medidas[indexMedida] || medidas[0];

  document.getElementById(`price-${cuadroId}`).innerText = `$${seleccion.precio.toLocaleString()}`;
}

// Filtros y búsqueda
function setupEventListeners() {
  document.querySelectorAll('[data-filter]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const tipo = btn.dataset.filter;
      const valor = btn.dataset.value;

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

  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      busquedaTextoActual = e.target.value.trim();
      renderizarCatalogo();
    });
  }
}

// Pedido WhatsApp
function pedirPorWhatsapp(titulo, cuadroId) {
  const cuadro = cuadrosData.find(c => c.id === cuadroId);
  const selectMedida = document.getElementById(`size-${cuadroId}`);
  const medidaText = selectMedida ? selectMedida.options[selectMedida.selectedIndex].text : "";
  const precioText = document.getElementById(`price-${cuadroId}`).innerText;

  const esConLuz = cuadro && (cuadro.tipo === "con_luz" || cuadro.tieneLuz === true);
  const tipoTexto = esConLuz ? "Cuadro con Luz LED Neon" : "Cuadro Completo Estándar";

  const mensaje = `¡Hola *360 Digital*! 🖼️\nQuiero pedir el producto: *${titulo}*\n\n📌 *Tipo:* ${tipoTexto}\n📐 *Medida:* ${medidaText}\n💰 *Precio:* ${precioText}\n\n¿Me indican los pasos para realizar la compra?`;

  window.open(`https://wa.me/573187752351?text=${encodeURIComponent(mensaje)}`, '_blank');
}