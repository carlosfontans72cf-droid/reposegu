import { useAuth } from '../auth/AuthProvider';
import { useI18n } from '../i18n';
import { SelectorIdioma } from '../components/ui';

export default function Desactivado({ error = false }) {
  const { salir } = useAuth();
  const { t } = useI18n();
  return (
    <div className="pantalla">
      <div className="selector-flotante">
        <SelectorIdioma />
      </div>
      <section className="tarjeta formulario">
        <h1>{error ? t('common.error') : t('disabled.title')}</h1>
        {!error && <p>{t('disabled.text')}</p>}
        <button className="boton secundario" onClick={salir}>
          {t('common.logout')}
        </button>
      </section>
    </div>
  );
}
