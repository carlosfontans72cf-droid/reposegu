// Importación desde Excel (.xlsx) y CSV. Las funciones de normalización son puras
// para poder probarlas sin navegador.
import Papa from 'papaparse';
import { aNumero, redondear } from './costos.js';

// "Harina 0000" → "harina0000": sin tildes, mayúsculas ni signos, para comparar encabezados y nombres.
export const clave = (s) =>
  String(s ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

// Cada columna acepta varios nombres posibles (español, portugués e inglés).
const COLUMNAS = {
  insumos: {
    nombre: ['nombre', 'insumo', 'ingrediente', 'producto', 'nome', 'name', 'item'],
    unidad: ['unidad', 'unidadcompra', 'unidademedida', 'unidade', 'unit', 'um'],
    cantidad: ['cantidad', 'cantidadcompra', 'cantidadcomprada', 'quantidade', 'qtd', 'quantity', 'qty'],
    precio: ['precio', 'preciocompra', 'costo', 'preco', 'precodecompra', 'custo', 'price', 'cost'],
    stock: ['stock', 'existencia', 'estoque', 'inventario', 'enstock'],
    minimo: ['minimo', 'stockminimo', 'minimodestock', 'estoqueminimo', 'min', 'minimum'],
  },
  productos: {
    nombre: ['nombre', 'producto', 'nome', 'name', 'item', 'torta'],
    descripcion: ['descripcion', 'detalle', 'descricao', 'description'],
    categoria: ['categoria', 'rubro', 'tipo', 'category'],
    precio: ['precio', 'preciodeventa', 'preciodelista', 'valor', 'preco', 'price'],
    visible: ['visible', 'catalogo', 'mostrar', 'publicar', 'catalog'],
  },
  clientes: {
    nombre: ['nombre', 'cliente', 'nome', 'name'],
    telefono: ['telefono', 'whatsapp', 'celular', 'cel', 'tel', 'telefone', 'phone', 'movil'],
    direccion: ['direccion', 'domicilio', 'endereco', 'address'],
    notas: ['notas', 'nota', 'observaciones', 'observacion', 'obs', 'observacoes', 'notes'],
  },
};

const UNIDAD_ALIAS = {
  kg: ['kg', 'kgs', 'kilo', 'kilos', 'kilogramo', 'kilogramos', 'quilo', 'quilos'],
  g: ['g', 'gr', 'grs', 'gramo', 'gramos', 'grama', 'gramas'],
  l: ['l', 'lt', 'lts', 'litro', 'litros'],
  ml: ['ml', 'cc', 'mililitro', 'mililitros'],
  un: ['un', 'u', 'uni', 'unid', 'unidad', 'unidades', 'unidade', 'unidades'],
};
// Cada unidad de compra pasa a la unidad base del sistema: [base, factor].
const A_BASE = { kg: ['g', 1000], g: ['g', 1], l: ['ml', 1000], ml: ['ml', 1], un: ['un', 1] };

export function unidadDe(texto) {
  const k = clave(texto);
  for (const [u, alias] of Object.entries(UNIDAD_ALIAS)) if (alias.includes(k)) return u;
  return null;
}

const NO = ['no', 'nao', 'n', '0', 'false'];

// Lee un archivo .csv, .txt o .xlsx y devuelve una matriz de filas (arreglos de celdas).
export async function leerArchivo(archivo) {
  const nombre = (archivo.name || '').toLowerCase();
  if (nombre.endsWith('.xlsx')) {
    const { readSheet } = await import('read-excel-file/browser');
    const filas = await readSheet(archivo);
    return filas.map((f) => f.map((c) => (c instanceof Date ? c.toISOString().slice(0, 10) : c)));
  }
  if (nombre.endsWith('.xls')) throw new Error('xls');
  const texto = await archivo.text();
  const r = Papa.parse(texto.replace(/^﻿/, ''), { skipEmptyLines: 'greedy' });
  return r.data;
}

// Convierte la matriz en objetos { nombre, precio, ... } reconociendo los encabezados.
// existentes: nombres que ya están cargados, para no duplicarlos.
export function normalizarFilas(tipo, matriz, existentes = []) {
  const defs = COLUMNAS[tipo];
  const filas = (matriz || []).filter((f) => f.some((c) => String(c ?? '').trim() !== ''));
  if (filas.length === 0) return { items: [], errores: [], sinReconocer: [], cabecera: false };

  const encabezado = filas[0].map(clave);
  const indice = {};
  // Primero coincidencia exacta; después, para lo que quedó sin columna, una parecida
  // ("Precio de compra" también sirve como "precio"). Una columna se usa una sola vez.
  for (const [campo, alias] of Object.entries(defs)) {
    const i = encabezado.findIndex((h) => alias.includes(h));
    if (i >= 0) indice[campo] = i;
  }
  for (const [campo, alias] of Object.entries(defs)) {
    if (indice[campo] !== undefined) continue;
    const i = encabezado.findIndex(
      (h, n) => !Object.values(indice).includes(n) && alias.some((a) => a.length >= 5 && h.includes(a)),
    );
    if (i >= 0) indice[campo] = i;
  }
  if (indice.nombre === undefined) {
    return { items: [], errores: [], sinReconocer: filas[0].map(String), cabecera: false };
  }
  const usados = new Set(Object.values(indice));
  const sinReconocer = filas[0].map(String).filter((h, i) => h.trim() && !usados.has(i));

  const vistos = new Set(existentes.map(clave));
  const items = [];
  const errores = [];

  filas.slice(1).forEach((fila, n) => {
    const nroFila = n + 2;
    const celda = (campo) => (indice[campo] === undefined ? '' : String(fila[indice[campo]] ?? '').trim());
    const nombre = celda('nombre');
    if (!nombre) return errores.push({ fila: nroFila, motivo: 'sinNombre' });
    const k = clave(nombre);
    if (vistos.has(k)) return errores.push({ fila: nroFila, nombre, motivo: 'duplicado' });
    vistos.add(k);

    if (tipo === 'insumos') {
      const u = celda('unidad') ? unidadDe(celda('unidad')) : 'un';
      if (!u) return errores.push({ fila: nroFila, nombre, motivo: 'unidad' });
      const [base, factor] = A_BASE[u];
      const cantidad = aNumero(celda('cantidad')) || 1;
      items.push({
        nombre,
        unidad: base,
        cantidadCompra: redondear(cantidad * factor),
        precioCompra: Math.max(aNumero(celda('precio')), 0),
        stock: redondear(aNumero(celda('stock')) * factor),
        stockMinimo: redondear(aNumero(celda('minimo')) * factor),
      });
    } else if (tipo === 'productos') {
      const v = clave(celda('visible'));
      items.push({
        nombre,
        descripcion: celda('descripcion'),
        categoria: celda('categoria'),
        precio: Math.max(aNumero(celda('precio')), 0),
        // Visible salvo que la columna diga claramente que no.
        visible: !NO.includes(v),
      });
    } else {
      items.push({
        nombre,
        telefono: celda('telefono').replace(/[^\d+]/g, ''),
        direccion: celda('direccion'),
        notas: celda('notas'),
      });
    }
  });

  return { items, errores, sinReconocer, cabecera: true };
}

// Archivo de ejemplo que la persona puede bajar, completar y volver a subir.
// Usa ";" y BOM para que Excel en español lo abra en columnas y con tildes.
export function plantilla(tipo) {
  const filas = {
    insumos: [
      ['Nombre', 'Unidad', 'Cantidad comprada', 'Precio de compra', 'Stock', 'Stock mínimo'],
      ['Harina 000', 'kg', '1', '60', '10', '3'],
      ['Leche', 'l', '1', '55', '6', '2'],
      ['Huevos', 'un', '30', '330', '60', '30'],
    ],
    productos: [
      ['Nombre', 'Descripción', 'Categoría', 'Precio', 'Visible en catálogo'],
      ['Torta de chocolate', 'Bizcocho húmedo con ganache', 'Tortas', '1200', 'si'],
      ['Alfajores x6', 'Maicena con dulce de leche', 'Dulces', '350', 'si'],
    ],
    clientes: [
      ['Nombre', 'Teléfono', 'Dirección', 'Notas'],
      ['María Pérez', '59899123456', 'Av. Italia 1234', 'Alérgica a la nuez'],
    ],
  }[tipo];
  return `﻿${filas.map((f) => f.join(';')).join('\r\n')}\r\n`;
}
