import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import { useI18n } from '../i18n';
import { PieLegal } from '../components/ui';

// Pantalla "Más": lo que no entra en la barra de abajo.
export default function Mas() {
  const { perfil } = useAuth();
  const { t } = useI18n();
  const esGestor = perfil.rol === 'dueno' || perfil.rol === 'admin';

  const enlaces = [
    ['/clientes', 'nav.clients', 'more.clientsHelp', true],
    ['/zonas', 'nav.zones', 'more.zonesHelp', esGestor],
    ['/importar', 'nav.import', 'more.importHelp', esGestor],
    ['/equipo', 'nav.team', 'more.teamHelp', esGestor],
    ['/ajustes', 'nav.settings', 'more.settingsHelp', true],
  ].filter((e) => e[3]);

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
