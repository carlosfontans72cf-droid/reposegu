import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useI18n } from '../i18n';

const Ctx = createContext(null);

// undefined = todavía cargando · null = no existe · objeto = existe
export function AuthProvider({ children }) {
  const { setLang } = useI18n();
  const [user, setUser] = useState(undefined);
  const [verificado, setVerificado] = useState(false);
  const [perfil, setPerfil] = useState(undefined);
  const [empresa, setEmpresa] = useState(undefined);

  useEffect(
    () =>
      onAuthStateChanged(auth, (u) => {
        setUser(u);
        setVerificado(Boolean(u?.emailVerified));
        if (!u) {
          setPerfil(null);
          setEmpresa(null);
        } else {
          setPerfil(undefined);
        }
      }),
    [],
  );

  // Perfil propio (empresa y rol). Siempre se puede leer el de uno mismo.
  const uid = user?.uid;
  useEffect(() => {
    if (!uid) return undefined;
    return onSnapshot(
      doc(db, 'usuarios', uid),
      (s) => setPerfil(s.exists() ? { id: s.id, ...s.data() } : null),
      () => setPerfil(null),
    );
  }, [uid]);

  // Empresa del perfil (el superadmin no pertenece a ninguna).
  const empresaId = perfil?.empresaId;
  useEffect(() => {
    if (!empresaId) {
      setEmpresa(null);
      return undefined;
    }
    setEmpresa(undefined);
    return onSnapshot(
      doc(db, 'empresas', empresaId),
      (s) => setEmpresa(s.exists() ? { id: s.id, ...s.data() } : null),
      () => setEmpresa(null),
    );
  }, [empresaId]);

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
    setVerificado(u.emailVerified);
    return u.emailVerified;
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
