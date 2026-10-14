let cuadrosData = [];
let filtroPiezasActual = "todas";
let filtroTipoActual = "todos"; // Soporta tipo (con_luz / sin_luz)
let filtroEtiquetaActual = "todas";
let busquedaTextoActual = "";

// ===== CONFIGURACIÓN DE PAGINACIÓN =====
let paginaActual = 1;
const productosPorPagina = 12; // Cantidad de cuadros por página
let productosFiltrados = [];

// Texto de especificaciones general / materiales
const ESPECIFICACIONES_GENERALES = "Todos nuestros cuadros son realizados en impresión digital de alta resolución en vinilo acabado brillante sobre MDF 9mm, cuentan con soporte metálico en la parte de atrás ¡Listos para colgar!";
const ESPECIFICACIONES_LED = "Todos nuestros cuadros con luz LED son realizados en impresión digital de alta resolución en vinilo acabado brillante sobre MDF 9mm, cuentan con soporte metálico en la parte de atrás y sistema de iluminación LED ¡Listos para colgar! También lo puedes solicitar con dilatadores para mejor apariencia en su instalación.";
const ESPECIFICACIONES_5_PIEZAS_DETALLE = "Compuesto por 5 cuadros de diferentes tamaños. Ideal para crear un efecto visual impactante en cualquier espacio.";

// Tablas de medidas
const MEDIDAS_LED = [
  { tamano: "30 x 70 cm", precio: 105000, especificaciones: ESPECIFICACIONES_LED },
  { tamano: "40 x 90 cm", precio: 140000, especificaciones: ESPECIFICACIONES_LED },
  { tamano: "60 x 100 cm", precio: 190000, especificaciones: ESPECIFICACIONES_LED },
  { tamano: "70 x 120 cm", precio: 240000, especificaciones: ESPECIFICACIONES_LED }
];

const MEDIDAS_COMPLETOS = [
  { tamano: "40 x 90 cm", precio: 125000, especificaciones: ESPECIFICACIONES_GENERALES },
  { tamano: "50 x 100 cm", precio: 150000, especificaciones: ESPECIFICACIONES_GENERALES },
  { tamano: "60 x 100 cm", precio: 170000, especificaciones: ESPECIFICACIONES_GENERALES },
  { tamano: "70 x 120 cm", precio: 200000, especificaciones: ESPECIFICACIONES_GENERALES },
  { tamano: "140 x 80 cm", precio: 250000, especificaciones: ESPECIFICACIONES_GENERALES }
];

const MEDIDAS_TRIPTICOS = [
  { tamano: "30 x 60 cm total", precio: 75000, especificaciones: `${ESPECIFICACIONES_GENERALES}\n\n📐 Medida 30 x 60 cm: compuesto por 3 cuadros de 20x30 cm.` },
  { tamano: "40 x 90 cm total", precio: 120000, especificaciones: `${ESPECIFICACIONES_GENERALES}\n\n📐 Medida 40 x 90 cm: compuesto por 3 cuadros de 30x40 cm.` },
  { tamano: "60 x 105 cm total", precio: 165000, especificaciones: `${ESPECIFICACIONES_GENERALES}\n\n📐 Medida 60 x 105 cm: compuesto por 3 cuadros de 60x35 cm.` },
  { tamano: "70 x 120 cm total", precio: 200000, especificaciones: `${ESPECIFICACIONES_GENERALES}\n\n📐 Medida 70 x 120 cm: compuesto por 3 cuadros de 40x70 cm.` },
  { tamano: "80 x 150 cm total", precio: 240000, especificaciones: `${ESPECIFICACIONES_GENERALES}\n\n📐 Medida 80 x 150 cm: compuesto por 3 cuadros de 50x80 cm.` }
];

const MEDIDAS_CINCO_PIEZAS = [
  { tamano: "50 x 100 cm total", precio: 145000, especificaciones: `${ESPECIFICACIONES_GENERALES}\n\n📐 ${ESPECIFICACIONES_5_PIEZAS_DETALLE}` },
  { tamano: "70 x 125 cm total", precio: 190000, especificaciones: `${ESPECIFICACIONES_GENERALES}\n\n📐 ${ESPECIFICACIONES_5_PIEZAS_DETALLE}` },
  { tamano: "80 x 150 cm total", precio: 230000, especificaciones: `${ESPECIFICACIONES_GENERALES}\n\n📐 ${ESPECIFICACIONES_5_PIEZAS_DETALLE}` },
  { tamano: "100 x 200 cm total", precio: 350000, especificaciones: `${ESPECIFICACIONES_GENERALES}\n\n📐 ${ESPECIFICACIONES_5_PIEZAS_DETALLE}` }
];

