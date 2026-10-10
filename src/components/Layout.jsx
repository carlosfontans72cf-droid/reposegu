import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import { DatosProvider } from '../data/DatosProvider';
import { useI18n } from '../i18n';
import { estadoSuscripcion } from '../lib/suscripcion';
import CatalogoSync from './CatalogoSync';
import { PieLegal, SelectorIdioma } from './ui';

const COLOR_BASE = '#8a3b5c';

export default function Layout() {
  const { perfil, empresa, salir } = useAuth();
  const { t } = useI18n();
  const esSuper = perfil.rol === 'superadmin';
  const esPasteleria = !esSuper && empresa?.vertical === 'pasteleria';
  const esGestor = perfil.rol === 'dueno' || perfil.rol === 'admin';
  const sus = estadoSuscripcion(empresa);
  const color = empresa?.marca?.colorPrimario || COLOR_BASE;
  const logo = empresa?.marca?.logoUrl;

  let enlaces;
  if (esSuper) {
    enlaces = [
      ['/', 'nav.companies'],
      ['/cobro', 'nav.billing'],
      ['/ajustes', 'nav.settings'],
    ];
  } else if (esPasteleria) {
    enlaces = [
      ['/', 'nav.home'],
      ['/pedidos', 'nav.orders'],
      ['/entregas', 'nav.deliveries'],
      ['/productos', 'nav.products'],
      ['/stock', 'nav.stock'],
      ['/mas', 'nav.more'],
    ];
  } else if (esGestor) {
    enlaces = [
      ['/', 'nav.home'],
      ['/equipo', 'nav.team'],
      ['/ajustes', 'nav.settings'],
    ];
  } else {
    enlaces = [
      ['/', 'nav.home'],
      ['/ajustes', 'nav.settings'],
    ];
  }

  const contenido = (
    <div className="app" style={{ '--marca': color }}>
      <header className="cabecera">
        <div className="marca">
          {logo && <img src={logo} alt="" className="logo" />}
          <strong>{empresa?.nombre || t('app.name')}</strong>
        </div>
        <div className="acciones">
          <SelectorIdioma />
          <button type="button" className="boton texto" onClick={salir}>
            {t('common.logout')}
          </button>
        </div>
      </header>

      {sus.estado === 'gracia' && (
        <p className="aviso error banda" role="status">
          {t('state.gracia')} · {t('home.graceLeft', { n: sus.dias })}
        </p>
      )}

      <main className="contenido">
        <Outlet />
        <PieLegal />
      </main>

      <nav className={`navegacion ${enlaces.length > 4 ? 'compacta' : ''}`} aria-label="Principal">
        {enlaces.map(([ruta, clave]) => (
          <NavLink key={ruta} to={ruta} end={ruta === '/'} className={({ isActive }) => (isActive ? 'activo' : '')}>
            {t(clave)}
          </NavLink>
        ))}
      </nav>
      {esPasteleria && <CatalogoSync />}
    </div>
  );

  // Los datos de la pastelería se escuchan una sola vez para todas las pantallas.
  return esPasteleria ? <DatosProvider>{contenido}</DatosProvider> : contenido;
}
