import { Link, useNavigate } from 'react-router-dom';
import { useI18n } from '../i18n';
import { contenidoLegal } from '../legal/index.js';
import { SelectorIdioma } from '../components/ui';

// Términos y Condiciones / Política de Privacidad. Se abren sin iniciar sesión.
export default function Legal({ doc }) {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const texto = contenidoLegal(lang)[doc === 'privacidad' ? 'privacidad' : 'terminos'];

  const volver = () => (window.history.length > 1 ? navigate(-1) : navigate('/'));

  return (
    <div className="app">
      <header className="cabecera">
        <button type="button" className="boton texto" onClick={volver}>
          ‹ {t('common.back')}
        </button>
        <SelectorIdioma />
      </header>
      <main className="contenido legal">
        <div className="pestanas" role="tablist">
          <Link to="/terminos" className={doc !== 'privacidad' ? 'activo' : ''} role="tab">
            {t('legal.tabTerms')}
          </Link>
          <Link to="/privacidad" className={doc === 'privacidad' ? 'activo' : ''} role="tab">
            {t('legal.tabPrivacy')}
          </Link>
        </div>

        <h1>{texto.titulo}</h1>
        <p className="suave">{texto.intro}</p>
        {texto.secciones.map((s) => (
          <section key={s.t}>
            <h2>{s.t}</h2>
            {s.p.map((parrafo, i) => (
              <p key={i}>{parrafo}</p>
            ))}
          </section>
        ))}
      </main>
    </div>
  );
}
