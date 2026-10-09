import { useEffect, useState } from 'react';
import { collection, deleteDoc, doc, onSnapshot, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../auth/AuthProvider';
import { useI18n } from '../i18n';
import { LIMITE_EQUIPO } from '../lib/paises';
import { Aviso, Campo, useCopiar } from '../components/ui';

export default function Equipo() {
  const { perfil, empresa } = useAuth();
  const { t } = useI18n();
  const { copiado, copiar } = useCopiar();
  const esDueno = perfil.rol === 'dueno';

  const [miembros, setMiembros] = useState([]);
  const [invitaciones, setInvitaciones] = useState([]);
  const [email, setEmail] = useState('');
  const [rol, setRol] = useState('empleado');
  const [mensaje, setMensaje] = useState({ tipo: 'ok', texto: '' });

  useEffect(
    () =>
      onSnapshot(
        query(collection(db, 'usuarios'), where('empresaId', '==', empresa.id)),
        (s) => setMiembros(s.docs.map((d) => ({ id: d.id, ...d.data() }))),
        () => setMensaje({ tipo: 'error', texto: t('common.error') }),
      ),
    [empresa.id, t],
  );

  useEffect(
    () =>
      onSnapshot(
        query(collection(db, 'invitaciones'), where('empresaId', '==', empresa.id)),
        (s) => setInvitaciones(s.docs.map((d) => ({ id: d.id, ...d.data() }))),
        () => {},
      ),
    [empresa.id],
  );

  const maximo = LIMITE_EQUIPO[empresa.vertical] ?? 10;
  const limitado = Number.isFinite(maximo);
  const activos = miembros.filter((m) => m.activo !== false).length;
  const lleno = limitado && activos + invitaciones.length >= maximo;

  const avisar = (tipo, texto) => setMensaje({ tipo, texto });
  const falla = (e) => avisar('error', e?.code === 'permission-denied' ? t('common.permission') : t('common.error'));

  const invitar = async (ev) => {
    ev.preventDefault();
    avisar('ok', '');
    if (lleno) return avisar('error', t('team.limitReached'));
    const correo = email.trim().toLowerCase();
    try {
      await setDoc(doc(db, 'invitaciones', correo), {
        empresaId: empresa.id,
        rol: esDueno ? rol : 'empleado',
        creadaEn: serverTimestamp(),
      });
      setEmail('');
      avisar('ok', t('team.inviteSent'));
    } catch (e) {
      falla(e);
    }
  };

  const cambiar = async (m, cambios) => {
    try {
      await updateDoc(doc(db, 'usuarios', m.id), cambios);
    } catch (e) {
      falla(e);
    }
  };

  const cancelar = async (inv) => {
    try {
      await deleteDoc(doc(db, 'invitaciones', inv.id));
    } catch (e) {
      falla(e);
    }
  };

  const mensajeInvitacion = (inv) =>
    t('team.inviteMsg', { empresa: empresa.nombre, email: inv.id, url: window.location.origin });

  return (
    <>
      <h1>{t('team.title')}</h1>
      <p className="suave">
        {limitado ? t('team.count', { n: activos, max: maximo }) : t('team.countFree', { n: activos })}
      </p>
      <Aviso tipo={mensaje.tipo}>{mensaje.texto}</Aviso>

      <section className="tarjeta">
        <h2>{t('team.members')}</h2>
        <ul className="lista">
          {miembros.map((m) => {
            const yo = m.id === perfil.id;
            const gestionable = esDueno && !yo && m.rol !== 'dueno';
            return (
              <li key={m.id} className={m.activo === false ? 'inactivo' : ''}>
                <div>
                  <strong>{m.nombre}</strong>
                  {yo && <span className="suave"> ({t('team.you')})</span>}
                  <div className="suave">
                    {m.email} · {t(`role.${m.rol}`)}
                    {m.activo === false && ` · ${t('team.inactive')}`}
                  </div>
                </div>
                {gestionable && (
                  <div className="acciones">
                    <select value={m.rol} onChange={(e) => cambiar(m, { rol: e.target.value })} aria-label={t('team.inviteRole')}>
                      <option value="admin">{t('role.admin')}</option>
                      <option value="empleado">{t('role.empleado')}</option>
                    </select>
                    <button className="boton secundario" onClick={() => cambiar(m, { activo: m.activo === false })}>
                      {m.activo === false ? t('team.activate') : t('team.deactivate')}
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      {invitaciones.length > 0 && (
        <section className="tarjeta">
          <h2>{t('team.pending')}</h2>
          <ul className="lista">
            {invitaciones.map((inv) => (
              <li key={inv.id}>
                <div>
                  <strong>{inv.id}</strong>
                  <div className="suave">{t(`role.${inv.rol}`)}</div>
                </div>
                <div className="acciones">
                  <button className="boton secundario" onClick={() => copiar(inv.id, mensajeInvitacion(inv))}>
                    {copiado === inv.id ? t('common.copied') : t('team.copyLink')}
                  </button>
                  <button className="boton texto" onClick={() => cancelar(inv)}>
                    {t('team.revoke')}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <form className="tarjeta formulario" onSubmit={invitar}>
        <h2>{t('team.invite')}</h2>
        <Campo etiqueta={t('team.inviteEmail')} ayuda={t('team.inviteHelp')}>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </Campo>
        {esDueno && (
          <Campo etiqueta={t('team.inviteRole')}>
            <select value={rol} onChange={(e) => setRol(e.target.value)}>
              <option value="empleado">{t('role.empleado')}</option>
              <option value="admin">{t('role.admin')}</option>
            </select>
          </Campo>
        )}
        <button className="boton" disabled={lleno}>
          {t('team.inviteBtn')}
        </button>
        {lleno && <p className="suave">{t('team.limitReached')}</p>}
      </form>
    </>
  );
}
