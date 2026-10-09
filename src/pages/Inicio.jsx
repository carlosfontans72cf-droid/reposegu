import { useAuth } from '../auth/AuthProvider';
import { useI18n } from '../i18n';
import { estadoSuscripcion } from '../lib/suscripcion';
import DatosPago from '../components/DatosPago';

export default function Inicio() {
  const { perfil, empresa } = useAuth();
  const { t, fecha } = useI18n();
  const sus = estadoSuscripcion(empresa);
  const veCobro = perfil.rol === 'dueno' || perfil.rol === 'admin';
  const enPrueba = sus.estado === 'prueba';

  return (
    <>
      <h1>{t('home.hello', { nombre: perfil.nombre })}</h1>
      <p className="suave">
        {t(`role.${perfil.rol}`)} · {t(`vertical.${empresa.vertical}`)}
      </p>

      {veCobro && (
        <section className="tarjeta">
          <h2>{t('home.status')}</h2>
          <p>
            <span className={`insignia ${sus.estado}`}>{t(`state.${sus.estado}`)}</span>
          </p>
          <p>
            {t('home.daysLeft', { n: sus.dias })}
            {sus.fin && <span className="suave"> · {t('home.until', { fecha: fecha(sus.fin) })}</span>}
          </p>
          {enPrueba && <p className="suave">{t('company.intro')}</p>}
        </section>
      )}

      <section className="tarjeta">
        <p>{t('home.soon')}</p>
      </section>

      {veCobro && <DatosPago empresa={empresa} />}
    </>
  );
}
