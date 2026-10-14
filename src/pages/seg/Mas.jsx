import { Link } from 'react-router-dom';
import { useI18n } from '../../i18n';
import { PieLegal } from '../../components/ui';

// "Más" de seguridad (dueño y administrador): lo que no entra en la barra de abajo.
export default function MasSeg() {
  const { t } = useI18n();
  const enlaces = [
    ['/personal', 'seg.nav.staff', 'seg.more.staffHelp'],
    ['/puestos', 'seg.nav.posts', 'seg.more.postsHelp'],
    ['/asistencia', 'seg.nav.attendance', 'seg.more.attendanceHelp'],
    ['/incidentes', 'seg.nav.incidents', 'seg.more.incidentsHelp'],
    ['/equipo', 'nav.team', 'more.teamHelp'],
    ['/ajustes', 'nav.settings', 'more.settingsHelp'],
  ];
  return (
    <>
      <h1>{t('nav.more')}</h1>
      {enlaces.map(([ruta, titulo, ayuda]) => (
        <Link key={ruta} to={ruta} className="tarjeta enlace-tarjeta">
          <strong>{t(titulo)}</strong>
          <span className="suave">{t(ayuda)}</span>
        </Link>
      ))}
      <PieLegal />
    </>
  );
}
