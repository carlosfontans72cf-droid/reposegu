// Cálculos de costos, stock y totales. Todo son funciones puras (sin Firebase),
// para poder probarlas aparte.
//
// Unidades base: 'g' (gramos), 'ml' (mililitros) y 'un' (unidades).
// Un insumo se compra en cantidades como "1 kg por $120": guardamos la cantidad
// ya convertida a la unidad base (1000 g) y el precio de esa compra.

export const UNIDADES = ['g', 'ml', 'un'];

// Unidades en las que la persona puede cargar una compra, con su factor a la base.
export const UNIDADES_COMPRA = {
  g: [
    ['g', 1],
    ['kg', 1000],
  ],
  ml: [
    ['ml', 1],
    ['l', 1000],
  ],
  un: [['un', 1]],
};

// Acepta "12,5" y "12.5". Devuelve 0 si no es un número.
export function aNumero(v) {
  if (typeof v === 'number') return Number.isFinite(v) ? v : 0;
  const n = Number(String(v ?? '').trim().replace(/\s/g, '').replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
}

export const redondear = (n, decimales = 3) => {
  const f = 10 ** decimales;
  return Math.round((Number(n) + Number.EPSILON) * f) / f;
};

// Costo de una unidad base (un gramo, un mililitro o una unidad) de un insumo.
export function costoBase(insumo) {
  const cantidad = Number(insumo?.cantidadCompra);
  const precio = Number(insumo?.precioCompra);
  if (!(cantidad > 0) || !(precio >= 0)) return 0;
  return precio / cantidad;
}

// Costo de la receta de un producto.
// receta = { rinde, items: [{ insumoId, cantidad }], otros }
// Devuelve el costo total de la tanda, el de cada unidad y los insumos que ya no existen.
export function costoReceta(receta, insumosPorId) {
  if (!receta) return { total: 0, porUnidad: 0, faltan: [], tiene: false };
  const rinde = aNumero(receta.rinde) > 0 ? aNumero(receta.rinde) : 1;
  const faltan = [];
  let total = aNumero(receta.otros);
  for (const it of receta.items || []) {
    const insumo = insumosPorId[it.insumoId];
    if (!insumo) {
      faltan.push(it.insumoId);
      continue;
    }
    total += aNumero(it.cantidad) * costoBase(insumo);
  }
  const tiene = (receta.items || []).length > 0 || aNumero(receta.otros) > 0;
  return { total, porUnidad: total / rinde, faltan, tiene };
}

export function margen(precio, costo) {
  const p = aNumero(precio);
  const c = aNumero(costo);
  const ganancia = p - c;
  return { ganancia, porcentaje: p > 0 ? (ganancia / p) * 100 : 0 };
}

// Cuánto de cada insumo gasta un pedido. items = [{ productoId, cantidad }].
// Un producto "rinde" varias unidades por receta: 12 cupcakes que rinde 12 gastan
// 1/12 de la receta cada uno.
export function consumoDePedido(items, productosPorId) {
  const consumo = {};
  for (const it of items || []) {
    const receta = productosPorId[it.productoId]?.receta;
    if (!receta) continue;
    const rinde = aNumero(receta.rinde) > 0 ? aNumero(receta.rinde) : 1;
    const veces = aNumero(it.cantidad) / rinde;
    for (const ri of receta.items || []) {
      if (!ri.insumoId) continue;
      consumo[ri.insumoId] = redondear((consumo[ri.insumoId] || 0) + aNumero(ri.cantidad) * veces);
    }
  }
  return consumo;
}

// Insumos que no alcanzan para un consumo dado.
export function faltantesDeStock(consumo, insumosPorId) {
  const faltan = [];
  for (const [id, necesita] of Object.entries(consumo)) {
    const insumo = insumosPorId[id];
    if (!insumo) continue;
    const hay = aNumero(insumo.stock);
    if (hay < necesita) faltan.push({ id, nombre: insumo.nombre, unidad: insumo.unidad, falta: redondear(necesita - hay) });
  }
  return faltan;
}

export function estadoStock(insumo) {
  const stock = aNumero(insumo?.stock);
  if (stock <= 0) return 'sin';
  if (stock <= aNumero(insumo?.stockMinimo)) return 'bajo';
  return 'ok';
}

export function formatearCantidad(n, unidad, lang = 'es') {
  const x = aNumero(n);
  const num = (v) => new Intl.NumberFormat(lang, { maximumFractionDigits: 2 }).format(v);
  if (unidad === 'g' && Math.abs(x) >= 1000) return `${num(x / 1000)} kg`;
  if (unidad === 'ml' && Math.abs(x) >= 1000) return `${num(x / 1000)} l`;
  return `${num(x)} ${unidad || ''}`.trim();
}

// Totales de un pedido. envio solo suma si la entrega es a domicilio.
export function totalesPedido({ items, descuento, tipoEntrega, envioCobrado }) {
  const subtotal = (items || []).reduce((s, it) => s + aNumero(it.cantidad) * aNumero(it.precio), 0);
  const dto = Math.min(Math.max(aNumero(descuento), 0), subtotal);
  const envio = tipoEntrega === 'envio' ? Math.max(aNumero(envioCobrado), 0) : 0;
  const costo = (items || []).reduce((s, it) => s + aNumero(it.cantidad) * aNumero(it.costo), 0);
  return { subtotal, descuento: dto, envio, total: subtotal - dto + envio, costo };
}
