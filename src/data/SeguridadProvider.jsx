import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { collection, doc, limit, onSnapshot, orderBy, query, Timestamp, where } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../auth/AuthProvider';
import { inicioDelDia } from '../lib/formato';
import { leerDoc } from '../lib/seguridad.js';

const Ctx = createContext(null);

const VACIO = {
  puestos: [],
  turnos: [],
  personal: [],
  equipo: [],
  asistencias: [],
  alertas: [],
  incidentes: [],
  rondas: [],
  chats: [],
  chatPropio: null,
};

// Escucha en vivo los datos de la empresa de seguridad, según el rol:
//  - dueño/administrador: todo.
//  - guardia (empleado): solo lo suyo (turnos asignados, su asistencia, sus incidentes y su chat).
// Las consultas del guardia usan solo igualdades para no requerir índices compuestos.
export function SeguridadProvider({ children }) {
  const { perfil, empresa } = useAuth();
  const empresaId = empresa?.id;
  const uid = perfil?.id;
  const esGestor = perfil?.rol === 'dueno' || perfil?.rol === 'admin';
  const [datos, setDatos] = useState(VACIO);
  const [listos, setListos] = useState({});
  const [fallo, setFallo] = useState(false);

  useEffect(() => {
    if (!empresaId || !uid) return undefined;
    setDatos(VACIO);
    setListos({});
    setFallo(false);
    const base = (n) => collection(db, 'empresas', empresaId, n);
    const hace = (dias) => Timestamp.fromMillis(inicioDelDia().getTime() - dias * 86400000);

    const lista = (clave, q) =>
      onSnapshot(
        q,
        (s) => {
          setDatos((d) => ({ ...d, [clave]: s.docs.map(leerDoc) }));
          setListos((l) => ({ ...l, [clave]: true }));
        },
        () => {
          setFallo(true);
          setListos((l) => ({ ...l, [clave]: true }));
        },
      );

    const bajas = [lista('puestos', base('puestos'))];

    if (esGestor) {
      bajas.push(
        lista('turnos', query(base('turnos'), where('fin', '>=', hace(1)), orderBy('fin'))),
        lista('personal', base('personal')),
        lista('equipo', query(collection(db, 'usuarios'), where('empresaId', '==', empresaId))),
        lista('asistencias', query(base('asistencias'), where('entrada', '>=', hace(14)), orderBy('entrada', 'desc'))),
        lista('alertas', query(base('alertas'), orderBy('creadoEn', 'desc'), limit(40))),
        lista('incidentes', query(base('incidentes'), orderBy('creadoEn', 'desc'), limit(150))),
        lista('rondas', query(base('rondas'), where('inicio', '>=', hace(14)), orderBy('inicio', 'desc'))),
        lista('chats', base('chats')),
      );
    } else {
      bajas.push(
        lista('turnos', query(base('turnos'), where('guardias', 'array-contains', uid))),
        lista('asistencias', query(base('asistencias'), where('uid', '==', uid), where('abierta', '==', true))),
        lista('alertas', query(base('alertas'), where('uid', '==', uid), where('estado', '==', 'activa'))),
        lista('incidentes', query(base('incidentes'), where('uid', '==', uid))),
        lista('rondas', query(base('rondas'), where('uid', '==', uid), where('estado', '==', 'en_curso'))),
        onSnapshot(
          doc(db, 'empresas', empresaId, 'personal', uid),
          (s) => {
            setDatos((d) => ({ ...d, personal: s.exists() ? [leerDoc(s)] : [] }));
            setListos((l) => ({ ...l, personal: true }));
          },
          () => setListos((l) => ({ ...l, personal: true })),
        ),
        onSnapshot(
          doc(db, 'empresas', empresaId, 'chats', uid),
          (s) => {
            setDatos((d) => ({ ...d, chatPropio: s.exists() ? leerDoc(s) : null }));
            setListos((l) => ({ ...l, chats: true }));
          },
          () => setListos((l) => ({ ...l, chats: true })),
        ),
      );
    }
    return () => bajas.forEach((b) => b());
  }, [empresaId, uid, esGestor]);

  const value = useMemo(() => {
    const porId = (l) => Object.fromEntries(l.map((x) => [x.id, x]));
    const esperadas = esGestor
      ? ['puestos', 'turnos', 'personal', 'equipo', 'asistencias', 'alertas', 'incidentes', 'rondas', 'chats']
      : ['puestos', 'turnos', 'asistencias', 'alertas', 'incidentes', 'rondas', 'personal', 'chats'];
    // Los guardias son los integrantes con rol empleado.
    const guardias = datos.equipo.filter((m) => m.rol === 'empleado' && m.activo !== false);
    return {
      ...datos,
      puestosPorId: porId(datos.puestos),
      turnosPorId: porId(datos.turnos),
      personalPorId: porId(datos.personal),
      equipoPorId: porId(datos.equipo),
      guardias,
      alertasActivas: datos.alertas.filter((a) => a.estado === 'activa'),
      rondaAbierta: !esGestor ? datos.rondas[0] || null : null,
      miFicha: datos.personal[0] || null,
      asistenciaAbierta: !esGestor ? datos.asistencias[0] || null : null,
      cargando: !esperadas.every((k) => listos[k]),
      fallo,
    };
  }, [datos, listos, fallo, esGestor]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useSeg = () => useContext(Ctx);
