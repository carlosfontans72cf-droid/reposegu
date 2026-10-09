import { useAuth } from '../auth/AuthProvider';
import { useI18n } from '../i18n';
import { SelectorIdioma } from '../components/ui';
import DatosPago from '../components/DatosPago';

// Suscripción vencida y fuera del período de gracia: solo se puede pagar o salir.
export default function Bloqueada() {
  const { perfil, empresa, salir } = useAuth();
  const { t } = useI18n();
  const puedePagar = perfil.rol === 'dueno' || perfil.rol === 'admin';
  const suspendida = empresa?.estado === 'suspendida';

  return (
    <div className="pantalla">
      <div className="selector-flotante">
        <SelectorIdioma />
      </div>
      <div className="columna">
        <section className="tarjeta formulario">
          <h1>{suspendida ? t('state.suspendida') : t('pay.blockedTitle')}</h1>
          <p>{puedePagar ? t('pay.blockedOwner') : t('pay.blockedStaff')}</p>
          <button className="boton secundario" onClick={salir}>
            {t('common.logout')}
          </button>
        </section>
        {puedePagar && <DatosPago empresa={empresa} />}
      </div>
    </div>
  );
}
