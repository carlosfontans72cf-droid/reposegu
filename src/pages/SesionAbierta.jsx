import { useAuth } from '../auth/AuthProvider';
import { useI18n } from '../i18n';
import { SelectorIdioma } from '../components/ui';

// Se muestra cuando alguien abre un enlace de acceso con código en un navegador
// que ya tiene otra sesión (por ejemplo, la del dueño probando).
export default function SesionAbierta({ onSeguir }) {
  const { perfil, user, salir } = useAuth();
  const { t } = useI18n();
  return (
    <div className="pantalla">
      <div className="selector-flotante">
        <SelectorIdioma />
      </div>
      <section className="tarjeta formulario">
        <h1>{t('access.conflict.title')}</h1>
        <p>{t('access.conflict.text', { nombre: perfil?.nombre || user?.email || '' })}</p>
        <button className="boton" onClick={salir}>
          {t('access.conflict.logout')}
        </button>
        <button className="boton secundario" onClick={onSeguir}>
          {t('access.conflict.keep')}
        </button>
      </section>
    </div>
  );
}