const MEDIDAS_PERSONALIZADOS = [
  { tamano: "20 x 30 cm", precio: 25000, especificaciones: ESPECIFICACIONES_GENERALES },
  { tamano: "30 x 40 cm", precio: 40000, especificaciones: ESPECIFICACIONES_GENERALES },
  { tamano: "40 x 50 cm", precio: 75000, especificaciones: ESPECIFICACIONES_GENERALES },
  { tamano: "50 x 70 cm", precio: 100000, especificaciones: ESPECIFICACIONES_GENERALES },
  { tamano: "90 x 90 cm", precio: 110000, especificaciones: ESPECIFICACIONES_GENERALES }
];

// Cargar datos al iniciar
document.addEventListener("DOMContentLoaded", () => {
  fetch("cuadros.json")
    .then(res => res.json())
    .then(data => {
      cuadrosData = data.cuadros || data;
      renderizarMenuCategorias();
      filtrarYRenderizar();
      injectarDatosEstructurados();
      setupEventListeners();
    })
    .catch(err => console.error("Error al cargar cuadros.json:", err));
});

// Filtrar productos y reiniciar a la página 1
function filtrarYRenderizar() {
  productosFiltrados = cuadrosData.filter(item => {
    const esConLuzItem = item.tipo === "con_luz" || item.tieneLuz === true;

    const coincidePiezas = filtroPiezasActual === "todas" || (item.piezas && item.piezas.toString() === filtroPiezasActual);
    
    let coincideTipo = true;
    if (filtroTipoActual === "con_luz" || filtroTipoActual === "neon") {
      coincideTipo = esConLuzItem;
    } else if (filtroTipoActual === "sin_luz") {
      coincideTipo = !esConLuzItem;
    }

    const etiquetasLimpias = Array.isArray(item.etiquetas)
      ? item.etiquetas.filter(Boolean).map(t => t.toString().trim().toLowerCase())
      : [];

    const coincideEtiqueta = filtroEtiquetaActual === "todas" || etiquetasLimpias.includes(filtroEtiquetaActual);
    
    const texto = busquedaTextoActual.toLowerCase();
    const tituloValido = (item.titulo || "").toLowerCase();
    const coincideTexto = tituloValido.includes(texto) || etiquetasLimpias.some(tag => tag.includes(texto));

    return coincidePiezas && coincideTipo && coincideEtiqueta && coincideTexto;
  });

  paginaActual = 1; // Reinicia a la primera página tras cualquier filtro o búsqueda
  renderizarCatalogoPaginado();
}

