// Escrituras a Firestore de los módulos de la pastelería.
import {
  collection,
  doc,
  increment,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../firebase';
import { aNumero, consumoDePedido } from './costos.js';

const dePedidos = (empresaId, id) => doc(db, 'empresas', empresaId, 'pedidos', id);

// Estados del pedido. Las reglas de Firestore aceptan solo estos valores.
export const ESTADOS = ['nuevo', 'confirmado', 'preparacion', 'listo', 'entregado', 'cancelado'];
// Desde 'preparacion' los insumos ya se gastaron y se descuentan del stock.
const GASTAN_STOCK = ['preparacion', 'listo', 'entregado'];

// Crea el pedido con número correlativo (#1, #2...). La numeración y el pedido se
// guardan juntos, así dos personas cargando a la vez no repiten número.
export async function crearPedido(empresaId, uid, datos) {
  const contador = doc(db, 'empresas', empresaId, 'config', 'pedidos');
  const nuevo = doc(collection(db, 'empresas', empresaId, 'pedidos'));
  let numero = 0;
  await runTransaction(db, async (tx) => {
    const s = await tx.get(contador);
    numero = s.exists() ? (s.data().ultimo || 0) + 1 : 1;
    if (s.exists()) tx.update(contador, { ultimo: numero });
    else tx.set(contador, { ultimo: 1 });
    tx.set(nuevo, {
      ...datos,
      numero,
      estado: 'nuevo',
      abonado: aNumero(datos.abonado),
      stockDescontado: false,
      consumo: {},
      creadoEn: serverTimestamp(),
      creadoPor: uid,
    });
  });
  return { id: nuevo.id, numero };
}

export const editarPedido = (empresaId, id, cambios) => updateDoc(dePedidos(empresaId, id), cambios);

export const registrarCobro = (empresaId, id, monto) =>
  updateDoc(dePedidos(empresaId, id), { abonado: increment(aNumero(monto)) });

// Cambia el estado y mantiene el stock al día:
//  · al pasar a preparación se descuentan los insumos de las recetas;
//  · si el pedido vuelve atrás o se cancela, se devuelven.
// Todo en un solo lote, así no queda a medias.
export async function cambiarEstado(empresaId, pedido, nuevo, productosPorId, insumosPorId) {
  const lote = writeBatch(db);
  const cambios = { estado: nuevo };
  const stockDe = (id) => doc(db, 'empresas', empresaId, 'insumos', id);

  if (GASTAN_STOCK.includes(nuevo) && !pedido.stockDescontado) {
    const consumo = {};
    for (const [id, cant] of Object.entries(consumoDePedido(pedido.items, productosPorId))) {
      if (!insumosPorId[id]) continue;
      consumo[id] = cant;
      lote.update(stockDe(id), { stock: increment(-cant) });
    }
    cambios.stockDescontado = true;
    cambios.consumo = consumo;
  } else if (!GASTAN_STOCK.includes(nuevo) && pedido.stockDescontado) {
    for (const [id, cant] of Object.entries(pedido.consumo || {})) {
      if (insumosPorId[id]) lote.update(stockDe(id), { stock: increment(cant) });
    }
    cambios.stockDescontado = false;
    cambios.consumo = {};
  }
  if (nuevo === 'entregado') {
    cambios.entregadoEn = serverTimestamp();
    cambios.enCamino = false;
  }
  if (nuevo !== 'listo' && nuevo !== 'entregado') cambios.enCamino = false;

  lote.update(dePedidos(empresaId, pedido.id), cambios);
  await lote.commit();
}

// Carga masiva (importador). Firestore admite hasta 500 escrituras por lote.
export async function guardarVarios(empresaId, coleccion, items) {
  for (let i = 0; i < items.length; i += 400) {
    const lote = writeBatch(db);
    for (const it of items.slice(i, i + 400)) {
      lote.set(doc(collection(db, 'empresas', empresaId, coleccion)), { ...it, creadoEn: serverTimestamp() });
    }
    await lote.commit();
  }
  return items.length;
}

// ---- Catálogo público ----
// Lo que ven los clientes es una copia mínima: nunca lleva recetas, costos ni stock.
export function armarCatalogo(empresa, productos) {
  const items = productos
    .filter((p) => p.visible)
    .map((p) => ({
      id: p.id,
      nombre: p.nombre || '',
      descripcion: p.descripcion || '',
      categoria: p.categoria || '',
      precio: aNumero(p.precio),
      fotoUrl: p.fotoUrl || '',
    }))
    .sort((a, b) => a.categoria.localeCompare(b.categoria) || a.nombre.localeCompare(b.nombre));
  return {
    nombre: empresa.nombre || '',
    whatsapp: empresa.whatsapp || '',
    color: empresa.marca?.colorPrimario || '',
    logoUrl: empresa.marca?.logoUrl || '',
    moneda: empresa.moneda || 'UYU',
    pais: empresa.pais || '',
    idioma: empresa.idiomaDefecto || 'es',
    items,
  };
}

export const publicarCatalogo = (empresaId, catalogo) =>
  setDoc(doc(db, 'catalogos', empresaId), { ...catalogo, actualizadoEn: serverTimestamp() });
