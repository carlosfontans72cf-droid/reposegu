import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useI18n } from '../i18n';
import { formatoDinero } from '../lib/formato';
import { enlaceWhatsapp } from '../lib/paises';
import { Cargando, PieLegal, SelectorIdioma } from '../components/ui';

// Catálogo que ve el cliente final: sin cuenta, sin registro. Arma el pedido y lo
// manda por WhatsApp al negocio; el equipo lo carga después en la app.
export default function CatalogoPublico() {
  const { empresaId } = useParams();
  const { t, lang } = useI18n();
  const [cat, setCat] = useState(undefined); // undefined cargando · null no disponible
  const [carrito, setCarrito] = useState({});
  const [verPedido, setVerPedido] = useState(false);
  const [nombre, setNombre] = useState('');
  const [para, setPara] = useState('');
  const [nota, setNota] = useState('');
  const [categoria, setCategoria] = useState('');

  useEffect(() => {
    let vivo = true;
    getDoc(doc(db, 'catalogos', empresaId))
      .then((s) => vivo && setCat(s.exists() ? s.data() : null))
      .catch(() => vivo && setCat(null));
    return () => {
      vivo = false;
    };
  }, [empresaId]);

  const dinero = (n) => formatoDinero(n, cat?.moneda || 'UYU', lang);
  const items = useMemo(() => cat?.items || [], [cat]);
  const categorias = useMemo(() => [...new Set(items.map((i) => i.categoria).filter(Boolean))], [items]);
  const visibles = items.filter((i) => !categoria || i.categoria === categoria);

  const lineas = items.filter((i) => carrito[i.id] > 0).map((i) => ({ ...i, cantidad: carrito[i.id] }));
  const cantidadTotal = lineas.reduce((s, l) => s + l.cantidad, 0);
  const total = lineas.reduce((s, l) => s + l.cantidad * l.precio, 0);

  const cambiar = (id, delta) =>
    setCarrito((c) => {
      const n = Math.max((c[id] || 0) + delta, 0);
      const x = { ...c };
      if (n === 0) delete x[id];
      else x[id] = n;
      return x;
    });

  const mensaje = [
    t('shop.msgHello', { empresa: cat?.nombre || '' }),
    ...lineas.map((l) => `• ${l.cantidad} × ${l.nombre} — ${dinero(l.cantidad * l.precio)}`),
    `${t('shop.total')}: ${dinero(total)}`,
    nombre.trim() ? `${t('shop.name')}: ${nombre.trim()}` : '',
    para.trim() ? `${t('shop.forDate')}: ${para.trim()}` : '',
    nota.trim() ? `${t('shop.note')}: ${nota.trim()}` : '',
  ]
    .filter(Boolean)
    .join('\n');
  const enviar = enlaceWhatsapp(cat?.whatsapp, mensaje);

  if (cat === undefined) return <Cargando />;
  if (cat === null)
    return (
      <div className="pantalla">
        <div className="tarjeta">
          <h1>{t('shop.unavailable')}</h1>
          <p className="suave">{t('shop.unavailableText')}</p>
        </div>
      </div>
    );

  return (
    <div className="app tienda" style={{ '--marca': cat.color || '#8a3b5c' }}>
      <header className="cabecera">
        <div className="marca">
          {cat.logoUrl && <img src={cat.logoUrl} alt="" className="logo" />}
          <strong>{cat.nombre}</strong>
        </div>
        <SelectorIdioma />
      </header>

      <main className="contenido">
        {categorias.length > 1 && (
          <div className="pestanas desplazable" role="tablist">
            <button type="button" className={!categoria ? 'activo' : ''} onClick={() => setCategoria('')}>
              {t('shop.all')}
            </button>
            {categorias.map((c) => (
              <button key={c} type="button" className={categoria === c ? 'activo' : ''} onClick={() => setCategoria(c)}>
                {c}
              </button>
            ))}
          </div>
        )}

        {items.length === 0 && <p className="suave">{t('shop.empty')}</p>}

        <div className="rejilla">
          {visibles.map((i) => (
            <article key={i.id} className="producto-tienda">
              {i.fotoUrl ? <img src={i.fotoUrl} alt={i.nombre} loading="lazy" /> : <div className="sin-foto" aria-hidden="true" />}
              <div className="cuerpo">
                <h2>{i.nombre}</h2>
                {i.descripcion && <p className="suave">{i.descripcion}</p>}
                <div className="pie">
                  <strong>{dinero(i.precio)}</strong>
                  {carrito[i.id] ? (
                    <div className="cantidad">
                      <button type="button" onClick={() => cambiar(i.id, -1)} aria-label={t('shop.less')}>
                        −
                      </button>
                      <span>{carrito[i.id]}</span>
                      <button type="button" onClick={() => cambiar(i.id, 1)} aria-label={t('shop.more')}>
                        +
                      </button>
                    </div>
                  ) : (
                    <button type="button" className="boton" onClick={() => cambiar(i.id, 1)}>
                      {t('shop.add')}
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
        <p className="suave pie-legal">{t('shop.disclaimer')}</p>
        <PieLegal />
      </main>

      {cantidadTotal > 0 && !verPedido && (
        <button type="button" className="barra-carrito" onClick={() => setVerPedido(true)}>
          <span>{t('shop.viewOrder', { n: cantidadTotal })}</span>
          <strong>{dinero(total)}</strong>
        </button>
      )}

      {verPedido && (
        <div className="hoja" role="dialog" aria-modal="true" aria-label={t('shop.yourOrder')}>
          <div className="hoja-cuerpo">
            <div className="encabezado">
              <h1>{t('shop.yourOrder')}</h1>
              <button type="button" className="boton texto" onClick={() => setVerPedido(false)}>
                {t('common.close')}
              </button>
            </div>
            {lineas.length === 0 && <p className="suave">{t('shop.emptyCart')}</p>}
            <ul className="lista">
              {lineas.map((l) => (
                <li key={l.id}>
                  <span>
                    {l.cantidad} × {l.nombre}
                  </span>
                  <span className="fila">
                    {dinero(l.cantidad * l.precio)}
                    <span className="cantidad chica">
                      <button type="button" onClick={() => cambiar(l.id, -1)} aria-label={t('shop.less')}>
                        −
                      </button>
                      <button type="button" onClick={() => cambiar(l.id, 1)} aria-label={t('shop.more')}>
                        +
                      </button>
                    </span>
                  </span>
                </li>
              ))}
            </ul>
            <p className="total-tienda">
              {t('shop.total')}: <strong>{dinero(total)}</strong>
            </p>
            <div className="formulario">
              <label className="campo">
                <span className="etiqueta">{t('shop.name')}</span>
                <input value={nombre} onChange={(e) => setNombre(e.target.value)} maxLength={60} autoComplete="name" />
              </label>
              <label className="campo">
                <span className="etiqueta">{t('shop.forDate')}</span>
                <input value={para} onChange={(e) => setPara(e.target.value)} maxLength={60} placeholder={t('shop.forDateHint')} />
              </label>
              <label className="campo">
                <span className="etiqueta">{t('shop.note')}</span>
                <textarea rows={2} value={nota} onChange={(e) => setNota(e.target.value)} maxLength={300} />
              </label>
              {enviar ? (
                <a className="boton grande" href={enviar} target="_blank" rel="noreferrer">
                  {t('shop.send')}
                </a>
              ) : (
                <p className="aviso error">{t('shop.noWhatsapp')}</p>
              )}
              <p className="suave">{t('shop.sendHelp')}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
