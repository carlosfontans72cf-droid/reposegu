import { useEffect, useState } from 'react';
import { collection, doc, getDoc, serverTimestamp, Timestamp, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../auth/AuthProvider';
import { useI18n } from '../i18n';
import { PAISES, VERTICALES, soloDigitos } from '../lib/paises';
import { Aviso, Campo, Cargando, SelectorIdioma } from '../components/ui';

const DIAS_PRUEBA = 30;

// Persona recién registrada y sin perfil: o la invitaron a un equipo, o crea su empresa.
export default function Onboarding() {
  const { user, salir } = useAuth();
  const { t, lang } = useI18n();
  const correo = (user.email || '').toLowerCase();

  const [invitacion, setInvitacion] = useState(undefined);
  const [error, setError] = useState('');
  const [ocupado, setOcupado] = useState(false);

  const [nombreEmpresa, setNombreEmpresa] = useState('');
  const [vertical, setVertical] = useState(VERTICALES[0]);
  const [pais, setPais] = useState('UY');
  const [whatsapp, setWhatsapp] = useState('');

  useEffect(() => {
    let vivo = true;
    getDoc(doc(db, 'invitaciones', correo))
      .then((s) => vivo && setInvitacion(s.exists() ? s.data() : null))
      .catch(() => vivo && setInvitacion(null));
    return () => {
      vivo = false;
    };
  }, [correo]);

  const nombrePersona = user.displayName || correo.split('@')[0];

  const manejarError = (e) => {
    setError(e?.code === 'permission-denied' ? t('common.permission') : t('common.error'));
  };

  const unirse = async () => {
    setError('');
    setOcupado(true);
    try {
      await user.getIdToken(true); // las reglas leen email_verified del token
      const lote = writeBatch(db);
      lote.set(doc(db, 'usuarios', user.uid), {
        empresaId: invitacion.empresaId,
        rol: invitacion.rol,
        nombre: nombrePersona,
        email: correo,
        idioma: lang,
        activo: true,
        creadoEn: serverTimestamp(),
      });
      lote.delete(doc(db, 'invitaciones', correo));
      await lote.commit();
    } catch (e) {
      manejarError(e);
      setOcupado(false);
    }
  };

  const crearEmpresa = async (ev) => {
    ev.preventDefault();
    setError('');
    setOcupado(true);
    try {
      await user.getIdToken(true);
      const datosPais = PAISES[pais];
      const empresaRef = doc(collection(db, 'empresas'));
      const fin = new Date(Date.now() + DIAS_PRUEBA * 24 * 60 * 60 * 1000);

      const lote = writeBatch(db);
      lote.set(empresaRef, {
        nombre: nombreEmpresa.trim(),
        vertical,
        pais,
        moneda: datosPais.moneda,
        zonaHoraria: datosPais.zona,
        idiomaDefecto: datosPais.idioma,
        whatsapp: soloDigitos(whatsapp),
        marca: { colorPrimario: '#8a3b5c', logoUrl: '' },
        plan: 'prueba',
        estado: 'prueba',
        finPrueba: Timestamp.fromDate(fin),
        venceEl: null,
        ownerUid: user.uid,
        creadoEn: serverTimestamp(),
      });
      lote.set(doc(db, 'usuarios', user.uid), {
        empresaId: empresaRef.id,
        rol: 'dueno',
        nombre: nombrePersona,
        email: correo,
        idioma: lang,
        activo: true,
        creadoEn: serverTimestamp(),
      });
      await lote.commit();
    } catch (e) {
      manejarError(e);
      setOcupado(false);
    }
  };

  if (invitacion === undefined) return <Cargando />;

  return (
    <div className="pantalla">
      <div className="selector-flotante">
        <SelectorIdioma />
      </div>

      {invitacion ? (
        <section className="tarjeta formulario">
          <h1>{t('join.title')}</h1>
          <p>{t('join.text', { rol: t(`role.${invitacion.rol}`) })}</p>
          <Aviso tipo="error">{error}</Aviso>
          <button className="boton" onClick={unirse} disabled={ocupado}>
            {t('join.btn')}
          </button>
          <button className="boton texto" onClick={salir}>
            {t('common.logout')}
          </button>
        </section>
      ) : (
        <form className="tarjeta formulario" onSubmit={crearEmpresa}>
          <h1>{t('company.title')}</h1>
          <p className="suave">{t('company.intro')}</p>

          <Campo etiqueta={t('company.name')}>
            <input value={nombreEmpresa} onChange={(e) => setNombreEmpresa(e.target.value)} required maxLength={80} />
          </Campo>

          <Campo etiqueta={t('company.vertical')}>
            <select value={vertical} onChange={(e) => setVertical(e.target.value)}>
              {VERTICALES.map((v) => (
                <option key={v} value={v}>
                  {t(`vertical.${v}`)}
                </option>
              ))}
            </select>
          </Campo>

          <Campo etiqueta={t('company.country')}>
            <select value={pais} onChange={(e) => setPais(e.target.value)}>
              {Object.keys(PAISES).map((p) => (
                <option key={p} value={p}>
                  {t(`country.${p}`)}
                </option>
              ))}
            </select>
          </Campo>

          <Campo etiqueta={`${t('company.whatsapp')} (${t('common.optional')})`} ayuda={t('company.whatsappHint')}>
            <input
              inputMode="numeric"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="59899123456"
            />
          </Campo>

          <Aviso tipo="error">{error}</Aviso>
          <button className="boton" disabled={ocupado}>
            {t('company.create')}
          </button>
          <button type="button" className="boton texto" onClick={salir}>
            {t('common.logout')}
          </button>
        </form>
      )}
    </div>
  );
}
