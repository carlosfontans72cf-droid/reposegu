import { useState } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { useDatos } from '../data/DatosProvider';
import { useI18n } from '../i18n';
import { useDinero } from '../lib/formato';
import { formatearCantidad } from '../lib/costos';
import { leerArchivo, normalizarFilas, plantilla } from '../lib/importar';
import { guardarVarios } from '../lib/servicios';
import { Aviso, Campo } from '../components/ui';

const TIPOS = ['productos', 'insumos', 'clientes'];

// Trae datos que el negocio ya tenía en Excel: se exporta como CSV (o se sube el .xlsx),
// se revisa la vista previa y recién ahí se carga.
export default function Importar() {
  const { t, lang } = useI18n();
  const dinero = useDinero();
  const { empresa } = useAuth();
  const datos = useDatos();
  const [tipo, setTipo] = useState('productos');
  const [res, setRes] = useState(null);
  const [archivo, setArchivo] = useState('');
  const [msg, setMsg] = useState({ tipo: 'ok', texto: '' });
  const [ocupado, setOcupado] = useState(false);

  const reiniciar = (nuevoTipo) => {
    setTipo(nuevoTipo);
    setRes(null);
    setArchivo('');
    setMsg({ tipo: 'ok', texto: '' });
  };

  const elegir = async (ev) => {
    const f = ev.target.files?.[0];
    ev.target.value = '';
    if (!f) return;
    setMsg({ tipo: 'ok', texto: '' });
    setRes(null);
    setArchivo(f.name);
    try {
      const matriz = await leerArchivo(f);
      const r = normalizarFilas(tipo, matriz, datos[tipo].map((x) => x.nombre));
      setRes(r);
      if (!r.cabecera) setMsg({ tipo: 'error', texto: t('import.noHeader') });
    } catch (e) {
      setMsg({ tipo: 'error', texto: e?.message === 'xls' ? t('import.xls') : t('import.readError') });
    }
  };

  const bajarPlantilla = () => {
    const blob = new Blob([plantilla(tipo)], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `plantilla-${tipo}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const importar = async () => {
    if (!res?.items.length) return;
    setOcupado(true);
    try {
      const n = await guardarVarios(empresa.id, tipo, res.items);
      setRes(null);
      setArchivo('');
      setMsg({ tipo: 'ok', texto: t('import.done', { n }) });
    } catch {
      setMsg({ tipo: 'error', texto: t('common.error') });
    } finally {
      setOcupado(false);
    }
  };

  const columnas = {
    productos: ['nombre', 'categoria', 'precio'],
    insumos: ['nombre', 'unidad', 'precioCompra', 'stock'],
    clientes: ['nombre', 'telefono', 'direccion'],
  }[tipo];

  const celda = (it, c) => {
    if (c === 'precio' || c === 'precioCompra') return dinero(it[c]);
    if (c === 'stock') return formatearCantidad(it.stock, it.unidad, lang);
    if (c === 'unidad') return it.unidad;
    return it[c] || '—';
  };

  return (
    <>
      <h1>{t('import.title')}</h1>
      <p className="suave">{t('import.help')}</p>

      <section className="tarjeta formulario">
        <Campo etiqueta={t('import.what')}>
          <select value={tipo} onChange={(e) => reiniciar(e.target.value)}>
            {TIPOS.map((k) => (
              <option key={k} value={k}>
                {t(`import.type.${k}`)}
              </option>
            ))}
          </select>
        </Campo>
        <p className="suave">{t(`import.columns.${tipo}`)}</p>
        <div className="fila envolver">
          <button type="button" className="boton secundario" onClick={bajarPlantilla}>
            {t('import.template')}
          </button>
          <label className="boton">
            {t('import.pick')}
            <input type="file" accept=".csv,.txt,.xlsx" hidden onChange={elegir} />
          </label>
        </div>
        {archivo && <p className="suave">{archivo}</p>}
        <Aviso tipo={msg.tipo}>{msg.texto}</Aviso>
      </section>

      {res?.cabecera && (
        <section className="tarjeta">
          <h2>{t('import.preview')}</h2>
          <p>
            <strong>{t('import.ready', { n: res.items.length })}</strong>
            {res.errores.length > 0 && <span className="suave"> · {t('import.skipped', { n: res.errores.length })}</span>}
          </p>
          {res.sinReconocer.length > 0 && <p className="suave">{t('import.ignored', { lista: res.sinReconocer.join(', ') })}</p>}

          {res.items.length > 0 && (
            <div className="tabla-scroll">
              <table className="tabla">
                <thead>
                  <tr>
                    {columnas.map((c) => (
                      <th key={c}>{t(`import.col.${c}`)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {res.items.slice(0, 8).map((it, i) => (
                    <tr key={i}>
                      {columnas.map((c) => (
                        <td key={c}>{celda(it, c)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {res.items.length > 8 && <p className="suave">{t('import.more', { n: res.items.length - 8 })}</p>}
            </div>
          )}

          {res.errores.length > 0 && (
            <details>
              <summary>{t('import.skippedTitle')}</summary>
              <ul className="lista">
                {res.errores.slice(0, 20).map((e, i) => (
                  <li key={i}>
                    <span>
                      {t('import.row', { n: e.fila })} {e.nombre || ''}
                    </span>
                    <span className="suave">{t(`import.reason.${e.motivo}`)}</span>
                  </li>
                ))}
              </ul>
            </details>
          )}

          <button type="button" className="boton" disabled={ocupado || res.items.length === 0} onClick={importar}>
            {t('import.confirm', { n: res.items.length })}
          </button>
        </section>
      )}
    </>
  );
}