// Renderizar tarjetas por página
function renderizarCatalogoPaginado() {
  const container = document.getElementById("catalog-grid");
  if (!container) return;
  container.innerHTML = "";

  if (productosFiltrados.length === 0) {
    container.innerHTML = `<p style="color:var(--text-muted); grid-column: 1/-1; text-align:center; padding: 3rem 0;">No se encontraron cuadros con estos filtros o búsqueda.</p>`;
    renderizarPaginacion(0);
    return;
  }

  // Paginado usando .slice()
  const inicio = (paginaActual - 1) * productosPorPagina;
  const fin = inicio + productosPorPagina;
  const productosPagina = productosFiltrados.slice(inicio, fin);

  productosPagina.forEach(cuadro => {
    const esConLuz = cuadro.tipo === "con_luz" || cuadro.tieneLuz === true;
    const etiquetasRender = Array.isArray(cuadro.etiquetas) ? cuadro.etiquetas.filter(Boolean) : [];
    const esPersonalizado = cuadro.tipo === "personalizado" || etiquetasRender.some(e => e.toString().toLowerCase().includes("personalizado"));

    let medidasDelCuadro = [];
    if (cuadro.medidas && cuadro.medidas.length > 0) {
      medidasDelCuadro = cuadro.medidas;
    } else if (esConLuz) {
      medidasDelCuadro = MEDIDAS_LED;
    } else if (cuadro.piezas === 3) {
      medidasDelCuadro = MEDIDAS_TRIPTICOS;
    } else if (cuadro.piezas === 5) {
      medidasDelCuadro = MEDIDAS_CINCO_PIEZAS;
    } else if (esPersonalizado) {
      medidasDelCuadro = MEDIDAS_PERSONALIZADOS;
    } else {
      medidasDelCuadro = MEDIDAS_COMPLETOS;
    }

    cuadro.medidasPobladas = medidasDelCuadro;
    const medidaInicial = medidasDelCuadro[0];

    const opcionesMedidasHTML = medidasDelCuadro.map((m, index) => 
      `<option value="${index}">${m.tamano}</option>`
    ).join("");

    const tagsHTML = etiquetasRender.map(t => `<span class="tag-mini">${t}</span>`).join("");
    let badgeTipo = `${cuadro.piezas || 1} ${cuadro.piezas === 1 ? 'Pieza' : 'Piezas'}`;
    if (esConLuz) badgeTipo += ' • Iluminación LED';

    const cardHTML = `
      <div class="card" id="card-${cuadro.id}" itemscope itemtype="https://schema.org/Product">
        <div class="card-img" onclick="abrirModalImagen('${cuadro.imagen}')">
          <img src="${cuadro.imagen}" alt="Cuadro ${cuadro.titulo}" loading="lazy" width="400" height="400" itemprop="image">
          <span class="badge-piezas">${badgeTipo}</span>
        </div>

        <div class="card-body">
          <h3 class="card-title" itemprop="name">${cuadro.titulo}</h3>
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

          <details class="specs-accordion">
            <summary><i class="fas fa-info-circle"></i> Ficha Técnica y Materiales</summary>
            <p id="specs-${cuadro.id}">${medidaInicial.especificaciones}</p>
          </details>

          <details class="specs-accordion">
            <summary><i class="fas fa-truck"></i> Envíos y Pagos</summary>
            <p>Envíos garantizados a todo Colombia. Paga al recibir o recibe un 10% descuento si realizas un abono del 50%.</p>
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

  renderizarPaginacion(productosFiltrados.length);
}

// Generador de botones de páginas
function renderizarPaginacion(totalProductos) {
  let contenedorPaginacion = document.getElementById('pagination-container');

  if (!contenedorPaginacion) {
    contenedorPaginacion = document.createElement('div');
    contenedorPaginacion.id = 'pagination-container';
    contenedorPaginacion.className = 'pagination-container';
    document.querySelector('.catalog-container').appendChild(contenedorPaginacion);
  }

  contenedorPaginacion.innerHTML = '';

  const totalPaginas = Math.ceil(totalProductos / productosPorPagina);
  if (totalPaginas <= 1) return;

  // Botón Anterior
  const btnAnt = document.createElement('button');
  btnAnt.className = `btn-page ${paginaActual === 1 ? 'disabled' : ''}`;
  btnAnt.innerHTML = '<i class="fas fa-chevron-left"></i>';
  btnAnt.onclick = () => cambiarPagina(paginaActual - 1);
  contenedorPaginacion.appendChild(btnAnt);

  // Botones Numéricos
  for (let i = 1; i <= totalPaginas; i++) {
    const btnNum = document.createElement('button');
    btnNum.className = `btn-page ${i === paginaActual ? 'active' : ''}`;
    btnNum.textContent = i;
    btnNum.onclick = () => cambiarPagina(i);
    contenedorPaginacion.appendChild(btnNum);
  }

  // Botón Siguiente
  const btnSig = document.createElement('button');
  btnSig.className = `btn-page ${paginaActual === totalPaginas ? 'disabled' : ''}`;
  btnSig.innerHTML = '<i class="fas fa-chevron-right"></i>';
  btnSig.onclick = () => cambiarPagina(paginaActual + 1);
  contenedorPaginacion.appendChild(btnSig);
}

function cambiarPagina(nuevaPagina) {
  const totalPaginas = Math.ceil(productosFiltrados.length / productosPorPagina);
  if (nuevaPagina < 1 || nuevaPagina > totalPaginas) return;

  paginaActual = nuevaPagina;
  renderizarCatalogoPaginado();

  const catalogo = document.getElementById('catalog-grid');
  if (catalogo) {
    catalogo.scrollIntoView({ behavior: 'smooth' });
  }
}

// Resto de funciones (Menú, Selectores, Modales)
function renderizarMenuCategorias() {
  const menuContainer = document.getElementById("dropdown-categorias");
  if (!menuContainer) return;

  const todasLasEtiquetas = new Set();
  cuadrosData.forEach(cuadro => {
    if (cuadro.etiquetas && Array.isArray(cuadro.etiquetas)) {
      cuadro.etiquetas.forEach(tag => {
        if (tag && typeof tag === 'string') {
          const tagLimpio = tag.trim().toLowerCase();
          if (tagLimpio.length > 0) todasLasEtiquetas.add(tagLimpio);
        }
      });
    }
  });

  const etiquetasOrdenadas = Array.from(todasLasEtiquetas).sort();
  let htmlCategorias = `
    <li>
      <a href="#" class="btn-tag ${filtroEtiquetaActual === 'todas' ? 'active' : ''}" data-filter="etiqueta" data-value="todas">
        Todas las categorías
      </a>
    </li>
  `;

  etiquetasOrdenadas.forEach(tag => {
    const nombreFormateado = tag.charAt(0).toUpperCase() + tag.slice(1);
    const estaActivo = filtroEtiquetaActual === tag ? "active" : "";
    htmlCategorias += `
      <li>
        <a href="#" class="btn-tag ${estaActivo}" data-filter="etiqueta" data-value="${tag}">
          ${nombreFormateado}
        </a>
      </li>
    `;
  });

  menuContainer.innerHTML = htmlCategorias;
}

function cambiarMedida(cuadroId, indexMedida) {
  const cuadro = cuadrosData.find(c => c.id === cuadroId);
  if (!cuadro) return;

  const medidas = cuadro.medidasPobladas || MEDIDAS_COMPLETOS;
  const seleccion = medidas[indexMedida] || medidas[0];

  const elemPrecio = document.getElementById(`price-${cuadroId}`);
  const elemSpecs = document.getElementById(`specs-${cuadroId}`);

  if (elemPrecio) elemPrecio.innerText = `$${seleccion.precio.toLocaleString()}`;
  if (elemSpecs) elemSpecs.innerText = seleccion.especificaciones;
}

function setupEventListeners() {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-filter]');
    if (!btn) return;

    e.preventDefault();
    const tipo = btn.dataset.filter;
    const valor = btn.dataset.value;

    if (tipo === 'piezas') {
      filtroPiezasActual = valor;
      filtroTipoActual = "todos";
    } else if (tipo === 'tipo') {
      filtroTipoActual = valor;
      filtroPiezasActual = "todas";
    } else if (tipo === 'etiqueta') {
      filtroEtiquetaActual = valor;
    }

    if (tipo === 'etiqueta') {
      document.querySelectorAll('#dropdown-categorias .btn-tag').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    } else if (tipo === 'piezas' || tipo === 'tipo') {
      document.querySelectorAll('.btn-filter, .btn-neon-filter').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    }

    filtrarYRenderizar();
  });

  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      busquedaTextoActual = e.target.value.trim();
      filtrarYRenderizar();
    });
  }
}

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

function abrirModalImagen(rutaImagen) {
  const modal = document.getElementById("image-modal");
  const modalImg = document.getElementById("modal-img-target");
  
  if (modal && modalImg) {
    modalImg.src = rutaImagen;
    modal.style.display = "flex";
    document.body.style.overflow = "hidden";
  }
}

function cerrarModalImagen() {
  const modal = document.getElementById("image-modal");
  if (modal) {
    modal.style.display = "none";
    document.body.style.overflow = "auto";
  }
}

function injectarDatosEstructurados() {
  if (!cuadrosData || cuadrosData.length === 0) return;

  const items = cuadrosData.map((cuadro, index) => {
    const precio = (cuadro.medidas && cuadro.medidas[0] && cuadro.medidas[0].precio) || parseFloat(cuadro.precio) || 0;
    const imagenAbs = cuadro.imagen.startsWith("http")
      ? cuadro.imagen
      : "https://catalogo-cuadros.netlify.app/" + cuadro.imagen.replace(/^\.?\//, "");

    return {
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Product",
        "name": cuadro.titulo,
        "image": imagenAbs,
        "description": cuadro.descripcion || `Cuadro decorativo ${cuadro.titulo} en impresión HD sobre MDF 9mm.`,
        "offers": {
          "@type": "Offer",
          "priceCurrency": "COP",
          "price": precio,
          "availability": "https://schema.org/InStock"
        }
      }
    };
  });

  const sl = document.createElement("script");
  sl.type = "application/ld+json";
  sl.textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Catálogo de Cuadros Decorativos 360 Digital",
    "itemListElement": items
  });
  document.head.appendChild(sl);
}