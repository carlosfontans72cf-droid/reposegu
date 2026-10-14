import { useEffect, useState } from 'react';
import { collection, deleteDoc, doc, onSnapshot, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../auth/AuthProvider';
import { useI18n } from '../i18n';
import { LIMITE_EQUIPO } from '../lib/paises';
import { Aviso, Campo, useCopiar } from '../components/ui';
import { crearAcceso, renovarCodigo } from '../lib/accesoServicios';
import { ADMIN, cargosDe, formatearCodigo } from '../lib/acceso.js';
import { telefonoInternacional } from '../lib/seguridad.js';

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
  const [accesos, setAccesos] = useState({});
  const [nombreNuevo, setNombreNuevo] = useState('');
  const [cargoNuevo, setCargoNuevo] = useState('');
  const [cargoTexto, setCargoTexto] = useState('');
  const [telNuevo, setTelNuevo] = useState('');
  const [creando, setCreando] = useState(false);
  const [recienCreado, setRecienCreado] = useState(null);
  const [visibles, setVisibles] = useState({});

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

  // Códigos de acceso vigentes (solo los ve la gestión).
  useEffect(
    () =>
      onSnapshot(
        collection(db, 'empresas', empresa.id, 'accesos'),
        (s) => setAccesos(Object.fromEntries(s.docs.map((d) => [d.id, { id: d.id, ...d.data() }]))),
        () => {},
      ),
    [empresa.id],
  );

  const cargos = cargosDe(empresa, t);
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

  const urlAcceso = (nombre) => `${window.location.origin}/?acceso=1&n=${encodeURIComponent(nombre)}`;
  const mensajeAcceso = (a) =>
    t('access.msg', { nombre: a.nombre, empresa: empresa.nombre, url: urlAcceso(a.nombre), codigo: formatearCodigo(a.codigo) });
  const enlaceWhatsApp = (texto, tel) => {
    const num = telefonoInternacional(tel, empresa.pais);
    return `https://wa.me/${num}?text=${encodeURIComponent(texto)}`;
  };

  const guardarCargos = async (lista) => {
    if (lista.length === 0) return avisar('error', t('access.cargos.min'));
    try {
      await updateDoc(doc(db, 'empresas', empresa.id), { cargos: lista.slice(0, 20) });
      avisar('ok', t('access.cargos.saved'));
    } catch (e) {
      falla(e);
    }
  };

  const crear = async (ev) => {
    ev.preventDefault();
    avisar('ok', '');
    if (lleno) return avisar('error', t('team.limitReached'));
    setCreando(true);
    const eleccion = cargoNuevo && (cargoNuevo === ADMIN ? esDueno : true) ? cargoNuevo : cargos[0];
    try {
      const r = await crearAcceso({
        empresa,
        quien: perfil.id,
        nombre: nombreNuevo,
        rol: eleccion === ADMIN ? 'admin' : 'empleado',
        cargo: eleccion === ADMIN ? t('role.admin') : eleccion,
        telefono: telNuevo,
      });
      setRecienCreado({ id: r.uid, nombre: nombreNuevo.trim(), codigo: r.codigo, telefono: telNuevo });
      setNombreNuevo('');
      setTelNuevo('');
      avisar('ok', t('access.created', { nombre: nombreNuevo.trim() }));
    } catch (e) {
      if (e?.code === 'auth/email-already-in-use') avisar('error', t('access.create.dup'));
      else if (e?.code === 'acceso/nombre-invalido') avisar('error', t('access.create.invalidName'));
      else falla(e);
    } finally {
      setCreando(false);
    }
  };

  const nuevoCodigo = async (m) => {
    const a = accesos[m.id];
    if (!a || !window.confirm(t('access.newCodeConfirm'))) return;
    try {
      await renovarCodigo({ empresa, acceso: a });
      setVisibles((v) => ({ ...v, [m.id]: true }));
      avisar('ok', t('access.newCodeDone'));
    } catch (e) {
      falla(e);
    }
  };

  // Botones para enviar el acceso: WhatsApp y copiar mensaje.
  const botonesAcceso = (a) => (
    <>
      <a className="boton" href={enlaceWhatsApp(mensajeAcceso(a), a.telefono)} target="_blank" rel="noreferrer">
        {t('access.sendWa')}
      </a>
      <button type="button" className="boton secundario" onClick={() => copiar(`acc-${a.id}`, mensajeAcceso(a))}>
        {copiado === `acc-${a.id}` ? t('access.copied') : t('access.copy')}
      </button>
    </>
  );

  const mensajeInvitacion = (inv) =>
    t('team.inviteMsg', { empresa: empresa.nombre, email: inv.id, url: window.location.origin });

  return (
    <>
      <h1>{t('team.title')}</h1>
      <p className="suave">
        {limitado ? t('team.count', { n: activos, max: maximo }) : t('team.countFree', { n: activos })}
      </p>
      <Aviso tipo={mensaje.tipo}>{mensaje.texto}</Aviso>

      {recienCreado && (
        <section className="tarjeta">
          <h2>{recienCreado.nombre}</h2>
          <p>
            {t('access.code')}: <strong className="codigo">{formatearCodigo(recienCreado.codigo)}</strong>
          </p>
          <div className="acciones">{botonesAcceso(recienCreado)}</div>
        </section>
      )}

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
                    {m.acceso === 'codigo' ? t('access.byCode') : m.email} · {m.rol === 'admin' ? t('role.admin') : m.cargo || t(`role.${m.rol}`)}
                    {m.activo === false && ` · ${t('team.inactive')}`}
                  </div>
                </div>
                {accesos[m.id] && !yo && (esDueno || m.rol !== 'admin') && (
                  <div className="acciones">
                    {visibles[m.id] && (
                      <span className="codigo">{formatearCodigo(accesos[m.id].codigo)}</span>
                    )}
                    <button type="button" className="boton texto" onClick={() => setVisibles((v) => ({ ...v, [m.id]: !v[m.id] }))}>
                      {visibles[m.id] ? t('access.hide') : t('access.show')}
                    </button>
                    {botonesAcceso(accesos[m.id])}
                    <button type="button" className="boton texto" onClick={() => nuevoCodigo(m)}>
                      {t('access.newCode')}
                    </button>
                  </div>
                )}
                {gestionable && (
                  <div className="acciones">
                    <select
                      value={m.rol === 'admin' ? ADMIN : m.cargo || '__empleado'}
                      onChange={(e) =>
                        cambiar(
                          m,
                          e.target.value === ADMIN
                            ? { rol: 'admin', cargo: t('role.admin') }
                            : { rol: 'empleado', cargo: e.target.value === '__empleado' ? t('role.empleado') : e.target.value },
                        )
                      }
                      aria-label={t('access.cargo.label')}
                    >
                      <option value={ADMIN}>{t('role.admin')}</option>
                      {cargos.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                      {m.rol !== 'admin' && !cargos.includes(m.cargo || '') && (
                        <option value={m.cargo || '__empleado'}>{m.cargo || t('role.empleado')}</option>
                      )}
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
                  <a className="boton" href={enlaceWhatsApp(mensajeInvitacion(inv), '')} target="_blank" rel="noreferrer">
                    {t('access.sendWa')}
                  </a>
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

      <section className="tarjeta">
        <h2>{t('access.cargos.title')}</h2>
        <p className="suave">{t('access.cargos.help')}</p>
        <ul className="chips">
          {cargos.map((c) => (
            <li key={c} className="chip">
              {c}
              <button type="button" className="boton texto" aria-label={`${t('access.cargos.remove')} ${c}`} onClick={() => guardarCargos(cargos.filter((x) => x !== c))}>
                ×
              </button>
            </li>
          ))}
        </ul>
        <div className="fila">
          <input
            value={cargoTexto}
            onChange={(e) => setCargoTexto(e.target.value)}
            placeholder={t('access.cargos.placeholder')}
            maxLength={40}
            aria-label={t('access.cargos.add')}
          />
          <button
            type="button"
            className="boton secundario"
            disabled={!cargoTexto.trim()}
            onClick={() => {
              const nuevo = cargoTexto.trim();
              if (!cargos.some((c) => c.toLowerCase() === nuevo.toLowerCase())) guardarCargos([...cargos, nuevo]);
              setCargoTexto('');
            }}
          >
            {t('access.cargos.add')}
          </button>
        </div>
      </section>

      <form className="tarjeta formulario" onSubmit={crear}>
        <h2>{t('access.create.title')}</h2>
        <p className="suave">{t('access.create.help')}</p>
        <Campo etiqueta={t('access.create.name')} ayuda={t('access.create.nameHelp')}>
          <input value={nombreNuevo} onChange={(e) => setNombreNuevo(e.target.value)} required maxLength={80} />
        </Campo>
        <Campo etiqueta={t('access.create.phone')} ayuda={t('access.create.phoneHelp')}>
          <input type="tel" value={telNuevo} onChange={(e) => setTelNuevo(e.target.value)} inputMode="tel" />
        </Campo>
        <Campo etiqueta={t('access.cargo.label')}>
          <select value={cargoNuevo || cargos[0]} onChange={(e) => setCargoNuevo(e.target.value)}>
            {cargos.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
            {esDueno && <option value={ADMIN}>{t('role.admin')}</option>}
          </select>
        </Campo>
        <button className="boton" disabled={lleno || creando}>
          {t('access.create.btn')}
        </button>
        {lleno && <p className="suave">{t('team.limitReached')}</p>}
      </form>

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
