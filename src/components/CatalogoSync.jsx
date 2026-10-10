import { useEffect, useMemo, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../auth/AuthProvider';
import { useDatos } from '../data/DatosProvider';
import { armarCatalogo, publicarCatalogo } from '../lib/servicios';

// JSON con las claves ordenadas, para comparar lo local con lo publicado.
const estable = (v) =>
  JSON.stringify(v, (_, x) =>
    x && typeof x === 'object' && !Array.isArray(x)
      ? Object.fromEntries(Object.entries(x).sort(([a], [b]) => a.localeCompare(b)))
      : x,
  );

// Mantiene al día el catálogo público (lo que ven los clientes sin cuenta).
// Lo hace el dueño o administrador cuando cambian productos, precios, logo o WhatsApp.
// Escribe solo si hay diferencias, así abrir la app no gasta escrituras.
export default function CatalogoSync() {
  const { empresa, perfil } = useAuth();
  const { productos, productosListos } = useDatos();
  const esGestor = perfil.rol === 'dueno' || perfil.rol === 'admin';
  const [publicado, setPublicado] = useState(undefined); // huella publicada · null si no existe

  const huella = useMemo(() => estable(armarCatalogo(empresa, productos)), [empresa, productos]);

  useEffect(() => {
    if (!esGestor) return undefined;
    let vivo = true;
    getDoc(doc(db, 'catalogos', empresa.id))
      .then((s) => {
        if (!vivo) return;
        if (!s.exists()) return setPublicado(null);
        const { actualizadoEn, ...resto } = s.data();
        setPublicado(estable(resto));
      })
      .catch(() => vivo && setPublicado(null));
    return () => {
      vivo = false;
    };
  }, [esGestor, empresa.id]);

  useEffect(() => {
    if (!esGestor || publicado === undefined || !productosListos || publicado === huella) return;
    publicarCatalogo(empresa.id, armarCatalogo(empresa, productos))
      .then(() => setPublicado(huella))
      .catch(() => {});
  }, [esGestor, publicado, productosListos, huella, empresa, productos]);

  return null;
}
