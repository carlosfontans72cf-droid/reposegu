import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthProvider';
import { useSeg } from '../../data/SeguridadProvider';
import { useI18n } from '../../i18n';
import { enlaceWhatsapp } from '../../lib/paises';
import { guardarFicha } from '../../lib/segServicios';
import { aInputFecha, deInputFecha } from '../../lib/segFormato';
import { estadoHabilitacion, iniciales, telefonoInternacional } from '../../lib/seguridad.js';
import { Aviso, Campo, Cargando } from '../../components/ui';

// Ficha de cada guardia: documento, teléfono, contacto de emergencia y habilitación.
// Los guardias son los integrantes del equipo con rol "empleado".
export default function Personal() {
  const { equipo, personalPorId, cargando } = useSeg();
  const { t, fecha } = useI18n();
  const { empresa } = useAuth();
  const [editando, setEditando] = useState(null);
  const [buscar, setBuscar] = useState('');

  if (cargando) return <Cargando />;
  const ahora = Date.now();
  const guardias = equipo
    .filter((m) => m.rol === 'empleado')
    .filter((m) => `${m.nombre} ${m.email}`.toLowerCase().includes(buscar.trim().toLowerCase()))
    .sort((a, b) => a.nombre.localeCompare(b.nombre));

  return (
    <>
      <div className="encabezado">
        <h1>{t('seg.staff.title')}</h1>
        <Link className="boton" to="/equipo">
          {t('seg.staff.invite')}
        </Link>
      </div>
      <p className="suave">{t('seg.staff.help')}</p>
      <input type="search" placeholder={t('common.search')} value={buscar} onChange={(e) => setBuscar(e.target.value)} />
      {guardias.length === 0 && <p className="suave">{t('seg.staff.empty')}</p>}
      {guardias.map((g) => {
        const f = personalPorId[g.id];
        const hab = estadoHabilitacion(f?.habilitacionVence ?? null, ahora);
        const intl = telefonoInternacional(f?.telefono, empresa.pais);
        if (editando === g.id) return <FormFicha key={g.id} guardia={g} ficha={f} onListo={() => setEditando(null)} />;
        return (
          <section key={g.id} className={`tarjeta ${g.activo === false ? 'inactivo' : ''}`}>
            <div className="dato">
              <div className="persona">
                <span className="avatar" aria-hidden="true">
                  {iniciales(g.nombre)}
                </span>
                <div>
                  <strong>{g.nombre}</strong>
                  {g.activo === false && <span className="insignia bloqueada">{t('team.inactive')}</span>}
                  <div className="suave">{g.email}</div>
                  <div className="suave">
                    {f?.documento ? `${t('seg.staff.document')}: ${f.documento}` : t('seg.staff.noFile')}
                    {f?.telefono && ` · ${f.telefono}`}
                  </div>
                  <div>
                    <span className={`insignia hab-${hab}`}>
                      {t(`seg.staff.lic.${hab}`)}
                      {f?.habilitacionVence ? ` · ${fecha(new Date(f.habilitacionVence))}` : ''}
                    </span>
                  </div>
                </div>
              </div>
              <div className="fila">
                {intl && (
                  <a className="boton secundario" href={enlaceWhatsapp(intl)} target="_blank" rel="noreferrer">
                    WhatsApp
                  </a>
                )}
                <button type="button" className="boton secundario" onClick={() => setEditando(g.id)}>
                  {t('common.edit')}
                </button>
              </div>
            </div>
          </section>
        );
      })}
    </>
  );
}

function FormFicha({ guardia, ficha, onListo }) {
  const { t } = useI18n();
  const { empresa } = useAuth();
  const [documento, setDocumento] = useState(ficha?.documento || '');
  const [telefono, setTelefono] = useState(ficha?.telefono || '');
  const [contacto, setContacto] = useState(ficha?.contactoEmergencia || '');
  const [vence, setVence] = useState(ficha?.habilitacionVence ? aInputFecha(ficha.habilitacionVence) : '');
  const [notas, setNotas] = useState(ficha?.notas || '');
  const [msg, setMsg] = useState('');
  const [ocupado, setOcupado] = useState(false);

  const guardar = async (ev) => {
    ev.preventDefault();
    setOcupado(true);
    setMsg('');
    try {
      await guardarFicha(empresa.id, guardia.id, {
        documento,
        telefono,
        contactoEmergencia: contacto,
        habilitacionVence: vence ? deInputFecha(vence) : null,
        notas,
      });
      onListo();
    } catch {
      setMsg(t('common.error'));
    } finally {
      setOcupado(false);
    }
  };

  return (
    <form className="tarjeta formulario" onSubmit={guardar}>
      <h2>{guardia.nombre}</h2>
      <div className="dos">
        <Campo etiqueta={t('seg.staff.document')}>
          <input value={documento} onChange={(e) => setDocumento(e.target.value)} maxLength={40} />
        </Campo>
        <Campo etiqueta={t('seg.staff.phone')} ayuda={t('seg.staff.phoneHelp')}>
          <input type="tel" value={telefono} onChange={(e) => setTelefono(e.target.value)} maxLength={30} />
        </Campo>
      </div>
      <Campo etiqueta={t('seg.staff.emergency')}>
        <input value={contacto} onChange={(e) => setContacto(e.target.value)} maxLength={120} />
      </Campo>
      <Campo etiqueta={t('seg.staff.licenseUntil')} ayuda={t('seg.staff.licenseHelp')}>
        <input type="date" value={vence} onChange={(e) => setVence(e.target.value)} />
      </Campo>
      <Campo etiqueta={t('seg.staff.notes')}>
        <textarea rows={2} value={notas} onChange={(e) => setNotas(e.target.value)} maxLength={500} />
      </Campo>
      <Aviso tipo="error">{msg}</Aviso>
      <div className="fila">
        <button className="boton" disabled={ocupado}>
          {t('common.save')}
        </button>
        <button type="button" className="boton secundario" onClick={onListo}>
          {t('common.cancel')}
        </button>
      </div>
    </form>
  );
}
