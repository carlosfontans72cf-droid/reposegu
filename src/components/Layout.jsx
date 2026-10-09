import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import { useI18n } from '../i18n';
import { estadoSuscripcion } from '../lib/suscripcion';
import { SelectorIdioma } from './ui';

const COLOR_BASE = '#8a3b5c';

export default function Layout() {
  const { perfil, empresa, salir } = useAuth();
  const { t } = useI18n();
  const esSuper = perfil.rol === 'superadmin';
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
  } else if (perfil.rol === 'empleado') {
    enlaces = [
      ['/', 'nav.home'],
      ['/ajustes', 'nav.settings'],
    ];
  } else {
    enlaces = [
      ['/', 'nav.home'],
      ['/equipo', 'nav.team'],
      ['/ajustes', 'nav.settings'],
    ];
  }

  return (
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
      </main>

      <nav className="navegacion" aria-label="Principal">
        {enlaces.map(([ruta, clave]) => (
          <NavLink key={ruta} to={ruta} end={ruta === '/'} className={({ isActive }) => (isActive ? 'activo' : '')}>
            {t(clave)}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
