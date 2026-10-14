import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useI18n } from '../i18n';
import { esEmailAcceso } from '../lib/acceso.js';

const Ctx = createContext(null);

// undefined = todavía cargando · null = no existe · objeto = existe
export function AuthProvider({ children }) {
  const { setLang } = useI18n();
  const [user, setUser] = useState(undefined);
  const [verificado, setVerificado] = useState(false);
  const [perfil, setPerfil] = useState(undefined);

  useEffect(
    () =>
      onAuthStateChanged(auth, (u) => {
        setUser(u);
        // Las cuentas por código no tienen email real: no hay nada que verificar.
        setVerificado(Boolean(u?.emailVerified) || esEmailAcceso(u?.email));
        if (!u) {
          setPerfil(null);
        } else {
          setPerfil(undefined);
        }
      }),
    [],
  );

  // Perfil propio (empresa y rol). Siempre se puede leer el de uno mismo.
  // Un "no existe" que viene solo de la caché local no es definitivo: se espera la respuesta
  // del servidor (con un tope, por si no hay conexión). Así nadie ve "crear empresa" por error.
  const uid = user?.uid;
  useEffect(() => {
    if (!uid) return undefined;
    let espera = null;
    const baja = onSnapshot(
      doc(db, 'usuarios', uid),
      { includeMetadataChanges: true },
      (s) => {
        clearTimeout(espera);
        if (!s.exists() && s.metadata.fromCache) {
          espera = setTimeout(() => setPerfil((p) => (p === undefined ? null : p)), 8000);
          return;
        }
        const nuevo = s.exists() ? { id: s.id, ...s.data() } : null;
        // Los cambios de metadatos no deben generar un perfil "nuevo" (reiniciaría el GPS, etc.).
        setPerfil((p) => (p && nuevo && JSON.stringify(p) === JSON.stringify(nuevo) ? p : nuevo));
      },
      () => setPerfil(null),
    );
    return () => {
      clearTimeout(espera);
      baja();
    };
  }, [uid]);

  // Empresa del perfil (el superadmin no pertenece a ninguna). Se guarda con su id para no
  // mostrar por un instante la empresa de la sesión anterior ni "sin empresa".
  const empresaId = perfil?.empresaId;
  const [empresaEst, setEmpresaEst] = useState({ id: null, valor: undefined });
  useEffect(() => {
    if (!empresaId) return undefined;
    return onSnapshot(
      doc(db, 'empresas', empresaId),
      (s) => setEmpresaEst({ id: empresaId, valor: s.exists() ? { id: s.id, ...s.data() } : null }),
      () => setEmpresaEst({ id: empresaId, valor: null }),
    );
  }, [empresaId]);
  const empresa = !empresaId ? null : empresaEst.id === empresaId ? empresaEst.valor : undefined;

  // El idioma guardado en el perfil manda sobre el del navegador.
  const idiomaPerfil = perfil?.idioma;
  useEffect(() => {
    if (idiomaPerfil) setLang(idiomaPerfil);
  }, [idiomaPerfil, setLang]);

  // Después de confirmar el email hay que refrescar también el token,
  // porque las reglas de Firestore leen request.auth.token.email_verified.
  const refrescarUsuario = useCallback(async () => {
    const u = auth.currentUser;
    if (!u) return false;
    await u.reload();
    await u.getIdToken(true);
    const ok = u.emailVerified || esEmailAcceso(u.email);
    setVerificado(ok);
    return ok;
  }, []);

  const cargando =
    user === undefined || (user && perfil === undefined) || (perfil?.empresaId && empresa === undefined);

  const value = useMemo(
    () => ({
      user,
      verificado,
      perfil,
      empresa,
      cargando: Boolean(cargando),
      refrescarUsuario,
      salir: () => signOut(auth),
    }),
    [user, verificado, perfil, empresa, cargando, refrescarUsuario],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
