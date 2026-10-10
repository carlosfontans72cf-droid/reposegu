import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { collection, onSnapshot, orderBy, query, Timestamp, where } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../auth/AuthProvider';
import { inicioDelDia } from '../lib/formato';

const Ctx = createContext(null);

const DIAS_DE_PEDIDOS = 45; // los pedidos más viejos no se cargan (menos lecturas)
const VACIO = { productos: [], insumos: [], clientes: [], zonas: [], pedidos: [] };

// Escucha en vivo los datos de la empresa. Firestore guarda una copia en el celular,
// así que al volver a abrir la app casi no se paga lectura.
export function DatosProvider({ children }) {
  const { empresa } = useAuth();
  const empresaId = empresa?.id;
  const [datos, setDatos] = useState(VACIO);
  const [listos, setListos] = useState({});
  const [fallo, setFallo] = useState(false);

  useEffect(() => {
    if (!empresaId) return undefined;
    setDatos(VACIO);
    setListos({});
    setFallo(false);
    const base = (nombre) => collection(db, 'empresas', empresaId, nombre);
    const desde = Timestamp.fromDate(new Date(inicioDelDia().getTime() - DIAS_DE_PEDIDOS * 86400000));

    const consultas = {
      productos: base('productos'),
      insumos: base('insumos'),
      clientes: base('clientes'),
      zonas: base('zonas'),
      pedidos: query(base('pedidos'), where('fechaEntrega', '>=', desde), orderBy('fechaEntrega')),
    };

    const bajas = Object.entries(consultas).map(([nombre, q]) =>
      onSnapshot(
        q,
        (s) => {
          setDatos((d) => ({ ...d, [nombre]: s.docs.map((x) => ({ id: x.id, ...x.data() })) }));
          setListos((l) => ({ ...l, [nombre]: true }));
        },
        () => {
          setFallo(true);
          setListos((l) => ({ ...l, [nombre]: true }));
        },
      ),
    );
    return () => bajas.forEach((b) => b());
  }, [empresaId]);

  const value = useMemo(() => {
    const porId = (lista) => Object.fromEntries(lista.map((x) => [x.id, x]));
    return {
      ...datos,
      productosPorId: porId(datos.productos),
      insumosPorId: porId(datos.insumos),
      clientesPorId: porId(datos.clientes),
      zonasPorId: porId(datos.zonas),
      cargando: !['productos', 'insumos', 'clientes', 'zonas', 'pedidos'].every((k) => listos[k]),
      productosListos: Boolean(listos.productos),
      fallo,
    };
  }, [datos, listos, fallo]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useDatos = () => useContext(Ctx);
